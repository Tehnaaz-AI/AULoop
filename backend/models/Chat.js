import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, trim: true, maxlength: 1200 },
    offer: {
      amount: Number,
      status: { type: String, enum: ["pending", "accepted", "declined", "countered"], default: "pending" }
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    itemRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ItemRequest" },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    handoverOtp: { type: String, default: null },
    handoverOtpExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

chatSchema.index({ buyer: 1, seller: 1, listing: 1, itemRequest: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
