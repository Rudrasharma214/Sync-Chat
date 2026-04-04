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

export const sendMessage = async ({ conversationId, content, replyTo } = {}) => {
    try {
        const response = await api.post("/messages", {
            conversationId,
            content,
            replyTo: replyTo || undefined,
        });

        logger.info("Send message API call successful", null, "MessageService");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Send message API call failed", error?.response?.data, "MessageService");
        return normalizeErrorResponse(error);
    }
};

export const getMessages = async (conversationId, page = 1, limit = 20) => {
    try {
        const response = await api.get(`/messages/${conversationId}`, {
            params: { page, limit },
        });

        logger.info("Get messages API call successful", null, "MessageService");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Get messages API call failed", error?.response?.data, "MessageService");
        return normalizeErrorResponse(error);
    }
};

export const updateMessage = async (messageId, content) => {
    try {
        const response = await api.patch(`/messages/${messageId}`, { content });

        logger.info("Update message API call successful", null, "MessageService");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Update message API call failed", error?.response?.data, "MessageService");
        return normalizeErrorResponse(error);
    }
};

export const deleteMessage = async (messageId, type) => {
    try {
        const response = await api.delete(`/messages/${messageId}`, {
            data: { type },
        });

        logger.info("Delete message API call successful", null, "MessageService");
        return normalizeSuccessResponse(response);
    } catch (error) {
        logger.error("Delete message API call failed", error?.response?.data, "MessageService");
        return normalizeErrorResponse(error);
    }
};
