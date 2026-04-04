import mongoose from "mongoose";
import { STATUS } from "../constant/statusCodes.js";
import * as conversationRepo from "../repositories/conversation.repositories.js";
import * as messageRepo from "../repositories/message.repository.js";
import { emitToConversation, emitToUser } from "../config/socket.js";

const UPDATE_WINDOW_MS = 2 * 60 * 60 * 1000;
const DELETE_EVERYONE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DELETED_MESSAGE_TEXT = "This message was deleted";

const isParticipant = (conversation, userId) =>
    conversation.participants.some((participantId) => participantId.toString() === userId.toString());

export const sendMessage = async (userId, payload) => {
    try {
        const { conversationId, content, replyTo } = payload;

        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid conversationId is required",
            };
        }

        if (typeof content !== "string" || !content.trim()) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Message content is required",
            };
        }

        const conversation = await conversationRepo.getConversationById(conversationId);

        if (!conversation) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Conversation not found",
            };
        }

        if (!isParticipant(conversation, userId)) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "You are not a participant of this conversation",
            };
        }

        if (replyTo) {
            if (!mongoose.Types.ObjectId.isValid(replyTo)) {
                return {
                    success: false,
                    statusCode: STATUS.BAD_REQUEST,
                    message: "Invalid replyTo message id",
                };
            }

            const replyMessage = await messageRepo.getMessageById(replyTo);

            if (!replyMessage || replyMessage.conversationId.toString() !== conversationId.toString()) {
                return {
                    success: false,
                    statusCode: STATUS.BAD_REQUEST,
                    message: "replyTo message does not belong to this conversation",
                };
            }
        }

        const message = await messageRepo.createMessage({
            senderId: userId,
            conversationId,
            text: content.trim(),
            replyTo: replyTo || null,
            messageType: "text",
        });

        await conversationRepo.updateConversation(conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
        });

        const populatedMessage = await message.populate([
            {
                path: "senderId",
                select: "id fullname email profilepic",
            },
            {
                path: "replyTo",
                populate: {
                    path: "senderId",
                    select: "id fullname email profilepic",
                },
            },
        ]);

        emitToConversation(conversationId, "newMessage", populatedMessage);

        return {
            success: true,
            statusCode: STATUS.CREATED,
            message: "Message sent successfully",
            data: populatedMessage,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error sending message",
            error: error.message,
        };
    }
};

export const getMessagesByConversation = async (userId, conversationId, page = 1, limit = 20) => {
    try {
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid conversationId is required",
            };
        }

        const conversation = await conversationRepo.getConversationById(conversationId);

        if (!conversation) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Conversation not found",
            };
        }

        if (!isParticipant(conversation, userId)) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "You are not a participant of this conversation",
            };
        }

        const parsedPage = Number.parseInt(page, 10);
        const parsedLimit = Number.parseInt(limit, 10);
        const normalizedPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
        const normalizedLimit = Number.isNaN(parsedLimit) ? 20 : Math.max(1, Math.min(parsedLimit, 100));

        const { messages, total } = await messageRepo.getPaginatedMessagesByConversation(
            conversationId,
            userId,
            normalizedPage,
            normalizedLimit
        );

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Messages fetched successfully",
            data: {
                messages,
                pagination: {
                    page: normalizedPage,
                    limit: normalizedLimit,
                    total,
                    hasNextPage: normalizedPage * normalizedLimit < total,
                },
            },
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error fetching messages",
            error: error.message,
        };
    }
};

export const updateMessage = async (userId, messageId, content) => {
    try {
        if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid messageId is required",
            };
        }

        if (typeof content !== "string" || !content.trim()) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Message content is required",
            };
        }

        const message = await messageRepo.getMessageById(messageId);

        if (!message) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Message not found",
            };
        }

        if (message.senderId.toString() !== userId.toString()) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only sender can update this message",
            };
        }

        if (message.deletedForEveryone || message.isDeletedForEveryone) {
            return {
                success: false,
                statusCode: STATUS.CONFLICT,
                message: "Deleted message cannot be updated",
            };
        }

        const isUpdateWindowExpired = Date.now() - new Date(message.createdAt).getTime() > UPDATE_WINDOW_MS;

        if (isUpdateWindowExpired) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Message can only be updated within 2 hours",
            };
        }

        const updatedMessage = await messageRepo.updateMessageById(messageId, {
            text: content.trim(),
        });

        const populatedMessage = await updatedMessage.populate([
            {
                path: "senderId",
                select: "id fullname email profilepic",
            },
            {
                path: "replyTo",
                populate: {
                    path: "senderId",
                    select: "id fullname email profilepic",
                },
            },
        ]);

        emitToConversation(populatedMessage.conversationId, "messageUpdated", populatedMessage);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Message updated successfully",
            data: populatedMessage,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error updating message",
            error: error.message,
        };
    }
};

export const deleteMessage = async (userId, messageId, type) => {
    try {
        if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid messageId is required",
            };
        }

        if (!["me", "everyone"].includes(type)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: 'Deletion type must be either "me" or "everyone"',
            };
        }

        const message = await messageRepo.getMessageById(messageId);

        if (!message) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Message not found",
            };
        }

        if (type === "me") {
            await messageRepo.upsertDeleteForMeStatus(messageId, userId);

            emitToUser(userId, "messageDeleted", {
                messageId,
                type: "me",
            });

            return {
                success: true,
                statusCode: STATUS.OK,
                message: "Message deleted for you",
                data: {
                    messageId,
                    type,
                },
            };
        }

        if (message.senderId.toString() !== userId.toString()) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only sender can delete message for everyone",
            };
        }

        const isDeleteWindowExpired = Date.now() - new Date(message.createdAt).getTime() > DELETE_EVERYONE_WINDOW_MS;

        if (isDeleteWindowExpired) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Delete for everyone is only allowed within 24 hours",
            };
        }

        const updatedMessage = await messageRepo.updateMessageById(messageId, {
            text: DELETED_MESSAGE_TEXT,
            image: "",
            messageType: "text",
            deletedForEveryone: true,
            isDeletedForEveryone: true,
        });

        const populatedMessage = await updatedMessage.populate([
            {
                path: "senderId",
                select: "id fullname email profilepic",
            },
            {
                path: "replyTo",
                populate: {
                    path: "senderId",
                    select: "id fullname email profilepic",
                },
            },
        ]);

        emitToConversation(populatedMessage.conversationId, "messageDeleted", {
            messageId,
            type: "everyone",
        });

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Message deleted for everyone",
            data: populatedMessage,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error deleting message",
            error: error.message,
        };
    }
};
