import Listing from "../models/Listing.js";
import SavedSearch from "../models/SavedSearch.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const updateProfile = async (req, res, next) => {
  try {
    const { name, description, phone, department, year, socials } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (year !== undefined) updateData.year = year;
    if (socials !== undefined) {
      updateData.socials = {};
      if (socials.instagram !== undefined) updateData.socials.instagram = socials.instagram;
      if (socials.twitter !== undefined) updateData.socials.twitter = socials.twitter;
      if (socials.linkedin !== undefined) updateData.socials.linkedin = socials.linkedin;
      if (socials.portfolio !== undefined) updateData.socials.portfolio = socials.portfolio;
    }

    // Handle avatar upload
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "auloop/avatars", resource_type: "image", transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      updateData.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -otpHash -otpExpires");

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const listings = await Listing.find({ wishlistBy: req.user._id })
      .populate("seller", "name email trustScore avatar")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

export const getPurchases = async (req, res, next) => {
  try {
    const listings = await Listing.find({ soldTo: req.user._id })
      .populate("seller", "name email phone trustScore reviewAverage reviewCount")
      .sort({ updatedAt: -1 });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

export const getSavedSearches = async (req, res, next) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(searches);
  } catch (error) {
    next(error);
  }
};

export const createSavedSearch = async (req, res, next) => {
  try {
    const search = await SavedSearch.create({ ...req.body, user: req.user._id });
    res.status(201).json(search);
  } catch (error) {
    next(error);
  }
};

export const deleteSavedSearch = async (req, res, next) => {
  try {
    await SavedSearch.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Saved search deleted" });
  } catch (error) {
    next(error);
  }
};

export const getTopSellers = async (req, res, next) => {
  try {
    const topSellers = await User.find({ isBanned: false, isVerified: true })
      .sort({ trustScore: -1, completedSales: -1 })
      .limit(5)
      .select("name avatar trustScore completedSales department badges");
    res.json(topSellers);
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
