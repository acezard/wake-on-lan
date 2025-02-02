const isProduction = process.env.NODE_ENV === "production";

const logger = {
  debug: (message: string, data?: any) => handleLog("debug", message, data),
  info: (message: string, data?: any) => handleLog("info", message, data),
  warn: (message: string, data?: any) => handleLog("warn", message, data),
  error: (message: string, data?: any) => handleLog("error", message, data),
};

// Core logging function
function handleLog(level: "debug" | "info" | "warn" | "error", message: string, data?: any) {
  // ✅ Log to console in development
  if (!isProduction) {
    const logFn = console[level] || console.log;
    logFn(`[${level.toUpperCase()}]: ${message}`, data || "");
  }

  // ✅ Send logs to backend
  fetch("/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message, data }),
  }).catch((err) => console.error("Failed to send log:", err));
}

export default logger;
