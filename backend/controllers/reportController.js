import Report from "../models/Report.js";
import User from "../models/User.js";

export const createReport = async (req, res, next) => {
  try {
    const { listing, reportedUser, reason, details } = req.body;
    if (!listing && !reportedUser) {
      res.status(400);
      throw new Error("Report must target a listing or user");
    }
    const report = await Report.create({
      reporter: req.user._id,
      listing: listing || null,
      reportedUser: reportedUser || null,
      reason,
      details
    });
    if (reportedUser) {
      await User.findByIdAndUpdate(reportedUser, { $inc: { reportsCount: 1, trustScore: -5 } });
    }
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (_req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email isBanned")
      .populate("listing", "title price status")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, adminNote: req.body.adminNote || "" },
      { new: true }
    );
    if (!report) {
      res.status(404);
      throw new Error("Report not found");
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
};
