import chokidar from 'chokidar';
import { exec, ChildProcess } from 'child_process';

// Paths to watch
const frontendPath = './frontend/src'; // Path to frontend source code
const backendPath = './backend/dist'; // Path to backend compiled files

// Function to run shell commands
const runCommand = (command: string, name: string): ChildProcess => {
    console.log(`[${name}] Running: ${command}`);
    const process = exec(command);

    process.stdout?.on('data', (data) => {
        console.log(`[${name}]: ${data}`);
    });

    process.stderr?.on('data', (data) => {
        console.error(`[${name} Error]: ${data}`);
    });

    process.on('close', (code) => {
        if (code !== 0) {
            console.error(`[${name}] exited with code ${code}`);
        } else {
            console.log(`[${name}] completed successfully.`);
        }
    });

    return process;
};

// Start initial frontend build
console.log('[Frontend] Initial build...');
runCommand('npm run build --prefix frontend', 'Frontend');

// Start backend server
console.log('[Backend] Starting server...');
let backendProcess: ChildProcess | null = runCommand('node ./backend/dist/server.js', 'Backend');

// Watch frontend for changes
chokidar.watch(frontendPath, { ignoreInitial: true }).on('all', (event, path) => {
    console.log(`[Frontend] Detected ${event} in ${path}. Rebuilding...`);
    runCommand('npm run build --prefix frontend', 'Frontend');
});

// Watch backend for changes
chokidar.watch(backendPath, { ignoreInitial: true }).on('all', (event, path) => {
    console.log(`[Backend] Detected ${event} in ${path}. Restarting server...`);
    if (backendProcess) {
        backendProcess.kill(); // Kill the existing backend process
    }
    backendProcess = runCommand('node ./backend/dist/server.js', 'Backend');
});
