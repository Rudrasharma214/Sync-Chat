import { STATUS } from "../constant/statusCodes.js";
import * as conversationRepo from "../repositories/conversation.repositories.js";
import * as userRepo from "../repositories/user.repositories.js";

/**
 * Create or get direct conversation between two users
 * @param {string} userId - Current user ID
 * @param {string} recipientId - Recipient user ID
 * @returns {object} Response object with success, statusCode, message, data
 */
export const createOrGetDirectConversation = async (userId, recipientId) => {
    try {
        if (!userId || !recipientId) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Both userId and recipientId are required"
            };
        }

        if (userId === recipientId) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Cannot create conversation with yourself"
            };
        }

        const [currentUser, recipient] = await Promise.all([
            userRepo.getUserById(userId),
            userRepo.getUserById(recipientId)
        ]);

        if (!currentUser) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Current user not found"
            };
        }

        if (!recipient) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Recipient user not found"
            };
        }

        const participantIds = [userId, recipientId].sort();

        let conversation = await conversationRepo.getDirectConversationByParticipants(participantIds);

        if (conversation) {
            conversation = await conversation.populate([
                { path: 'participants', select: 'id fullname email profilepic' },
                { path: 'lastMessage' }
            ]);

            return {
                success: true,
                statusCode: STATUS.OK,
                message: "Conversation retrieved successfully",
                data: conversation
            };
        }

        const newConversation = await conversationRepo.createConversation({
            type: 'direct',
            participants: participantIds,
            lastMessageAt: new Date()
        });

        await newConversation.populate({
            path: 'participants',
            select: 'id fullname email profilepic'
        });

        return {
            success: true,
            statusCode: STATUS.CREATED,
            message: "Direct conversation created successfully",
            data: newConversation
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error creating or retrieving direct conversation",
            error: error.message
        };
    }
};

/**
 * Get conversation by ID with validation that user is participant
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Current user ID
 * @returns {object} Response object with success, statusCode, message, data
 */
export const getConversationWithValidation = async (conversationId, userId) => {
    try {
        const conversation = await conversationRepo.getConversationById(conversationId)
            .populate('participants', 'id fullname email profilepic')
            .populate('groupId', 'name avatar createdBy');

        if (!conversation) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Conversation not found"
            };
        }

        const isParticipant = conversation.participants.some(p => p._id.toString() === userId);
        if (!isParticipant) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "You are not a participant of this conversation"
            };
        }

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Conversation retrieved successfully",
            data: conversation
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error retrieving conversation",
            error: error.message
        };
    }
};

/**
 * Get all conversations for current user (direct + group)
 * @param {string} userId - Current user ID
 * @returns {object} Response object with success, statusCode, message, data
 */
export const getAllConversations = async (userId, searchTerm = "") => {
    try {
        if (!userId) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "User ID is required"
            };
        }

        const conversations = await conversationRepo.getConversationsByParticipantId(userId);

        const populatedConversations = await Promise.all(
            conversations.map((conversation) =>
                conversation.populate([
                    { path: "participants", select: "id fullname email profilepic" },
                    { path: "groupId", select: "name avatar description createdBy members" },
                    { path: "lastMessage", populate: { path: "senderId", select: "id fullname profilepic" } },
                ])
            )
        );

        const normalizedConversations = populatedConversations.map((conversation) => {
            const isDirect = conversation.type === "direct";
            const otherParticipant = isDirect
                ? conversation.participants.find((participant) => participant._id.toString() !== userId.toString()) || null
                : null;

            return {
                _id: conversation._id,
                type: conversation.type,
                participants: conversation.participants,
                otherParticipant,
                group: conversation.groupId || null,
                lastMessage: conversation.lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
            };
        });

        const normalizedSearch = searchTerm.trim().toLowerCase();
        const filteredConversations = normalizedSearch
            ? normalizedConversations.filter((conversation) => {
                const directName = conversation?.otherParticipant?.fullname || "";
                const groupName = conversation?.group?.name || "";
                const lastMessageText = conversation?.lastMessage?.text || "";

                const searchableText = `${directName} ${groupName} ${lastMessageText}`.toLowerCase();
                return searchableText.includes(normalizedSearch);
            })
            : normalizedConversations;

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Conversations fetched successfully",
            data: filteredConversations,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error fetching conversations",
            error: error.message,
        };
    }
};
