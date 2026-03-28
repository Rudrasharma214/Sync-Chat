import React from "react";
import { Moon, Sun } from "lucide-react";

const SettingsAppearance = ({ isDarkMode, toggleTheme }) => {
    return (
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
    );
};

export default SettingsAppearance;
