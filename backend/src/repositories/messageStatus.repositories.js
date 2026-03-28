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

export const getUnreadCountByUserId = async (userId) => {
    return await MessageStatus.countDocuments({ userId, status: "unread" });
};

export const getUnreadStatusesByUserId = async (userId, limit = 20) => {
    return await MessageStatus.find({ userId, status: "unread" })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate({
            path: "messageId",
            select: "text image messageType senderId conversationId createdAt",
            populate: [
                {
                    path: "senderId",
                    select: "fullname email profilepic",
                },
                {
                    path: "conversationId",
                    select: "type participants groupId lastMessageAt",
                },
            ],
        });
};

export const updateMessageStatus = async (id, updateData) => {
    return await MessageStatus.findByIdAndUpdate(id, updateData, { new: true });
};

export const upsertMessageStatus = async (messageId, userId, updateData) => {
    return await MessageStatus.findOneAndUpdate(
        { messageId, userId },
        updateData,
        { returnDocument: "after", upsert: true }
    );
};

export const deleteMessageStatus = async (id) => {
    return await MessageStatus.findByIdAndDelete(id);
};
