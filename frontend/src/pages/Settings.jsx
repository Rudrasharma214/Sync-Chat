import React, { useEffect, useState } from "react";
import { ArrowLeft, Bell, Link2, Moon, Palette, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useNotificationPreferences, useUnreadSummary } from "../hooks/useQueries/notificationQueries";
import {
    useToggleNotifications,
    useUpdateNotificationPreferences,
} from "../hooks/useMutation/notificationMutation";
import {
    getNotificationPermission,
    isPushSupported,
    subscribeBrowserPush,
} from "../services/BrowserPushService";

const sections = [
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
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeSection, setActiveSection] = useState("notifications");
    const [notificationForm, setNotificationForm] = useState({
        endpoint: "",
        p256dh: "",
        auth: "",
    });
    const [permissionState, setPermissionState] = useState(getNotificationPermission());
    const [isConnectingBrowserPush, setIsConnectingBrowserPush] = useState(false);

    const {
        data: notificationPreferences,
        isLoading: isLoadingPreferences,
        isError: isPreferencesError,
    } = useNotificationPreferences();
    const { data: unreadSummary } = useUnreadSummary(5);

    const toggleNotificationsMutation = useToggleNotifications();
    const updatePreferencesMutation = useUpdateNotificationPreferences();

    useEffect(() => {
        if (!notificationPreferences) {
            return;
        }

        setNotificationForm({
            endpoint: notificationPreferences.endpoint || "",
            p256dh: notificationPreferences?.keys?.p256dh || "",
            auth: notificationPreferences?.keys?.auth || "",
        });
    }, [notificationPreferences]);

    const notificationsEnabled = notificationPreferences?.notificationsEnabled ?? true;

    const handleConnectBrowserPush = async () => {
        if (!isPushSupported()) {
            toast.error("Push notifications are not supported in this browser.");
            return;
        }

        try {
            setIsConnectingBrowserPush(true);

            const subscription = await subscribeBrowserPush();
            setPermissionState(getNotificationPermission());

            const nextFormState = {
                endpoint: subscription?.endpoint || "",
                p256dh: subscription?.keys?.p256dh || "",
                auth: subscription?.keys?.auth || "",
            };

            setNotificationForm(nextFormState);

            await updatePreferencesMutation.mutateAsync({
                notificationsEnabled: true,
                endpoint: nextFormState.endpoint,
                keys: {
                    p256dh: nextFormState.p256dh,
                    auth: nextFormState.auth,
                },
            });

            toast.success("Browser push connected and saved");
        } catch (error) {
            setPermissionState(getNotificationPermission());
            toast.error(error.message || "Failed to connect browser push");
        } finally {
            setIsConnectingBrowserPush(false);
        }
    };

    const handleToggleNotifications = () => {
        toggleNotificationsMutation.mutate(!notificationsEnabled, {
            onSuccess: () => {
                toast.success(`Notifications ${notificationsEnabled ? "disabled" : "enabled"}`);
            },
            onError: (error) => {
                toast.error(error.message || "Failed to update notifications");
            },
        });
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

                    <div className="theme-muted text-xs sm:text-sm">Personal preferences and notification controls</div>
                </div>

                <div className="theme-border grid min-h-[72vh] grid-cols-1 overflow-hidden rounded-3xl border theme-surface md:grid-cols-[240px_1fr]">
                    <aside className="theme-border border-b p-3 md:border-b-0 md:border-r md:p-4">
                        <div className="mb-3 px-2">
                            <h1 className="theme-text text-xl font-semibold">Settings</h1>
                            <p className="theme-muted mt-1 text-xs">Quick control panel</p>
                        </div>

                        <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;

                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => setActiveSection(section.id)}
                                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${isActive
                                            ? "border-amber-500/70 bg-amber-500/10 text-amber-500"
                                            : "theme-border theme-muted hover:border-amber-500/70 hover:text-amber-500"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {section.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="space-y-5 p-4 sm:p-6">
                        {activeSection === "notifications" ? (
                            <>
                                <div className="theme-border rounded-2xl border p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h2 className="theme-text text-lg font-semibold">Notifications</h2>
                                            <p className="theme-muted mt-1 text-sm">
                                                Control push notifications and message alerts.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleToggleNotifications}
                                            disabled={toggleNotificationsMutation.isPending || isLoadingPreferences}
                                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${notificationsEnabled
                                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                                                : "theme-border theme-muted"
                                                }`}
                                        >
                                            {toggleNotificationsMutation.isPending
                                                ? "Updating..."
                                                : notificationsEnabled
                                                    ? "Enabled"
                                                    : "Disabled"}
                                        </button>
                                    </div>

                                    {isPreferencesError ? (
                                        <p className="mt-3 text-sm text-rose-500">Unable to load notification preferences.</p>
                                    ) : null}
                                </div>

                                <div className="theme-border rounded-2xl border p-4 sm:p-5">
                                    <h3 className="theme-text text-sm font-semibold">Push Subscription</h3>
                                    <p className="theme-muted mt-1 text-xs">
                                        Connect this browser and capture endpoint and keys automatically from Chrome.
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="theme-border theme-muted rounded-full border px-2.5 py-1">
                                            Browser support: {isPushSupported() ? "Yes" : "No"}
                                        </span>
                                        <span className="theme-border theme-muted rounded-full border px-2.5 py-1">
                                            Permission: {permissionState}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <label className="block">
                                            <span className="theme-muted mb-1 block text-xs">Endpoint</span>
                                            <input
                                                type="text"
                                                value={notificationForm.endpoint}
                                                className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-amber-500"
                                                placeholder="https://fcm.googleapis.com/fcm/send/..."
                                                readOnly
                                            />
                                        </label>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <label className="block">
                                                <span className="theme-muted mb-1 block text-xs">p256dh</span>
                                                <input
                                                    type="text"
                                                    value={notificationForm.p256dh}
                                                    className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-amber-500"
                                                    placeholder="Public key"
                                                    readOnly
                                                />
                                            </label>

                                            <label className="block">
                                                <span className="theme-muted mb-1 block text-xs">auth</span>
                                                <input
                                                    type="text"
                                                    value={notificationForm.auth}
                                                    className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-amber-500"
                                                    placeholder="Auth secret"
                                                    readOnly
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleConnectBrowserPush}
                                        disabled={
                                            isConnectingBrowserPush ||
                                            updatePreferencesMutation.isPending ||
                                            isLoadingPreferences ||
                                            !isPushSupported()
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        <Link2 className="h-4 w-4" />
                                        {isConnectingBrowserPush || updatePreferencesMutation.isPending
                                            ? "Connecting..."
                                            : "Connect this browser"}
                                    </button>
                                </div>

                                <div className="theme-border rounded-2xl border p-4 sm:p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="theme-text text-sm font-semibold">Unread Overview</h3>
                                        <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-500">
                                            {unreadSummary?.unreadCount ?? 0} unread
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {unreadSummary?.latest?.length ? (
                                            unreadSummary.latest.slice(0, 3).map((item) => (
                                                <div
                                                    key={item.messageStatusId}
                                                    className="theme-border rounded-xl border px-3 py-2"
                                                >
                                                    <p className="theme-text truncate text-sm">{item.text || "(media message)"}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="theme-muted text-sm">No unread messages right now.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="theme-border rounded-2xl border p-4 sm:p-5">
                                <h2 className="theme-text text-lg font-semibold">Appearance</h2>
                                <p className="theme-muted mt-1 text-sm">Switch between dark and light mode.</p>

                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
                                    aria-label="Toggle theme"
                                    title={isDarkMode ? "Switch to light" : "Switch to dark"}
                                >
                                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    {isDarkMode ? "Use light mode" : "Use dark mode"}
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Settings;
