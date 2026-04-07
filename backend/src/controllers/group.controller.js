import { STATUS } from "../constant/statusCodes.js";
import { sendErrorResponse, sendResponse } from "../utils/response.js";
import * as groupService from "../services/group.service.js";

/**
 * Create a new group
 * @route POST /api/groups
 * @access Private
 */
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

/**
 * Get all groups of current user
 * @route GET /api/groups
 * @access Private
 */
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

/**
 * Get group by ID
 * @route GET /api/groups/:groupId
 * @access Private
 */
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

/**
 * Update group details
 * @route PATCH /api/groups/:groupId
 * @access Private (admin/owner)
 */
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

/**
 * Delete group
 * @route DELETE /api/groups/:groupId
 * @access Private (owner)
 */
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

/**
 * Add members to a group
 * @route POST /api/groups/:groupId/members
 * @access Private (admin/owner)
 */
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

/**
 * Remove member from a group
 * @route DELETE /api/groups/:groupId/members/:memberId
 * @access Private (admin/owner)
 */
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

/**
 * Update role of a group member
 * @route PATCH /api/groups/:groupId/members/:memberId/role
 * @access Private (owner)
 */
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
