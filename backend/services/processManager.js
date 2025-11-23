// C:\Users\dobbi\Desktop\TCadmin\backend\services\processManager.js
const { spawn } = require('child_process');
const EventEmitter = require('events');
const path = require('path');

class ProcessManager extends EventEmitter {
    constructor() {
        super();
        this.processes = new Map(); // id → { process, logs, startTime }
    }

    /**
     * Start a server process.
     * @param {string} id            Unique server ID
     * @param {string} executablePath Full path to the executable
     * @param {Array<string>} args   Command‑line arguments
     * @param {string} cwd           Working directory (usually the server folder)
     */
    start(id, executablePath, args = [], cwd) {
        if (this.processes.has(id)) {
            throw new Error(`Process ${id} is already running.`);
        }

        console.log(`Starting process ${id}: ${executablePath} ${args.join(' ')}`);

        const child = spawn(executablePath, args, {
            cwd: cwd || path.dirname(executablePath),
            detached: true,
            windowsHide: false,               // keep console window visible
            stdio: ['ignore', 'pipe', 'pipe'], // ignore stdin, capture stdout/stderr
            // CREATE_NEW_CONSOLE flag (0x00000010) gives the process its own console on Windows
            creationFlags: 0x00000010
        });

        // Ensure the child lives beyond the parent if we ever exit
        child.unref();

        const procEntry = {
            process: child,
            logs: [],
            startTime: Date.now()
        };
        this.processes.set(id, procEntry);

        // Capture stdout
        child.stdout.on('data', data => {
            const msg = data.toString();
            this.appendLog(id, msg);
        });

        // Capture stderr
        child.stderr.on('data', data => {
            const msg = data.toString();
            this.appendLog(id, msg);
        });

        // When the process ends
        child.on('close', code => {
            console.log(`Process ${id} exited with code ${code}`);
            this.processes.delete(id);
            this.emit('status-change', { id, status: 'stopped', code });
        });

        this.emit('status-change', { id, status: 'running' });
        return true;
    }

    /** Stop a running server */
    stop(id) {
        const entry = this.processes.get(id);
        if (!entry) return false;
        try {
            process.kill(entry.process.pid);
        } catch (err) {
            console.error(`Failed to kill process ${id}:`, err);
        }
        this.processes.delete(id);
        return true;
    }

    /** Append a log line for a server */
    appendLog(id, msg) {
        const entry = this.processes.get(id);
        if (!entry) return;
        entry.logs.push(msg);
        if (entry.logs.length > 1000) entry.logs.shift();
        this.emit('log', { id, data: msg });
    }

    /** Retrieve accumulated logs (used by the UI) */
    getLogs(id) {
        const entry = this.processes.get(id);
        return entry ? entry.logs.join('') : '';
    }

    /** Current status of a server */
    getStatus(id) {
        return this.processes.has(id) ? 'running' : 'stopped';
    }
}

module.exports = new ProcessManager();