// src/services/statusCheckService.ts
import net from "net";
import os from "os";

/**
 * Retrieves the local IPv4 address for the specified network interface.
 *
 * @param netInterface The name of the network interface (e.g., "wlan0", "eth0").
 * @returns The local IPv4 address if found, otherwise undefined.
 */
function getLocalAddress(netInterface: string): string | undefined {
  const interfaces = os.networkInterfaces();
  const iface = interfaces[netInterface];
  if (!iface) {
    console.warn(`Interface ${netInterface} not found.`);
    return undefined;
  }
  // Filter for non-internal IPv4 addresses
  const addressInfo = iface.find(
    (detail) => detail.family === "IPv4" && !detail.internal
  );
  return addressInfo?.address;
}

/**
 * Checks if the PC is online by attempting to connect to its RDP port (3389).
 * The outgoing connection is bound to the IP of the provided network interface.
 *
 * @param ip The IP address of the target PC.
 * @param netInterface The network interface name to use for the connection.
 * @param port The TCP port to check (default 3389 for RDP).
 * @param timeout The connection timeout in milliseconds (default 5000ms).
 * @returns A promise that resolves to true if the PC is online, false otherwise.
 */
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

    // Build connection options
    const options: net.NetConnectOpts = {
      port,
      host: ip,
    };
    console.log(`Checking status for ${ip}:${port} on ${netInterface}`);

    // Dynamically get the local address for the given interface
    const localAddress = getLocalAddress(netInterface);
    console.log(`Using local address: ${localAddress}`);
    if (localAddress) {
      options.localAddress = localAddress;
    }

    socket.connect(options);
  });
}
