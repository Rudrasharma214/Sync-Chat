import { STATUS } from "../constant/statusCodes.js";
import { sendErrorResponse, sendResponse } from "../utils/response.js";
import * as groupService from "../services/group.service.js";

export const createGroup = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const result = await groupService.createGroup(userId, req.body || {});

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.CREATED, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const getMyGroups = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const result = await groupService.getMyGroups(userId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const getGroupById = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { groupId } = req.params;
        const result = await groupService.getGroupById(userId, groupId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const updateGroup = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { groupId } = req.params;
        const result = await groupService.updateGroup(userId, groupId, req.body || {});

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const deleteGroup = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { groupId } = req.params;
        const result = await groupService.deleteGroup(userId, groupId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const addMembers = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { groupId } = req.params;
        const { memberIds } = req.body || {};
        const result = await groupService.addMembers(userId, groupId, memberIds);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { groupId, memberId } = req.params;
        const result = await groupService.removeMember(userId, groupId, memberId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const updateMemberRole = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { groupId, memberId } = req.params;
        const { role } = req.body || {};
        const result = await groupService.updateMemberRole(userId, groupId, memberId, role);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};
