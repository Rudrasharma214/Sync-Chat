import React, { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SidebarMenu from "../components/chat/SidebarMenu";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { useConversationById, useConversations } from "../hooks/useQueries/conversationQueries";
import { useSocket } from "../hooks/useSocket";

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

  return {
    id: conversation?._id,
    name:
      (isDirect ? directParticipant?.fullname : group?.name) ||
      (isDirect ? "Direct chat" : "Group chat"),
    avatar: (isDirect ? directParticipant?.profilepic : group?.avatar) || FALLBACK_AVATAR,
    preview: lastMessageText || "No messages yet",
    time: formatConversationTime(conversation?.lastMessageAt),
    unread: 0,
    online: false,
    email: directParticipant?.email || "",
    phone: "",
    about: group?.description || "",
    media: [],
    messages: [],
  };
};

const mapConversationDetails = (conversation, authUserId) => {
  if (!conversation) {
    return null;
  }

  const isDirect = conversation.type === "direct";
  const directParticipant = isDirect
    ? conversation?.participants?.find(
      (participant) => String(participant?._id || participant?.id) !== String(authUserId)
    )
    : null;

  const group = conversation?.groupId;

  return {
    id: conversation._id,
    name: (isDirect ? directParticipant?.fullname : group?.name) || "Conversation",
    avatar: (isDirect ? directParticipant?.profilepic : group?.avatar) || FALLBACK_AVATAR,
    email: directParticipant?.email || "",
    about: group?.description || "",
    phone: "",
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    error: conversationsError,
  } = useConversations();

  const conversations = useMemo(
    () => (Array.isArray(conversationsData) ? conversationsData.map(mapConversationListItem) : []),
    [conversationsData]
  );

  const selectedConversationId = useMemo(() => {
    if (!conversations.length) {
      return null;
    }

    const hasCurrentSelection = conversations.some(
      (conversation) => conversation.id === activeConversationId
    );

    return hasCurrentSelection ? activeConversationId : conversations[0].id;
  }, [activeConversationId, conversations]);

  const { data: activeConversationDetails } = useConversationById(selectedConversationId, {
    enabled: Boolean(selectedConversationId),
  });

  const activeConversation = useMemo(
    () => {
      const baseConversation =
        conversations.find((conversation) => conversation.id === selectedConversationId) || null;

      if (!baseConversation) {
        return null;
      }

      const authUserId = authUser?.id || authUser?._id;
      const details = mapConversationDetails(activeConversationDetails, authUserId);
      return details ? { ...baseConversation, ...details } : baseConversation;
    },
    [activeConversationDetails, authUser, conversations, selectedConversationId]
  );

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setIsChatOpen(true);
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
    <main className="theme-bg h-screen w-screen overflow-hidden">
      <div className="theme-border flex h-full w-full overflow-hidden border bg-[linear-gradient(120deg,var(--surface)_0%,var(--surface-soft)_100%)]">
        <SidebarMenu
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => navigate("/settings")}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 pl-16 sm:pl-0">
          <div
            className={
              isChatOpen
                ? "hidden sm:flex sm:w-[300px] lg:w-[320px]"
                : "flex w-full sm:w-[300px] lg:w-[320px]"
            }
          >
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.id}
              onSelectConversation={handleSelectConversation}
              isLoading={isConversationsLoading}
              isError={isConversationsError}
              errorMessage={conversationsError?.message}
            />
          </div>

          <div
            className={isChatOpen ? "flex min-w-0 flex-1" : "hidden sm:flex sm:min-w-0 sm:flex-1"}
          >
            {activeConversation ? (
              <ChatWindow
                socket={socket}
                conversationId={activeConversation.id}
                activeConversation={activeConversation}
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
    </main>
  );
};

export default ChatDashboard;
