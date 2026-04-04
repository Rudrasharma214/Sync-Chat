import { io } from "socket.io-client";
import { logger } from "../utils/logger";

let socketInstance = null;

const resolveSocketUrl = () => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (socketUrl) {
        return socketUrl;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        return apiUrl.replace(/\/api\/?$/, "");
    }

    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    return "http://localhost:3000";
};

export const connectSocket = (token) => {
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
        auth: token ? { token } : {},
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
