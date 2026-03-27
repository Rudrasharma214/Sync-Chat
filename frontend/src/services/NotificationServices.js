import { api } from "./ApiInstance";
import { logger } from "../utils/logger";

export const getNotificationPreferences = async () => {
    try {
        const response = await api.get("/notifications/preferences");
        logger.info("Get notification preferences API call successful", null, "NotificationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error("Get notification preferences API call failed", error.response?.data, "NotificationServices");
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

export const updateNotificationPreferences = async (payload) => {
    try {
        const response = await api.put("/notifications/preferences", payload);
        logger.info("Update notification preferences API call successful", null, "NotificationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error("Update notification preferences API call failed", error.response?.data, "NotificationServices");
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

export const toggleNotifications = async (enabled) => {
    try {
        const response = await api.patch("/notifications/preferences/toggle", { enabled });
        logger.info("Toggle notifications API call successful", null, "NotificationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error("Toggle notifications API call failed", error.response?.data, "NotificationServices");
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

export const getUnreadSummary = async (limit = 5) => {
    try {
        const response = await api.get(`/notifications/unread-summary?limit=${limit}`);
        logger.info("Get unread summary API call successful", null, "NotificationServices");
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        logger.error("Get unread summary API call failed", error.response?.data, "NotificationServices");
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};
