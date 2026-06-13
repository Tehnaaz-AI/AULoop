import express from "express";
import { getChat, getMyChats, sendChatMessage, startChat, generateHandoverOtp } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", startChat);
router.get("/", getMyChats);
router.post("/:id/messages", sendChatMessage);
router.get("/:id", getChat);
router.post("/:id/generate-otp", generateHandoverOtp);

export default router;
