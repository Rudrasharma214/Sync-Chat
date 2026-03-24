import Redis from "ioredis";
import env from "../config/env.js";
import logger from "../config/logger.js";

let connection = null;

const { host, port, username, password, db, tlsEnabled } = env.redis;

try {
    connection = new Redis({
        host,
        port,
        username: username || undefined,
        password: password || undefined,
        db,
        tls: tlsEnabled ? {} : undefined,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    connection.on("connect", () => {
        logger.info(`Connected to Redis successfully on ${host}:${port}`);
    });

    connection.on("error", (err) => {
        logger.error(`Redis connection error on ${host}:${port}: ${err.message}`);
    });

    connection.on("reconnecting", () => {
        logger.warn("Reconnecting to Redis...");
    });

    connection.on("close", () => {
        logger.info("Redis connection closed");
    });
} catch (error) {
    logger.error("Failed to initialize Redis connection", error);
    connection = null;
}

export const getRedisClient = () => connection;

export const closeRedis = async () => {
    if (connection) {
        try {
            await connection.quit();
            logger.info("Redis disconnected");
        } catch (err) {
            logger.error("Redis disconnect error", err);
        } finally {
            connection = null;
        }
    }
};
