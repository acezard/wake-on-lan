import { Router } from "express";
import logger from "../utils/logger";

const router = Router();

router.post("/", (req, res) => {
  try {
    // 🔍 Ensure req.body exists and has expected properties
    if (!req.body || typeof req.body !== "object") {
      logger.warn("Received empty or invalid log request", { body: req.body });
      res.status(400).json({ error: "Invalid JSON payload" });
    }

    const { level, message, data } = req.body;

    if (!level || !message) {
      logger.warn("Received malformed log request", { body: req.body });
      res.status(400).json({ error: "Missing 'level' or 'message' in log request" });
    }

    logger.log({ level, message, meta: data });
    res.status(200).send("Log received");
  } catch (error) {
    logger.error("Error processing log request", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
