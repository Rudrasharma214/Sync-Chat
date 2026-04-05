import * as conversationService from "../services/conversation.service.js";
import { STATUS } from "../constant/statusCodes.js";
import { sendResponse, sendErrorResponse } from '../utils/response.js';

/**
 * Create or get direct conversation between current user and recipient
 * @route POST /api/conversations/direct
 * @access Private
 */
export const createOrGetDirectConversation = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { recipientId } = req.body;

        if (!recipientId) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "Recipient ID is required");
        }

        const result = await conversationService.createOrGetDirectConversation(userId, recipientId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

/**
 * Get conversation by ID
 * @route GET /api/conversations/:conversationId
 * @access Private
 */
export const getConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { _id: userId } = req.user;

        if (!conversationId) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "Conversation ID is required");
        }

        const result = await conversationService.getConversationWithValidation(conversationId, userId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all direct and group conversations for current user
 * @route GET /api/conversations
 * @access Private
 */
export const getAllConversations = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const searchTerm = typeof req.query?.search === "string" ? req.query.search : "";

        const result = await conversationService.getAllConversations(userId, searchTerm);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode, result.message, result.data);
    } catch (error) {
        next(error);
    }
};
