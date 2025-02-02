import { Router } from "express";
import { PC_DETAILS } from "../config";

const router = Router();

router.get("/", (req, res) => {
  console.log("Getting PC names");
  res.json(Object.keys(PC_DETAILS));
});

export default router;
