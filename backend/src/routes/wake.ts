import { Router, Request, Response } from "express";
import { wakePC } from "../services/wolService";
import { PC_DETAILS } from "../config";
import logger from "../utils/logger"; // Import Winston logger

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const pcName = req.query.name as string;

  if (!pcName || !PC_DETAILS[pcName]) {
    logger.warn(`Invalid PC name requested for wake-up: ${pcName}`);
    res.status(400).json({ error: "Invalid PC name" });
    return;
  }

  const { ip, mac, interface: netInterface } = PC_DETAILS[pcName];
  const finalInterface = netInterface || "eth0";

  try {
    logger.info(`Starting wake process for PC: ${pcName} (MAC: ${mac}, IP: ${ip}, Interface: ${finalInterface})`);
    
    await wakePC(mac, ip, finalInterface);

    logger.info(`Successfully sent wake-up signal to ${pcName}`);
    res.json({ message: `${pcName} is awake and ready for remote access.` });
  } catch (error) {
    logger.error(`Error during wake process for ${pcName}: ${error}`);
    res.status(500).json({ error: `Failed to wake PC: ${pcName}` });
  }
});

export default router;
