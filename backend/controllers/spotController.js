import MeetupSpot from "../models/MeetupSpot.js";

// Request a new spot
export const requestSpot = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      res.status(400);
      throw new Error("Spot name is required");
    }

    // Check if it already exists
    const existing = await MeetupSpot.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      if (existing.status === "approved") {
        return res.status(400).json({ message: "Spot already exists and is approved" });
      } else if (existing.status === "pending") {
        return res.status(400).json({ message: "Spot is already pending approval" });
      }
    }

    const spot = await MeetupSpot.create({
      name: name.trim(),
      requestedBy: req.user._id
    });

    res.status(201).json(spot);
  } catch (error) {
    next(error);
  }
};

// Get all approved spots
export const getApprovedSpots = async (req, res, next) => {
  try {
    const spots = await MeetupSpot.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(spots);
  } catch (error) {
    next(error);
  }
};

// Admin: Get pending spots
export const getPendingSpots = async (req, res, next) => {
  try {
    const spots = await MeetupSpot.find({ status: "pending" })
      .populate("requestedBy", "name email")
      .sort({ createdAt: 1 });
    res.json(spots);
  } catch (error) {
    next(error);
  }
};

// Admin: Approve or Reject spot
export const updateSpotStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    const spot = await MeetupSpot.findById(req.params.id);
    if (!spot) {
      res.status(404);
      throw new Error("Spot not found");
    }

    spot.status = status;
    await spot.save();

    res.json(spot);
  } catch (error) {
    next(error);
  }
};
