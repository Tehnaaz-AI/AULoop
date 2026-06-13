import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    phone: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    year: { type: String, trim: true, default: "" },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    description: { type: String, default: "", maxlength: 300, trim: true },
    socials: {
      instagram: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" }
    },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    reviewAverage: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    completedSales: { type: Number, default: 0 },
    badges: [{ type: String, trim: true }],
    reportsCount: { type: Number, default: 0 },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
