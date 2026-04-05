import React from "react";
import { Search } from "lucide-react";

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchValue = "",
  onSearchChange,
  isLoading = false,
  isError = false,
  errorMessage = "",
}) => {
  return (
    <section className="theme-surface flex h-full w-full flex-col theme-border sm:w-[300px] sm:border-r lg:w-[320px]">
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div>
            <p className="theme-text text-2xl font-semibold">Sync Chat</p>
          </div>
        </div>

        <div className="relative">
          <Search className="theme-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            className="theme-input w-full rounded-xl border py-1.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500"
            placeholder="Search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </div>

        <div className="mt-4 min-h-0 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              Loading conversations...
            </div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center py-8 text-center text-sm theme-muted">
              {errorMessage || "Unable to load conversations right now."}
            </div>
          ) : !conversations.length ? (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              No conversations yet.
            </div>
          ) : !conversations.length ? (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              No conversations found.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
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
                          <p className="theme-text truncate text-sm font-semibold">
                            {conversation.name}
                          </p>
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
          )}
        </div>
      </div>
    </section>
  );
};

export default ConversationList;
