import React, { useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

const getSenderId = (message) => {
    const senderRef = message?.senderId;
    if (!senderRef) {
        return null;
    }

    if (typeof senderRef === "object") {
        return senderRef?._id || senderRef?.id || null;
    }

    return senderRef;
};

const getSenderName = (message) => {
    const senderRef = message?.senderId;

    if (typeof senderRef === "object") {
        return senderRef?.fullname || senderRef?.name || "Unknown user";
    }

    return "Unknown user";
};

const getMessageTimestamp = (message) => {
    const rawDate = message?.createdAt || message?.updatedAt;
    const date = rawDate ? new Date(rawDate) : null;

    if (!date || Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const isMessageEdited = (message) => {
    if (!message || message?.deletedForEveryone || message?.isDeletedForEveryone) {
        return false;
    }

    const createdAt = new Date(message?.createdAt || 0).getTime();
    const updatedAt = new Date(message?.updatedAt || 0).getTime();

    if (Number.isNaN(createdAt) || Number.isNaN(updatedAt)) {
        return false;
    }

    return updatedAt > createdAt;
};

const MessageItem = ({ message, currentUserId, onEditMessage, onDeleteMessage }) => {
    const messageId = message?._id || message?.id;
    const senderId = getSenderId(message);
    const senderName = getSenderName(message);
    const isMine = String(senderId) === String(currentUserId);

    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState(message?.text || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const canManageMessage = isMine && !isEditing && !message?.deletedForEveryone && !message?.isDeletedForEveryone;
    const messageTimestamp = getMessageTimestamp(message);

    const canEdit = useMemo(() => {
        if (!isMine || message?.deletedForEveryone || message?.isDeletedForEveryone) {
            return false;
        }

        const createdAt = new Date(message?.createdAt || message?.updatedAt || Date.now()).getTime();
        if (Number.isNaN(createdAt)) {
            return false;
        }

        return Date.now() - createdAt <= TWO_HOURS_IN_MS;
    }, [isMine, message]);

    const renderedContent = message?.deletedForEveryone || message?.isDeletedForEveryone
        ? "This message was deleted"
        : message?.text || "";

    const handleSaveEdit = async () => {
        const nextText = draftText.trim();
        if (!nextText || nextText === message?.text || !messageId) {
            setIsEditing(false);
            return;
        }

        await onEditMessage(messageId, nextText);
        setIsMenuOpen(false);
        setIsEditing(false);
    };

    const handleDelete = async (type) => {
        if (!messageId) {
            return;
        }
        setIsDeleting(true);
        try {
            await onDeleteMessage(messageId, type);
        } finally {
            setDeleteType(null);
            setIsDeleting(false);
        }
    };

    const openDeleteConfirmation = (type) => {
        setIsMenuOpen(false);
        setDeleteType(type);
    };

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[72%] sm:px-3.5 sm:py-2 ${isMine ? "bg-[var(--bubble-mine)] text-slate-900" : "bg-[var(--bubble-their)] theme-text"
                    }`}
            >
                <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold opacity-75">{senderName}</p>
                    <div className="flex items-center gap-1.5">
                        {isMessageEdited(message) ? (
                            <span className="text-[10px] font-medium uppercase tracking-wide opacity-65">edited</span>
                        ) : null}

                        {canManageMessage ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen((prev) => !prev)}
                                    className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-900/75 transition hover:bg-slate-900/15 hover:text-slate-900"
                                    aria-label="Message options"
                                    title="Message options"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </button>

                                {isMenuOpen ? (
                                    <div className="absolute right-0 top-6 z-20 min-w-[130px] rounded-lg border border-slate-800/15 bg-[var(--surface)] p-1 text-xs shadow-lg">
                                        {canEdit ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="theme-text block w-full rounded px-2 py-1.5 text-left transition hover:bg-amber-500/10"
                                            >
                                                Edit
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => openDeleteConfirmation("me")}
                                            className="theme-text block w-full rounded px-2 py-1.5 text-left transition hover:bg-amber-500/10"
                                        >
                                            Delete for me
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openDeleteConfirmation("everyone")}
                                            className="theme-text block w-full rounded px-2 py-1.5 text-left transition hover:bg-amber-500/10"
                                        >
                                            Delete for everyone
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={draftText}
                            onChange={(event) => setDraftText(event.target.value)}
                            className="h-8 w-full rounded-md border border-slate-300/30 bg-transparent px-2 text-sm outline-none"
                            autoFocus
                        />
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="rounded-md bg-amber-500 px-2 py-1 font-semibold text-slate-900"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDraftText(message?.text || "");
                                    setIsEditing(false);
                                }}
                                className="rounded-md border border-slate-300/30 px-2 py-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed">{renderedContent || "This message was deleted"}</p>
                )}

                {!isEditing && messageTimestamp ? (
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                        <p className="text-[11px] opacity-70">{messageTimestamp}</p>
                    </div>
                ) : null}

                {isMenuOpen && canManageMessage ? (
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                        aria-label="Close message options"
                    />
                ) : null}

                {deleteType ? (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (!isDeleting) {
                                    setDeleteType(null);
                                }
                            }}
                            className="absolute inset-0 bg-black/55"
                            aria-label="Close delete confirmation"
                        />

                        <div className="theme-surface theme-border relative z-10 w-full max-w-sm rounded-2xl border p-4 shadow-2xl">
                            <h3 className="theme-text text-base font-semibold">Delete message?</h3>
                            <p className="theme-muted mt-1 text-sm">
                                {deleteType === "everyone"
                                    ? "This will remove the message for everyone in this conversation."
                                    : "This will remove the message only for you."}
                            </p>

                            <div className="mt-4 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDeleteType(null)}
                                    disabled={isDeleting}
                                    className="theme-border theme-text rounded-md border px-3 py-1.5 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(deleteType)}
                                    disabled={isDeleting}
                                    className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MessageItem;
