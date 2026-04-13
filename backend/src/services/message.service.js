import mongoose from "mongoose";
import { STATUS } from "../constant/statusCodes.js";
import * as conversationRepo from "../repositories/conversation.repositories.js";
import * as messageRepo from "../repositories/message.repository.js";
import * as messageStatusRepo from "../repositories/messageStatus.repositories.js";
import * as notificationService from "./notification.service.js";
import { sendBrowserPush } from "../config/push.js";
import { emitToConversation, emitToUser } from "../config/socket.js";
import logger from "../config/logger.js";

const UPDATE_WINDOW_MS = 2 * 60 * 60 * 1000;
const DELETE_EVERYONE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DELETED_MESSAGE_TEXT = "This message was deleted";

const isParticipant = (conversation, userId) =>
    conversation.participants.some((participantId) => participantId.toString() === userId.toString());

const sendPushToRecipients = async (recipientIds, message, senderName) => {
    if (!Array.isArray(recipientIds) || !recipientIds.length) {
        return;
    }

    await Promise.all(
        recipientIds.map(async (recipientId) => {
            try {
                const preference = await notificationService.getNotificationPreferenceByUserId(recipientId);
                const notificationsEnabled = preference?.notificationsEnabled !== false;
                const subscriptions = Array.isArray(preference?.subscriptions)
                    ? preference.subscriptions
                    : [];

                if (!notificationsEnabled || !subscriptions.length) {
                    logger.info("User has no active notification subscriptions", {
                        recipientId: String(recipientId),
                        subscriptionCount: subscriptions.length,
                        notificationsEnabled,
                    });
                    return;
                }

                const payload = {
                    title: senderName || "New Message",
                    body: message?.text || "You have a new message",
                    sender: senderName,
                    data: {
                        url: "/chat",
                        conversationId: String(message?.conversationId || ""),
                        messageId: String(message?._id || ""),
                    },
                };

                const pushResults = await Promise.allSettled(
                    subscriptions.map(async (subscription) => {
                        const result = await sendBrowserPush(subscription, payload);

                        if (!result.success) {
                            logger.warn("Push delivery failed", {
                                recipientId: String(recipientId),
                                endpoint: subscription?.endpoint?.substring(0, 50),
                                reason: result.reason,
                                statusCode: result.statusCode,
                            });

                            if (
                                !result.success
                                && [404, 410].includes(Number(result.statusCode))
                                && subscription?.endpoint
                            ) {
                                // Subscription is invalid, remove it
                                await notificationService.updatePreferences(recipientId, {
                                    removeSubscriptionEndpoint: subscription.endpoint,
                                });
                                logger.info("Removed invalid subscription endpoint", {
                                    recipientId: String(recipientId),
                                    endpoint: subscription?.endpoint?.substring(0, 50),
                                });
                            }
                        } else {
                            logger.info("Push notification sent successfully", {
                                recipientId: String(recipientId),
                                endpoint: subscription?.endpoint?.substring(0, 50),
                            });
                        }

                        return result;
                    })
                );

                const successCount = pushResults.filter((r) => r.status === "fulfilled" && r.value?.success).length;
                logger.info("Push notification batch completed", {
                    recipientId: String(recipientId),
                    totalSubscriptions: subscriptions.length,
                    successCount,
                    failureCount: subscriptions.length - successCount,
                });
            } catch (error) {
                logger.error("Push notification flow failed", {
                    recipientId: String(recipientId),
                    error: error?.message,
                });
            }
        })
    );
};

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

        const recipientIds = conversation.participants
            .filter((participantId) => participantId.toString() !== userId.toString())
            .map((participantId) => participantId.toString());

        await messageStatusRepo.upsertUnreadStatusesForMessage(message._id, recipientIds);

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

        const senderName = populatedMessage?.senderId?.fullname || "Sync Chat";
        await sendPushToRecipients(recipientIds, populatedMessage, senderName);

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

        if (normalizedPage === 1) {
            await messageStatusRepo.markConversationMessagesAsRead(conversationId, userId);
        }

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
