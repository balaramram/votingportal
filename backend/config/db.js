import mongoose from "mongoose";
import { loggerMain } from "../middleware/log-error-handler/logger.js";

const mongoUrl = process.env.MONGO_URL

const retryDelay = 10000;

const Database = async () => {
  const connect = async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        loggerMain.info("MongoDB is already connected.");
        return;
      }

      await mongoose.connect(mongoUrl);

      loggerMain.info("Successfully connected to MongoDB");
    } catch (err) {
      loggerMain.error("MongoDB connection error", { error: err.message });
      setTimeout(connect, retryDelay);
    }
  };

  mongoose.connection.on("disconnected", () => {
    loggerMain.warn("MongoDB disconnected! Retrying...");
    setTimeout(connect, retryDelay);
  });

  mongoose.connection.on("connected", () => {
    loggerMain.info("MongoDB connected.");
  });

  mongoose.connection.on("error", (err) => {
    loggerMain.error("MongoDB connection error", { error: err.message });
  });

  await connect();
};

export default Database;
