import MessageStatus from '../models/messageStatus.model.js';
import Message from '../models/message.model.js';

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
    return await MessageStatus.countDocuments({
        userId,
        status: "unread",
        deletedForMe: { $ne: true },
    });
};

export const getUnreadStatusesByUserId = async (userId, limit = 20) => {
    return await MessageStatus.find({
        userId,
        status: "unread",
        deletedForMe: { $ne: true },
    })
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

export const getUnreadCountsByConversation = async (userId) => {
    return await MessageStatus.aggregate([
        {
            $match: {
                userId,
                status: "unread",
                deletedForMe: { $ne: true },
            },
        },
        {
            $lookup: {
                from: "messages",
                localField: "messageId",
                foreignField: "_id",
                as: "message",
            },
        },
        {
            $unwind: "$message",
        },
        {
            $group: {
                _id: "$message.conversationId",
                count: { $sum: 1 },
            },
        },
    ]);
};

export const updateMessageStatus = async (id, updateData) => {
    return await MessageStatus.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
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

export const deleteMessageStatusesByMessageIds = async (messageIds = []) => {
    if (!Array.isArray(messageIds) || !messageIds.length) {
        return { deletedCount: 0 };
    }

    return await MessageStatus.deleteMany({
        messageId: { $in: messageIds },
    });
};

export const upsertUnreadStatusesForMessage = async (messageId, userIds = []) => {
    if (!messageId || !Array.isArray(userIds) || !userIds.length) {
        return;
    }

    await Promise.all(
        userIds.map((userId) =>
            MessageStatus.findOneAndUpdate(
                { messageId, userId },
                {
                    $set: {
                        status: "unread",
                        readAt: null,
                        deletedForMe: false,
                    },
                },
                {
                    returnDocument: "after",
                    upsert: true,
                }
            )
        )
    );
};

export const markConversationMessagesAsRead = async (conversationId, userId) => {
    if (!conversationId || !userId) {
        return { modifiedCount: 0 };
    }

    const conversationMessages = await Message.find({ conversationId }).select("_id");
    if (!conversationMessages.length) {
        return { modifiedCount: 0 };
    }

    const messageIds = conversationMessages.map((message) => message._id);

    return await MessageStatus.updateMany(
        {
            userId,
            messageId: { $in: messageIds },
            status: { $ne: "read" },
        },
        {
            $set: {
                status: "read",
                readAt: new Date(),
            },
        }
    );
};
