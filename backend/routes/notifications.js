import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();
router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ 
    user: req.user._id,
    type: { $in: ["message", "chat", "sale", "purchase"] }
  })
    .populate({
      path: "listing",
      populate: { path: "seller", select: "name email avatar trustScore" }
    })
    .sort({ createdAt: -1 })
    .limit(80);
  res.json(notifications);
}));

router.patch("/read-all", asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: "All notifications marked as read" });
}));

router.patch("/:id/read", asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json(notification);
}));

router.delete("/", asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ message: "All notifications cleared" });
}));

export default router;
