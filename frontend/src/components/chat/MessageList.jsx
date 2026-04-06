import React, { useEffect, useMemo, useRef } from "react";
import { useMessages } from "../../hooks/useQueries/messageQueries";
import MessageItem from "./MessageItem";

const getMessageTimestamp = (message) => {
    const rawTimestamp = message?.createdAt || message?.updatedAt || 0;
    const parsed = new Date(rawTimestamp).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const getMessageId = (message) => message?._id || message?.id;

const MessageList = ({ socket, conversationId, currentUserId, onEditMessage, onDeleteMessage }) => {
    const endRef = useRef(null);

    const { data, isLoading } = useMessages(conversationId, undefined, socket);

    const messages = useMemo(() => {
        const pages = data?.pages || [];
        const flattened = pages.flatMap((page) => page?.messages || []);

        return [...flattened].sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));
    }, [data]);

    const latestMessageId = messages.length ? getMessageId(messages[messages.length - 1]) : null;

    useEffect(() => {
        if (!latestMessageId) {
            return;
        }

        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [latestMessageId]);

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

    return (
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-4">
            <div className="space-y-3">
                {messages.map((message) => (
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
