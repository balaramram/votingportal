// utils/logger.js
import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

// Ensure log directories exist
const baseLogDir = path.resolve("logs");
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
const logFolders = {
  error: path.join(baseLogDir, "Controller-error"),
  request: path.join(baseLogDir, "Api-request"),
  activity: path.join(baseLogDir, "Api-activity"),
};
Object.values(logFolders).forEach(ensureDir);

const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const type = meta.type || "UNKNOWN";
    return `${timestamp} [${type.toUpperCase()}]:[${level.toUpperCase()}] ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  })
);

const createTransport = (folder, name, level = "info") =>
  new DailyRotateFile({
    filename: path.join(folder, `${name}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "30d",
    level,
    format: logFormat,
  });

const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    createTransport(logFolders.error, "error", "error"),
    createTransport(logFolders.request, "request", logLevel),
    createTransport(logFolders.activity, "activity", "info"),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(baseLogDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(baseLogDir, "rejections.log"),
    }),
  ],
});

// Mask sensitive data
const maskSensitive = (obj = {}) => {
  const clone = { ...obj };
  ["password", "token", "authorization"].forEach((key) => {
    if (clone[key]) clone[key] = "***";
  });
  return clone;
};

// Middleware: Request logger
const requestLogger = (req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const duration = process.hrtime(start);
    const ms = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2);
    const user = req.user || null; // Attach user from auth middleware if available
    const logData = {
      method: req.method,
      protocol: req.protocol,
      host: req.headers.host,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${ms}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      body: maskSensitive(req.body),
      query: req.query,
      user,
    };
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    // General request log
    logger.log(level, "HTTP Request", { ...logData, type: "request" });
    // Activity log based on status code
    switch (res.statusCode) {
      case 401:
        logger.warn("Unauthorized Access", { ...logData, type: "response" });
        break;
      case 403:
        logger.warn("Forbidden Access", { ...logData, type: "response" });
        break;
      case 404:
        logger.warn("Route Not Found", { ...logData, type: "response" });
        break;
      default:
        if (res.statusCode < 300) {
          logger.info("Successful API Activity", {
            ...logData,
            type: "response",
          });
        }
        break;
    }
  });
  next();
};

// Middleware: Error logger
const errorHandler = (err, req, res, next) => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: maskSensitive(req.body),
    query: req.query,
    user: req.user || null,
  };
  logger.error("API Error", errorDetails);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

// Custom error class with optional cause and metadata
class AppError extends Error {
  constructor(message, statusCode = 500, details = null, cause = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.success = (statusCode === 200 || statusCode === 201)? 200 : 500;
    if (cause) this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom: Activity logging for security or event tracking
const logActivity = (message, meta = {}, level = "info") => {
  logger.log(level, message, maskSensitive(meta));
};

export { requestLogger, errorHandler, logActivity, AppError };
