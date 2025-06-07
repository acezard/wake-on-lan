import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// 🔍 Determine log level from environment, defaulting to 'info'
const env = process.env.NODE_ENV || 'development';
const defaultLevel = process.env.LOG_LEVEL || 'info';

// 🔍 In test environment, only log errors to reduce noise
const consoleLevel = env === 'test' ? 'error' : defaultLevel;

const logDirectory = path.join(__dirname, "../../logs");

// 🔥 Log file rotation setup
const dailyRotateTransport = new DailyRotateFile({
  filename: path.join(logDirectory, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "14d",
  level: defaultLevel, // File logs respect LOG_LEVEL
});

// 🔥 Create Winston Logger
const logger = winston.createLogger({
  level: defaultLevel, // Controls global logging threshold
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: consoleLevel,        // Console respects test override
      silent: env === 'test',     // Silence console entirely in tests
    }),
    dailyRotateTransport,
  ],
});

// 🔍 Announce current log level (will only show outside test env)
logger.info(`Logger initialized with level: ${defaultLevel.toUpperCase()} (env=${env})`);

export default logger;
