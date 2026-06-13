import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";

let ioInstance = null;

export const sendSocketNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit("notification:new", notification);
  }
};

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (process.env.CLIENT_URL || "https://au-loop.vercel.app").split(",").map((origin) => origin.trim()),
      credentials: true
    }
  });
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.isBanned) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on("chat:join", async (chatId) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      const isMember = [chat.buyer.toString(), chat.seller.toString()].includes(socket.user._id.toString());
      if (isMember || socket.user.role === "admin") socket.join(`chat:${chatId}`);
    });

    socket.on("message:send", async ({ chatId, body, offer }, callback) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) throw new Error("Chat not found");
        const isMember = [chat.buyer.toString(), chat.seller.toString()].includes(socket.user._id.toString());
        if (!isMember) throw new Error("Chat access denied");

        const message = { sender: socket.user._id, body, offer, readBy: [socket.user._id] };
        chat.messages.push(message);
        chat.lastMessageAt = new Date();
        await chat.save();
        const populated = await Chat.findById(chatId).populate("messages.sender", "name email avatar");
        const created = populated.messages[populated.messages.length - 1];

        // Determine recipient and listing details
        const isSeller = socket.user._id.toString() === chat.seller.toString();
        const recipientId = isSeller ? chat.buyer : chat.seller;
        const listing = await Listing.findById(chat.listing);

        // Create notification for recipient
        const notif = await Notification.create({
          user: recipientId,
          type: "chat",
          title: `New message from ${socket.user.name} 💬`,
          body: listing ? `Regarding: "${listing.title}"` : "You have a new message!",
          chat: chat._id
        });

        sendSocketNotification(recipientId, notif);

        io.to(`chat:${chatId}`).emit("message:new", { chatId, message: created });
        io.to(`user:${chat.buyer}`).to(`user:${chat.seller}`).emit("chat:updated", { chatId });
        callback?.({ ok: true, message: created });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });

    socket.on("message:broadcast", async ({ chatId, message }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      const isMember = [chat.buyer.toString(), chat.seller.toString()].includes(socket.user._id.toString());
      if (!isMember) return;
      socket.to(`chat:${chatId}`).emit("message:new", { chatId, message });
      io.to(`user:${chat.buyer}`).to(`user:${chat.seller}`).emit("chat:updated", { chatId });
    });

    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit("typing", { chatId, userId: socket.user._id, isTyping });
    });

    socket.on("chat:read", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;
        const isMember = [chat.buyer.toString(), chat.seller.toString()].includes(socket.user._id.toString());
        if (!isMember) return;
        
        const result = await Chat.updateOne(
          { _id: chatId },
          { $addToSet: { "messages.$[elem].readBy": socket.user._id } },
          { arrayFilters: [{ "elem.readBy": { $ne: socket.user._id } }] }
        );

        if (result.modifiedCount > 0) {
          io.to(`chat:${chatId}`).emit("chat:read_receipt", { chatId, userId: socket.user._id });
        }
      } catch (error) {
        console.error("Read receipt error:", error);
      }
    });
  });

  return io;
};
