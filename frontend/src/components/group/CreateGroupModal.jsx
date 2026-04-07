import React, { useMemo, useState } from "react";
import { Loader2, Search, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateGroup } from "../../hooks/useMutation/groupMutation";
import { useSearchUsers } from "../../hooks/useQueries/authQueries";

const FALLBACK_AVATAR =
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=140&q=80";

const getUserId = (user) => user?._id || user?.id;

const CreateGroupModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [avatar, setAvatar] = useState("");
    const [memberSearch, setMemberSearch] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const createGroupMutation = useCreateGroup();

    const { data: searchedUsers = [], isLoading: isSearchingUsers } = useSearchUsers(memberSearch, {
        enabled: isOpen && Boolean(memberSearch.trim()),
    });

    const selectedIds = useMemo(
        () => new Set(selectedMembers.map((member) => String(getUserId(member)))),
        [selectedMembers]
    );

    const searchResults = useMemo(
        () => searchedUsers.filter((user) => !selectedIds.has(String(getUserId(user)))),
        [searchedUsers, selectedIds]
    );

    const resetForm = () => {
        setName("");
        setDescription("");
        setAvatar("");
        setMemberSearch("");
        setSelectedMembers([]);
    };

    const handleClose = () => {
        if (createGroupMutation.isPending) {
            return;
        }
        resetForm();
        onClose?.();
    };

    const handleAddMember = (user) => {
        const userId = getUserId(user);
        if (!userId || selectedIds.has(String(userId))) {
            return;
        }

        setSelectedMembers((prev) => [...prev, user]);
        setMemberSearch("");
    };

    const handleRemoveMember = (memberId) => {
        setSelectedMembers((prev) => prev.filter((member) => String(getUserId(member)) !== String(memberId)));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            toast.error("Group name is required");
            return;
        }

        try {
            const payload = {
                name: name.trim(),
                description: description.trim(),
                avatar: avatar.trim(),
                memberIds: selectedMembers.map((member) => getUserId(member)).filter(Boolean),
            };

            const createdGroup = await createGroupMutation.mutateAsync(payload);
            toast.success("Group created successfully");
            resetForm();
            onCreated?.(createdGroup);
            onClose?.();
        } catch (error) {
            toast.error(error.message || "Failed to create group");
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                onClick={handleClose}
                className="absolute inset-0 bg-black/60"
                aria-label="Close create group dialog"
            />

            <div className="theme-surface theme-border relative z-10 w-full max-w-2xl rounded-3xl border p-4 shadow-2xl sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="theme-text text-xl font-semibold">Create New Group</h2>
                        <p className="theme-muted text-sm">Set up details and invite members to start chatting.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="theme-border theme-muted inline-flex h-9 w-9 items-center justify-center rounded-xl border transition hover:border-amber-500/70 hover:text-amber-500"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1">
                            <span className="theme-muted text-xs font-medium">Group name</span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-500"
                                placeholder="e.g. Product Team"
                                maxLength={60}
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="theme-muted text-xs font-medium">Avatar URL (optional)</span>
                            <input
                                value={avatar}
                                onChange={(event) => setAvatar(event.target.value)}
                                className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-500"
                                placeholder="https://..."
                            />
                        </label>
                    </div>

                    <label className="space-y-1">
                        <span className="theme-muted text-xs font-medium">Description (optional)</span>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                            className="theme-input w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-amber-500"
                            placeholder="What is this group for?"
                        />
                    </label>

                    <div className="theme-border rounded-2xl border p-3">
                        <p className="theme-text mb-2 text-sm font-semibold">Invite members</p>
                        <div className="relative">
                            <Search className="theme-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <input
                                value={memberSearch}
                                onChange={(event) => setMemberSearch(event.target.value)}
                                className="theme-input w-full rounded-xl border py-2 pl-10 pr-3 text-sm outline-none focus:border-amber-500"
                                placeholder="Search users by name or email"
                            />
                        </div>

                        {memberSearch.trim() ? (
                            <div className="theme-border mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border p-2">
                                {isSearchingUsers ? (
                                    <div className="theme-muted text-xs">Searching users...</div>
                                ) : searchResults.length ? (
                                    searchResults.map((user) => (
                                        <button
                                            key={getUserId(user)}
                                            type="button"
                                            onClick={() => handleAddMember(user)}
                                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-amber-500/10"
                                        >
                                            <img
                                                src={user.profilepic || FALLBACK_AVATAR}
                                                alt={user.fullname}
                                                className="h-7 w-7 rounded-lg object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="theme-text truncate text-sm">{user.fullname}</p>
                                                <p className="theme-muted truncate text-xs">{user.email}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="theme-muted text-xs">No users found</div>
                                )}
                            </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedMembers.length ? (
                                selectedMembers.map((member) => {
                                    const memberId = getUserId(member);

                                    return (
                                        <span
                                            key={memberId}
                                            className="theme-border inline-flex items-center gap-2 rounded-full border px-2 py-1"
                                        >
                                            <Users className="theme-muted h-3.5 w-3.5" />
                                            <span className="theme-text text-xs">{member.fullname}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(memberId)}
                                                className="theme-muted transition hover:text-amber-500"
                                                aria-label={`Remove ${member.fullname}`}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    );
                                })
                            ) : (
                                <p className="theme-muted text-xs">No members selected. You can add members later.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="theme-border theme-text rounded-xl border px-4 py-2 text-sm transition hover:border-amber-500/70 hover:text-amber-500"
                            disabled={createGroupMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createGroupMutation.isPending || !name.trim()}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createGroupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Create group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
