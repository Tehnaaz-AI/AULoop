import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/meta", (_req, res) => {
  res.json({
    categories: ["Books", "Electronics", "Cycles", "Hostel Essentials", "Fashion", "Sports"],
    meetupZones: ["Hostel A Gate", "Library Entrance", "Main Canteen", "Parking Area", "Innovation Lab"],
    conditions: ["New", "Like new", "Excellent", "Good", "Fair"]
  });
});

router.get("/", asyncHandler(async (req, res) => {
  const { q, category, meetupLocation, condition, negotiable, minPrice, maxPrice, status = "active" } = req.query;
  const filter = { status: "active" };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (meetupLocation) filter.meetupLocation = meetupLocation;
  if (condition) filter.condition = condition;
  if (negotiable) filter.negotiable = negotiable === "true";
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
  if (q) filter.$text = { $search: q };

  const products = await Product.find(filter).populate("sellerId", "name trustScore badges hostel").sort({ createdAt: -1 }).limit(60);
  res.json(products);
}));

router.get("/saved/me", protect, asyncHandler(async (req, res) => {
  const products = await Product.find({ savedBy: req.user._id, status: "active" }).populate("sellerId", "name trustScore badges hostel").sort({ updatedAt: -1 });
  res.json(products);
}));

router.post("/", protect, asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, sellerId: req.user._id });
  res.status(201).json(product);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate("sellerId", "name trustScore badges hostel");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}));

router.get("/:id/related", asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const related = await Product.find({
    _id: { $ne: product._id },
    status: "active",
    $or: [{ category: product.category }, { aiTags: { $in: product.aiTags || [] } }]
  })
    .populate("sellerId", "name trustScore badges hostel")
    .limit(6);
  res.json(related);
}));

router.patch("/:id", protect, asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate({ _id: req.params.id, sellerId: req.user._id }, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}));

router.post("/:id/like", protect, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
  res.json(product);
}));

router.post("/:id/save", protect, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const saved = product.savedBy.some((id) => id.equals(req.user._id));
  product.savedBy = saved ? product.savedBy.filter((id) => !id.equals(req.user._id)) : [...product.savedBy, req.user._id];
  await product.save();
  res.json({ saved: !saved });
}));

export default router;
