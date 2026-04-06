import React, { useEffect, useMemo, useRef } from "react";
import { useMessages } from "../../hooks/useQueries/messageQueries";
import MessageItem from "./MessageItem";

const getMessageTimestamp = (message) => {
    const rawTimestamp = message?.createdAt || message?.updatedAt || 0;
    const parsed = new Date(rawTimestamp).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const getMessageId = (message) => message?._id || message?.id;
const getSenderName = (message) => {
    const senderRef = message?.senderId;

    if (typeof senderRef === "object") {
        return senderRef?.fullname || senderRef?.name || "";
    }

    return "";
};

const normalizeText = (value = "") => String(value).trim().toLowerCase();

const MessageList = ({ socket, conversationId, currentUserId, searchTerm = "", onEditMessage, onDeleteMessage }) => {
    const endRef = useRef(null);

    const { data, isLoading } = useMessages(conversationId, undefined, socket);

    const messages = useMemo(() => {
        const pages = data?.pages || [];
        const flattened = pages.flatMap((page) => page?.messages || []);

        return [...flattened].sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));
    }, [data]);

    const filteredMessages = useMemo(() => {
        const query = normalizeText(searchTerm);

        if (!query) {
            return messages;
        }

        return messages.filter((message) => {
            const messageText = normalizeText(message?.text || "");
            const senderName = normalizeText(getSenderName(message));
            const deletedText = normalizeText("This message was deleted");

            return (
                messageText.includes(query) ||
                senderName.includes(query) ||
                deletedText.includes(query)
            );
        });
    }, [messages, searchTerm]);

    const latestMessageId = filteredMessages.length ? getMessageId(filteredMessages[filteredMessages.length - 1]) : null;

    useEffect(() => {
        if (!latestMessageId || searchTerm.trim()) {
            return;
        }

        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [latestMessageId, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center px-4 py-6 text-sm theme-muted">
                Loading messages...
            </div>
        );
    }

    if (!messages.length) {
        return (
            <div className="flex flex-1 items-center justify-center px-4 py-6 text-sm theme-muted">
                No messages yet.
            </div>
        );
    }

    if (searchTerm.trim() && !filteredMessages.length) {
        return (
            <div className="flex flex-1 items-center justify-center px-4 py-6 text-sm theme-muted">
                No messages found for &quot;{searchTerm.trim()}&quot;.
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-4">
            <div className="space-y-3">
                {filteredMessages.map((message) => (
                    <MessageItem
                        key={getMessageId(message)}
                        message={message}
                        currentUserId={currentUserId}
                        onEditMessage={onEditMessage}
                        onDeleteMessage={onDeleteMessage}
                    />
                ))}
            </div>
            <div ref={endRef} />
        </div>
    );
};

export default MessageList;
