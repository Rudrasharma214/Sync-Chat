import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as conversationService from "../../services/ConversationServices";
import { logger } from "../../utils/logger";
import { conversationQueryKeys } from "../useQueries/conversationQueries";

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
            queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
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
