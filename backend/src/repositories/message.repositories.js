import Message from '../models/message.model.js';

export const createMessage = async (messageData) => {
    const message = new Message(messageData);
    return await message.save();
};

export const getMessageById = async (id) => {
    return await Message.findById(id);
};

export const getMessagesByConversationId = async (conversationId) => {
    return await Message.find({ conversationId }).sort({ createdAt: -1 });
};

export const updateMessage = async (id, updateData) => {
    return await Message.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteMessage = async (id) => {
    return await Message.findByIdAndDelete(id);
};
