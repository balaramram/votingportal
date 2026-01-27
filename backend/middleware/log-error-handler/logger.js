// utils/logger.js
import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

// Ensure logs directory exists
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Dynamic log level based on environment
const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

// Common log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${
      Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
    }`;
  })
);

// Daily rotating combined log
const dailyRotateTransport = new DailyRotateFile({
  filename: path.join(`${logDir}/App-runnig-log`, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "30d",
  level: logLevel,
  format: logFormat,
});

// Daily rotating error-only log
const dailyRotateErrorTransport = new DailyRotateFile({
  filename: path.join(`${logDir}/App-runnig-log`, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
  format: logFormat,
});

// Main logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    dailyRotateTransport,
    dailyRotateErrorTransport,
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
  ],
});

// Attach global crash listeners
const handleFatalCrash = (error, context = "uncaughtException") => {
  logger.error(` [${context.toUpperCase()}] : ${error.message}`, {
    stack: error.stack,
  });

  // Close transports (flush) then exit after a short delay.
  try {
    for (const transport of logger.transports) {
      if (transport && typeof transport.close === "function") {
        transport.close();
      }
    }
  } catch (e) {
    // ignore errors while closing transports
  }

  setTimeout(() => process.exit(1), 200);
};

process.on("uncaughtException", (err) =>
  handleFatalCrash(err, "uncaughtException")
);

process.on("unhandledRejection", (reason) => {
  const error =
    reason instanceof Error ? reason : new Error(JSON.stringify(reason));
  handleFatalCrash(error, "unhandledRejection");
});

process.on("SIGTERM", () => {
  logger.warn("Process terminated (SIGTERM). Cleaning up...");
});

process.on("exit", (code) => {
  logger.info(`Process exited with code ${code}`);
});

// Export logger
export { logger as loggerMain };
