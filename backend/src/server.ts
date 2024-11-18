import express, { Request, Response } from 'express';
import path from 'path';
import wol from 'wol';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
const ping = require('ping');
import dotenv from 'dotenv';

dotenv.config();

const SERVER_IP = process.env.SERVER_IP || '0.0.0.0';
const PORT = parseInt(process.env.SERVER_PORT || '8080', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

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
const pcDetails = JSON.parse(process.env.PC_DETAILS || '{}') as Record<string, { mac: string; ip: string }>;

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

// Endpoint: Wake a PC
app.get('/wake', async (req: Request, res: Response): Promise<void> => {
    const pcName = req.query.name as string;

    if (!pcName || !pcDetails[pcName]) {
        res.status(400).json({ error: 'Invalid PC name' });
        return;
    }

    const { mac } = pcDetails[pcName];

    try {
        await new Promise<void>((resolve, reject) => {
            wol.wake(mac, { address: '255.255.255.255', port: 9 }, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        res.json({ message: `Wake-on-LAN packet sent to ${pcName}'s PC (MAC: ${mac})` });
    } catch (error) {
        console.error('Failed to send WoL packet:', error);
        res.status(500).json({ error: 'Failed to wake PC' });
    }
});

app.get('/pcs', (req: Request, res: Response) => {
    res.json(Object.keys(pcDetails));
});

if (NODE_ENV === 'development') {
    console.log('🛠️ Running in development mode: Proxying to React dev server...');
    // Proxy frontend requests to React dev server
    app.use(
        '/',
        createProxyMiddleware({
            target: 'http://localhost:3000',
            changeOrigin: true,
        })
    );
} else {
    console.log('🚀 Running in production mode: Serving frontend build...');
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../../frontend/build')));

    // Catch-all handler for React routes
    app.get('*', (req: Request, res: Response) => {
        try {
            const indexPath = path.join(__dirname, '../../frontend/build/index.html');
            res.sendFile(indexPath);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Frontend build is not available:', error.message);
            } else {
                console.error('Frontend build is not available:', error);
            }
            res.status(503).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Frontend Not Available</title>
                </head>
                <body>
                    <h1>Frontend is still building or not available. Please try again later.</h1>
                </body>
                </html>
            `); // Return a simple "frontend is building" message
        }
    });
}

app.listen(PORT, SERVER_IP, () => {
    console.log(`Server running at http://${SERVER_IP}:${PORT}`);
});
