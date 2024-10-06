import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // this map stores socket id corresponding to the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`); // Log user connection
  }

  const onlineUsers = Object.keys(userSocketMap);
  console.log("Online Users:", onlineUsers); // Log online users
  io.emit("getOnlineUsers", onlineUsers); // Emit online users list

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User disconnected: ${userId}`); // Log user disconnection
    }
    const updatedOnlineUsers = Object.keys(userSocketMap);
    console.log("Updated Online Users:", updatedOnlineUsers); // Log updated online users
    io.emit("getOnlineUsers", updatedOnlineUsers); // Emit updated online users list
  });
});

export { app, server, io };
