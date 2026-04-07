import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as groupService from "../../services/GroupServices";
import { logger } from "../../utils/logger";
import { groupQueryKeys } from "../useQueries/groupQueries";

const invalidateGroupCaches = (queryClient, groupId) => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });

    if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.byId(groupId) });
    }
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const result = await groupService.createGroup(payload);
            if (!result.success) {
                throw new Error(result.message || "Failed to create group");
            }
            return result.data;
        },
        onSuccess: () => {
            logger.info("Group created successfully", null, "useCreateGroup");
            invalidateGroupCaches(queryClient);
        },
        onError: (error) => {
            logger.error("Failed to create group", error, "useCreateGroup");
        },
    });
};

export const useUpdateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, payload }) => {
            const result = await groupService.updateGroup(groupId, payload);
            if (!result.success) {
                throw new Error(result.message || "Failed to update group");
            }
            return result.data;
        },
        onSuccess: (_, variables) => {
            logger.info("Group updated successfully", null, "useUpdateGroup");
            invalidateGroupCaches(queryClient, variables?.groupId);
        },
        onError: (error) => {
            logger.error("Failed to update group", error, "useUpdateGroup");
        },
    });
};

export const useDeleteGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (groupId) => {
            const result = await groupService.deleteGroup(groupId);
            if (!result.success) {
                throw new Error(result.message || "Failed to delete group");
            }
            return { ...(result.data || {}), groupId };
        },
        onSuccess: (data) => {
            logger.info("Group deleted successfully", null, "useDeleteGroup");
            invalidateGroupCaches(queryClient, data?.groupId);
        },
        onError: (error) => {
            logger.error("Failed to delete group", error, "useDeleteGroup");
        },
    });
};

export const useAddGroupMembers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, memberIds }) => {
            const result = await groupService.addMembers(groupId, memberIds);
            if (!result.success) {
                throw new Error(result.message || "Failed to add group members");
            }
            return result.data;
        },
        onSuccess: (data) => {
            logger.info("Group members added successfully", null, "useAddGroupMembers");
            invalidateGroupCaches(queryClient, data?._id);
        },
        onError: (error) => {
            logger.error("Failed to add group members", error, "useAddGroupMembers");
        },
    });
};

export const useRemoveGroupMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, memberId }) => {
            const result = await groupService.removeMember(groupId, memberId);
            if (!result.success) {
                throw new Error(result.message || "Failed to remove group member");
            }
            return result.data;
        },
        onSuccess: (data) => {
            logger.info("Group member removed successfully", null, "useRemoveGroupMember");
            invalidateGroupCaches(queryClient, data?._id);
        },
        onError: (error) => {
            logger.error("Failed to remove group member", error, "useRemoveGroupMember");
        },
    });
};

export const useUpdateGroupMemberRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ groupId, memberId, role }) => {
            const result = await groupService.updateMemberRole(groupId, memberId, role);
            if (!result.success) {
                throw new Error(result.message || "Failed to update member role");
            }
            return result.data;
        },
        onSuccess: (data) => {
            logger.info("Group member role updated successfully", null, "useUpdateGroupMemberRole");
            invalidateGroupCaches(queryClient, data?._id);
        },
        onError: (error) => {
            logger.error("Failed to update member role", error, "useUpdateGroupMemberRole");
        },
    });
};
