import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "admin", "member"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            default: "",
            maxlength: 500,
        },
        avatar: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: {
            type: [memberSchema],
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: "Group must have at least one member",
            },
        },
    },
    {
        timestamps: true,
    }
);

groupSchema.index({ createdBy: 1, createdAt: -1 });
groupSchema.index({ "members.userId": 1 });

const Group = mongoose.model("Group", groupSchema);

export default Group;
