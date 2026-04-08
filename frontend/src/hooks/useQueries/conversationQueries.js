import { useInfiniteQuery } from "@tanstack/react-query";
import * as conversationService from "../../services/ConversationServices";
import { logger } from "../../utils/logger";

export const conversationQueryKeys = {
    all: (searchTerm = "") => ["conversations", { search: searchTerm }],
};

export const useConversations = (searchTerm = "") => {
    return useInfiniteQuery({
        queryKey: conversationQueryKeys.all(searchTerm),
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const result = await conversationService.getPaginatedConversations(searchTerm, pageParam, 20);
            if (!result.success) {
                throw new Error(result.message || "Failed to load conversations");
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
            logger.error("Failed to fetch conversations", error, "useConversations");
        },
    });
};
