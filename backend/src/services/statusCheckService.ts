// src/services/statusCheckService.ts
import net from "net";

/**
 * Checks if the PC is online by attempting to connect to its RDP port (3389).
 *
 * @param ip The IP address of the target PC.
 * @param port The TCP port to check (default 3389 for RDP).
 * @param timeout The connection timeout in milliseconds (default 5000ms).
 * @returns A promise that resolves to true if the PC is online, false otherwise.
 */
export function isPCOnline(
  ip: string,
  port = 3389,
  timeout = 5000,
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    // Set a timeout for the connection attempt
    socket.setTimeout(timeout);

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, ip);
  });
}
