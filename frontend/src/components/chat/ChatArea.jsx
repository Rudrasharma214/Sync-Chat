import React from "react";
import { Mic, MoreVertical, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";

const menuIconBtnClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500";

const ChatArea = ({ activeConversation }) => {
    return (
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
    );
};

export default ChatArea;
