import { api } from "./ApiInstance";
import { logger } from "../utils/logger";

/**
 * Create or get a direct conversation between two users
 */
export const createOrGetDirectConversation = async (recipientId) => {
    try {
        const response = await api.post("/conversations/direct", { recipientId });
        logger.info(
            "Create/get direct conversation API call successful",
            null,
            "ConversationServices"
        );
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error(
            "Create/get direct conversation API call failed",
            error.response?.data,
            "ConversationServices"
        );
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

/**
 * Get all conversations (direct + group) for authenticated user
 */
export const getAllConversations = async (searchTerm = "") => {
    try {
        const response = await api.get("/conversations", {
            params: searchTerm ? { search: searchTerm } : undefined,
        });
        logger.info("Get conversations API call successful", null, "ConversationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error(
            "Get conversations API call failed",
            error.response?.data,
            "ConversationServices"
        );
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

export const getPaginatedConversations = async (searchTerm = "", page = 1, limit = 20) => {
    try {
        const response = await api.get("/conversations", {
            params: {
                page,
                limit,
                ...(searchTerm ? { search: searchTerm } : {}),
            },
        });
        logger.info("Get paginated conversations API call successful", null, "ConversationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error(
            "Get paginated conversations API call failed",
            error.response?.data,
            "ConversationServices"
        );
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

/**
 * Get conversation by ID
 */
export const getConversationById = async (conversationId) => {
    try {
        const response = await api.get(`/conversations/${conversationId}`);
        logger.info("Get conversation API call successful", null, "ConversationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error(
            "Get conversation API call failed",
            error.response?.data,
            "ConversationServices"
        );
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};
