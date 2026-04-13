import NotificationPreference from '../models/notificationPreference.model.js';
import logger from '../config/logger.js';

export const createNotificationPreference = async (data) => {
    const notificationPreference = new NotificationPreference(data);
    return await notificationPreference.save();
};

export const getNotificationPreferenceByUserId = async (userId) => {
    return await NotificationPreference.findOne({ userId });
};

export const upsertNotificationPreference = async (userId, updateData) => {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        updateData,
        { returnDocument: "after", upsert: true }
    );
};

export const toggleNotifications = async (userId, enabled) => {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        { notificationsEnabled: enabled },
        { returnDocument: "after", upsert: true }
    );
};

export const updateLastNotifiedAt = async (userId, notifiedAt = new Date()) => {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        { lastNotifiedAt: notifiedAt },
        { returnDocument: "after" }
    );
};

export const deleteNotificationPreference = async (userId) => {
    return await NotificationPreference.findOneAndDelete({ userId });
};

export const addSubscription = async (userId, subscription) => {
    const existingPreference = await NotificationPreference.findOne({ userId });
    const alreadyExists = existingPreference?.subscriptions?.some(
        (sub) => sub.endpoint === subscription.endpoint
    );

    if (alreadyExists) {
        logger.info("Subscription already exists for user, skipping", {
            userId: String(userId),
            endpoint: subscription?.endpoint?.substring(0, 50) + "...",
        });
        return existingPreference;
    }

    const result = await NotificationPreference.findOneAndUpdate(
        {
            userId,
            "subscriptions.endpoint": { $ne: subscription.endpoint },
        },
        {
            $push: { subscriptions: subscription },
        },
        {
            returnDocument: "after",
            upsert: true,
        }
    );

    logger.info("Subscription added for user", {
        userId: String(userId),
        endpoint: subscription?.endpoint?.substring(0, 50) + "...",
        totalSubscriptions: result?.subscriptions?.length || 0,
    });

    return result;
};

export const removeSubscriptionByEndpoint = async (userId, endpoint) => {
    const result = await NotificationPreference.findOneAndUpdate(
        { userId },
        { $pull: { subscriptions: { endpoint } } },
        { returnDocument: "after" }
    );

    logger.info("Subscription removed for user", {
        userId: String(userId),
        endpoint: endpoint.substring(0, 50) + "...",
        remainingSubscriptions: result?.subscriptions?.length || 0,
    });

    return result;
};
