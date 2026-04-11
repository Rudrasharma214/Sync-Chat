import NotificationPreference from '../models/notificationPreference.model.js';

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
    return await NotificationPreference.findOneAndUpdate(
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
};

export const removeSubscriptionByEndpoint = async (userId, endpoint) => {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        { $pull: { subscriptions: { endpoint } } },
        { returnDocument: "after" }
    );
};
