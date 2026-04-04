import mongoose from "mongoose";
import Message from "../models/message.model.js";
import MessageStatus from "../models/messageStatus.model.js";

export const createMessage = async (messageData) => {
    const message = new Message(messageData);
    return await message.save();
};

export const getMessageById = async (messageId) => {
    return await Message.findById(messageId);
};

export const getPaginatedMessagesByConversation = async (conversationId, userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [result] = await Message.aggregate([
        {
            $match: {
                conversationId: new mongoose.Types.ObjectId(conversationId),
            },
        },
        {
            $lookup: {
                from: "messagestatuses",
                let: { messageId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$messageId", "$$messageId"] },
                                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                                    { $eq: ["$deletedForMe", true] },
                                ],
                            },
                        },
                    },
                ],
                as: "deletedStatus",
            },
        },
        {
            $match: {
                deletedStatus: { $size: 0 },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ]);

    const messages = await Message.populate(result?.data || [], [
        {
            path: "senderId",
            select: "id fullname email profilepic",
        },
        {
            path: "replyTo",
            populate: {
                path: "senderId",
                select: "id fullname email profilepic",
            },
        },
    ]);

    return {
        messages,
        total: result?.totalCount?.[0]?.count || 0,
    };
};

export const updateMessageById = async (messageId, updateData) => {
    return await Message.findByIdAndUpdate(messageId, updateData, { new: true });
};

export const upsertDeleteForMeStatus = async (messageId, userId) => {
    return await MessageStatus.findOneAndUpdate(
        { messageId, userId },
        { $set: { deletedForMe: true } },
        { returnDocument: "after", upsert: true }
    );
};
