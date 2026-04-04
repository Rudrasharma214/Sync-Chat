import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as messageService from "../../services/message.service";
import { logger } from "../../utils/logger";
import {
    appendMessage,
    getConversationId,
    messageQueryKeys,
    removeMessage,
    replaceMessage,
} from "../messageCache";

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const result = await messageService.sendMessage(payload);
            if (!result.success) {
                throw new Error(result.message || "Failed to send message");
            }
            return result.data;
        },
        onSuccess: (createdMessage) => {
            const conversationId = getConversationId(createdMessage);
            if (!conversationId) {
                queryClient.invalidateQueries({ queryKey: ["messages"] });
                return;
            }

            const queryKey = messageQueryKeys.byConversation(conversationId);
            queryClient.setQueryData(queryKey, (oldData) => appendMessage(oldData, createdMessage));
        },
        onError: (error) => {
            logger.error("Failed to send message", error, "useSendMessage");
        },
    });
};

export const useUpdateMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, content }) => {
            const result = await messageService.updateMessage(messageId, content);
            if (!result.success) {
                throw new Error(result.message || "Failed to update message");
            }
            return result.data;
        },
        onSuccess: (updatedMessage) => {
            const conversationId = getConversationId(updatedMessage);
            if (!conversationId) {
                queryClient.invalidateQueries({ queryKey: ["messages"] });
                return;
            }

            const queryKey = messageQueryKeys.byConversation(conversationId);
            queryClient.setQueryData(queryKey, (oldData) => replaceMessage(oldData, updatedMessage));
        },
        onError: (error) => {
            logger.error("Failed to update message", error, "useUpdateMessage");
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, type }) => {
            const result = await messageService.deleteMessage(messageId, type);
            if (!result.success) {
                throw new Error(result.message || "Failed to delete message");
            }
            return result.data;
        },
        onSuccess: (data, variables) => {
            const knownConversationId = variables?.conversationId || getConversationId(data);
            const deletedMessageId = data?.messageId || data?._id || data?.id || variables?.messageId;

            if (!knownConversationId || !deletedMessageId) {
                queryClient.invalidateQueries({ queryKey: ["messages"] });
                return;
            }

            const queryKey = messageQueryKeys.byConversation(knownConversationId);

            if (variables?.type === "everyone" && data && !data.messageId) {
                queryClient.setQueryData(queryKey, (oldData) => replaceMessage(oldData, data));
                return;
            }

            queryClient.setQueryData(queryKey, (oldData) => removeMessage(oldData, deletedMessageId));
        },
        onError: (error) => {
            logger.error("Failed to delete message", error, "useDeleteMessage");
        },
    });
};
