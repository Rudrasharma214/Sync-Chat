import { STATUS } from "../constant/statusCodes.js";
import { sendErrorResponse, sendResponse } from "../utils/response.js";
import * as messageService from "../services/message.service.js";

export const sendMessage = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;

        const result = await messageService.sendMessage(userId, req.body || {});

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.CREATED, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const getMessagesByConversation = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { conversationId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const result = await messageService.getMessagesByConversation(userId, conversationId, page, limit);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const updateMessage = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { messageId } = req.params;
        const { content } = req.body;

        const result = await messageService.updateMessage(userId, messageId, content);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { messageId } = req.params;
        const { type } = req.body || {};

        const result = await messageService.deleteMessage(userId, messageId, type);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode || STATUS.OK, result.message, result.data);
    } catch (error) {
        next(error);
    }
};
