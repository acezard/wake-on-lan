import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import statusRouter from "./routes/status";
import wakeRouter from "./routes/wake";
import pcsRouter from "./routes/pcs";
import { PORT } from "./config";

const app = express();
app.use(cors());

// Mount API routes
app.use("/status", statusRouter);
app.use("/wake", wakeRouter);
app.use("/pcs", pcsRouter);

// Optionally, proxy frontend requests to your React dev server
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
  }),
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
