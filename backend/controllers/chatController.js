import Chat from "../models/Chat.js";
import Listing from "../models/Listing.js";
import ItemRequest from "../models/ItemRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendSocketNotification } from "../socket/index.js";

export const startChat = async (req, res, next) => {
  try {


    let targetDoc;
    let sellerId;
    let isRequest = false;

    if (req.body.listingId) {
      targetDoc = await Listing.findById(req.body.listingId);
      if (!targetDoc) {
        res.status(404);
        throw new Error("Listing not found");
      }
      sellerId = targetDoc.seller;
    } else if (req.body.requestId) {
      targetDoc = await ItemRequest.findById(req.body.requestId);
      if (!targetDoc) {
        res.status(404);
        throw new Error("Request not found");
      }
      sellerId = targetDoc.requester;
      isRequest = true;
    } else {
      res.status(400);
      throw new Error("listingId or requestId is required");
    }

    if (sellerId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot start a chat with yourself");
    }

    const query = { buyer: req.user._id, seller: sellerId };
    if (isRequest) query.itemRequest = targetDoc._id;
    else query.listing = targetDoc._id;

    const chat = await Chat.findOneAndUpdate(
      query,
      { ...query, lastMessageAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate("listing", "title price images status")
      .populate("itemRequest", "title budget status")
      .populate("buyer seller", "name email avatar trustScore");

    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
};

export const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ $or: [{ buyer: req.user._id }, { seller: req.user._id }] })
      .populate("listing", "title price images status")
      .populate("itemRequest", "title budget status")
      .populate("buyer seller", "name email avatar trustScore")
      .sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (error) {
    next(error);
  }
};

export const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("listing", "title price images status seller")
      .populate("itemRequest", "title budget status")
      .populate("buyer seller messages.sender", "name email avatar trustScore");
    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }
    const isMember = [chat.buyer._id.toString(), chat.seller._id.toString()].includes(req.user._id.toString());
    if (!isMember && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Chat access denied");
    }
    res.json(chat);
  } catch (error) {
    next(error);
  }
};

export const sendChatMessage = async (req, res, next) => {
  try {
    const { body, offer } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }
    const isMember = [chat.buyer.toString(), chat.seller.toString()].includes(req.user._id.toString());
    if (!isMember) {
      res.status(403);
      throw new Error("Chat access denied");
    }
    if (!body?.trim() && !offer?.amount) {
      res.status(400);
      throw new Error("Message or offer is required");
    }

    // Add message to chat
    chat.messages.push({
      sender: req.user._id,
      body: body || "",
      offer,
      readBy: [req.user._id]
    });
    chat.lastMessageAt = new Date();
    await chat.save();

    // Get listing details for notification
    const listing = await Listing.findById(chat.listing);
    
    // Determine who is receiving the notification
    const isSeller = req.user._id.toString() === chat.seller.toString();
    const recipientId = isSeller ? chat.buyer : chat.seller;
    
    // Create notification for recipient
    let notifBody = "You have a new message!";
    if (listing) notifBody = `Regarding: "${listing.title}"`;
    else if (chat.itemRequest) {
      const ir = await ItemRequest.findById(chat.itemRequest);
      if (ir) notifBody = `Regarding Request: "${ir.title}"`;
    }

    const notif = await Notification.create({
      user: recipientId,
      type: "chat",
      title: `New message from ${req.user.name} 💬`,
      body: notifBody,
      chat: chat._id
    });

    sendSocketNotification(recipientId, notif);

    const populated = await Chat.findById(chat._id).populate("messages.sender", "name email avatar");
    res.status(201).json(populated.messages[populated.messages.length - 1]);
  } catch (error) {
    next(error);
  }
};

export const generateHandoverOtp = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id).populate("listing", "status");
    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }
    if (chat.listing && chat.listing.status === "sold") {
      res.status(400);
      throw new Error("This item is already marked as sold.");
    }
    if (chat.buyer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the buyer can generate a handover OTP");
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    chat.handoverOtp = otp;
    chat.handoverOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await chat.save();

    res.json({ otp, expires: chat.handoverOtpExpires });
  } catch (error) {
    next(error);
  }
};
