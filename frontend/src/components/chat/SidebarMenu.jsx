import React from "react";
import { Bell, Edit3, LogOut, MessageCircle, Moon, Settings, Sun, Users } from "lucide-react";

const menuIconBtnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500 sm:h-9 sm:w-9 sm:rounded-xl";

const SidebarMenu = ({ isDarkMode, onToggleTheme, onOpenSettings, onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-16 shrink-0 flex-col items-center justify-between border-r theme-border bg-[var(--sidebar)] py-2 sm:static sm:z-auto sm:h-auto sm:w-20 sm:py-5">
      <div className="flex flex-col items-center gap-2 sm:gap-4">
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-xl font-bold text-slate-900 shadow-sm shadow-amber-500/30 sm:h-11 sm:w-11 sm:rounded-xl sm:text-2xl">
          S
        </div>
        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/30 sm:h-10 sm:w-10">
          <MessageCircle className="h-4 w-4" />
        </div>

        <button type="button" className={menuIconBtnClass} aria-label="All chats" title="All chats">
          <Users className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={menuIconBtnClass}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button type="button" className={menuIconBtnClass} aria-label="Edit" title="Compose">
          <Edit3 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 sm:gap-3">
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

        <button
          type="button"
          className={menuIconBtnClass}
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default SidebarMenu;
