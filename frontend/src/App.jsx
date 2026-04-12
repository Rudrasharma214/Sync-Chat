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

      const hasPromptedKey = `notifications-prompted:${userId}`;
      const hasPrompted = localStorage.getItem(hasPromptedKey) === "1";

      try {
        const preferencesResult = await notificationService.getNotificationPreferences();
        if (!preferencesResult.success) {
          return;
        }

        const preferences = preferencesResult.data || {};
        const subscriptions = Array.isArray(preferences.subscriptions)
          ? preferences.subscriptions
          : [];
        const hasStoredSubscription = subscriptions.length > 0;

        if (hasStoredSubscription) {
          return;
        }

        const permission = getNotificationPermission();
        if (permission === "denied") {
          return;
        }

        if (permission === "default" && hasPrompted) {
          return;
        }

        if (permission === "default") {
          localStorage.setItem(hasPromptedKey, "1");
        }

        const subscription = await subscribeUser();
        const updateResult = await notificationService.updateNotificationPreferences({
          notificationsEnabled: true,
          subscription,
        });

        if (!updateResult.success) {
          logger.warn(
            "Auto notification onboarding update failed",
            updateResult.message,
            "App"
          );
        }
      } catch (error) {
        logger.warn("Auto notification onboarding skipped", error, "App");
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
