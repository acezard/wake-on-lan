import { Router, Request, Response } from "express";
import { wakePC } from "../services/wolService";
import { PC_DETAILS } from "../config";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const pcName = req.query.name as string;
  if (!pcName || !PC_DETAILS[pcName]) {
    res.status(400).json({ error: "Invalid PC name" });
  }

  const { ip, mac, interface: netInterface } = PC_DETAILS[pcName];
  const finalInterface = netInterface || "eth0";

  try {
    console.log(`Starting wake process for PC: ${pcName}`);
    await wakePC(mac, ip, finalInterface);
    res.json({ message: `${pcName} is awake and ready for remote access.` });
  } catch (error) {
    console.error(`Error during wake process for ${pcName}:`, error);
    res.status(500).json({ error: `Failed to wake PC: ${pcName}` });
  }
});

export default router;
