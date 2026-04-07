import Group from '../models/group.model.js';

/**
 * Create a new group document
 * @param {object} groupData - Group data payload
 * @returns {Promise<object>} Created group document
 */
export const createGroup = async (groupData) => {
    const group = new Group(groupData);
    return await group.save();
};

/**
 * Get group by ID
 * @param {string} id - Group ID
 * @returns {Promise<object|null>} Group document
 */
export const getGroupById = async (id) => {
    return await Group.findById(id);
};

/**
 * Get all groups by member user ID
 * @param {string} userId - Member user ID
 * @returns {Promise<object[]>} Group list
 */
export const getGroupsByMemberId = async (userId) => {
    return await Group.find({ 'members.userId': userId }).sort({ updatedAt: -1 });
};

/**
 * Update group by ID
 * @param {string} id - Group ID
 * @param {object} updateData - Partial update data
 * @returns {Promise<object|null>} Updated group document
 */
export const updateGroup = async (id, updateData) => {
    return await Group.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
};

/**
 * Delete group by ID
 * @param {string} id - Group ID
 * @returns {Promise<object|null>} Deleted group document
 */
export const deleteGroup = async (id) => {
    return await Group.findByIdAndDelete(id);
};
