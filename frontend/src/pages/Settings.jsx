import React, { useState } from "react";
import { ArrowLeft, Bell, Moon, Palette, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useNotificationPreferences } from "../hooks/useQueries/notificationQueries";
import { useToggleNotifications } from "../hooks/useMutation/notificationMutation";

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

    const {
        data: notificationPreferences,
        isLoading: isLoadingPreferences,
        isError: isPreferencesError,
    } = useNotificationPreferences();

    const toggleNotificationsMutation = useToggleNotifications();

    const notificationsEnabled = notificationPreferences?.notificationsEnabled ?? true;

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
