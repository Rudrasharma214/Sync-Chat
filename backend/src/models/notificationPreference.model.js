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
        subscriptions: [
            {
                endpoint: {
                    type: String,
                    required: true,
                    trim: true,
                },
                keys: {
                    p256dh: {
                        type: String,
                        required: true,
                    },
                    auth: {
                        type: String,
                        required: true,
                    },
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

notificationPreferenceSchema.index({ notificationsEnabled: 1, updatedAt: -1 });
notificationPreferenceSchema.index({ userId: 1, "subscriptions.endpoint": 1 });

const NotificationPreference = mongoose.model(
    "NotificationPreference",
    notificationPreferenceSchema
);

export default NotificationPreference;
