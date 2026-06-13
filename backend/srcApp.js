import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationsRoutes from "./routes/notifications.js";
import productsRoutes from "./routes/products.js";
import requestRoutes from "./routes/requestRoutes.js";
import spotRoutes from "./routes/spotRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(",").map(o => o.trim())
  : ["https://au-loop.vercel.app", "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 80, standardHeaders: true }),
  authRoutes
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/listings", listingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/spots", spotRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "AULoop", time: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

export default app;
