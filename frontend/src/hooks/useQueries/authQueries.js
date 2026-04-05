import { useQuery } from "@tanstack/react-query";
import * as authService from "../../services/AuthServices";
import { logger } from "../../utils/logger";

export const authQueryKeys = {
    searchUsers: (searchTerm = "") => ["auth", "users", "search", { search: searchTerm }],
};

export const useSearchUsers = (searchTerm = "", options = {}) => {
    return useQuery({
        queryKey: authQueryKeys.searchUsers(searchTerm),
        queryFn: async () => {
            const result = await authService.searchUsers(searchTerm);
            if (!result.success) {
                throw new Error(result.message || "Failed to search users");
            }
            return result.data;
        },
        enabled: Boolean(searchTerm?.trim()),
        staleTime: 30 * 1000,
        onError: (error) => {
            logger.error("Failed to search users", error, "useSearchUsers");
        },
        ...options,
    });
};
