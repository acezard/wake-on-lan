import dotenv from "dotenv";

dotenv.config();

export const PC_DETAILS: Record<
  string,
  { mac: string; ip: string; interface: string }
> = JSON.parse(process.env.PC_DETAILS || "{}");

export const PORT = process.env.PORT || 8080;
