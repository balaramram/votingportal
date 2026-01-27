import "./config/env.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Database from "./config/db.js";
import { corsOptions } from "./config/corsOrgine.js";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import votingRoutes from "./routes/votingRoute.js";
import { errorHandler } from "./middleware/log-error-handler/logemodule.js";
import {verifyOTP, sendOTP} from "./controller/emailController.js"

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(morgan("dev")); //combined
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send({ success: true, message: "Voting Portal API is running" });
});
// Debug endpoint: returns cookies and headers for troubleshooting authentication
app.get("/debug/cookies", (req, res) => {
  res
    .status(200)
    .json({
      cookies: req.cookies || {},
      authorization: req.headers.authorization || null,
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/voting", votingRoutes);
app.post("/api/send-otp", sendOTP);
app.post("/api/verify-otp",verifyOTP);

// Error handling middleware
app.use(errorHandler);

// Connect to database
Database();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
});
