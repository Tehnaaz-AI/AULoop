import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

const DEMO_TAG = "auloop-demo-seed";

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env before clearing demo data.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const demoUsers = await User.find({ email: /\.demo@anurag\.edu\.in$/ }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);
  const demoListings = await Listing.find({ $or: [{ seller: { $in: demoUserIds } }, { tags: DEMO_TAG }] }).select("_id");
  const demoListingIds = demoListings.map((listing) => listing._id);

  const [notifications, reviews, chats, listings, users] = await Promise.all([
    Notification.deleteMany({ $or: [{ user: { $in: demoUserIds } }, { listing: { $in: demoListingIds } }] }),
    Review.deleteMany({ $or: [{ seller: { $in: demoUserIds } }, { buyer: { $in: demoUserIds } }, { listing: { $in: demoListingIds } }] }),
    Chat.deleteMany({ $or: [{ seller: { $in: demoUserIds } }, { buyer: { $in: demoUserIds } }, { listing: { $in: demoListingIds } }] }),
    Listing.deleteMany({ _id: { $in: demoListingIds } }),
    User.deleteMany({ _id: { $in: demoUserIds } })
  ]);

  console.log("AULoop demo data removed.");
  console.log(`Deleted users: ${users.deletedCount}`);
  console.log(`Deleted listings: ${listings.deletedCount}`);
  console.log(`Deleted chats: ${chats.deletedCount}`);
  console.log(`Deleted reviews: ${reviews.deletedCount}`);
  console.log(`Deleted notifications: ${notifications.deletedCount}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Clear demo failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
