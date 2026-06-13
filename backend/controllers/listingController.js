import cloudinary from "../config/cloudinary.js";
import Listing from "../models/Listing.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { calculateQualityScore } from "../utils/listingQuality.js";
import { sendSocketNotification } from "../socket/index.js";

const uploadToCloudinary = (file, resourceType = "auto") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "auloop/listings", resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });

export const createListing = async (req, res, next) => {
  try {
    const imageFiles = req.files?.images || [];
    const videoFile = req.files?.video?.[0];

    const images = imageFiles.length ? await Promise.all(imageFiles.map(f => uploadToCloudinary(f, "image"))) : [];
    const video = videoFile ? await uploadToCloudinary(videoFile, "video") : null;
    let tags = [];
    let campusMeetupSpots = [];
    try {
      if (req.body.tags) tags = JSON.parse(req.body.tags);
      if (req.body.campusMeetupSpots) campusMeetupSpots = JSON.parse(req.body.campusMeetupSpots);
    } catch (e) {
      res.status(400);
      throw new Error("Invalid format for tags or campusMeetupSpots");
    }

    const payload = {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      condition: req.body.condition,
      tags,
      campusMeetupSpots,
      images,
      video,
      seller: req.user._id
    };
    payload.qualityScore = calculateQualityScore(payload);

    const listing = await Listing.create(payload);
    res.status(201).json(await listing.populate("seller", "name email trustScore avatar"));
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const { q, category, condition, minPrice, maxPrice, sort = "newest", status, sellerId, buyerId, lostFoundType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = "available";
    
    if (sellerId) filter.seller = sellerId;
    if (buyerId) filter.soldTo = buyerId;
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (lostFoundType) filter.lostFoundType = lostFoundType;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (q) filter.$text = { $search: q };

    const sortMap = {
      newest: { createdAt: -1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      trusted: { qualityScore: -1 }
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(filter)
      .populate("seller", "name email phone trustScore reviewAverage reviewCount avatar completedSales")
      .populate("soldTo", "name email phone")
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNum);

    const total = await Listing.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({ listings, total, page: pageNum, limit: limitNum, totalPages });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate(
        "seller",
        "name email phone trustScore reviewAverage reviewCount avatar completedSales department year"
      )
      .populate(
        "soldTo",
        "name email phone avatar"
      );
    if (!listing) {
      res.status(404);
      throw new Error("Listing not found");
    }
    res.json(listing);
  } catch (error) {
    next(error);
  }
};

  export const updateListingStatus = async (req, res, next) => {
  try {
    const { status, otp } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error("Listing not found");
    }
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("You can update only your own listing");
    }

    listing.status = status;
    if (status === "reserved") listing.reservedFor = req.body.userId || null;
    
    let finalSoldTo = null;
    let buyerUser = null;
    
    if (status === "sold") {
      if (!otp) {
        res.status(400);
        throw new Error("Handover OTP is required to mark an item as sold securely.");
      }
      
      const chat = await Chat.findOne({ listing: listing._id, seller: req.user._id, handoverOtp: otp });
      
      if (!chat) {
         res.status(400);
         throw new Error("Invalid Handover OTP.");
      }
      if (chat.handoverOtpExpires && chat.handoverOtpExpires < new Date()) {
         res.status(400);
         throw new Error("Handover OTP has expired. Ask the buyer to generate a new one.");
      }

      buyerUser = await User.findById(chat.buyer);
      finalSoldTo = buyerUser._id;
      
      listing.soldTo = finalSoldTo;
      
      if (finalSoldTo) {
        await User.findByIdAndUpdate(listing.seller, { $inc: { completedSales: 1 } });
        
        // Create notifications for both seller and buyer
        // Notification for seller
        const saleNotif = await Notification.create({
          user: listing.seller,
          type: "sale",
          title: "Item Sold! 🎉",
          body: `Your listing "${listing.title}" has been sold to ${buyerUser?.name || "a buyer"}!`,
          listing: listing._id,
        });
        
        sendSocketNotification(listing.seller, saleNotif);
        
        // Notification for buyer
        const purchaseNotif = await Notification.create({
          user: finalSoldTo,
          type: "purchase",
          title: "Purchase Successful! 🛒",
          body: `You purchased "${listing.title}"!`,
          listing: listing._id,
        });

        sendSocketNotification(finalSoldTo, purchaseNotif);
      }
      
      await Chat.updateMany({ listing: listing._id }, { $set: { lastMessageAt: new Date() } });
    }
    
    await listing.save();
    // Populate the soldTo field to return full buyer info
    await listing.populate("seller", "name email phone trustScore reviewAverage reviewCount avatar completedSales");
    await listing.populate("soldTo", "name email phone avatar department year");
    
    res.json(listing);
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error("Listing not found");
    }
    const exists = listing.wishlistBy.some((id) => id.toString() === req.user._id.toString());
    listing.wishlistBy = exists
      ? listing.wishlistBy.filter((id) => id.toString() !== req.user._id.toString())
      : [...listing.wishlistBy, req.user._id];
    await listing.save();
    res.json({ wished: !exists, count: listing.wishlistBy.length });
  } catch (error) {
    next(error);
  }
};

export const myListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};
