import mongoose from "mongoose";

const spotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const MeetupSpot = mongoose.model("MeetupSpot", spotSchema);
export default MeetupSpot;
