import express, { Request, Response } from 'express';
import path from 'path';
import wol from 'wol';
import cors from 'cors';
const ping = require('ping');

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
const pcDetails: Record<string, { mac: string; ip: string }> = {
    antonin: { mac: '00:d8:61:bd:34:18', ip: '192.168.1.177' }, // Antonin's PC
    anthony: { mac: '00:e1:91:ac:72:3f', ip: '192.168.1.101' }, // Anthony's PC
};

const app = express();
const PORT = 8080;

// Allow requests from specific origins
app.use(cors({ origin: ['http://localhost:3000', 'http://192.168.1.177:8080'] }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/build')));

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
            wol.wake(mac, (err) => {
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

// Catch-all handler for React routes
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
