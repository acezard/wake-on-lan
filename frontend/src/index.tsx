import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import logger from "./utils/logger";

// Global error handler
window.onerror = (message, source, lineno, colno, error) => {
  logger.error("Unhandled error", { message, source, lineno, colno, error });
};

// Global promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled promise rejection", { reason: event.reason });
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
