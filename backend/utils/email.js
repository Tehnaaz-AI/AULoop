import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false"
    }
  });
};

export const sendOtpEmail = async ({ to, name, otp }) => {
  const transporter = createTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`OTP for ${to}: ${otp}`);
      return;
    }
    throw new Error("SMTP settings are missing");
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "Your AULoop verification code",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10212b">
          <h2>Welcome to AULoop, ${name}</h2>
          <p>Use this OTP to verify your Anurag University email:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`OTP email failed for ${to}: ${error.message}`);
      console.log(`OTP for ${to}: ${otp}`);
      return;
    }

    error.statusCode = 502;
    error.message =
      "OTP email could not be sent. Check SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT and SMTP_FROM in backend/.env.";
    throw error;
  }
};
