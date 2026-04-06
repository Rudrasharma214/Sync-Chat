import Group from '../models/group.model.js';

export const createGroup = async (groupData) => {
    const group = new Group(groupData);
    return await group.save();
};

export const getGroupById = async (id) => {
    return await Group.findById(id);
};

export const getGroupsByMemberId = async (userId) => {
    return await Group.find({ 'members.userId': userId }).sort({ updatedAt: -1 });
};

export const updateGroup = async (id, updateData) => {
    return await Group.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
};

export const deleteGroup = async (id) => {
    return await Group.findByIdAndDelete(id);
};
