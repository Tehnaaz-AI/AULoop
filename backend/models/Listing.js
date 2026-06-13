import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1600 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["Books", "Cycles", "Electronics", "Hostel", "Lab Gear", "Sports", "Other", "Campus Radar"],
      required: true
    },
    condition: {
      type: String,
      enum: ["Like New", "Good", "Fair", "Needs Repair"],
      required: true
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    video: {
      url: { type: String },
      publicId: { type: String }
    },
    lostFoundType: { type: String, enum: ["lost", "found", null], default: null },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["available", "reserved", "sold", "hidden"], default: "available" },
    hiddenReason: { type: String, trim: true, default: "" },
    campusMeetupSpots: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    wishlistBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0, min: 0, max: 100 },
    reservedFor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    soldTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedByBuyer: { type: Boolean, default: false }
  },
  { timestamps: true }
);

listingSchema.index({ title: "text", description: "text", tags: "text", category: "text" });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
