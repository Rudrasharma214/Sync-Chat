import { STATUS } from "../constant/statusCodes.js";
import { sendErrorResponse, sendResponse } from "../utils/response.js";
import * as notificationService from "../services/notification.service.js";

export const getPreferences = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const result = await notificationService.getPreferences(userId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const updatePreferences = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const result = await notificationService.updatePreferences(userId, req.body || {});

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const toggleNotifications = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { enabled } = req.body;

        if (enabled !== undefined && typeof enabled !== "boolean") {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "enabled must be a boolean");
        }

        const result = await notificationService.toggleNotifications(userId, enabled);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const deletePreferences = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const result = await notificationService.deletePreferences(userId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.OK, result.message);
    } catch (error) {
        next(error);
    }
};

export const getUnreadSummary = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const parsedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isNaN(parsedLimit) ? 20 : Math.max(1, Math.min(parsedLimit, 100));

        const result = await notificationService.getUnreadSummary(userId, limit);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};
