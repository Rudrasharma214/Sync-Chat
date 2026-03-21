import MessageStatus from '../models/messageStatus.model.js';

export const createMessageStatus = async (statusData) => {
    const messageStatus = new MessageStatus(statusData);
    return await messageStatus.save();
};

export const getMessageStatusById = async (id) => {
    return await MessageStatus.findById(id);
};

export const getMessageStatusByMessageAndUser = async (messageId, userId) => {
    return await MessageStatus.findOne({ messageId, userId });
};

export const getMessageStatusesByUserId = async (userId) => {
    return await MessageStatus.find({ userId }).sort({ updatedAt: -1 });
};

export const updateMessageStatus = async (id, updateData) => {
    return await MessageStatus.findByIdAndUpdate(id, updateData, { new: true });
};

export const upsertMessageStatus = async (messageId, userId, updateData) => {
    return await MessageStatus.findOneAndUpdate(
        { messageId, userId },
        updateData,
        { new: true, upsert: true }
    );
};

export const deleteMessageStatus = async (id) => {
    return await MessageStatus.findByIdAndDelete(id);
};
