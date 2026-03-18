import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/sync-chat',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default env;