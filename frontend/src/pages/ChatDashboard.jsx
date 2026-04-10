import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SidebarMenu from "../components/chat/SidebarMenu";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import CreateGroupModal from "../components/group/CreateGroupModal";
import { useConversations } from "../hooks/useQueries/conversationQueries";
import { useSocket } from "../hooks/useSocket";
import { useSearchUsers } from "../hooks/useQueries/authQueries";
import { useCreateOrGetDirectConversation } from "../hooks/useMutation/conversationMutation";
import { logger } from "../utils/logger";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=140&q=80";

const formatConversationTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const mapConversationListItem = (conversation) => {
  const isDirect = conversation?.type === "direct";
  const directParticipant = conversation?.otherParticipant;
  const group = conversation?.group;
  const lastMessageText = conversation?.lastMessage?.text?.trim();
  const participantId = directParticipant?._id || directParticipant?.id || null;
  const groupId = group?._id || null;
  const memberCount = Array.isArray(group?.members) ? group.members.length : 0;

  return {
    id: conversation?._id,
    type: conversation?.type || "direct",
    groupId,
    memberCount,
    name:
      (isDirect ? directParticipant?.fullname : group?.name) ||
      (isDirect ? "Direct chat" : "Group chat"),
    avatar: (isDirect ? directParticipant?.profilepic : group?.avatar) || FALLBACK_AVATAR,
    preview: lastMessageText || "No messages yet",
    time: formatConversationTime(conversation?.lastMessageAt),
    unread: 0,
    participantId,
    online: false,
    email: directParticipant?.email || "",
    phone: "",
    about: group?.description || "",
    media: [],
    messages: [],
  };
};

const ChatDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { authUser, logout } = useAuth();
  const { socket } = useSocket();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [pendingGroupIdToSelect, setPendingGroupIdToSelect] = useState(null);
  const createOrGetDirectConversation = useCreateOrGetDirectConversation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    error: conversationsError,
    fetchNextPage: fetchMoreConversations,
    hasNextPage: hasMoreConversations,
    isFetchingNextPage: isFetchingMoreConversations,
  } = useConversations(debouncedSearchTerm);

  const {
    data: searchedUsers = [],
    isLoading: isUserSearchLoading,
  } = useSearchUsers(debouncedSearchTerm, {
    enabled: Boolean(debouncedSearchTerm),
  });

  useEffect(() => {
    if (!socket) {
      setOnlineUserIds(new Set());
      return;
    }

    const handleOnlineUsers = (onlineUsers = []) => {
      const normalized = Array.isArray(onlineUsers)
        ? onlineUsers.map((userId) => String(userId))
        : [];
      setOnlineUserIds(new Set(normalized));
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [socket]);

  const conversations = useMemo(
    () => {
      const pages = conversationsData?.pages || [];
      if (!Array.isArray(pages) || !pages.length) {
        return [];
      }

      const flattenedConversations = pages.flatMap((page) => page?.conversations || []);

      return flattenedConversations.map((conversation) => {
        const mappedConversation = mapConversationListItem(conversation);
        const participantId = mappedConversation.participantId;

        return {
          ...mappedConversation,
          online: Boolean(participantId && onlineUserIds.has(String(participantId))),
        };
      });
    },
    [conversationsData, onlineUserIds]
  );

  useEffect(() => {
    if (!pendingGroupIdToSelect || !conversations.length) {
      return;
    }

    const matchedConversation = conversations.find(
      (conversation) =>
        conversation.type === "group" && String(conversation.groupId) === String(pendingGroupIdToSelect)
    );

    if (!matchedConversation) {
      return;
    }

    setActiveConversationId(matchedConversation.id);
    setIsChatOpen(true);
    setPendingGroupIdToSelect(null);
  }, [conversations, pendingGroupIdToSelect]);

  const selectedConversationId = useMemo(() => {
    if (activeConversationId) {
      return activeConversationId;
    }

    if (!conversations.length) {
      return null;
    }

    return conversations[0].id;
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!activeConversationId && conversations.length) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    const stillVisible = conversations.some(
      (conversation) => String(conversation.id) === String(activeConversationId)
    );

    if (!stillVisible) {
      setActiveConversationId(conversations[0]?.id || null);
    }
  }, [activeConversationId, conversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );
  const visibleActiveConversation = activeConversation;

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setIsChatOpen(true);
  };

  const handleSelectUser = async (userId) => {
    try {
      const conversation = await createOrGetDirectConversation.mutateAsync(userId);
      const nextConversationId = conversation?._id;

      if (nextConversationId) {
        setActiveConversationId(nextConversationId);
        setIsChatOpen(true);
        setSearchTerm("");
      }
    } catch (error) {
      toast.error(error.message || "Failed to start direct conversation");
      logger.error("Failed to create/select direct conversation", error, "ChatDashboard");
    }
  };

  const handleGroupCreated = (group) => {
    const createdGroupId = group?._id || group?.id;
    if (!createdGroupId) {
      return;
    }

    setPendingGroupIdToSelect(createdGroupId);
  };

  const handleBackToList = () => {
    setIsChatOpen(false);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      navigate("/login");
    }
  };

  return (
    <main className="theme-bg h-[100dvh] w-screen overflow-hidden">
      <div className="theme-border flex h-full min-h-0 w-full overflow-hidden border bg-[linear-gradient(120deg,var(--surface)_0%,var(--surface-soft)_100%)]">
        <SidebarMenu
          isDarkMode={isDarkMode}
          activeSection="chat"
          onOpenChat={() => navigate("/chat")}
          onOpenGroups={() => navigate("/groups")}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => navigate("/settings")}
          onLogout={handleLogout}
        />

        <div className="flex min-h-0 min-w-0 flex-1 pl-14 sm:pl-0">
          <div
            className={
              isChatOpen
                ? "hidden sm:flex sm:w-[300px] lg:w-[320px]"
                : "flex min-h-0 w-full sm:w-[300px] lg:w-[320px]"
            }
          >
            <ConversationList
              conversations={conversations}
              activeConversationId={visibleActiveConversation?.id}
              onSelectConversation={handleSelectConversation}
              onLoadMore={fetchMoreConversations}
              hasNextPage={hasMoreConversations}
              isFetchingNextPage={isFetchingMoreConversations}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchedUsers={searchedUsers}
              isUserSearchLoading={isUserSearchLoading}
              onSelectUser={handleSelectUser}
              onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
              isLoading={isConversationsLoading}
              isError={isConversationsError}
              errorMessage={conversationsError?.message}
            />
          </div>

          <div
            className={isChatOpen ? "flex min-h-0 min-w-0 flex-1" : "hidden sm:flex sm:min-h-0 sm:min-w-0 sm:flex-1"}
          >
            {visibleActiveConversation ? (
              <ChatWindow
                socket={socket}
                conversationId={visibleActiveConversation.id}
                activeConversation={visibleActiveConversation}
                onBack={handleBackToList}
              />
            ) : (
              <section className="theme-surface flex h-full w-full items-center justify-center p-4 text-sm theme-muted">
                Select a conversation to start chatting.
              </section>
            )}
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreated={handleGroupCreated}
      />
    </main>
  );
};

export default ChatDashboard;
