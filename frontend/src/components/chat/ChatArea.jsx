import React from "react";
import { ArrowLeft, Mic, MoreVertical, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";

const menuIconBtnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500 sm:h-9 sm:w-9 sm:rounded-xl";

const ChatArea = ({ activeConversation, onBack }) => {
    return (
        <section className="theme-surface flex h-full min-w-0 flex-1 flex-col">
            <header className="theme-border flex items-center justify-between border-b px-3 py-3 sm:px-5 sm:py-3">
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
                    <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                        className="h-9 w-9 rounded-xl object-cover sm:h-11 sm:w-11"
                    />
                    <div className="min-w-0">
                        <h2 className="theme-text truncate text-sm font-semibold sm:text-xl">
                            {activeConversation.name}
                        </h2>
                        <p className="text-xs text-amber-500">{activeConversation.online ? "Online" : "Last seen 22m ago"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button type="button" className="hidden sm:inline-flex" aria-label="Search in chat" title="Search in chat">
                        <span className={menuIconBtnClass}>
                            <Search className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className="hidden sm:inline-flex" aria-label="Call" title="Call">
                        <span className={menuIconBtnClass}>
                            <Phone className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className="hidden sm:inline-flex" aria-label="Video" title="Video">
                        <span className={menuIconBtnClass}>
                            <Video className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className={menuIconBtnClass} aria-label="More" title="More options">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5 sm:py-4">
                {activeConversation.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[72%] sm:px-3.5 sm:py-2 ${message.isMine ? "bg-[var(--bubble-mine)] text-slate-900" : "bg-[var(--bubble-their)] theme-text"
                                }`}
                        >
                            <p className="mb-1 text-xs font-semibold opacity-75">{message.sender}</p>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p className="mt-1 text-right text-[11px] opacity-70">{message.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="theme-border border-t p-2 sm:p-4">
                <div className="theme-input flex items-center gap-1.5 rounded-2xl border px-2.5 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
                    <button type="button" className={menuIconBtnClass} aria-label="Attach file" title="Attach file">
                        <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                        type="text"
                        className="theme-bg theme-text w-full bg-transparent text-sm outline-none"
                        placeholder="Your message"
                    />
                    <button type="button" className="hidden sm:inline-flex" aria-label="Emoji" title="Emoji">
                        <span className={menuIconBtnClass}>
                            <Smile className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className="hidden sm:inline-flex" aria-label="Voice message" title="Voice message">
                        <span className={menuIconBtnClass}>
                            <Mic className="h-4 w-4" />
                        </span>
                    </button>
                    <button type="button" className={`${menuIconBtnClass} sm:hidden`} aria-label="Emoji" title="Emoji">
                        <Smile className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-900 transition hover:bg-amber-400 sm:h-9 sm:w-9 sm:rounded-xl"
                        aria-label="Send message"
                        title="Send"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </footer>
        </section>
    );
};

export default ChatArea;
