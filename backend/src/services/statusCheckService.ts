import { exec } from "child_process";
import os from "os";
import logger from "../utils/logger";

/**
 * Retrieves the IPv4 address of the specified network interface.
 * @param netInterface - Name of the network interface (e.g., "wlan0").
 * @returns The IPv4 address, or undefined if not found.
 */
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

/**
 * Checks if a host is reachable via an ARP ping using the system 'arping' command.
 * @param ip - The target IP address to check.
 * @param netInterface - The network interface to use (e.g., "wlan0").
 * @param timeout - Timeout for the ARP request in milliseconds (default: 5000).
 * @returns Promise that resolves to true if the host replies to ARP, false otherwise.
 */
export function isPCOnline(
  ip: string,
  netInterface: string,
  timeout = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    const seconds = Math.ceil(timeout / 1000);
    let cmd = `arping -c3 -w${seconds} -I ${netInterface}`;

    const localAddress = getLocalAddress(netInterface);
    if (localAddress) {
      cmd += ` -s ${localAddress}`;
      logger.info(`Using source address ${localAddress} for ARP`);
    }
    cmd += ` ${ip}`;

    logger.info(`Executing ARP ping: ${cmd}`);
    exec(cmd, (err, stdout, stderr) => {
      const output = stdout + stderr;
      // Match common reply patterns:
      const replyRegex = /bytes from|Unicast reply|Received \d+ response/;
      if (!err && replyRegex.test(output)) {
        logger.info(`Host ${ip} is online (ARP reply detected)`);
        resolve(true);
      } else {
        logger.warn(
          `Host ${ip} is offline (no ARP reply or error): ${
            err?.message || output.trim()
          }`
        );
        resolve(false);
      }
    });
  });
}
