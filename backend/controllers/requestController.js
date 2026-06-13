import ItemRequest from "../models/ItemRequest.js";

// @desc    Get all open item requests
// @route   GET /api/requests
// @access  Public
export const getRequests = async (req, res, next) => {
  try {
    const requests = await ItemRequest.find({ status: "open" })
      .populate("requester", "name email trustScore")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new item request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res, next) => {
  try {
    const { title, description, budget } = req.body;
    
    if (!title) {
      res.status(400);
      throw new Error("Title is required");
    }

    const itemRequest = await ItemRequest.create({
      title,
      description,
      budget,
      requester: req.user._id,
      status: "open"
    });

    const populatedRequest = await itemRequest.populate("requester", "name email trustScore");
    res.status(201).json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id/status
// @access  Private
export const updateRequestStatus = async (req, res, next) => {
  try {
    const itemRequest = await ItemRequest.findById(req.params.id);
    
    if (!itemRequest) {
      res.status(404);
      throw new Error("Request not found");
    }

    // Only requester can update status (or admin)
    if (itemRequest.requester.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to update this request");
    }

    itemRequest.status = req.body.status || itemRequest.status;
    await itemRequest.save();

    res.json(itemRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private
export const deleteRequest = async (req, res, next) => {
  try {
    const itemRequest = await ItemRequest.findById(req.params.id);

    if (!itemRequest) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (itemRequest.requester.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to delete this request");
    }

    await itemRequest.deleteOne();
    res.json({ message: "Request removed" });
  } catch (error) {
    next(error);
  }
};
