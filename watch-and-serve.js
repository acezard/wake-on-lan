"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chokidar_1 = require("chokidar");
var child_process_1 = require("child_process");
// Paths to watch
var frontendPath = './frontend/src'; // Path to frontend source code
var backendPath = './backend/dist'; // Path to backend compiled files
// Function to run shell commands
var runCommand = function (command, name) {
    var _a, _b;
    console.log("[".concat(name, "] Running: ").concat(command));
    var process = (0, child_process_1.exec)(command);
    (_a = process.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
        console.log("[".concat(name, "]: ").concat(data));
    });
    (_b = process.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
        console.error("[".concat(name, " Error]: ").concat(data));
    });
    process.on('close', function (code) {
        if (code !== 0) {
            console.error("[".concat(name, "] exited with code ").concat(code));
        }
        else {
            console.log("[".concat(name, "] completed successfully."));
        }
    });
    return process;
};
// Start initial frontend build
console.log('[Frontend] Initial build...');
runCommand('npm run build --prefix frontend', 'Frontend');
// Start backend server
console.log('[Backend] Starting server...');
var backendProcess = runCommand('node ./backend/dist/server.js', 'Backend');
// Watch frontend for changes
chokidar_1.default.watch(frontendPath, { ignoreInitial: true }).on('all', function (event, path) {
    console.log("[Frontend] Detected ".concat(event, " in ").concat(path, ". Rebuilding..."));
    runCommand('npm run build --prefix frontend', 'Frontend');
});
// Watch backend for changes
chokidar_1.default.watch(backendPath, { ignoreInitial: true }).on('all', function (event, path) {
    console.log("[Backend] Detected ".concat(event, " in ").concat(path, ". Restarting server..."));
    if (backendProcess) {
        backendProcess.kill(); // Kill the existing backend process
    }
    backendProcess = runCommand('node ./backend/dist/server.js', 'Backend');
});
