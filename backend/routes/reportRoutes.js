import express from "express";
import { createReport, getReports, updateReport } from "../controllers/reportController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, adminOnly, getReports);
router.patch("/:id", protect, adminOnly, updateReport);

export default router;
