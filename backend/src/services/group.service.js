import mongoose from "mongoose";
import { STATUS } from "../constant/statusCodes.js";
import * as groupRepo from "../repositories/group.repositories.js";
import * as userRepo from "../repositories/user.repositories.js";
import * as conversationRepo from "../repositories/conversation.repositories.js";

const ROLE_PRIORITY = {
    owner: 3,
    admin: 2,
    member: 1,
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeId = (id) => String(id);

const hasRoleAtLeast = (memberRole, requiredRole) => {
    return (ROLE_PRIORITY[memberRole] || 0) >= (ROLE_PRIORITY[requiredRole] || 0);
};

const getMemberEntry = (group, userId) => {
    return group.members.find((member) => normalizeId(member.userId) === normalizeId(userId));
};

const populateGroup = async (group) => {
    if (!group) {
        return null;
    }

    await group.populate([
        { path: "createdBy", select: "id fullname email profilepic" },
        { path: "members.userId", select: "id fullname email profilepic" },
    ]);

    return group;
};

export const createGroup = async (currentUserId, payload) => {
    try {
        const { name, description = "", avatar = "", memberIds = [] } = payload || {};

        if (!name || !String(name).trim()) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Group name is required",
            };
        }

        const allMemberIds = new Set([normalizeId(currentUserId)]);
        for (const memberId of memberIds) {
            if (memberId) {
                allMemberIds.add(normalizeId(memberId));
            }
        }

        const normalizedMembers = Array.from(allMemberIds);
        const invalidMemberId = normalizedMembers.find((memberId) => !isValidObjectId(memberId));

        if (invalidMemberId) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "One or more member IDs are invalid",
            };
        }

        const existingUsers = await Promise.all(
            normalizedMembers.map((memberId) => userRepo.getUserById(memberId))
        );

        const hasMissingUser = existingUsers.some((user) => !user);
        if (hasMissingUser) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "One or more users do not exist",
            };
        }

        const members = normalizedMembers.map((memberId) => ({
            userId: memberId,
            role: normalizeId(memberId) === normalizeId(currentUserId) ? "owner" : "member",
        }));

        const group = await groupRepo.createGroup({
            name: String(name).trim(),
            description: String(description || "").trim(),
            avatar: String(avatar || "").trim(),
            createdBy: currentUserId,
            members,
        });

        await conversationRepo.createConversation({
            type: "group",
            participants: normalizedMembers,
            groupId: group._id,
            lastMessageAt: new Date(),
        });

        const populatedGroup = await populateGroup(group);

        return {
            success: true,
            statusCode: STATUS.CREATED,
            message: "Group created successfully",
            data: populatedGroup,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error creating group",
            error: error.message,
        };
    }
};

export const getMyGroups = async (currentUserId) => {
    try {
        const groups = await groupRepo.getGroupsByMemberId(currentUserId);
        const populatedGroups = await Promise.all(groups.map((group) => populateGroup(group)));

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Groups fetched successfully",
            data: populatedGroups,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error fetching groups",
            error: error.message,
        };
    }
};

export const getGroupById = async (currentUserId, groupId) => {
    try {
        if (!groupId || !isValidObjectId(groupId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid group ID is required",
            };
        }

        const group = await groupRepo.getGroupById(groupId);
        if (!group) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Group not found",
            };
        }

        const currentMember = getMemberEntry(group, currentUserId);
        if (!currentMember) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "You are not a member of this group",
            };
        }

        const populatedGroup = await populateGroup(group);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Group fetched successfully",
            data: populatedGroup,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error fetching group",
            error: error.message,
        };
    }
};

export const updateGroup = async (currentUserId, groupId, payload) => {
    try {
        if (!groupId || !isValidObjectId(groupId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid group ID is required",
            };
        }

        const group = await groupRepo.getGroupById(groupId);
        if (!group) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Group not found",
            };
        }

        const currentMember = getMemberEntry(group, currentUserId);
        if (!currentMember || !hasRoleAtLeast(currentMember.role, "admin")) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only admins or owners can update the group",
            };
        }

        const updateData = {};

        if (payload?.name !== undefined) {
            const nextName = String(payload.name || "").trim();
            if (!nextName) {
                return {
                    success: false,
                    statusCode: STATUS.BAD_REQUEST,
                    message: "Group name cannot be empty",
                };
            }
            updateData.name = nextName;
        }

        if (payload?.description !== undefined) {
            updateData.description = String(payload.description || "").trim();
        }

        if (payload?.avatar !== undefined) {
            updateData.avatar = String(payload.avatar || "").trim();
        }

        const updatedGroup = await groupRepo.updateGroup(groupId, updateData);
        const populatedGroup = await populateGroup(updatedGroup);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Group updated successfully",
            data: populatedGroup,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error updating group",
            error: error.message,
        };
    }
};

export const deleteGroup = async (currentUserId, groupId) => {
    try {
        if (!groupId || !isValidObjectId(groupId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid group ID is required",
            };
        }

        const group = await groupRepo.getGroupById(groupId);
        if (!group) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Group not found",
            };
        }

        const currentMember = getMemberEntry(group, currentUserId);
        if (!currentMember || currentMember.role !== "owner") {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only the group owner can delete the group",
            };
        }

        await groupRepo.deleteGroup(groupId);

        const conversation = await conversationRepo.getConversationByGroupId(groupId);
        if (conversation) {
            await conversationRepo.deleteConversation(conversation._id);
        }

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Group deleted successfully",
            data: null,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error deleting group",
            error: error.message,
        };
    }
};

export const addMembers = async (currentUserId, groupId, memberIds = []) => {
    try {
        if (!groupId || !isValidObjectId(groupId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid group ID is required",
            };
        }

        if (!Array.isArray(memberIds) || !memberIds.length) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "memberIds array is required",
            };
        }

        const group = await groupRepo.getGroupById(groupId);
        if (!group) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Group not found",
            };
        }

        const currentMember = getMemberEntry(group, currentUserId);
        if (!currentMember || !hasRoleAtLeast(currentMember.role, "admin")) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only admins or owners can add members",
            };
        }

        const existingMemberSet = new Set(group.members.map((member) => normalizeId(member.userId)));
        const uniqueNewMemberIds = Array.from(
            new Set(memberIds.map((memberId) => normalizeId(memberId)).filter((memberId) => !existingMemberSet.has(memberId)))
        );

        if (!uniqueNewMemberIds.length) {
            const populatedGroup = await populateGroup(group);
            return {
                success: true,
                statusCode: STATUS.OK,
                message: "No new members to add",
                data: populatedGroup,
            };
        }

        const invalidMemberId = uniqueNewMemberIds.find((memberId) => !isValidObjectId(memberId));
        if (invalidMemberId) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "One or more member IDs are invalid",
            };
        }

        const users = await Promise.all(uniqueNewMemberIds.map((memberId) => userRepo.getUserById(memberId)));
        const hasMissingUser = users.some((user) => !user);
        if (hasMissingUser) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "One or more users do not exist",
            };
        }

        for (const memberId of uniqueNewMemberIds) {
            group.members.push({ userId: memberId, role: "member" });
        }

        await group.save();

        const conversation = await conversationRepo.getConversationByGroupId(groupId);
        if (conversation) {
            const participantSet = new Set(conversation.participants.map((participantId) => normalizeId(participantId)));
            for (const memberId of uniqueNewMemberIds) {
                if (!participantSet.has(memberId)) {
                    conversation.participants.push(memberId);
                }
            }
            await conversation.save();
        }

        const populatedGroup = await populateGroup(group);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Members added successfully",
            data: populatedGroup,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error adding members",
            error: error.message,
        };
    }
};

export const removeMember = async (currentUserId, groupId, memberId) => {
    try {
        if (!groupId || !isValidObjectId(groupId) || !memberId || !isValidObjectId(memberId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid group ID and member ID are required",
            };
        }

        const group = await groupRepo.getGroupById(groupId);
        if (!group) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Group not found",
            };
        }

        const currentMember = getMemberEntry(group, currentUserId);
        if (!currentMember || !hasRoleAtLeast(currentMember.role, "admin")) {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only admins or owners can remove members",
            };
        }

        const targetMember = getMemberEntry(group, memberId);
        if (!targetMember) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Member not found in this group",
            };
        }

        if (targetMember.role === "owner") {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Owner cannot be removed from group",
            };
        }

        group.members = group.members.filter((member) => normalizeId(member.userId) !== normalizeId(memberId));

        if (!group.members.length) {
            return {
                success: false,
                statusCode: STATUS.CONFLICT,
                message: "Group must have at least one member",
            };
        }

        await group.save();

        const conversation = await conversationRepo.getConversationByGroupId(groupId);
        if (conversation) {
            conversation.participants = conversation.participants.filter(
                (participantId) => normalizeId(participantId) !== normalizeId(memberId)
            );
            await conversation.save();
        }

        const populatedGroup = await populateGroup(group);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Member removed successfully",
            data: populatedGroup,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error removing member",
            error: error.message,
        };
    }
};

export const updateMemberRole = async (currentUserId, groupId, memberId, role) => {
    try {
        if (!groupId || !isValidObjectId(groupId) || !memberId || !isValidObjectId(memberId)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Valid group ID and member ID are required",
            };
        }

        const nextRole = String(role || "").trim();
        if (!["admin", "member"].includes(nextRole)) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "Role must be either admin or member",
            };
        }

        const group = await groupRepo.getGroupById(groupId);
        if (!group) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Group not found",
            };
        }

        const currentMember = getMemberEntry(group, currentUserId);
        if (!currentMember || currentMember.role !== "owner") {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Only owner can update member roles",
            };
        }

        const targetMember = getMemberEntry(group, memberId);
        if (!targetMember) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "Member not found in this group",
            };
        }

        if (targetMember.role === "owner") {
            return {
                success: false,
                statusCode: STATUS.FORBIDDEN,
                message: "Owner role cannot be changed",
            };
        }

        targetMember.role = nextRole;
        await group.save();

        const populatedGroup = await populateGroup(group);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Member role updated successfully",
            data: populatedGroup,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error updating member role",
            error: error.message,
        };
    }
};
