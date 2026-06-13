import express from "express";
import { rateLimit } from "express-rate-limit";
import { login, me, register, resendOtp, verifyEmail } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});

const router = express.Router();

router.post("/register", authLimiter, upload.single("avatar"), register);
router.post("/verify", authLimiter, verifyEmail);
router.post("/resend-otp", authLimiter, resendOtp);
router.post("/login", authLimiter, login);
router.get("/me", protect, me);

export default router;
