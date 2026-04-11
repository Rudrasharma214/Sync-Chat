import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const toBool = (value, fallback = false) => {
    if (value === undefined) return fallback;
    return value === 'true' || value === '1';
};

const durationToMs = (value, fallbackMs) => {
    if (!value) return fallbackMs;

    if (/^\d+$/.test(value)) {
        return Number(value);
    }

    const match = String(value).trim().match(/^(\d+)(ms|s|m|h|d)$/i);
    if (!match) return fallbackMs;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
};

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sync-chat',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    JWT_ACCESS_COOKIE_MAX_AGE: durationToMs(process.env.JWT_ACCESS_EXPIRES_IN || '15m', 15 * 60 * 1000),
    JWT_REFRESH_COOKIE_MAX_AGE: durationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d', 7 * 24 * 60 * 60 * 1000),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || '',
        db: Number(process.env.REDIS_DB || 0),
        tlsEnabled: toBool(process.env.REDIS_TLS, false),
    },
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
    VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:no-reply@sync-chat.local',
};

export default env;