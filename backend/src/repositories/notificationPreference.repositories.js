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
        { new: true, upsert: true }
    );
};

export const toggleNotifications = async (userId, enabled) => {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        { notificationsEnabled: enabled },
        { new: true, upsert: true }
    );
};

export const updateLastNotifiedAt = async (userId, notifiedAt = new Date()) => {
    return await NotificationPreference.findOneAndUpdate(
        { userId },
        { lastNotifiedAt: notifiedAt },
        { new: true }
    );
};

export const deleteNotificationPreference = async (userId) => {
    return await NotificationPreference.findOneAndDelete({ userId });
};
