import React from "react";

const SettingsProfile = ({
  authUser,
  passwordForm,
  onPasswordChange,
  onPasswordSubmit,
  isSaving,
}) => {
  return (
    <>
      <div className="theme-border rounded-2xl border p-4 sm:p-5">
        <h2 className="theme-text text-lg font-semibold">Profile</h2>
        <p className="theme-muted mt-1 text-sm">Manage your account information.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="theme-border rounded-xl border px-3 py-2">
            <p className="theme-muted text-xs">Full name</p>
            <p className="theme-text mt-1 text-sm font-semibold">
              {authUser?.fullname || "Not available"}
            </p>
          </div>
          <div className="theme-border rounded-xl border px-3 py-2">
            <p className="theme-muted text-xs">Email</p>
            <p className="theme-text mt-1 text-sm font-semibold">
              {authUser?.email || "Not available"}
            </p>
          </div>
        </div>
      </div>

      <div className="theme-border rounded-2xl border p-4 sm:p-5">
        <h3 className="theme-text text-sm font-semibold">Change password</h3>
        <p className="theme-muted mt-1 text-xs">
          Update your password to keep your account secure.
        </p>

        <form className="mt-4 space-y-3" onSubmit={onPasswordSubmit}>
          <label className="block">
            <span className="theme-muted mb-1 block text-xs">Current password</span>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onPasswordChange}
              className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-amber-500"
              placeholder="Enter current password"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="theme-muted mb-1 block text-xs">New password</span>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={onPasswordChange}
                className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-amber-500"
                placeholder="New password"
              />
            </label>

            <label className="block">
              <span className="theme-muted mb-1 block text-xs">Confirm new password</span>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={onPasswordChange}
                className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-amber-500"
                placeholder="Confirm password"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
};

export default SettingsProfile;
