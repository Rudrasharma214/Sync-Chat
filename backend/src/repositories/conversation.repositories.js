import Conversation from '../models/conversation.model.js';

export const createConversation = async (conversationData) => {
    const conversation = new Conversation(conversationData);
    return await conversation.save();
};

export const getConversationById = async (id) => {
    return await Conversation.findById(id);
};

export const getDirectConversationByParticipants = async (participantIds) => {
    return await Conversation.findOne({
        type: 'direct',
        participants: { $all: participantIds, $size: participantIds.length },
    });
};

export const getConversationByGroupId = async (groupId) => {
    return await Conversation.findOne({ type: 'group', groupId });
};

export const getConversationsByParticipantId = async (userId) => {
    return await Conversation.find({ participants: userId }).sort({ lastMessageAt: -1 });
};

export const updateConversation = async (id, updateData) => {
    return await Conversation.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteConversation = async (id) => {
    return await Conversation.findByIdAndDelete(id);
};
