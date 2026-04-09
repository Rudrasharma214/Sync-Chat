import { io } from "socket.io-client";
import { api } from "./ApiInstance";
import { logger } from "../utils/logger";

let socketInstance = null;
let isRefreshingSocketAuth = false;

const resolveSocketUrl = () => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
    if (socketUrl) {
        return socketUrl;
    }

    const apiUrl = import.meta.env.VITE_API_URL?.trim();
    if (apiUrl) {
        return apiUrl.replace(/\/api\/?$/, "");
    }

    if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
        return window.location.origin;
    }

    logger.error(
        "Missing VITE_SOCKET_URL and VITE_API_URL for socket connection outside localhost",
        null,
        "SocketService"
    );

    return "http://localhost:3000";
};

export const connectSocket = () => {
    if (socketInstance?.connected) {
        return socketInstance;
    }

    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }

    const socketUrl = resolveSocketUrl();

    socketInstance = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        closeOnBeforeunload: true,
        autoConnect: true,
        reconnection: true,
    });

    socketInstance.on("connect", () => {
        logger.info("Socket connected", { socketId: socketInstance.id }, "SocketService");
    });

    socketInstance.on("disconnect", (reason) => {
        logger.info("Socket disconnected", { reason }, "SocketService");
    });

    socketInstance.on("connect_error", (error) => {
        logger.error("Socket connection failed", error?.message || error, "SocketService");

        const message = String(error?.message || "").toLowerCase();
        const isUnauthorized = message.includes("unauthorized");

        if (!isUnauthorized || isRefreshingSocketAuth) {
            return;
        }

        isRefreshingSocketAuth = true;

        api.post("/auth/refresh-token")
            .then(() => {
                if (!socketInstance) {
                    return;
                }

                socketInstance.connect();
            })
            .catch((refreshError) => {
                logger.error(
                    "Socket auth refresh failed",
                    refreshError?.response?.data || refreshError?.message || refreshError,
                    "SocketService"
                );
            })
            .finally(() => {
                isRefreshingSocketAuth = false;
            });
    });

    return socketInstance;
};

export const disconnectSocket = () => {
    if (!socketInstance) {
        return;
    }

    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
};

export const getSocket = () => socketInstance;
