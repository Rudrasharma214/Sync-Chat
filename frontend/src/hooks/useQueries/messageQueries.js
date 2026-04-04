import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import * as messageService from "../../services/message.service";
import { getSocket } from "../../services/socket.service";
import { logger } from "../../utils/logger";
import {
    appendMessage,
    getConversationId,
    messageQueryKeys,
    removeMessage,
    replaceMessage,
} from "../messageCache";

const DEFAULT_LIMIT = 20;

export const useMessages = (conversationId, limit = DEFAULT_LIMIT) => {
    const queryClient = useQueryClient();
    const queryKey = messageQueryKeys.byConversation(conversationId);

    const query = useInfiniteQuery({
        queryKey,
        enabled: Boolean(conversationId),
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const result = await messageService.getMessages(conversationId, pageParam, limit);
            if (!result.success) {
                throw new Error(result.message || "Failed to fetch messages");
            }
            return result.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.hasNextPage) {
                return Number(lastPage.pagination.page || 1) + 1;
            }
            return undefined;
        },
        onError: (error) => {
            logger.error("Failed to fetch messages", error, "useMessages");
        },
    });

    useEffect(() => {
        if (!conversationId) {
            return;
        }

        const socket = getSocket();
        if (!socket) {
            return;
        }

        socket.emit("joinConversation", conversationId);

        const handleNewMessage = (incomingMessage) => {
            if (!incomingMessage) {
                return;
            }

            const incomingConversationId = getConversationId(incomingMessage);
            if (String(incomingConversationId) !== String(conversationId)) {
                return;
            }

            queryClient.setQueryData(
                messageQueryKeys.byConversation(conversationId),
                (oldData) => appendMessage(oldData, incomingMessage)
            );
        };

        const handleMessageUpdated = (updatedMessage) => {
            if (!updatedMessage) {
                return;
            }

            const incomingConversationId = getConversationId(updatedMessage);
            if (String(incomingConversationId) !== String(conversationId)) {
                return;
            }

            queryClient.setQueryData(
                messageQueryKeys.byConversation(conversationId),
                (oldData) => replaceMessage(oldData, updatedMessage)
            );
        };

        const handleMessageDeleted = (payload) => {
            const deletedId = payload?.messageId || payload?._id || payload?.id;
            if (!deletedId) {
                return;
            }

            queryClient.setQueryData(
                messageQueryKeys.byConversation(conversationId),
                (oldData) => removeMessage(oldData, deletedId)
            );
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageUpdated", handleMessageUpdated);
        socket.on("messageDeleted", handleMessageDeleted);

        return () => {
            socket.emit("leaveConversation", conversationId);
            socket.off("newMessage", handleNewMessage);
            socket.off("messageUpdated", handleMessageUpdated);
            socket.off("messageDeleted", handleMessageDeleted);
        };
    }, [conversationId, queryClient]);

    return query;
};

export { messageQueryKeys };
