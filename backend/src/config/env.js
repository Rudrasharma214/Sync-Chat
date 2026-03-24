import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const toBool = (value, fallback = false) => {
    if (value === undefined) return fallback;
    return value === 'true' || value === '1';
};

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sync-chat',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || '',
        db: Number(process.env.REDIS_DB || 0),
        tlsEnabled: toBool(process.env.REDIS_TLS, false),
    },
};

export default env;