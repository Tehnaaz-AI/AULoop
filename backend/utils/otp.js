import bcrypt from "bcryptjs";

export const createOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, otpHash, otpExpires };
};

export const verifyOtp = (otp, hash) => bcrypt.compare(otp, hash);
