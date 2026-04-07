import { useQuery } from "@tanstack/react-query";
import * as groupService from "../../services/GroupServices";
import { logger } from "../../utils/logger";

export const groupQueryKeys = {
    all: ["groups"],
    byId: (groupId) => ["groups", groupId],
};

export const useMyGroups = (options = {}) => {
    return useQuery({
        queryKey: groupQueryKeys.all,
        queryFn: async () => {
            const result = await groupService.getMyGroups();
            if (!result.success) {
                throw new Error(result.message || "Failed to fetch groups");
            }
            return result.data;
        },
        onError: (error) => {
            logger.error("Failed to fetch groups", error, "useMyGroups");
        },
        ...options,
    });
};

export const useGroupById = (groupId, options = {}) => {
    return useQuery({
        queryKey: groupQueryKeys.byId(groupId),
        queryFn: async () => {
            const result = await groupService.getGroupById(groupId);
            if (!result.success) {
                throw new Error(result.message || "Failed to fetch group");
            }
            return result.data;
        },
        enabled: Boolean(groupId),
        onError: (error) => {
            logger.error("Failed to fetch group by ID", error, "useGroupById");
        },
        ...options,
    });
};
