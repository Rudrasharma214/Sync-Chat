import mongoose from "mongoose";

const messageStatusSchema = new mongoose.Schema(
    {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["delivered", "unread", "read"],
            default: "delivered",
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

messageStatusSchema.index({ messageId: 1, userId: 1 }, { unique: true });
messageStatusSchema.index({ userId: 1, status: 1, updatedAt: -1 });

const MessageStatus = mongoose.model("MessageStatus", messageStatusSchema);

export default MessageStatus;
