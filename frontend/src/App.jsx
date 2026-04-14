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
          logger.info("Notification permission denied, skipping subscription verification", null, "App");
          return;
        }

        // If permission is not granted yet (still 'default'), don't request it automatically
        // User must click "Enable Notifications" button in settings
        if (permission !== "granted") {
          logger.info("Notification permission not yet granted - user must enable in settings", null, "App");
          return;
        }

        // Permission is granted - verify subscription on this device
        const currentSubscription = await BrowserPushService.getCurrentSubscription();
        if (!currentSubscription) {
          // Permission is granted but no subscription - this shouldn't happen normally
          logger.info("Permission granted but no subscription found on device", null, "App");
          return;
        }

        // Verify it's stored in backend
        const preferencesResult = await notificationService.getNotificationPreferences();
        if (!preferencesResult.success) {
          logger.warn("Failed to fetch notification preferences", preferencesResult.message, "App");
          return;
        }

        const preferences = preferencesResult.data || {};
        const subscriptions = Array.isArray(preferences.subscriptions) ? preferences.subscriptions : [];
        const currentEndpoint = currentSubscription.endpoint;
        const isAlreadyStored = subscriptions.some((sub) => sub.endpoint === currentEndpoint);

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
