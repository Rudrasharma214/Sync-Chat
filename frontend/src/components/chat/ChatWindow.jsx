import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Phone, Search, Users, X, Video } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDeleteMessage, useUpdateMessage } from "../../hooks/useMutation/messageMutation";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ContactProfileModal from "./ContactProfileModal";
import GroupDetailsPanel from "../group/GroupDetailsPanel";

const iconBtnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500 sm:h-9 sm:w-9 sm:rounded-xl";

const ChatWindow = ({ socket, conversationId, activeConversation, onBack }) => {
    const { authUser } = useAuth();
    const currentUserId = authUser?._id || authUser?.id || null;

    const [isTyping, setIsTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGroupPanelOpen, setIsGroupPanelOpen] = useState(false);
    const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
    const typingTimeoutRef = useRef(null);

    const updateMessageMutation = useUpdateMessage();
    const deleteMessageMutation = useDeleteMessage();

    useEffect(() => {
        if (!socket || !conversationId) {
            return;
        }

        const handleTyping = ({ userId } = {}) => {
            if (!userId || String(userId) === String(currentUserId)) {
                return;
            }

            setIsTyping(true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 1200);
        };

        socket.on("typing", handleTyping);

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            socket.off("typing", handleTyping);
        };
    }, [conversationId, currentUserId, socket]);

    useEffect(() => {
        setIsGroupPanelOpen(false);
        setIsProfilePanelOpen(false);
    }, [conversationId]);

    const typingText = useMemo(() => (isTyping ? "typing..." : ""), [isTyping]);
    const isGroupConversation = activeConversation?.type === "group";

    const presenceText = useMemo(() => {
        if (isGroupConversation) {
            const memberCount = Number(activeConversation?.memberCount || 0);
            return `${memberCount || 0} members`;
        }

        if (typingText) {
            return typingText;
        }

        return activeConversation?.online ? "Online" : "Offline";
    }, [activeConversation?.memberCount, activeConversation?.online, isGroupConversation, typingText]);

    const handleEditMessage = useCallback(
        async (messageId, content) => {
            await updateMessageMutation.mutateAsync({ messageId, content });
        },
        [updateMessageMutation]
    );

    const handleDeleteMessage = useCallback(
        async (messageId, type) => {
            await deleteMessageMutation.mutateAsync({ messageId, type, conversationId });
        },
        [conversationId, deleteMessageMutation]
    );

    const handleToggleSearch = () => {
        setIsSearchOpen((prev) => {
            const nextValue = !prev;

            if (!nextValue) {
                setSearchTerm("");
            }

            return nextValue;
        });
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setIsSearchOpen(false);
    };

    const handleOpenProfile = () => {
        if (!isGroupConversation) {
            setIsProfilePanelOpen(true);
        }
    };

    return (
        <section className="theme-surface relative flex h-full min-w-0 flex-1 flex-col">
            <header className="theme-border flex items-center justify-between gap-3 border-b px-3 py-3 sm:px-5 sm:py-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="theme-border theme-muted inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500 sm:hidden"
                        aria-label="Back to conversations"
                        title="Back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    {isGroupConversation ? (
                        <button
                            type="button"
                            onClick={() => setIsGroupPanelOpen(true)}
                            className="flex min-w-0 items-center gap-2 text-left"
                            aria-label="Open group details"
                            title="Group details"
                        >
                            <img
                                src={activeConversation?.avatar}
                                alt={activeConversation?.name}
                                className="h-9 w-9 rounded-xl object-cover sm:h-11 sm:w-11"
                            />
                            <div className="min-w-0">
                                <h2 className="theme-text truncate text-sm font-semibold sm:text-xl">
                                    {activeConversation?.name}
                                </h2>
                                <p className="text-xs text-amber-500">{presenceText}</p>
                            </div>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleOpenProfile}
                            className="flex min-w-0 items-center gap-2 text-left"
                            aria-label="Open contact profile"
                            title="Contact profile"
                        >
                            <img
                                src={activeConversation?.avatar}
                                alt={activeConversation?.name}
                                className="h-9 w-9 rounded-xl object-cover sm:h-11 sm:w-11"
                            />
                            <div className="min-w-0">
                                <h2 className="theme-text truncate text-sm font-semibold sm:text-xl">
                                    {activeConversation?.name}
                                </h2>
                                <p className="text-xs text-amber-500">{presenceText}</p>
                            </div>
                        </button>
                    )}
                </div>

                <div className="flex min-w-0 items-center gap-2">
                    {isSearchOpen ? (
                        <div className="theme-border flex w-[min(340px,55vw)] items-center gap-2 rounded-xl border bg-[var(--surface-soft)] px-3 py-2">
                            <Search className="theme-muted h-4 w-4 shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search messages"
                                className="theme-text w-full bg-transparent text-sm outline-none placeholder:theme-muted"
                                autoFocus
                            />
                            {searchTerm ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="theme-muted transition hover:text-amber-500"
                                    aria-label="Clear search"
                                    title="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                    ) : null}

                    <button type="button" className="hidden sm:inline-flex" onClick={handleToggleSearch} aria-label="Search in chat" title="Search in chat">
                        <span className={iconBtnClass}>
                            <Search className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className="hidden sm:inline-flex" aria-label="Call" title="Call">
                        <span className={iconBtnClass}>
                            <Phone className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className="hidden sm:inline-flex" aria-label="Video" title="Video">
                        <span className={iconBtnClass}>
                            <Video className="h-4 w-4" />
                        </span>
                    </button>
                    {isGroupConversation ? (
                        <button
                            type="button"
                            className="inline-flex"
                            onClick={() => setIsGroupPanelOpen(true)}
                            aria-label="Group details"
                            title="Group details"
                        >
                            <span className={iconBtnClass}>
                                <Users className="h-4 w-4" />
                            </span>
                        </button>
                    ) : null}
                </div>
            </header>

            <MessageList
                socket={socket}
                conversationId={conversationId}
                currentUserId={currentUserId}
                searchTerm={searchTerm}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
            />

            <MessageInput socket={socket} conversationId={conversationId} />

            {isGroupConversation ? (
                <GroupDetailsPanel
                    groupId={activeConversation?.groupId}
                    isOpen={isGroupPanelOpen}
                    onClose={() => setIsGroupPanelOpen(false)}
                />
            ) : null}

            <ContactProfileModal
                isOpen={!isGroupConversation && isProfilePanelOpen}
                onClose={() => setIsProfilePanelOpen(false)}
                contact={activeConversation}
            />
        </section>
    );
};

export default ChatWindow;
