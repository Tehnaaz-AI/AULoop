import express from "express";
import { createReview, getSellerReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/seller/:sellerId", getSellerReviews);
router.post("/listings/:listingId", protect, createReview);

export default router;
