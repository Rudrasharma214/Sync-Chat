import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            required: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ type: 1, updatedAt: -1 });
conversationSchema.index({ groupId: 1 }, { sparse: true, unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
