import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: String,
    read: { type: Boolean, default: false },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
