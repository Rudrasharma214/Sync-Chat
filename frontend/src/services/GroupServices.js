import { api } from "./ApiInstance";
import { logger } from "../utils/logger";

const normalizeSuccessResponse = (response) => ({
    success: true,
    data: response?.data?.data,
    message: response?.data?.message || "Request successful",
});

const normalizeErrorResponse = (error) => ({
    success: false,
    data: null,
    message: error?.response?.data?.message || error?.message || "Request failed",
});

export const createGroup = async (payload = {}) => {
    try {
        const response = await api.post("/groups", payload);

        logger.info("Create group API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Create group API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const getMyGroups = async () => {
    try {
        const response = await api.get("/groups");

        logger.info("Get my groups API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Get my groups API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const getGroupById = async (groupId) => {
    try {
        const response = await api.get(`/groups/${groupId}`);

        logger.info("Get group by ID API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Get group by ID API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const updateGroup = async (groupId, payload = {}) => {
    try {
        const response = await api.patch(`/groups/${groupId}`, payload);

        logger.info("Update group API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Update group API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const deleteGroup = async (groupId) => {
    try {
        const response = await api.delete(`/groups/${groupId}`);

        logger.info("Delete group API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Delete group API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const addMembers = async (groupId, memberIds = []) => {
    try {
        const response = await api.post(`/groups/${groupId}/members`, { memberIds });

        logger.info("Add group members API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Add group members API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const removeMember = async (groupId, memberId) => {
    try {
        const response = await api.delete(`/groups/${groupId}/members/${memberId}`);

        logger.info("Remove group member API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Remove group member API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};

export const updateMemberRole = async (groupId, memberId, role) => {
    try {
        const response = await api.patch(`/groups/${groupId}/members/${memberId}/role`, { role });

        logger.info("Update group member role API call successful", null, "GroupServices");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Update group member role API call failed", error?.response?.data, "GroupServices");
        return normalizeErrorResponse(error);
    }
};
