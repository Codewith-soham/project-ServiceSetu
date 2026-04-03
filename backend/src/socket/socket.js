import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

// Tracks all active sockets per user to support multi-device sessions.
const userSockets = new Map();

const parseTokenFromCookie = (cookieHeader = "") => {
  const cookies = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const accessTokenCookie = cookies.find((entry) => entry.startsWith("accessToken="));
  return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
};

const extractToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) {
    return authToken.startsWith("Bearer ") ? authToken.split(" ")[1] : authToken;
  }

  const authHeader = socket.handshake?.headers?.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookieHeader = socket.handshake?.headers?.cookie;
  return parseTokenFromCookie(cookieHeader);
};

const addUserSocket = (userId, socketId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  const sockets = userSockets.get(userId);
  if (!sockets) {
    return;
  }

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
  }
};

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error("Unauthorized: token missing"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = {
        id: decoded?.id,
        role: decoded?.role
      };

      if (!socket.user.id) {
        return next(new Error("Unauthorized: invalid token payload"));
      }

      return next();
    } catch (error) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user.id);
    addUserSocket(userId, socket.id);

    // Per-user room enables broadcast to all user devices.
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      removeUserSocket(userId, socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (!io || !userId || !event) {
    return false;
  }

  const normalizedUserId = String(userId);
  const sockets = userSockets.get(normalizedUserId);

  if (!sockets || sockets.size === 0) {
    return false;
  }

  io.to(`user:${normalizedUserId}`).emit(event, payload);
  return true;
};

export {
  initializeSocket,
  getIO,
  emitToUser,
  userSockets
};
