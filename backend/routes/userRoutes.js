import express from "express";
import {
  createSavedSearch,
  deleteSavedSearch,
  getSavedSearches,
  getPurchases,
  getWishlist,
  updateProfile,
  getUserProfile,
  getTopSellers
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/top", getTopSellers);

router.use(protect);
router.patch("/profile", upload.single("avatar"), updateProfile);
router.get("/wishlist", getWishlist);
router.get("/purchases", getPurchases);
router.get("/saved-searches", getSavedSearches);
router.post("/saved-searches", createSavedSearch);
router.delete("/saved-searches/:id", deleteSavedSearch);
router.get("/:id", getUserProfile);

export default router;
