import React from "react";
import { Bell, Edit3, LogOut, MessageCircle, Moon, Settings, Sun, Users } from "lucide-react";

const menuIconBtnClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500";

const SidebarMenu = ({ isDarkMode, onToggleTheme, onOpenSettings }) => {
    return (
        <aside className="flex w-20 flex-col items-center justify-between border-r theme-border bg-[var(--sidebar)] py-4 sm:w-24 sm:py-6">
            <div className="flex flex-col items-center gap-4">
                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-3xl font-bold text-slate-900 shadow-sm shadow-amber-500/30">
                    S
                </div>
                <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/30">
                    <MessageCircle className="h-5 w-5" />
                </div>

                <button type="button" className={menuIconBtnClass} aria-label="All chats" title="All chats">
                    <Users className="h-4 w-4" />
                </button>

                <button type="button" className={menuIconBtnClass} aria-label="Notifications" title="Notifications">
                    <Bell className="h-4 w-4" />
                </button>

                <button type="button" className={menuIconBtnClass} aria-label="Edit" title="Compose">
                    <Edit3 className="h-4 w-4" />
                </button>
            </div>

            <div className="flex flex-col items-center gap-3">
                <button
                    type="button"
                    className={menuIconBtnClass}
                    onClick={onToggleTheme}
                    aria-label="Toggle theme"
                    title={isDarkMode ? "Switch to light" : "Switch to dark"}
                >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <button
                    type="button"
                    className={menuIconBtnClass}
                    onClick={onOpenSettings}
                    aria-label="Settings"
                    title="Settings"
                >
                    <Settings className="h-4 w-4" />
                </button>

                <button type="button" className={menuIconBtnClass} aria-label="Logout" title="Logout">
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </aside>
    );
};

export default SidebarMenu;
