import { useQuery } from "@tanstack/react-query";
import * as notificationService from "../../services/NotificationServices";
import { logger } from "../../utils/logger";

export const notificationQueryKeys = {
    preferences: ["notification-preferences"],
    unreadSummary: (limit) => ["notification-unread-summary", limit],
};

export const useNotificationPreferences = () => {
    return useQuery({
        queryKey: notificationQueryKeys.preferences,
        queryFn: async () => {
            const result = await notificationService.getNotificationPreferences();
            if (!result.success) {
                throw new Error(result.message || "Failed to load notification preferences");
            }
            return result.data;
        },
        onError: (error) => {
            logger.error("Failed to fetch notification preferences", error, "useNotificationPreferences");
        },
    });
};

export const useUnreadSummary = (limit = 5) => {
    return useQuery({
        queryKey: notificationQueryKeys.unreadSummary(limit),
        queryFn: async () => {
            const result = await notificationService.getUnreadSummary(limit);
            if (!result.success) {
                throw new Error(result.message || "Failed to load unread summary");
            }
            return result.data;
        },
        onError: (error) => {
            logger.error("Failed to fetch unread summary", error, "useUnreadSummary");
        },
    });
};
