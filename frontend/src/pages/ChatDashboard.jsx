import React, { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SidebarMenu from "../components/chat/SidebarMenu";
import ConversationList from "../components/chat/ConversationList";
import ChatArea from "../components/chat/ChatArea";

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
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeConversationId, setActiveConversationId] = useState(dummyConversations[0].id);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const activeConversation = useMemo(
        () => dummyConversations.find((conversation) => conversation.id === activeConversationId) ?? dummyConversations[0],
        [activeConversationId]
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
                            conversations={dummyConversations}
                            activeConversationId={activeConversation.id}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>

                    <div className={isChatOpen ? "flex min-w-0 flex-1" : "hidden sm:flex sm:min-w-0 sm:flex-1"}>
                        <ChatArea activeConversation={activeConversation} onBack={handleBackToList} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ChatDashboard;