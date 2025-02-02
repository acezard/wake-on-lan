import { Router, Request, Response } from "express";
import { isPCOnline } from "../services/statusCheckService";
import { PC_DETAILS } from "../config";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const pcName = req.query.name as string;
  if (!pcName || !PC_DETAILS[pcName]) {
    res.status(400).json({ error: "Invalid PC name" });
  }

  const { ip, mac, interface: netInterface } = PC_DETAILS[pcName];
  const finalInterface = netInterface || "eth0";

  // Derive the /24 subnet from the IP
  const ipParts = ip.split(".");
  if (ipParts.length !== 4) {
    res.status(400).json({ error: "Invalid IP address format" });
  }
  const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;

  try {
    console.log(
      `Checking status for ${pcName} on ${finalInterface} in subnet ${subnet} (MAC: ${mac})`,
    );
    const online = await isPCOnline(ip, netInterface);
    res.json({ name: pcName, online });
  } catch (error) {
    console.error(`Error checking status of ${pcName}:`, error);
    res.status(500).json({ error: "Failed to check PC status" });
  }
});

export default router;
