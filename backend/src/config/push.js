import webpush from "web-push";
import env from "./env.js";
import logger from "./logger.js";

let isConfigured = false;

const configurePush = () => {
    if (isConfigured) {
        return true;
    }

    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
        logger.warn("VAPID keys are missing. Browser push notifications are disabled.");
        return false;
    }

    webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
    isConfigured = true;
    return true;
};

export const isPushConfigured = () => configurePush();

export const sendBrowserPush = async (subscription, payload) => {
    if (!configurePush()) {
        return { success: false, reason: "not_configured" };
    }

    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return { success: true };
    } catch (error) {
        return {
            success: false,
            reason: "send_failed",
            statusCode: error?.statusCode,
            error,
        };
    }
};
