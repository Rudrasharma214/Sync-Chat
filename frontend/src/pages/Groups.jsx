import React, { useMemo, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import SidebarMenu from "../components/chat/SidebarMenu";
import CreateGroupModal from "../components/group/CreateGroupModal";
import GroupDetailsPanel from "../components/group/GroupDetailsPanel";
import { useMyGroups } from "../hooks/useQueries/groupQueries";

const FALLBACK_AVATAR =
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=140&q=80";

const Groups = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout } = useAuth();

    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { data: groups = [], isLoading, isError, error } = useMyGroups();

    const sortedGroups = useMemo(() => {
        if (!Array.isArray(groups)) {
            return [];
        }

        return [...groups].sort((a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0));
    }, [groups]);

    const handleOpenDetails = (groupId) => {
        setSelectedGroupId(groupId);
        setIsDetailsOpen(true);
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
                    activeSection="groups"
                    onOpenChat={() => navigate("/chat")}
                    onOpenGroups={() => navigate("/groups")}
                    onToggleTheme={toggleTheme}
                    onOpenSettings={() => navigate("/settings")}
                    onLogout={handleLogout}
                />

                <section className="flex min-w-0 flex-1 flex-col overflow-hidden pl-16 sm:pl-0">
                    <header className="theme-border flex items-center justify-between border-b px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/chat")}
                                className="theme-border theme-text inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition hover:border-amber-500/70 hover:text-amber-500"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to chat
                            </button>
                            <div>
                                <h1 className="theme-text text-xl font-semibold">Groups</h1>
                                <p className="theme-muted text-xs">Create and manage your group chats</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsCreateGroupOpen(true)}
                            className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
                        >
                            Create group
                        </button>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                        {isLoading ? (
                            <div className="theme-muted py-10 text-center text-sm">Loading groups...</div>
                        ) : isError ? (
                            <div className="theme-muted py-10 text-center text-sm">
                                {error?.message || "Failed to load groups"}
                            </div>
                        ) : sortedGroups.length ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {sortedGroups.map((group) => {
                                    const groupId = group?._id || group?.id;
                                    const memberCount = Array.isArray(group?.members) ? group.members.length : 0;

                                    return (
                                        <article key={groupId} className="theme-border theme-surface rounded-2xl border p-4">
                                            <div className="mb-3 flex items-center gap-3">
                                                <img
                                                    src={group?.avatar || FALLBACK_AVATAR}
                                                    alt={group?.name || "Group"}
                                                    className="h-11 w-11 rounded-xl object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <h2 className="theme-text truncate text-base font-semibold">
                                                        {group?.name || "Unnamed group"}
                                                    </h2>
                                                    <p className="theme-muted inline-flex items-center gap-1 text-xs">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {memberCount} members
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="theme-muted min-h-10 text-sm">
                                                {group?.description || "No description added yet."}
                                            </p>

                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetails(groupId)}
                                                    className="theme-border theme-text rounded-xl border px-3 py-1.5 text-sm transition hover:border-amber-500/70 hover:text-amber-500"
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="theme-muted py-10 text-center text-sm">You have not created or joined any groups yet.</div>
                        )}
                    </div>
                </section>
            </div>

            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                onCreated={(group) => {
                    const groupId = group?._id || group?.id;
                    if (groupId) {
                        setSelectedGroupId(groupId);
                        setIsDetailsOpen(true);
                    }
                }}
            />

            <GroupDetailsPanel
                groupId={selectedGroupId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onDeleted={(deletedGroupId) => {
                    if (String(selectedGroupId) === String(deletedGroupId)) {
                        setIsDetailsOpen(false);
                        setSelectedGroupId(null);
                    }
                }}
            />
        </main>
    );
};

export default Groups;
