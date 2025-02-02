import net from "net";
import os from "os";
import logger from "../utils/logger"; // Import the logger

function getLocalAddress(netInterface: string): string | undefined {
  const interfaces = os.networkInterfaces();
  const iface = interfaces[netInterface];

  if (!iface) {
    logger.warn(`Interface ${netInterface} not found.`);
    return undefined;
  }

  const addressInfo = iface.find(
    (detail) => detail.family === "IPv4" && !detail.internal
  );
  return addressInfo?.address;
}

export function isPCOnline(
  ip: string,
  netInterface: string,
  port = 3389,
  timeout = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.once("connect", () => {
      logger.info(`Connection successful: ${ip}:${port}`);
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      logger.warn(`Timeout reached for ${ip}:${port}`);
      socket.destroy();
      resolve(false);
    });

    socket.once("error", (err) => {
      logger.error(`Failed to connect to ${ip}:${port} - ${err.message}`);
      socket.destroy();
      resolve(false);
    });

    const options: net.NetConnectOpts = { port, host: ip };

    logger.info(`Checking status for ${ip}:${port} on ${netInterface}`);

    const localAddress = getLocalAddress(netInterface);
    if (localAddress) {
      options.localAddress = localAddress;
      logger.info(`Using local address: ${localAddress}`);
    }

    socket.connect(options);
  });
}
