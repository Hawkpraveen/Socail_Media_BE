// utils/socketUtils.js

const userSocketMap = new Map();

export const addUser = (userId, socketId) => {
  if (userSocketMap.has(userId)) {
    userSocketMap.get(userId).add(socketId);
  } else {
    userSocketMap.set(userId, new Set([socketId]));
  }
};

export const removeUser = (userId, socketId) => {
  if (userSocketMap.has(userId)) {
    const userSockets = userSocketMap.get(userId);
    userSockets.delete(socketId);
    if (userSockets.size === 0) {
      userSocketMap.delete(userId);
    }
  }
};

export const getReceiverSocketIds = (receiverId) => {
  if (userSocketMap.has(receiverId)) {
    return Array.from(userSocketMap.get(receiverId));
  }
  return [];
};
