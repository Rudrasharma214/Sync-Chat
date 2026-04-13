import { STATUS } from "../constant/statusCodes.js";
import * as notificationPreferenceRepo from "../repositories/notificationPreference.repositories.js";
import * as messageStatusRepo from "../repositories/messageStatus.repositories.js";
import logger from "../config/logger.js";

const normalizeSubscription = (subscription) => {
    if (!subscription || typeof subscription !== "object") {
        return null;
    }

    const endpoint = typeof subscription.endpoint === "string" ? subscription.endpoint.trim() : "";
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
        return null;
    }

    return {
        endpoint,
        keys: {
            p256dh,
            auth,
        },
    };
};

const collectSubscriptions = (payload = {}) => {
    const normalized = [];

    if (Array.isArray(payload.subscriptions)) {
        for (const subscription of payload.subscriptions) {
            const parsed = normalizeSubscription(subscription);
            if (parsed) {
                normalized.push(parsed);
            }
        }
    }

    if (payload.subscription) {
        const parsed = normalizeSubscription(payload.subscription);
        if (parsed) {
            normalized.push(parsed);
        }
    }

    if (payload.endpoint || payload?.keys?.p256dh || payload?.keys?.auth) {
        const parsed = normalizeSubscription({
            endpoint: payload.endpoint,
            keys: payload.keys,
        });

        if (parsed) {
            normalized.push(parsed);
        }
    }

    return normalized;
};

const normalizePreference = (preference, userId) => {
    if (preference) {
        const plainPreference = typeof preference.toObject === "function"
            ? preference.toObject()
            : preference;

        const normalizedSubscriptions = Array.isArray(plainPreference.subscriptions)
            ? plainPreference.subscriptions
            : [];

        if (!normalizedSubscriptions.length && plainPreference.endpoint && plainPreference?.keys?.p256dh && plainPreference?.keys?.auth) {
            normalizedSubscriptions.push({
                endpoint: plainPreference.endpoint,
                keys: {
                    p256dh: plainPreference.keys.p256dh,
                    auth: plainPreference.keys.auth,
                },
            });
        }

        return {
            ...plainPreference,
            subscriptions: normalizedSubscriptions,
        };
    }

    return {
        userId,
        notificationsEnabled: false,
        subscriptions: [],
    };
};

export const getNotificationPreferenceByUserId = async (userId) => {
    return await notificationPreferenceRepo.getNotificationPreferenceByUserId(userId);
};

export const getPreferences = async (userId) => {
    try {
        const preference = await notificationPreferenceRepo.getNotificationPreferenceByUserId(userId);
        const subscriptionCount = Array.isArray(preference?.subscriptions)
            ? preference.subscriptions.length
            : 0;

        logger.info("Notification preferences retrieved", {
            userId: String(userId),
            subscriptionCount,
            notificationsEnabled: preference?.notificationsEnabled,
        });

        return {
            success: true,
            message: "Notification preferences fetched successfully",
            data: normalizePreference(preference, userId),
        };
    } catch (error) {
        logger.error("Error getting notification preferences", {
            userId: String(userId),
            error: error.message,
        });
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in getting notification preferences",
            error: error.message,
        };
    }
};

export const updatePreferences = async (userId, payload) => {
    try {
        const updateData = { userId };

        if (typeof payload.notificationsEnabled === "boolean") {
            updateData.notificationsEnabled = payload.notificationsEnabled;
        }

        if (typeof payload.enabled === "boolean") {
            updateData.notificationsEnabled = payload.enabled;
        }

        const subscriptions = collectSubscriptions(payload);
        const beforePreference = await notificationPreferenceRepo.getNotificationPreferenceByUserId(userId);
        const beforeSubscriptionCount = Array.isArray(beforePreference?.subscriptions)
            ? beforePreference.subscriptions.length
            : 0;

        let preference = await notificationPreferenceRepo.upsertNotificationPreference(userId, updateData);

        for (const subscription of subscriptions) {
            logger.info("Adding subscription for user", {
                userId: String(userId),
                endpoint: subscription?.endpoint?.substring(0, 50) + "...",
            });
            preference = await notificationPreferenceRepo.addSubscription(userId, subscription);
        }

        if (payload?.removeSubscriptionEndpoint) {
            logger.info("Removing subscription for user", {
                userId: String(userId),
                endpoint: String(payload.removeSubscriptionEndpoint).substring(0, 50) + "...",
            });
            preference = await notificationPreferenceRepo.removeSubscriptionByEndpoint(
                userId,
                String(payload.removeSubscriptionEndpoint)
            );
        }

        const afterSubscriptionCount = Array.isArray(preference?.subscriptions)
            ? preference.subscriptions.length
            : 0;

        logger.info("Notification preferences updated", {
            userId: String(userId),
            subscriptionsBefore: beforeSubscriptionCount,
            subscriptionsAfter: afterSubscriptionCount,
            subscriptionsAdded: subscriptions.length,
            notificationsEnabled: preference?.notificationsEnabled,
        });

        return {
            success: true,
            message: "Notification preferences updated successfully",
            data: normalizePreference(preference, userId),
        };
    } catch (error) {
        logger.error("Error updating notification preferences", {
            userId: String(userId),
            error: error.message,
        });
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in updating notification preferences",
            error: error.message,
        };
    }
};

export const toggleNotifications = async (userId, enabled) => {
    try {
        let resolvedEnabled = enabled;

        if (typeof resolvedEnabled !== "boolean") {
            const existingPreference = await notificationPreferenceRepo.getNotificationPreferenceByUserId(userId);
            resolvedEnabled = existingPreference ? !existingPreference.notificationsEnabled : false;
        }

        const preference = await notificationPreferenceRepo.toggleNotifications(userId, resolvedEnabled);

        return {
            success: true,
            message: "Notification toggle updated successfully",
            data: normalizePreference(preference, userId),
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in toggling notifications",
            error: error.message,
        };
    }
};

export const deletePreferences = async (userId) => {
    try {
        await notificationPreferenceRepo.deleteNotificationPreference(userId);

        return {
            success: true,
            message: "Notification preferences deleted successfully",
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in deleting notification preferences",
            error: error.message,
        };
    }
};

export const getUnreadSummary = async (userId, limit = 20) => {
    try {
        const unreadCount = await messageStatusRepo.getUnreadCountByUserId(userId);
        const unreadStatuses = await messageStatusRepo.getUnreadStatusesByUserId(userId, limit);
        const groupedUnread = await messageStatusRepo.getUnreadCountsByConversation(userId);

        const unreadByConversation = groupedUnread.reduce((acc, item) => {
            const conversationId = item?._id ? String(item._id) : "";
            if (!conversationId) {
                return acc;
            }

            acc[conversationId] = Number(item?.count || 0);
            return acc;
        }, {});

        const latest = unreadStatuses
            .filter((status) => status.messageId)
            .map((status) => ({
                messageStatusId: status._id,
                messageId: status.messageId._id,
                conversationId: status.messageId.conversationId,
                sender: status.messageId.senderId,
                text: status.messageId.text,
                image: status.messageId.image,
                messageType: status.messageId.messageType,
                messageCreatedAt: status.messageId.createdAt,
                statusUpdatedAt: status.updatedAt,
            }));

        return {
            success: true,
            message: "Unread summary fetched successfully",
            data: {
                unreadCount,
                unreadByConversation,
                latest,
            },
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in fetching unread summary",
            error: error.message,
        };
    }
};
