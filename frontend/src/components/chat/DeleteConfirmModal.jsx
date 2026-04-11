import React from "react";

const DeleteConfirmModal = ({
    isOpen,
    title = "Delete item?",
    description = "This action cannot be undone.",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    isLoading = false,
    onCancel,
    onConfirm,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
                type="button"
                onClick={() => {
                    if (!isLoading) {
                        onCancel?.();
                    }
                }}
                className="absolute inset-0 bg-black/55"
                aria-label="Close delete confirmation"
            />

            <div className="theme-surface theme-border relative z-10 w-full max-w-sm rounded-2xl border p-4 shadow-2xl">
                <h3 className="theme-text text-base font-semibold">{title}</h3>
                <p className="theme-muted mt-1 text-sm">{description}</p>

                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="theme-border theme-text rounded-md border px-3 py-1.5 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Deleting..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
