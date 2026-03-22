import { STATUS } from "../constant/statusCodes.js";
import * as notificationPreferenceRepo from "../repositories/notificationPreference.repositories.js";
import * as messageStatusRepo from "../repositories/messageStatus.repositories.js";

const normalizePreference = (preference, userId) => {
    if (preference) {
        return preference;
    }

    return {
        userId,
        notificationsEnabled: true,
        endpoint: "",
        keys: {
            p256dh: "",
            auth: "",
        },
    };
};

export const getPreferences = async (userId) => {
    try {
        const preference = await notificationPreferenceRepo.getNotificationPreferenceByUserId(userId);

        return {
            success: true,
            message: "Notification preferences fetched successfully",
            data: normalizePreference(preference, userId),
        };
    } catch (error) {
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
        const updateData = {
            notificationsEnabled: typeof payload.notificationsEnabled === "boolean" ? payload.notificationsEnabled : true,
            endpoint: typeof payload.endpoint === "string" ? payload.endpoint.trim() : "",
            keys: {
                p256dh: payload?.keys?.p256dh || "",
                auth: payload?.keys?.auth || "",
            },
        };

        const preference = await notificationPreferenceRepo.upsertNotificationPreference(userId, {
            ...updateData,
            userId,
        });

        return {
            success: true,
            message: "Notification preferences updated successfully",
            data: preference,
        };
    } catch (error) {
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
            data: preference,
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
