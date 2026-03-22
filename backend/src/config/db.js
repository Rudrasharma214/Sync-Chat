import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("MongoDB connected");
    } catch (error) {
        logger.error("MongoDB connection failed", error);
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            logger.info("MongoDB disconnected");
        }
    } catch (error) {
        logger.error("MongoDB disconnection failed", error);
        throw error;
    }
};