import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import Chat from "../models/Chat.js";
import Review from "../models/Review.js";

export const getAdminStats = async (_req, res, next) => {
  try {
    const [users, listings, openReports, chats, soldListings] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      Chat.countDocuments(),
      Listing.countDocuments({ status: "sold" })
    ]);
    res.json({ users, listings, openReports, chats, soldListings });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const [selling, purchased, reviews] = await Promise.all([
      Listing.find({ seller: user._id }).populate("soldTo", "name email phone").sort({ createdAt: -1 }),
      Listing.find({ soldTo: user._id }).populate("seller", "name email phone trustScore").sort({ updatedAt: -1 }),
      Review.find({ seller: user._id }).populate("buyer", "name email").populate("listing", "title price")
    ]);
    res.json({ user, selling, purchased, reviews });
  } catch (error) {
    next(error);
  }
};

export const getAllListings = async (_req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate("seller", "name email phone trustScore reviewAverage reviewCount")
      .populate("soldTo reservedFor", "name email phone")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Admin users cannot be banned");
    }
    user.isBanned = Boolean(req.body.isBanned);
    user.banReason = req.body.banReason || "";
    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const hideListing = async (req, res, next) => {
  try {
    if (req.body.status === "hidden" && (!req.body.reason || !req.body.reason.trim())) {
      res.status(400);
      throw new Error("A reason must be provided to hide a listing");
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error("Listing not found");
    }
    listing.status = req.body.status || "hidden";
    listing.hiddenReason = listing.status === "hidden" ? req.body.reason : "";
    await listing.save();
    res.json(listing);
  } catch (error) {
    next(error);
  }
};

export const removeListing = async (req, res, next) => {
  try {
    if (!req.body.reason || !req.body.reason.trim()) {
      res.status(400);
      throw new Error("A reason must be provided to permanently remove a listing");
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error("Listing not found");
    }
    
    await listing.deleteOne();
    res.json({ message: "Listing permanently deleted" });
  } catch (error) {
    next(error);
  }
};
