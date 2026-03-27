import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as notificationService from "../../services/NotificationServices";
import { logger } from "../../utils/logger";
import { notificationQueryKeys } from "../useQueries/notificationQueries";

export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const result = await notificationService.updateNotificationPreferences(payload);
            if (!result.success) {
                throw new Error(result.message || "Failed to update notification preferences");
            }
            return result.data;
        },
        onSuccess: () => {
            logger.info("Notification preferences updated", null, "useUpdateNotificationPreferences");
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.preferences });
        },
        onError: (error) => {
            logger.error("Failed to update notification preferences", error, "useUpdateNotificationPreferences");
        },
    });
};

export const useToggleNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (enabled) => {
            const result = await notificationService.toggleNotifications(enabled);
            if (!result.success) {
                throw new Error(result.message || "Failed to toggle notifications");
            }
            return result.data;
        },
        onSuccess: () => {
            logger.info("Notifications toggled", null, "useToggleNotifications");
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.preferences });
            queryClient.invalidateQueries({ queryKey: ["notification-unread-summary"] });
        },
        onError: (error) => {
            logger.error("Failed to toggle notifications", error, "useToggleNotifications");
        },
    });
};
