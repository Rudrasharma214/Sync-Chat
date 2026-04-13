import React from "react";
import { Smartphone, CheckCircle } from "lucide-react";

const SettingsNotifications = ({
  notificationsEnabled,
  isLoadingPreferences,
  isPreferencesError,
  isPending,
  onToggleNotifications,
  subscriptions = [],
}) => {
  const subscriptionCount = Array.isArray(subscriptions) ? subscriptions.length : 0;

  return (
    <div className="theme-border rounded-2xl border p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="theme-text text-lg font-semibold">Notifications</h2>
          <p className="theme-muted mt-1 text-sm">Control push notifications and message alerts.</p>

          {subscriptionCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {subscriptionCount} device{subscriptionCount !== 1 ? 's' : ''} registered
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleNotifications}
          disabled={isPending || isLoadingPreferences}
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${notificationsEnabled
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
              : "theme-border theme-muted"
            }`}
        >
          {isPending ? "Updating..." : notificationsEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {isPreferencesError ? (
        <p className="mt-3 text-sm text-rose-500">Unable to load notification preferences.</p>
      ) : null}

      {notificationsEnabled && subscriptionCount > 0 && (
        <div className="mt-4 space-y-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            📱 Your notification subscriptions:
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Notifications will be sent to all your registered devices when you receive a message.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsNotifications;
