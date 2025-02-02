import { Router } from "express";
import { PC_DETAILS } from "../config";
import logger from "../utils/logger"; // Import Winston logger

const router = Router();

router.get("/", (req, res) => {
  logger.debug(`Received headers: ${JSON.stringify(req.headers)}`);
  logger.info("Received request: GET /pcs");

  const pcNames = Object.keys(PC_DETAILS);
  logger.info(`Returning PC names: ${pcNames.join(", ") || "No PCs found"}`);

  res.json(pcNames);
});

export default router;
