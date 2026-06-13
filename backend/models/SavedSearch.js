import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, required: true },
    query: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    condition: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);
export default SavedSearch;
