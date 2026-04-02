import { useQuery } from "@tanstack/react-query";
import * as conversationService from "../../services/ConversationServices";
import { logger } from "../../utils/logger";

export const conversationQueryKeys = {
    all: ["conversations"],
    byId: (conversationId) => ["conversations", conversationId],
};

export const useConversations = () => {
    return useQuery({
        queryKey: conversationQueryKeys.all,
        queryFn: async () => {
            const result = await conversationService.getAllConversations();
            if (!result.success) {
                throw new Error(result.message || "Failed to load conversations");
            }
            return result.data;
        },
        onError: (error) => {
            logger.error("Failed to fetch conversations", error, "useConversations");
        },
    });
};

export const useConversationById = (conversationId, options = {}) => {
    return useQuery({
        queryKey: conversationQueryKeys.byId(conversationId),
        queryFn: async () => {
            const result = await conversationService.getConversationById(conversationId);
            if (!result.success) {
                throw new Error(result.message || "Failed to load conversation");
            }
            return result.data;
        },
        enabled: Boolean(conversationId),
        onError: (error) => {
            logger.error("Failed to fetch conversation", error, "useConversationById");
        },
        ...options,
    });
};
