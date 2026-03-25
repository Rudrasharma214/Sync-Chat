import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        notificationsEnabled: {
            type: Boolean,
            default: true,
        },
        endpoint: {
            type: String,
            default: "",
            trim: true,
        },
        keys: {
            p256dh: {
                type: String,
                default: "",
            },
            auth: {
                type: String,
                default: "",
            },
        }
    },
    {
        timestamps: true,
    }
);

notificationPreferenceSchema.index({ notificationsEnabled: 1, updatedAt: -1 });

const NotificationPreference = mongoose.model(
    "NotificationPreference",
    notificationPreferenceSchema
);

export default NotificationPreference;
