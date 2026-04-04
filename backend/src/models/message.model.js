import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        text: {
            type: String,
            default: "",
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        messageType: {
            type: String,
            enum: ["text", "media"],
            default: "text",
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        deletedForEveryone: {
            type: Boolean,
            default: false,
        },
        isDeletedForEveryone: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;