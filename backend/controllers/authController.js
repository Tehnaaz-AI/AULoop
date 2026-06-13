import User from "../models/User.js";
import { createOtp, verifyOtp } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";
import { generateToken } from "../utils/token.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const allowedDomain = () => (process.env.COLLEGE_EMAIL_DOMAIN || "anurag.edu.in").toLowerCase();
const isAllowedEmail = (email) => email.toLowerCase().endsWith(`@${allowedDomain()}`);

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
    role: user.role,
    phone: user.phone,
    department: user.department,
  year: user.year,
  avatar: user.avatar,
  description: user.description,
  isVerified: user.isVerified,
  trustScore: user.trustScore,
  reviewAverage: user.reviewAverage,
  reviewCount: user.reviewCount,
  completedSales: user.completedSales
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, year } = req.body;
    if (!name || !email || !password || !phone) {
      res.status(400);
      throw new Error("Name, email, phone and password are required");
    }
    if (!isAllowedEmail(email)) {
      res.status(400);
      throw new Error(`Only ${allowedDomain()} college emails are allowed`);
    }

    let avatarData = {};
    if (req.file) {
      try {
        avatarData = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "auloop/avatars", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, publicId: result.public_id });
            }
          );
          stream.end(req.file.buffer);
        });
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
      }
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const { otp, otpHash, otpExpires } = await createOtp();
    const exists = await User.findOne({ email: email.toLowerCase() }).select("+otpHash +otpExpires");

    if (exists?.isVerified) {
      res.status(409);
      throw new Error("Email is already registered. Please login.");
    }

    if (exists && !exists.isVerified) {
      exists.otpHash = otpHash;
      exists.otpExpires = otpExpires;
      if (Object.keys(avatarData).length) exists.avatar = avatarData;
      await exists.save();
      await sendOtpEmail({ to: exists.email, name: exists.name, otp });
      return res.status(200).json({
        message: "Account already exists but is not verified. A new OTP has been sent.",
        devOtp: process.env.NODE_ENV === "production" ? undefined : otp
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      department,
      year,
      avatar: avatarData,
      role: adminEmails.includes(email.toLowerCase()) ? "admin" : "student",
      otpHash,
      otpExpires
    });

    await sendOtpEmail({ to: user.email, name: user.name, otp });
    res.status(201).json({
      message: "Registration successful. Check your college email for OTP.",
      devOtp: process.env.NODE_ENV === "production" ? undefined : otp
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Email is already registered. Please login."));
    }
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+otpHash +otpExpires");
    if (!user || !user.otpHash || !user.otpExpires) {
      res.status(400);
      throw new Error("Invalid verification request");
    }
    if (user.otpExpires < new Date()) {
      res.status(400);
      throw new Error("OTP expired. Request a new one.");
    }
    const ok = await verifyOtp(otp, user.otpHash);
    if (!ok) {
      res.status(400);
      throw new Error("Invalid OTP");
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({ token, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+otpHash +otpExpires");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.isVerified) {
      res.status(400);
      throw new Error("Email is already verified");
    }

    const { otp, otpHash, otpExpires } = await createOtp();
    user.otpHash = otpHash;
    user.otpExpires = otpExpires;
    await user.save();
    await sendOtpEmail({ to: user.email, name: user.name, otp });
    res.json({
      message: "New OTP sent",
      devOtp: process.env.NODE_ENV === "production" ? undefined : otp
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    if (user.isBanned) {
      res.status(403);
      throw new Error(`Account banned${user.banReason ? `: ${user.banReason}` : ""}`);
    }
    if (!user.isVerified) {
      res.status(403);
      throw new Error("Please verify your email before logging in");
    }

    user.lastLoginAt = new Date();
    await user.save();
    res.json({ token: generateToken(user), user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({ user: buildUserResponse(req.user) });
};
