"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const wol_1 = __importDefault(require("wol"));
const cors_1 = __importDefault(require("cors"));
const ping = require('ping');
// Function to check if a device is online
const checkDevice = (ipAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield ping.promise.probe(ipAddress);
    return res.alive; // Returns true if the device is reachable
});
// Map PC names to MAC addresses and IPs
const pcDetails = {
    antonin: { mac: '00:d8:61:bd:34:18', ip: '192.168.1.177' }, // Antonin's PC
    anthony: { mac: '00:e1:91:ac:72:3f', ip: '192.168.1.101' }, // Anthony's PC
};
const app = (0, express_1.default)();
const PORT = 8080;
// Allow requests from specific origins
app.use((0, cors_1.default)({ origin: ['http://localhost:3000', 'http://192.168.1.177:8080'] }));
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
// Endpoint: Check if a PC is online
app.get('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pcName = req.query.name;
    if (!pcName || !pcDetails[pcName]) {
        res.status(400).json({ error: 'Invalid PC name' });
        return;
    }
    const { ip } = pcDetails[pcName];
    try {
        const isOnline = yield checkDevice(ip);
        res.json({ name: pcName, online: isOnline });
    }
    catch (error) {
        console.error(`Error checking status of ${pcName}:`, error);
        res.status(500).json({ error: 'Failed to check PC status' });
    }
}));
// Endpoint: Wake a PC
app.get('/wake', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pcName = req.query.name;
    if (!pcName || !pcDetails[pcName]) {
        res.status(400).json({ error: 'Invalid PC name' });
        return;
    }
    const { mac } = pcDetails[pcName];
    try {
        yield new Promise((resolve, reject) => {
            wol_1.default.wake(mac, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
        res.json({ message: `Wake-on-LAN packet sent to ${pcName}'s PC (MAC: ${mac})` });
    }
    catch (error) {
        console.error('Failed to send WoL packet:', error);
        res.status(500).json({ error: 'Failed to wake PC' });
    }
}));
// Catch-all handler for React routes
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/build/index.html'));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
