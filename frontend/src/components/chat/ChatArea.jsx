import React, { useState } from "react";
import {
  ArrowLeft,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react";

const menuIconBtnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-muted bg-[var(--surface-soft)] transition hover:border-amber-500/70 hover:text-amber-500 sm:h-9 sm:w-9 sm:rounded-xl";

const ChatArea = ({ activeConversation, onBack }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section className="theme-surface relative flex h-full min-w-0 flex-1 flex-col">
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
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="flex min-w-0 items-center gap-2 text-left"
            aria-label="Open chat details"
            title="Chat details"
          >
            <img
              src={activeConversation.avatar}
              alt={activeConversation.name}
              className="h-9 w-9 rounded-xl object-cover sm:h-11 sm:w-11"
            />
            <div className="min-w-0">
              <h2 className="theme-text truncate text-sm font-semibold sm:text-xl">
                {activeConversation.name}
              </h2>
              <p className="text-xs text-amber-500">
                {activeConversation.online ? "Online" : "Last seen 22m ago"}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:inline-flex"
            aria-label="Search in chat"
            title="Search in chat"
          >
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
          <div
            key={message.id}
            className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[72%] sm:px-3.5 sm:py-2 ${
                message.isMine
                  ? "bg-[var(--bubble-mine)] text-slate-900"
                  : "bg-[var(--bubble-their)] theme-text"
              }`}
            >
              <p className="mb-1 text-xs font-semibold opacity-75">{message.sender}</p>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className="mt-1 text-right text-[11px] opacity-70">{message.time}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="theme-border border-t p-2 sm:p-3">
        <div className="theme-border mx-auto flex w-full max-w-[720px] items-center gap-2 rounded-2xl border bg-[var(--surface-soft)] px-2 py-1 sm:gap-2.5 sm:px-3 sm:py-1.5">
          <button
            type="button"
            className={menuIconBtnClass}
            aria-label="Attach file"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            className="theme-text h-7 w-full bg-transparent text-sm outline-none sm:h-8"
            placeholder="Your message"
          />
          <button type="button" className="hidden sm:inline-flex" aria-label="Emoji" title="Emoji">
            <span className={menuIconBtnClass}>
              <Smile className="h-4 w-4" />
            </span>
          </button>
          <button
            type="button"
            className="hidden sm:inline-flex"
            aria-label="Voice message"
            title="Voice message"
          >
            <span className={menuIconBtnClass}>
              <Mic className="h-4 w-4" />
            </span>
          </button>
          <button
            type="button"
            className={`${menuIconBtnClass} sm:hidden`}
            aria-label="Emoji"
            title="Emoji"
          >
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

      <div
        className={`absolute inset-0 z-20 transition ${showDetails ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          type="button"
          onClick={() => setShowDetails(false)}
          className={`absolute inset-0 bg-black/40 transition sm:hidden ${showDetails ? "opacity-100" : "opacity-0"}`}
          aria-label="Close details overlay"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-[360px] border-l theme-border bg-[var(--surface)] shadow-2xl transition sm:w-[320px] ${
            showDetails ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="theme-border flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="theme-text text-sm font-semibold">Contact info</p>
              <p className="theme-muted text-xs">Chat details and media</p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className={menuIconBtnClass}
              aria-label="Close details"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-full overflow-y-auto px-4 py-4">
            <div className="flex flex-col items-center text-center">
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="h-20 w-20 rounded-3xl object-cover"
              />
              <h3 className="theme-text mt-3 text-lg font-semibold">{activeConversation.name}</h3>
              <p className="text-xs text-amber-500">
                {activeConversation.online ? "Online" : "Offline"}
              </p>
            </div>

            <div className="theme-border mt-4 rounded-2xl border p-3">
              <p className="theme-muted text-xs">About</p>
              <p className="theme-text mt-1 text-sm">
                {activeConversation.about || "No status available."}
              </p>
            </div>

            <div className="theme-border mt-3 rounded-2xl border p-3">
              <p className="theme-muted text-xs">Email</p>
              <p className="theme-text mt-1 text-sm">
                {activeConversation.email || "Not provided"}
              </p>
            </div>

            <div className="theme-border mt-3 rounded-2xl border p-3">
              <p className="theme-muted text-xs">Phone</p>
              <p className="theme-text mt-1 text-sm">
                {activeConversation.phone || "Not provided"}
              </p>
            </div>

            <div className="theme-border mt-3 rounded-2xl border p-3">
              <div className="flex items-center justify-between">
                <p className="theme-muted text-xs">Media</p>
                <button type="button" className="text-xs font-semibold text-amber-500">
                  View all
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(activeConversation.media || []).slice(0, 6).map((item, index) => (
                  <img
                    key={`${item}-${index}`}
                    src={item}
                    alt="Shared media"
                    className="h-20 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
              {!activeConversation.media?.length ? (
                <p className="theme-muted mt-2 text-xs">No media shared yet.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ChatArea;
