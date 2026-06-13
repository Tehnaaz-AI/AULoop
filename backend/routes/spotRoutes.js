import express from "express";
import {
  requestSpot,
  getApprovedSpots,
  getPendingSpots,
  updateSpotStatus
} from "../controllers/spotController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / User routes
router.get("/", getApprovedSpots);
router.post("/request", protect, requestSpot);

// Admin routes
router.get("/pending", protect, adminOnly, getPendingSpots);
router.patch("/:id", protect, adminOnly, updateSpotStatus);

export default router;
