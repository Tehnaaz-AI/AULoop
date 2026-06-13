import Listing from "../models/Listing.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { updateUserBadges } from "../utils/badgeManager.js";
const recalculateSellerTrust = async (sellerId) => {
  const reviews = await Review.find({ seller: sellerId });
  const seller = await User.findById(sellerId);
  if (!seller) return null;

  const reviewAverage = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const salesScore = Math.min((seller.completedSales || 0) * 8, 40);
  const reviewScore = reviewAverage ? reviewAverage * 12 : 0;
  const volumeScore = Math.min(reviews.length * 4, 20);
  const baseScore = 50;
  const trustScore = Math.round(Math.min(baseScore + salesScore + reviewScore + volumeScore, 100));

  seller.reviewAverage = Number(reviewAverage.toFixed(1));
  seller.reviewCount = reviews.length;
  seller.trustScore = trustScore;
  await seller.save();
  await updateUserBadges(sellerId);
  return seller;
};

export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      res.status(404);
      throw new Error("Listing not found");
    }
    if (listing.status !== "sold" || listing.soldTo?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the buyer can rate after the item is sold");
    }
    if (listing.reviewedByBuyer) {
      res.status(409);
      throw new Error("Seller already rated for this purchase");
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      res.status(400);
      throw new Error("Rating must be a number between 1 and 5");
    }

    const review = await Review.create({
      listing: listing._id,
      seller: listing.seller,
      buyer: req.user._id,
      rating: parsedRating,
      comment
    });
    listing.reviewedByBuyer = true;
    await listing.save();
    const seller = await recalculateSellerTrust(listing.seller);
    res.status(201).json({ review, seller });
  } catch (error) {
    next(error);
  }
};

export const getSellerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate("buyer", "name email")
      .populate("listing", "title price")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
