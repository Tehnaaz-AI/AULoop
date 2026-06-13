import mongoose from "mongoose";

const itemRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    budget: { type: Number, min: 0 },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["open", "fulfilled", "closed"], default: "open" }
  },
  { timestamps: true }
);

itemRequestSchema.index({ title: "text", description: "text" });

const ItemRequest = mongoose.model("ItemRequest", itemRequestSchema);
export default ItemRequest;
