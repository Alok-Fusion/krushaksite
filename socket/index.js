const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);

require("dotenv").config({
  path: "./.env",
});

app.use(cors());
app.use(express.json());

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Krushak Socket Server is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", onlineUsersCount: users.length });
});

let users = [];

const addUser = (userId, socketId) => {
  if (!userId) return;
  const existingUserIndex = users.findIndex((user) => user.userId === userId);
  if (existingUserIndex !== -1) {
    users[existingUserIndex].socketId = socketId;
  } else {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Register online user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Join a dedicated conversation room
  socket.on("joinConversation", (conversationId) => {
    if (conversationId) {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
    }
  });

  // Leave a conversation room
  socket.on("leaveConversation", (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation room: ${conversationId}`);
    }
  });

  // Send message - supports both room broadcasting and direct receiver delivery
  socket.on("sendMessage", ({ senderId, receiverId, text, images, conversationId }) => {
    const messagePayload = {
      senderId,
      receiverId,
      text,
      images,
      conversationId,
      createdAt: Date.now(),
    };

    // If conversation room exists, broadcast to that room
    if (conversationId) {
      socket.to(conversationId).emit("getMessage", messagePayload);
    }

    // Also forward directly to receiver's socket if online
    const receiver = getUser(receiverId);
    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit("getMessage", messagePayload);
    }
  });

  // Update last message notification
  socket.on("updateLastMessage", ({ lastMessage, lastMessagesId, conversationId }) => {
    if (conversationId) {
      socket.to(conversationId).emit("getLastMessage", {
        lastMessage,
        lastMessagesId,
        conversationId,
      });
    } else {
      io.emit("getLastMessage", {
        lastMessage,
        lastMessagesId,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Krushak Socket Server is running on port ${PORT}`);
});
