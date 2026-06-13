import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 800, default: "" }
  },
  { timestamps: true }
);

reviewSchema.index({ listing: 1, buyer: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
