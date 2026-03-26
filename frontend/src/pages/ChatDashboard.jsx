import React, { useMemo, useState } from "react";
import {
    Bell,
    Edit3,
    LogOut,
    MessageCircle,
    Mic,
    MoreVertical,
    Paperclip,
    Phone,
    Search,
    Send,
    Settings,
    Smile,
    Users,
    Video,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const dummyConversations = [
    {
        id: "c1",
        name: "Design chat",
        preview: "You: Let us lock the amber tokens before launch.",
        time: "4m",
        unread: 1,
        online: true,
        avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=140&q=80",
        messages: [
            {
                id: "m1",
                sender: "Jasmin Lowery",
                text: "I added new flows to our design system. Now you can use them for your projects!",
                time: "09:20",
                isMine: false,
            },
            {
                id: "m2",
                sender: "Alex Hunt",
                text: "Our intern team has completed the first rotation and they are now part of our core team.",
                time: "09:24",
                isMine: false,
            },
            {
                id: "m3",
                sender: "You",
                text: "My congratulations! I will be glad to work with everyone on the new project.",
                time: "09:27",
                isMine: true,
            },
        ],
    },
    {
        id: "c2",
        name: "Dev squad",
        preview: "Anthony: Build passed on staging.",
        time: "20m",
        unread: 0,
        online: false,
        avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=140&q=80",
        messages: [
            {
                id: "m4",
                sender: "Anthony Cordanes",
                text: "Build passed on staging. Want me to run smoke tests?",
                time: "08:54",
                isMine: false,
            },
            {
                id: "m5",
                sender: "You",
                text: "Yes. Please check notifications and reconnect behavior too.",
                time: "08:57",
                isMine: true,
            },
        ],
    },
];

const ChatDashboard = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeConversationId, setActiveConversationId] = useState(dummyConversations[0].id);
    const menuIconBtnClass =
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500";

    const activeConversation = useMemo(
        () => dummyConversations.find((conversation) => conversation.id === activeConversationId) ?? dummyConversations[0],
        [activeConversationId]
    );

    return (
        <main className="theme-bg min-h-screen px-3 py-3 sm:px-6 sm:py-6">
            <div className="theme-border mx-auto flex h-[calc(100vh-1.5rem)] w-full max-w-[1300px] overflow-hidden rounded-[28px] border bg-[linear-gradient(120deg,var(--surface)_0%,var(--surface-soft)_100%)] sm:h-[calc(100vh-3rem)]">
                <aside className="flex w-20 flex-col items-center justify-between border-r theme-border bg-[var(--sidebar)] py-4 sm:w-24 sm:py-6">
                    <div className="space-y-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/30">
                            <MessageCircle className="h-5 w-5" />
                        </div>

                        <button
                            type="button"
                            className={menuIconBtnClass}
                            aria-label="All chats"
                            title="All chats"
                        >
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

                        <button
                            type="button"
                            className={menuIconBtnClass}
                            aria-label="Edit"
                            title="Compose"
                        >
                            <Edit3 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            className={menuIconBtnClass}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            title={isDarkMode ? "Switch to light" : "Switch to dark"}
                        >
                            <Settings className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            className={menuIconBtnClass}
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </aside>

                <section className="theme-surface w-[300px] border-r theme-border sm:w-[340px]">
                    <div className="p-4 sm:p-5">
                        <div className="relative">
                            <Search className="theme-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <input
                                type="text"
                                className="theme-input w-full rounded-xl border py-2 pl-10 pr-3 text-sm outline-none focus:border-amber-500"
                                placeholder="Search"
                            />
                        </div>

                        <div className="mt-4 space-y-2">
                            {dummyConversations.map((conversation) => {
                                const isActive = conversation.id === activeConversation.id;

                                return (
                                    <button
                                        type="button"
                                        key={conversation.id}
                                        onClick={() => setActiveConversationId(conversation.id)}
                                        className={`w-full rounded-2xl border p-3 text-left transition ${isActive
                                                ? "border-amber-400/70 bg-amber-500/10"
                                                : "theme-border hover:border-amber-500/40 hover:bg-amber-500/5"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={conversation.avatar}
                                                alt={conversation.name}
                                                className="h-11 w-11 rounded-xl object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="theme-text truncate text-sm font-semibold">{conversation.name}</p>
                                                    <span className="theme-muted text-xs">{conversation.time}</span>
                                                </div>

                                                <p className="theme-muted mt-1 truncate text-xs">{conversation.preview}</p>
                                            </div>

                                            {conversation.unread > 0 && (
                                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-slate-900">
                                                    {conversation.unread}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="theme-surface flex min-w-0 flex-1 flex-col">
                    <header className="theme-border flex items-center justify-between border-b px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <img
                                src={activeConversation.avatar}
                                alt={activeConversation.name}
                                className="h-11 w-11 rounded-xl object-cover"
                            />
                            <div>
                                <h2 className="theme-text text-base font-semibold sm:text-2xl">{activeConversation.name}</h2>
                                <p className="text-xs text-amber-500">{activeConversation.online ? "Online" : "Last seen 22m ago"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button type="button" className={menuIconBtnClass} aria-label="Search in chat" title="Search in chat">
                                <Search className="h-4 w-4" />
                            </button>
                            <button type="button" className={menuIconBtnClass} aria-label="Call" title="Call">
                                <Phone className="h-4 w-4" />
                            </button>
                            <button type="button" className={menuIconBtnClass} aria-label="Video" title="Video">
                                <Video className="h-4 w-4" />
                            </button>
                            <button type="button" className={menuIconBtnClass} aria-label="More" title="More options">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                        {activeConversation.messages.map((message) => (
                            <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.isMine ? "bg-[var(--bubble-mine)] text-slate-900" : "bg-[var(--bubble-their)] theme-text"
                                        }`}
                                >
                                    <p className="mb-1 text-xs font-semibold opacity-75">{message.sender}</p>
                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                    <p className="mt-1 text-right text-[11px] opacity-70">{message.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className="theme-border border-t p-3 sm:p-4">
                        <div className="theme-input flex items-center gap-2 rounded-2xl border px-3 py-2.5">
                            <button type="button" className={menuIconBtnClass} aria-label="Attach file" title="Attach file">
                                <Paperclip className="h-4 w-4" />
                            </button>
                            <input
                                type="text"
                                className="theme-bg theme-text w-full bg-transparent text-sm outline-none"
                                placeholder="Your message"
                            />
                            <button type="button" className={menuIconBtnClass} aria-label="Emoji" title="Emoji">
                                <Smile className="h-4 w-4" />
                            </button>
                            <button type="button" className={menuIconBtnClass} aria-label="Voice message" title="Voice message">
                                <Mic className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-900 transition hover:bg-amber-400"
                                aria-label="Send message"
                                title="Send"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </footer>
                </section>
            </div>
        </main>
    );
};

export default ChatDashboard;