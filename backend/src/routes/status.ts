import { Router, Request, Response } from "express";
import { isPCOnline } from "../services/statusCheckService";
import { PC_DETAILS } from "../config";
import logger from "../utils/logger"; // Import Winston logger

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const pcName = req.query.name as string;

  if (!pcName || !PC_DETAILS[pcName]) {
    logger.warn(`Invalid PC name requested: ${pcName}`);
    res.status(400).json({ error: "Invalid PC name" });
    return;
  }

  const { ip, mac, interface: netInterface } = PC_DETAILS[pcName];
  const finalInterface = netInterface || "eth0";

  // Derive the /24 subnet from the IP
  const ipParts = ip.split(".");
  if (ipParts.length !== 4) {
    logger.error(`Invalid IP format for PC ${pcName}: ${ip}`);
    res.status(400).json({ error: "Invalid IP address format" });
    return;
  }
  const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;

  try {
    logger.info(`Checking status for ${pcName} on ${finalInterface} in subnet ${subnet} (MAC: ${mac})`);
    
    const online = await isPCOnline(ip, finalInterface);
    
    logger.info(`Status check complete for ${pcName}: ${online ? "ONLINE" : "OFFLINE"}`);
    res.json({ name: pcName, online });
  } catch (error) {
    logger.error(`Error checking status of ${pcName}: ${error}`);
    res.status(500).json({ error: "Failed to check PC status" });
  }
});

export default router;
