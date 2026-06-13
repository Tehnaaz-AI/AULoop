import express from "express";
import {
  createListing,
  getListing,
  getListings,
  myListings,
  toggleWishlist,
  updateListingStatus
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getListings);
router.get("/mine", protect, myListings);
router.post("/", protect, upload.fields([{ name: "images", maxCount: 5 }, { name: "video", maxCount: 1 }]), createListing);
router.get("/:id", getListing);
router.patch("/:id/status", protect, updateListingStatus);
router.post("/:id/wishlist", protect, toggleWishlist);

export default router;
