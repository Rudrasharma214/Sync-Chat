import React, { useMemo, useState } from "react";

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

const MessageItem = ({ message, currentUserId, onEditMessage, onDeleteMessage }) => {
    const messageId = message?._id || message?.id;
    const senderId = getSenderId(message);
    const senderName = getSenderName(message);
    const isMine = String(senderId) === String(currentUserId);

    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState(message?.text || "");

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
        setIsEditing(false);
    };

    const handleDelete = async (type) => {
        if (!messageId) {
            return;
        }
        await onDeleteMessage(messageId, type);
    };

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[72%] sm:px-3.5 sm:py-2 ${isMine ? "bg-[var(--bubble-mine)] text-slate-900" : "bg-[var(--bubble-their)] theme-text"
                    }`}
            >
                <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold opacity-75">{senderName}</p>
                    <p className="text-[11px] opacity-70">{getMessageTimestamp(message)}</p>
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

                {isMine && !isEditing && !message?.deletedForEveryone && !message?.isDeletedForEveryone ? (
                    <div className="mt-2 flex items-center gap-3 text-[11px] font-medium opacity-85">
                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="transition hover:text-amber-700"
                            >
                                Edit
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => handleDelete("me")}
                            className="transition hover:text-amber-700"
                        >
                            Delete for me
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete("everyone")}
                            className="transition hover:text-amber-700"
                        >
                            Delete for everyone
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MessageItem;
