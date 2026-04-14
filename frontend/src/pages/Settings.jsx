import React, { useState } from "react";
import { ArrowLeft, Bell, Palette, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotificationPreferences } from "../hooks/useQueries/notificationQueries";
import { useChangePassword } from "../hooks/useMutation/authMutation";
import { useUpdateNotificationPreferences } from "../hooks/useMutation/notificationMutation";
import {
  getNotificationPermission,
  isPushSupported,
  subscribeUser,
  requestPermissionAndSubscribe,
  unsubscribeUser,
} from "../services/BrowserPushService";
import SettingsAppearance from "../components/settings/SettingsAppearance";
import SettingsNotifications from "../components/settings/SettingsNotifications";
import SettingsProfile from "../components/settings/SettingsProfile";
import SettingsSidebar from "../components/settings/SettingsSidebar";

const sections = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("notifications");
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const {
    data: notificationPreferences,
    isLoading: isLoadingPreferences,
    isError: isPreferencesError,
  } = useNotificationPreferences();

  const updateNotificationPreferencesMutation = useUpdateNotificationPreferences();
  const changePasswordMutation = useChangePassword();

  const savedSubscriptions = Array.isArray(notificationPreferences?.subscriptions)
    ? notificationPreferences.subscriptions
    : [];
  const notificationsEnabled =
    (notificationPreferences?.notificationsEnabled ?? false) && savedSubscriptions.length > 0;

  const handleToggleNotifications = async () => {
    const nextEnabled = !notificationsEnabled;

    try {
      if (nextEnabled) {
        if (!isPushSupported()) {
          toast.error("Push notifications are not supported in this browser.");
          return;
        }

        const permission = getNotificationPermission();
        if (permission === "denied") {
          toast.error("Notification permission is blocked in browser settings.");
          return;
        }

        const subscription = await subscribeUser();

        await updateNotificationPreferencesMutation.mutateAsync({
          notificationsEnabled: true,
          subscription,
        });

        toast.success("Notifications enabled");
        return;
      }

      const unsubscribed = await unsubscribeUser();

      await updateNotificationPreferencesMutation.mutateAsync({
        notificationsEnabled: false,
        removeSubscriptionEndpoint: unsubscribed?.endpoint,
      });

      toast.success("Notifications disabled");
    } catch (error) {
      toast.error(error.message || "Failed to update notifications");
    }
  };

  const handleEnableNotifications = async () => {
    if (!isPushSupported()) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    setIsEnablingNotifications(true);

    try {
      // This will request permission in response to user interaction
      // and then subscribe
      const subscription = await requestPermissionAndSubscribe();

      await updateNotificationPreferencesMutation.mutateAsync({
        notificationsEnabled: true,
        subscription,
      });

      toast.success("Notifications enabled for this device!");
    } catch (error) {
      // Handle specific errors
      if (error.message.includes("denied")) {
        toast.error("Notification permission was denied. You can enable it in browser settings.");
      } else if (error.message.includes("unsupported")) {
        toast.error("Notifications are not supported on this device.");
      } else {
        toast.error(error.message || "Failed to enable notifications");
      }
    } finally {
      setIsEnablingNotifications(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    const result = await changePasswordMutation.mutateAsync({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (result?.success) {
      toast.success("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      return;
    }

    toast.error(result?.message || "Failed to update password.");
  };

  return (
    <main className="theme-bg min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="theme-border theme-text inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-amber-500/70 hover:text-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </button>

          <div className="theme-muted text-xs sm:text-sm">
            Personal preferences and notification controls
          </div>
        </div>

        <div className="theme-border grid min-h-[60vh] grid-cols-1 overflow-hidden rounded-3xl border theme-surface md:min-h-[72vh] md:grid-cols-[240px_1fr]">
          <SettingsSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <section className="space-y-5 p-4 sm:p-6">
            {activeSection === "notifications" ? (
              <SettingsNotifications
                notificationsEnabled={notificationsEnabled}
                isLoadingPreferences={isLoadingPreferences}
                isPreferencesError={isPreferencesError}
                isPending={updateNotificationPreferencesMutation.isPending}
                onToggleNotifications={handleToggleNotifications}
                onEnableNotifications={handleEnableNotifications}
                isEnablingNotifications={isEnablingNotifications}
                subscriptions={notificationPreferences?.subscriptions}
              />
            ) : activeSection === "profile" ? (
              <SettingsProfile
                authUser={authUser}
                passwordForm={passwordForm}
                onPasswordChange={handlePasswordChange}
                onPasswordSubmit={handlePasswordSubmit}
                isSaving={changePasswordMutation.isPending}
              />
            ) : (
              <SettingsAppearance isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Settings;
