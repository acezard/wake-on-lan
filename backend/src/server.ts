import express, { Request, Response } from 'express';
import wol from 'wol';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
const ping = require('ping');
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();

const SERVER_IP = process.env.SERVER_IP || '0.0.0.0';
const PORT = parseInt(process.env.SERVER_PORT || '8080', 10);

// Interface for ping response
interface PingResponse {
    alive: boolean;
}

// Function to check if a device is online
const checkDevice = async (ipAddress: string): Promise<boolean> => {
    const res: PingResponse = await ping.promise.probe(ipAddress);
    return res.alive; // Returns true if the device is reachable
};

// Map PC names to MAC addresses and IPs
const pcDetails = JSON.parse(process.env.PC_DETAILS || '{}') as Record<string, { mac: string; ip: string, rdp_user: string, rdp_password: string }>;

const app = express();

// Allow requests from specific origins
app.use(cors());


// Endpoint: Check if a PC is online
app.get('/status', async (req: Request, res: Response): Promise<void> => {
    const pcName = req.query.name as string;

    if (!pcName || !pcDetails[pcName]) {
        res.status(400).json({ error: 'Invalid PC name' });
        return;
    }

    const { ip } = pcDetails[pcName];
    try {
        const isOnline = await checkDevice(ip);
        res.json({ name: pcName, online: isOnline });
    } catch (error) {
        console.error(`Error checking status of ${pcName}:`, error);
        res.status(500).json({ error: 'Failed to check PC status' });
    }
});

app.get('/wake', async (req: Request, res: Response): Promise<void> => {
    const pcName = req.query.name as string;

    if (!pcName || !pcDetails[pcName]) {
        res.status(400).json({ error: 'Invalid PC name' });
        return;
    }

    const { mac, ip, rdp_user, rdp_password } = pcDetails[pcName];

    if (!rdp_user || !rdp_password) {
        res.status(400).json({ error: `RDP credentials not found for ${pcName}` });
        return;
    }

    try {
        console.log(`[${new Date().toISOString()}] Starting wake process for PC: ${pcName}`);

        // Step 1: Send Wake-on-LAN packet
        console.log(`[${new Date().toISOString()}] Sending Wake-on-LAN packet to MAC: ${mac}`);
        await new Promise<void>((resolve, reject) => {
            wol.wake(mac, { address: '255.255.255.255', port: 9 }, (err) => {
                if (err) {
                    console.error(`[${new Date().toISOString()}] Failed to send WoL packet: ${err.message}`);
                    return reject(err);
                }
                console.log(`[${new Date().toISOString()}] WoL packet sent successfully to ${pcName}`);
                resolve();
            });
        });

        // Step 2: Poll until the PC is online
        console.log(`[${new Date().toISOString()}] Checking if ${pcName} is online...`);
        let online = false;
        for (let i = 0; i < 10; i++) {
            online = await checkDevice(ip);
            if (online) {
                console.log(`[${new Date().toISOString()}] ${pcName} is now online.`);
                break;
            }
            console.log(`[${new Date().toISOString()}] ${pcName} is not online yet. Retrying (${i + 1}/10)...`);
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        }

        if (!online) {
            console.error(`[${new Date().toISOString()}] ${pcName} is not online after WoL.`);
            res.status(500).json({ error: `${pcName} is not online after WoL` });
            return;
        }

        // Step 3: Initiate RDP session
        console.log(`[${new Date().toISOString()}] Initiating RDP session for ${pcName}`);
        const rdpCommand = `DISPLAY=:99 xfreerdp /u:"${rdp_user}" /p:"${rdp_password}" /v:${ip} /dynamic-resolution /cert-ignore`;

        const rdpProcess = exec(rdpCommand, { shell: '/bin/sh' });

        // Monitor process output
        rdpProcess.stdout?.on('data', (data) => {
            console.log(`[RDP Output]: ${data}`);
        });

        rdpProcess.stderr?.on('data', (data) => {
            console.error(`[RDP Error]: ${data}`);
        });

        rdpProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`[${new Date().toISOString()}] RDP session completed successfully for ${pcName}`);
            } else {
                console.error(`[${new Date().toISOString()}] RDP session failed with code ${code} for ${pcName}`);
            }
        });

        // Step 4: Send a success response to the client
        res.json({ message: `${pcName} unlocked and ready for Parsec or Steam.` });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`[${new Date().toISOString()}] Error during wake and unlock process for ${pcName}: ${error.message}`);
            res.status(500).json({ error: `Failed to wake and unlock PC: ${pcName}` });
        } else {
            console.error(`[${new Date().toISOString()}] Unknown error during wake and unlock process for ${pcName}`);
            res.status(500).json({ error: `Failed to wake and unlock PC: ${pcName}` });
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
