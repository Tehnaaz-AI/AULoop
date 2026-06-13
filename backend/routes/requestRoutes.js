import express from "express";
import { getRequests, createRequest, updateRequestStatus, deleteRequest } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getRequests)
  .post(protect, createRequest);

router.route("/:id")
  .delete(protect, deleteRequest);

router.route("/:id/status")
  .patch(protect, updateRequestStatus);

export default router;
