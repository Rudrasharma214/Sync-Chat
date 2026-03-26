import React from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <main className="theme-bg min-h-screen px-6 py-8">
            <div className="mx-auto w-full max-w-3xl">
                <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="theme-border theme-text mb-6 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-amber-500/70 hover:text-amber-500"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to chat
                </button>

                <div className="theme-border theme-surface rounded-2xl border p-6">
                    <h1 className="theme-text text-2xl font-semibold">Settings</h1>
                    <p className="theme-muted mt-2 text-sm">Manage your chat preferences.</p>

                    <div className="theme-border mt-6 flex items-center justify-between rounded-xl border p-4">
                        <div>
                            <p className="theme-text text-sm font-semibold">Theme</p>
                            <p className="theme-muted text-xs">Switch between dark and light mode.</p>
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-900 transition hover:bg-amber-400"
                            aria-label="Toggle theme"
                            title={isDarkMode ? "Switch to light" : "Switch to dark"}
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Settings;
