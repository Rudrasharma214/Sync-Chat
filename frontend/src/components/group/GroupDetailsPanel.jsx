import React, { useMemo, useState } from "react";
import { Circle, FileText, Image, Link2, Loader2, Search, Shield, Trash2, UserPlus, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
    useAddGroupMembers,
    useDeleteGroup,
    useRemoveGroupMember,
    useUpdateGroup,
    useUpdateGroupMemberRole,
} from "../../hooks/useMutation/groupMutation";
import { useSearchUsers } from "../../hooks/useQueries/authQueries";
import { useGroupById } from "../../hooks/useQueries/groupQueries";
import DetailPopupLayout from "../chat/DetailPopupLayout";

const FALLBACK_AVATAR =
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=140&q=80";

const getUserId = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === "object") {
        return value._id || value.id || null;
    }

    return value;
};

const GroupDetailsPanel = ({ groupId, isOpen, onClose, onDeleted }) => {
    const { authUser } = useAuth();
    const currentUserId = authUser?._id || authUser?.id;

    const [memberSearch, setMemberSearch] = useState("");
    const [nameDraft, setNameDraft] = useState("");
    const [descriptionDraft, setDescriptionDraft] = useState("");
    const [avatarDraft, setAvatarDraft] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    const { data: group, isLoading: isGroupLoading } = useGroupById(groupId, {
        enabled: Boolean(groupId && isOpen),
    });

    const updateGroupMutation = useUpdateGroup();
    const addMembersMutation = useAddGroupMembers();
    const removeMemberMutation = useRemoveGroupMember();
    const updateRoleMutation = useUpdateGroupMemberRole();
    const deleteGroupMutation = useDeleteGroup();

    const members = useMemo(() => group?.members || [], [group]);

    const currentMember = useMemo(
        () => members.find((member) => String(getUserId(member?.userId)) === String(currentUserId)),
        [currentUserId, members]
    );

    const currentRole = currentMember?.role || "member";
    const canManageMembers = currentRole === "admin" || currentRole === "owner";
    const canEditGroup = canManageMembers;
    const canDeleteGroup = currentRole === "owner";
    const canChangeRole = currentRole === "owner";

    const memberIdSet = useMemo(
        () => new Set(members.map((member) => String(getUserId(member?.userId)))),
        [members]
    );

    const { data: searchedUsers = [], isLoading: isSearchingUsers } = useSearchUsers(memberSearch, {
        enabled: isOpen && canManageMembers && Boolean(memberSearch.trim()),
    });

    const addableUsers = useMemo(
        () => searchedUsers.filter((user) => !memberIdSet.has(String(getUserId(user)))),
        [memberIdSet, searchedUsers]
    );

    const syncDraftFromGroup = () => {
        setNameDraft(group?.name || "");
        setDescriptionDraft(group?.description || "");
        setAvatarDraft(group?.avatar || "");
    };

    React.useEffect(() => {
        if (group) {
            syncDraftFromGroup();
        }
    }, [group]);

    const handleSaveGroup = async () => {
        if (!groupId) {
            return;
        }

        try {
            await updateGroupMutation.mutateAsync({
                groupId,
                payload: {
                    name: nameDraft,
                    description: descriptionDraft,
                    avatar: avatarDraft,
                },
            });
            toast.success("Group updated");
        } catch (error) {
            toast.error(error.message || "Failed to update group");
        }
    };

    const handleAddMember = async (userId) => {
        if (!groupId || !userId) {
            return;
        }

        try {
            await addMembersMutation.mutateAsync({ groupId, memberIds: [userId] });
            toast.success("Member added");
            setMemberSearch("");
        } catch (error) {
            toast.error(error.message || "Failed to add member");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!groupId || !memberId) {
            return;
        }

        try {
            await removeMemberMutation.mutateAsync({ groupId, memberId });
            toast.success("Member removed");
        } catch (error) {
            toast.error(error.message || "Failed to remove member");
        }
    };

    const handleUpdateRole = async (memberId, role) => {
        if (!groupId || !memberId) {
            return;
        }

        try {
            await updateRoleMutation.mutateAsync({ groupId, memberId, role });
            toast.success("Role updated");
        } catch (error) {
            toast.error(error.message || "Failed to update role");
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupId) {
            return;
        }

        const confirmed = window.confirm("Delete this group permanently?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteGroupMutation.mutateAsync(groupId);
            toast.success("Group deleted");
            onDeleted?.(groupId);
            onClose?.();
        } catch (error) {
            toast.error(error.message || "Failed to delete group");
        }
    };

    if (!isOpen) {
        return null;
    }

    const tabs = [
        { key: "overview", label: "Overview", icon: Circle },
        { key: "members", label: "Members", icon: Users },
        { key: "media", label: "Media", icon: Image },
        { key: "files", label: "Files", icon: FileText },
        { key: "links", label: "Links", icon: Link2 },
    ];

    return (
        <DetailPopupLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Group Details"
            subtitle="Manage members, roles, and group settings"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {activeTab === "overview" ? (
                isGroupLoading ? (
                    <div className="theme-muted flex items-center justify-center py-8 text-sm">Loading group...</div>
                ) : !group ? (
                    <div className="theme-muted py-8 text-sm">Group details not available.</div>
                ) : (
                    <div className="mx-auto w-full max-w-2xl space-y-4">
                        <div className="theme-border rounded-2xl border p-3 sm:p-4">
                            <div className="mb-3 flex items-center gap-3">
                                <img
                                    src={group.avatar || FALLBACK_AVATAR}
                                    alt={group.name}
                                    className="h-14 w-14 rounded-2xl object-cover"
                                />
                                <div>
                                    <p className="theme-text text-base font-semibold">{group.name}</p>
                                    <p className="theme-muted text-xs">{members.length} members</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="space-y-1">
                                    <span className="theme-muted text-xs">Name</span>
                                    <input
                                        value={nameDraft}
                                        onChange={(event) => setNameDraft(event.target.value)}
                                        disabled={!canEditGroup || updateGroupMutation.isPending}
                                        className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-500 disabled:opacity-60"
                                    />
                                </label>

                                <label className="space-y-1">
                                    <span className="theme-muted text-xs">Description</span>
                                    <textarea
                                        value={descriptionDraft}
                                        onChange={(event) => setDescriptionDraft(event.target.value)}
                                        rows={3}
                                        disabled={!canEditGroup || updateGroupMutation.isPending}
                                        className="theme-input w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-500 disabled:opacity-60"
                                    />
                                </label>

                                <label className="space-y-1">
                                    <span className="theme-muted text-xs">Avatar URL</span>
                                    <input
                                        value={avatarDraft}
                                        onChange={(event) => setAvatarDraft(event.target.value)}
                                        disabled={!canEditGroup || updateGroupMutation.isPending}
                                        className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-500 disabled:opacity-60"
                                    />
                                </label>

                                {canEditGroup ? (
                                    <button
                                        type="button"
                                        onClick={handleSaveGroup}
                                        disabled={updateGroupMutation.isPending || !nameDraft.trim()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {updateGroupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                        Save changes
                                    </button>
                                ) : (
                                    <p className="theme-muted text-xs">Only admins or owner can edit group details.</p>
                                )}
                            </div>
                        </div>

                        {canDeleteGroup ? (
                            <button
                                type="button"
                                onClick={handleDeleteGroup}
                                disabled={deleteGroupMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleteGroupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete group
                            </button>
                        ) : (
                            <p className="theme-muted text-xs">Only owner can delete this group.</p>
                        )}
                    </div>
                )
            ) : activeTab === "members" ? (
                isGroupLoading ? (
                    <div className="theme-muted flex items-center justify-center py-8 text-sm">Loading group...</div>
                ) : !group ? (
                    <div className="theme-muted py-8 text-sm">Group details not available.</div>
                ) : (
                    <div className="mx-auto w-full max-w-2xl space-y-4">
                        {canManageMembers ? (
                            <div className="theme-border rounded-2xl border p-3 sm:p-4">
                                <p className="theme-text mb-2 text-sm font-semibold">Add members</p>
                                <div className="relative">
                                    <Search className="theme-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        value={memberSearch}
                                        onChange={(event) => setMemberSearch(event.target.value)}
                                        className="theme-input w-full rounded-xl border py-2 pl-10 pr-3 text-sm outline-none focus:border-amber-500"
                                        placeholder="Search users"
                                    />
                                </div>

                                {memberSearch.trim() ? (
                                    <div className="theme-border mt-2 max-h-36 space-y-1 overflow-y-auto rounded-xl border p-2">
                                        {isSearchingUsers ? (
                                            <p className="theme-muted text-xs">Searching users...</p>
                                        ) : addableUsers.length ? (
                                            addableUsers.map((user) => {
                                                const userId = getUserId(user);

                                                return (
                                                    <button
                                                        key={userId}
                                                        type="button"
                                                        onClick={() => handleAddMember(userId)}
                                                        disabled={addMembersMutation.isPending}
                                                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-amber-500/10"
                                                    >
                                                        <span className="theme-text truncate text-sm">{user.fullname}</span>
                                                        <UserPlus className="h-3.5 w-3.5 text-amber-500" />
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <p className="theme-muted text-xs">No users to add</p>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="theme-border rounded-2xl border p-3 sm:p-4">
                            <p className="theme-text mb-2 text-sm font-semibold">Members</p>

                            <div className="space-y-2">
                                {members.map((member) => {
                                    const user = member?.userId || {};
                                    const memberId = getUserId(user);
                                    const isOwner = member.role === "owner";
                                    const canRemove = canManageMembers && !isOwner;
                                    const canUpdateRole = canChangeRole && !isOwner;

                                    return (
                                        <div
                                            key={`${memberId}-${member.role}`}
                                            className="theme-border flex flex-col gap-2 rounded-xl border px-2 py-2 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <img
                                                    src={user.profilepic || FALLBACK_AVATAR}
                                                    alt={user.fullname || "Member"}
                                                    className="h-8 w-8 rounded-lg object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <p className="theme-text truncate text-sm">{user.fullname || "Unknown user"}</p>
                                                    <p className="theme-muted truncate text-xs">{user.email || "No email"}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-3">
                                                {canUpdateRole ? (
                                                    <div className="theme-border inline-flex items-center rounded-xl border bg-[var(--surface-soft)] p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateRole(memberId, "member")}
                                                            disabled={member.role === "member"}
                                                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${member.role === "member"
                                                                    ? "bg-amber-500 text-slate-900"
                                                                    : "theme-muted hover:text-amber-500"
                                                                }`}
                                                        >
                                                            Member
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateRole(memberId, "admin")}
                                                            disabled={member.role === "admin"}
                                                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${member.role === "admin"
                                                                    ? "bg-amber-500 text-slate-900"
                                                                    : "theme-muted hover:text-amber-500"
                                                                }`}
                                                        >
                                                            Admin
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500">
                                                        <Shield className="h-3 w-3" />
                                                        {member.role}
                                                    </span>
                                                )}

                                                {canRemove ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(memberId)}
                                                        className="theme-border theme-muted inline-flex h-8 w-8 items-center justify-center rounded-lg border transition hover:border-red-500/50 hover:bg-red-500/15 hover:text-red-500"
                                                        title="Remove member"
                                                        aria-label="Remove member"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="theme-muted py-10 text-center text-sm">
                    No {activeTab} available for this group yet.
                </div>
            )}
        </DetailPopupLayout>
    );
};

export default GroupDetailsPanel;
