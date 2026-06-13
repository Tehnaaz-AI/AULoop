import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    images: [{ type: String }],
    video: String,
    category: String,
    priceSuggestion: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" }
    },
    condition: { type: String, enum: ["New", "Like new", "Excellent", "Good", "Fair"], default: "Good" },
    price: { type: Number, required: true },
    negotiable: { type: Boolean, default: true },
    meetupLocation: String,
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    aiTags: [{ type: String }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["active", "sold", "flagged", "removed"], default: "active" }
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", aiTags: "text", category: "text" });

export default mongoose.model("Product", productSchema);
