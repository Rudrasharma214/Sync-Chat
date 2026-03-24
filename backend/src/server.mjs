import app from "./app.mjs";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { server as socketServer } from "./config/socket.js";
import { getRedisClient, closeRedis } from "./redis/redisConnection.js";

const PORT = env.PORT || 3000;

let server;

const startServer = async () => {
    try {
        await connectDB();
        getRedisClient();
        server = socketServer.listen(PORT, "0.0.0.0", () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error("Failed to start server", err);
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((closeError) => {
                    if (closeError) {
                        reject(closeError);
                        return;
                    }
                    resolve();
                });
            });
        }

        await disconnectDB();
        await closeRedis();
        process.exit(0);
    } catch (err) {
        logger.error("Error during shutdown", err);
        process.exit(1);
    }
};

process.on("SIGINT", () => {
    shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});

process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection", err);
    shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception", err);
    shutdown("UNCAUGHT_EXCEPTION");
});

void app;
startServer();