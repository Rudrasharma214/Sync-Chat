import React, { useEffect, useMemo, useRef } from "react";
import { Plus, Search } from "lucide-react";

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onLoadMore,
  hasNextPage = false,
  isFetchingNextPage = false,
  searchValue = "",
  onSearchChange,
  searchedUsers = [],
  isUserSearchLoading = false,
  onSelectUser,
  onOpenCreateGroup,
  isLoading = false,
  isError = false,
  errorMessage = "",
}) => {
  const hasSearchTerm = Boolean(searchValue.trim());
  const listRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

  const handleScroll = () => {
    if (!hasNextPage || isFetchingRef.current) {
      return;
    }

    const element = listRef.current;
    if (!element) {
      return;
    }

    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (remaining < 120) {
      onLoadMore?.();
    }
  };

  const footerText = useMemo(() => {
    if (isFetchingNextPage) {
      return "Loading more conversations...";
    }

    if (!hasNextPage && conversations.length) {
      return "No more conversations.";
    }

    return "";
  }, [conversations.length, hasNextPage, isFetchingNextPage]);

  return (
    <section className="theme-surface flex h-full w-full flex-col theme-border sm:w-[300px] sm:border-r lg:w-[320px]">
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="theme-text text-2xl font-semibold">Sync Chat</p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateGroup}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-amber-400"
            title="Create group"
            aria-label="Create group"
          >
            <Plus className="h-3.5 w-3.5" />
            Group
          </button>
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

        <div ref={listRef} onScroll={handleScroll} className="mt-4 min-h-0 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              Loading conversations...
            </div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center py-8 text-center text-sm theme-muted">
              {errorMessage || "Unable to load conversations right now."}
            </div>
          ) : conversations.length ? (
            <div className="space-y-2 pb-3">
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
              {footerText ? (
                <div className="py-2 text-center text-xs theme-muted">{footerText}</div>
              ) : null}
            </div>
          ) : hasSearchTerm && isUserSearchLoading ? (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              Searching users...
            </div>
          ) : hasSearchTerm && searchedUsers.length ? (
            <div className="space-y-2">
              {searchedUsers.map((user) => (
                <button
                  type="button"
                  key={user._id}
                  onClick={() => onSelectUser?.(user._id)}
                  className="theme-border w-full rounded-2xl border p-3 text-left transition hover:border-amber-500/40 hover:bg-amber-500/5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilepic || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=140&q=80"}
                      alt={user.fullname}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="theme-text truncate text-sm font-semibold">{user.fullname}</p>
                      <p className="theme-muted truncate text-xs">{user.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : hasSearchTerm ? (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              No conversations found.
            </div>
          ) : (
            <div className="flex h-full items-center justify-center py-8 text-sm theme-muted">
              No conversations yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConversationList;
