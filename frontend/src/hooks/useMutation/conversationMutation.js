import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as conversationService from "../../services/ConversationServices";
import { logger } from "../../utils/logger";
import { conversationQueryKeys } from "../useQueries/conversationQueries";
import { messageQueryKeys } from "../messageCache";

export const useCreateOrGetDirectConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (participantId) => {
            const result = await conversationService.createOrGetDirectConversation(participantId);
            if (!result.success) {
                throw new Error(result.message || "Failed to create conversation");
            }
            return result.data;
        },
        onSuccess: () => {
            logger.info(
                "Direct conversation created or loaded",
                null,
                "useCreateOrGetDirectConversation"
            );
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error) => {
            logger.error(
                "Failed to create or load direct conversation",
                error,
                "useCreateOrGetDirectConversation"
            );
        },
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (conversationId) => {
            const result = await conversationService.deleteConversation(conversationId);
            if (!result.success) {
                throw new Error(result.message || "Failed to delete conversation");
            }

            return {
                ...(result.data || {}),
                conversationId,
            };
        },
        onSuccess: (data, conversationId) => {
            logger.info("Conversation deleted", { conversationId }, "useDeleteConversation");
            queryClient.invalidateQueries({ queryKey: ["conversations"] });

            const targetConversationId = data?.conversationId || conversationId;
            if (targetConversationId) {
                queryClient.removeQueries({
                    queryKey: messageQueryKeys.byConversation(targetConversationId),
                    exact: true,
                });
            }
        },
        onError: (error) => {
            logger.error("Failed to delete conversation", error, "useDeleteConversation");
        },
    });
};
