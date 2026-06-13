import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: null },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reason: {
      type: String,
      enum: ["Scam", "Spam", "Wrong Category", "Abusive Chat", "Sold Outside App", "Other"],
      required: true
    },
    details: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["open", "reviewing", "resolved", "dismissed"], default: "open" },
    adminNote: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
