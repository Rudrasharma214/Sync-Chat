//-----------------packages----------------------

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//-----------------------------------------------

//----------------components---------------------

import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import {
  getNotificationPermission,
  isPushSupported,
  subscribeUser,
} from "./services/BrowserPushService";
import * as BrowserPushService from "./services/BrowserPushService";
import * as notificationService from "./services/NotificationServices";
import { logger } from "./utils/logger";

//-----------------------------------------------

//--------------------routes---------------------

import AppRoutes from "./routes/AppRoutes";

//----------------------------------------------

const AppContent = () => {
  const { isCheckingAuth } = useAuth();
  const { authUser } = useAuth();

  useEffect(() => {
    const bootstrapNotifications = async () => {
      if (!authUser || !isPushSupported()) {
        return;
      }

      const userId = authUser?._id || authUser?.id;
      if (!userId) {
        return;
      }

      try {
        // Get current permission state
        const permission = getNotificationPermission();

        // If permission is denied, skip
        if (permission === "denied") {
          logger.info("Notification permission denied, skipping subscription", null, "App");
          return;
        }

        // Get current subscriptions for this device
        // Check if this specific device is already subscribed
        const currentSubscription = await BrowserPushService.getCurrentSubscription();
        if (currentSubscription) {
          // Already subscribed on this device, verify it's in backend
          const preferencesResult = await notificationService.getNotificationPreferences();
          if (preferencesResult.success) {
            const preferences = preferencesResult.data || {};
            const subscriptions = Array.isArray(preferences.subscriptions)
              ? preferences.subscriptions
              : [];

            const currentEndpoint = currentSubscription.endpoint;
            const isAlreadyStored = subscriptions.some(
              (sub) => sub.endpoint === currentEndpoint
            );

            if (isAlreadyStored) {
              logger.info("Device already subscribed to notifications", { endpoint: currentEndpoint }, "App");
              return;
            }

            // Device has subscription but not stored in backend, so add it
            const updateResult = await notificationService.updateNotificationPreferences({
              notificationsEnabled: true,
              subscription: currentSubscription.toJSON(),
            });

            if (!updateResult.success) {
              logger.warn("Failed to update existing subscription", updateResult.message, "App");
              return;
            }

            logger.info("Added existing device subscription to backend", null, "App");
            return;
          }
        }

        // No subscription on this device yet, create new one
        if (permission === "granted") {
          // Already granted, just subscribe
          const subscription = await subscribeUser();
          const updateResult = await notificationService.updateNotificationPreferences({
            notificationsEnabled: true,
            subscription,
          });

          if (!updateResult.success) {
            logger.warn("Failed to store new subscription", updateResult.message, "App");
            return;
          }

          logger.info("Successfully subscribed device to notifications", { endpoint: subscription.endpoint }, "App");
          return;
        }

        // Permission is 'default' - need to ask user
        // Use a flag to track per-browser (not per-user)
        const browserPromptedKey = "notifications-browser-prompted";
        const browserPrompted = localStorage.getItem(browserPromptedKey) === "1";

        if (browserPrompted) {
          logger.info("User already declined notifications on this browser", null, "App");
          return;
        }

        // Mark that we've prompted on this browser
        localStorage.setItem(browserPromptedKey, "1");

        // Request permission from user
        const subscription = await subscribeUser();
        const updateResult = await notificationService.updateNotificationPreferences({
          notificationsEnabled: true,
          subscription,
        });

        if (!updateResult.success) {
          logger.warn("Failed to store new subscription after user granted", updateResult.message, "App");
          return;
        }

        logger.info("Successfully subscribed new device after user permission", { endpoint: subscription.endpoint }, "App");
      } catch (error) {
        logger.warn("Notification subscription bootstrap failed", error, "App");
      }
    };

    bootstrapNotifications();
  }, [authUser]);

  if (isCheckingAuth) {
    return (
      <div className="theme-bg theme-text flex h-screen items-center justify-center">
        <Loader className="size-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div>
      <AppRoutes />
      <Toaster />
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
