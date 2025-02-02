import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// 🔍 Determine log level from environment
const logLevel = process.env.LOG_LEVEL || "info";
const logDirectory = path.join(__dirname, "../../logs");

// 🔥 Log file rotation setup
const dailyRotateTransport = new DailyRotateFile({
  filename: path.join(logDirectory, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d",
  level: logLevel, // ✅ File logs respect `LOG_LEVEL`
});

// 🔥 Create Winston Logger
const logger = winston.createLogger({
  level: logLevel, // ✅ This controls what gets logged globally
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: logLevel, // ✅ Console logs also respect `LOG_LEVEL`
    }),
    dailyRotateTransport, // ✅ File logs respect `LOG_LEVEL`
  ],
});

// 🔍 Announce current log level
logger.info(`Logger initialized with level: ${logLevel.toUpperCase()}`);

export default logger;
