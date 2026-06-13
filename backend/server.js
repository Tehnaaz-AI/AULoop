import "dotenv/config";
import dns from "dns";
import http from "http";
import app from "./srcApp.js";
import connectDB from "./config/db.js";
import { configureSocket } from "./socket/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

configureSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`AULoop API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start AULoop API:", error.message);
    process.exit(1);
  }
};

startServer();
