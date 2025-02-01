import express, { Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();

const SERVER_IP = process.env.SERVER_IP || '0.0.0.0';
const PORT = parseInt(process.env.SERVER_PORT || '8080', 10);

// Map PC names to MAC addresses and IPs
const pcDetails = JSON.parse(process.env.PC_DETAILS || '{}') as Record<string, { mac: string; ip: string, interface: string}>;
const app = express();

// Allow requests from specific origins
app.use(cors());


/**
 * Runs arp-scan on a given interface and subnet,
 * then checks whether the output contains the target MAC address.
 *
 * @param mac The MAC address to search for.
 * @param netInterface The network interface to use (e.g., "eth0", "wlan0").
 * @param subnet The subnet to scan (e.g., "192.168.1.0/24").
 * @returns A promise that resolves to true if the MAC is found, false otherwise.
 */
function arpScanCheck(mac: string, netInterface: string, subnet = '192.168.1.0/24'): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const command = `arp-scan --interface=${netInterface} ${subnet}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`arp-scan error: ${error.message}`, stderr);
        return reject(error);
      }
      // Log the raw output if needed for debugging
      console.log(`arp-scan output:\n${stdout}`);
      // Check if the output (in lowercase) contains the target MAC (also lowercased)
      const found = stdout.toLowerCase().includes(mac.toLowerCase());
      resolve(found);
    });
  });
}

// Endpoint: Check if a PC is online (using arp-scan and MAC address)
app.get('/status', async (req: Request, res: Response): Promise<void> => {
  const pcName = req.query.name as string;
  if (!pcName || !pcDetails[pcName]) {
    res.status(400).json({ error: 'Invalid PC name' });
    return;
  }

  const { ip, mac, interface: netInterface } = pcDetails[pcName];
  // fallback to eth0 if none specified
  const finalInterface = netInterface || 'eth0';

  // Derive a /24 subnet from the IP.
  // (For example, "192.168.1.177" becomes "192.168.1.0/24")
  const ipParts = ip.split('.');
  if (ipParts.length !== 4) {
    res.status(400).json({ error: 'Invalid IP address format' });
    return;
  }
  const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;

  try {
    console.log(`[${new Date().toISOString()}] Checking ARP status for ${pcName} on ${finalInterface} in subnet ${subnet} (MAC: ${mac})`);
    const isOnline = await arpScanCheck(mac, finalInterface, subnet);
    res.json({ name: pcName, online: isOnline });
  } catch (error) {
    console.error(`Error checking ARP status of ${pcName}:`, error);
    res.status(500).json({ error: 'Failed to check PC status' });
  }
});

app.get('/wake', async (req: Request, res: Response): Promise<void> => {
    const pcName = req.query.name as string;

    if (!pcName || !pcDetails[pcName]) {
        res.status(400).json({ error: 'Invalid PC name' });
        return
    }

    // Destructure the properties from pcDetails
    const { mac, interface: netInterface } = pcDetails[pcName];
    // Fallback to eth0 if no interface is specified
    const finalInterface = netInterface || 'eth0';

    try {
        console.log(`[${new Date().toISOString()}] Starting wake process for PC: ${pcName}`);

        // Step 1: Send Wake-on-LAN packet via 'ether-wake'
        console.log(`[${new Date().toISOString()}] Sending Wake-on-LAN packet to MAC: ${mac} via ${finalInterface}`);
        await new Promise<void>((resolve, reject) => {
            // Construct the ether-wake command
            const command = `ether-wake -i ${finalInterface} ${mac}`;
            console.log(`[${new Date().toISOString()}] Executing command: ${command}`);

            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`[${new Date().toISOString()}] Failed to send WoL packet: ${error.message}`);
                    return reject(error);
                }
                if (stderr) {
                    console.log(`[${new Date().toISOString()}] ether-wake stderr: ${stderr}`);
                }
                console.log(`[${new Date().toISOString()}] WoL packet sent successfully to ${pcName}`);
                resolve();
            });
        });

        // Step 2: Poll until the PC is online (checking TCP port 3389 for RDP)
        console.log(`[${new Date().toISOString()}] Checking if ${pcName} is online...`);
        let online = false;
        for (let i = 0; i < 10; i++) {
            online = await arpScanCheck(mac, finalInterface);
            if (online) {
                console.log(`[${new Date().toISOString()}] ${pcName} is now online.`);
                break;
            }
            console.log(`[${new Date().toISOString()}] ${pcName} is not online yet. Retrying (${i + 1}/10)...`);
            // Wait 5 seconds between checks
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        // If not online after the loop, return an error
        if (!online) {
            console.error(`[${new Date().toISOString()}] ${pcName} is not online after WoL.`);
            res.status(500).json({ error: `${pcName} is not online after WoL` });
            return;
        }

        // Step 3: Respond with success
        res.json({ message: `${pcName} is awake and ready for remote access.` });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`[${new Date().toISOString()}] Error during wake process for ${pcName}: ${error.message}`);
            res.status(500).json({ error: `Failed to wake PC: ${pcName}` });
        } else {
            console.error(`[${new Date().toISOString()}] Unknown error during wake process for ${pcName}`);
            res.status(500).json({ error: `Failed to wake PC: ${pcName}` });
        }
    }
});

app.get('/pcs', (req: Request, res: Response) => {
    res.json(Object.keys(pcDetails));
});

// Proxy frontend requests to React dev server
app.use(
    '/',
    createProxyMiddleware({
        target: 'http://localhost:3000',
        changeOrigin: true,
    })
);

app.listen(PORT, SERVER_IP, () => {
    console.log(`Server running at http://${SERVER_IP}:${PORT}`);
});
