import express from "express";
import {
  banUser,
  getAdminStats,
  getAllListings,
  getUserDetails,
  getUsers,
  hideListing,
  removeListing
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.get("/listings", getAllListings);
router.patch("/users/:id/ban", banUser);
router.patch("/listings/:id/hide", hideListing);
router.patch("/listings/:id/remove", removeListing);

export default router;
