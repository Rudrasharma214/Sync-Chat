import React from "react";

const SettingsNotifications = ({
  notificationsEnabled,
  isLoadingPreferences,
  isPreferencesError,
  isPending,
  onToggleNotifications,
}) => {
  return (
    <div className="theme-border rounded-2xl border p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="theme-text text-lg font-semibold">Notifications</h2>
          <p className="theme-muted mt-1 text-sm">Control push notifications and message alerts.</p>
        </div>

        <button
          type="button"
          onClick={onToggleNotifications}
          disabled={isPending || isLoadingPreferences}
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            notificationsEnabled
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
    </div>
  );
};

export default SettingsNotifications;
