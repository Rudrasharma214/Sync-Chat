import React from "react";
import { X } from "lucide-react";

const closeBtnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500 sm:h-9 sm:w-9 sm:rounded-xl";

const DetailPopupLayout = ({
    isOpen,
    onClose,
    title,
    subtitle,
    tabs = [],
    activeTab,
    onTabChange,
    children,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/45"
                aria-label="Close details popup"
            />

            <section className="theme-surface theme-border relative z-10 h-[min(86vh,680px)] w-full max-w-4xl overflow-hidden rounded-3xl border shadow-2xl">
                <div className="flex h-full min-h-0 flex-col">
                    <header className="theme-border border-b px-4 py-3 sm:px-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="theme-text text-base font-semibold">{title}</p>
                                {subtitle ? <p className="theme-muted text-xs">{subtitle}</p> : null}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className={closeBtnClass}
                                aria-label="Close details popup"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => onTabChange?.(tab.key)}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${isActive
                                                ? "border-amber-500/70 bg-amber-500/10 text-amber-500"
                                                : "theme-border theme-muted hover:border-amber-500/70 hover:text-amber-500"
                                            }`}
                                    >
                                        {Icon ? <Icon className="h-4 w-4" /> : null}
                                        <span className="whitespace-nowrap font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
                </div>
            </section>
        </div>
    );
};

export default DetailPopupLayout;
