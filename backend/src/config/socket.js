import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import env from "./env.js";
import logger from "./logger.js";
import { verifyToken } from "../utils/token.js";
import { getRedisClient } from "../redis/redisConnection.js";
import * as conversationRepo from "../repositories/conversation.repositories.js";

const ONLINE_USERS_KEY = "online_users";
const USER_SOCKET_COUNT_KEY = "online_user_socket_counts";

let io;
let pubClient;
let subClient;

const parseCookieHeader = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, cookiePart) => {
    const [rawKey, ...rawValueParts] = cookiePart.trim().split("=");

    if (!rawKey) {
      return cookies;
    }

    const key = rawKey.trim();
    const value = rawValueParts.join("=").trim();

    if (key) {
      cookies[key] = decodeURIComponent(value || "");
    }

    return cookies;
  }, {});
};

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return String(authToken).startsWith("Bearer ") ? String(authToken).slice(7) : authToken;
  }

  const cookies = parseCookieHeader(socket.handshake.headers?.cookie || "");
  return cookies.accessToken || cookies.jwt || cookies.token || "";
};

const getUserIdFromDecodedToken = (decodedToken) => {
  return decodedToken?.userId || decodedToken?.id || decodedToken?._id || null;
};

const emitOnlineUsers = async () => {
  if (!io || !pubClient) {
    return;
  }

  const onlineUsers = await pubClient.smembers(ONLINE_USERS_KEY);
  io.emit("onlineUsers", onlineUsers);
};

const trackOnlineUser = async (userId) => {
  if (!pubClient || !userId) {
    return;
  }

  const normalizedUserId = String(userId);
  const socketCount = await pubClient.hincrby(USER_SOCKET_COUNT_KEY, normalizedUserId, 1);

  if (socketCount === 1) {
    await pubClient.sadd(ONLINE_USERS_KEY, normalizedUserId);
  }

  await emitOnlineUsers();
};

const untrackOnlineUser = async (userId) => {
  if (!pubClient || !userId) {
    return;
  }

  const normalizedUserId = String(userId);
  const socketCount = await pubClient.hincrby(USER_SOCKET_COUNT_KEY, normalizedUserId, -1);

  if (socketCount <= 0) {
    await pubClient.hdel(USER_SOCKET_COUNT_KEY, normalizedUserId);
    await pubClient.srem(ONLINE_USERS_KEY, normalizedUserId);
  }

  await emitOnlineUsers();
};

const canJoinConversation = async (conversationId, userId) => {
  if (!conversationId || !userId) {
    return false;
  }

  const conversation = await conversationRepo.getConversationById(conversationId);

  if (!conversation) {
    return false;
  }

  return conversation.participants.some((participantId) => participantId.toString() === String(userId));
};

const getConversationIdsForUser = async (userId) => {
  if (!userId) {
    return [];
  }

  const conversations = await conversationRepo.getConversationsByParticipantId(userId);
  return conversations.map((conversation) => String(conversation._id));
};

const joinConversationRoom = async (socket, conversationId, userId) => {
  if (!conversationId) {
    return false;
  }

  const isAllowed = await canJoinConversation(conversationId, userId);

  if (!isAllowed) {
    logger.warn("Socket attempted to join unauthorized conversation", {
      socketId: socket.id,
      userId,
      conversationId,
    });
    return false;
  }

  socket.join(String(conversationId));
  return true;
};

export const initSocket = (server) => {
  if (io) {
    return io;
  }

  const redisClient = getRedisClient();

  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  pubClient = redisClient.duplicate();
  subClient = redisClient.duplicate();

  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    // Detect closed tabs/connections faster so presence updates promptly.
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Clear stale presence state from previous crashes/restarts.
  Promise.all([
    pubClient.del(ONLINE_USERS_KEY),
    pubClient.del(USER_SOCKET_COUNT_KEY),
  ]).catch((error) => {
    logger.warn("Failed to reset stale online presence cache", {
      message: error?.message,
    });
  });

  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decodedUser = verifyToken(token);
      const userId = getUserIdFromDecodedToken(decodedUser);

      if (!userId) {
        return next(new Error("Unauthorized"));
      }

      socket.user = {
        ...decodedUser,
        userId,
      };

      return next();
    } catch (error) {
      logger.warn("Socket authentication failed", {
        message: error.message,
      });
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = String(socket.user?.userId);

    if (!userId || userId === "undefined") {
      logger.warn("Socket connected without a valid userId", {
        socketId: socket.id,
      });
      socket.disconnect(true);
      return;
    }

    try {
      socket.join(userId);

      const userConversationIds = await getConversationIdsForUser(userId);
      for (const conversationId of userConversationIds) {
        socket.join(conversationId);
      }

      const initialConversationId = socket.handshake.auth?.conversationId;
      if (initialConversationId) {
        await joinConversationRoom(socket, initialConversationId, userId);
      }

      const initialConversationIds = socket.handshake.auth?.conversationIds;
      if (Array.isArray(initialConversationIds)) {
        for (const conversationId of initialConversationIds) {
          if (conversationId) {
            await joinConversationRoom(socket, conversationId, userId);
          }
        }
      }

      await trackOnlineUser(userId);

      socket.on("joinConversation", async (conversationId) => {
        await joinConversationRoom(socket, conversationId, userId);
      });

      socket.on("leaveConversation", (conversationId) => {
        if (conversationId) {
          socket.leave(String(conversationId));
        }
      });

      socket.on("typing", async ({ conversationId } = {}) => {
        if (!conversationId) {
          return;
        }

        const isAllowed = await canJoinConversation(conversationId, userId);
        if (!isAllowed) {
          return;
        }

        socket.to(String(conversationId)).emit("typing", { userId });
      });

      socket.on("disconnect", async () => {
        try {
          await untrackOnlineUser(userId);
        } catch (error) {
          logger.error("Failed to update online users on disconnect", error);
        }
      });
    } catch (error) {
      logger.error("Socket connection handling failed", error);
      socket.disconnect(true);
    }
  });

  logger.info("Socket.IO initialized with Redis adapter");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

export const emitToUser = (userId, event, data) => {
  if (!userId) {
    return;
  }

  if (!io) {
    return;
  }

  io.to(String(userId)).emit(event, data);
};

export const emitToConversation = (conversationId, event, data) => {
  if (!conversationId) {
    return;
  }

  if (!io) {
    return;
  }

  io.to(String(conversationId)).emit(event, data);
};

export const closeSocket = async () => {
  try {
    if (io) {
      io.close();
      io = undefined;
    }

    if (pubClient) {
      await pubClient.quit();
      pubClient = undefined;
    }

    if (subClient) {
      await subClient.quit();
      subClient = undefined;
    }

    logger.info("Socket.IO resources closed");
  } catch (error) {
    logger.error("Failed to close Socket.IO resources", error);
  }
};
