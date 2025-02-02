import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import statusRouter from "./routes/status";
import wakeRouter from "./routes/wake";
import pcsRouter from "./routes/pcs";
import { PORT } from "./config";
import logger from "./utils/logger";
import logsRouter from "./routes/logs";

const app = express();
app.use(express.json()); // ✅ Parses JSON requests properly

app.use(cors());

app.use((req, res, next) => {
  logger.debug(`Incoming request: ${req.method} ${req.url}`, { body: req.body });
  next();
});

// ✅ Move request timing middleware **before** routes
app.use((req, res, next) => {
  const start = Date.now();
  
  // Ensure logging happens **after** response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });

  next(); // ✅ Call `next()` immediately
});



// ✅ Mount API routes (after logging middleware)
app.use("/status", statusRouter);
app.use("/wake", wakeRouter);
app.use("/pcs", pcsRouter);
app.use("/logs", logsRouter);

// ✅ Optionally, proxy frontend requests to your React dev server
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
  }),
);

// ✅ Log when the server starts
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// ✅ Handle graceful shutdown
process.on("SIGINT", () => {
  logger.warn("Server is shutting down (SIGINT received). Cleaning up...");
  process.exit(0);
});
