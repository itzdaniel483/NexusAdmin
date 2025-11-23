const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');

const STEAMCMD_URL = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
const INSTALL_DIR = path.join(__dirname, '..', 'steamcmd');
const EXECUTABLE = path.join(INSTALL_DIR, 'steamcmd.exe');

class SteamCMD {
    constructor() {
        this.ready = false;
    }

    async init() {
        if (fs.existsSync(EXECUTABLE)) {
            this.ready = true;
            console.log('SteamCMD found.');
            return;
        }
        console.log('SteamCMD not found. Downloading...');
        await this.downloadAndExtract();
    }

    async downloadAndExtract() {
        await fs.ensureDir(INSTALL_DIR);
        const zipPath = path.join(INSTALL_DIR, 'steamcmd.zip');

        const writer = fs.createWriteStream(zipPath);
        const response = await axios({
            url: STEAMCMD_URL,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                console.log('Download complete. Extracting...');
                const zip = new AdmZip(zipPath);
                zip.extractAllTo(INSTALL_DIR, true);
                fs.unlinkSync(zipPath); // Cleanup
                this.ready = true;
                console.log('SteamCMD ready.');
                resolve();
            });
            writer.on('error', reject);
        });
    }

    async install(appId, installPath, onLog) {
        if (!this.ready) await this.init();

        return new Promise((resolve, reject) => {
            const args = [
                '+force_install_dir', installPath,
                '+login', 'anonymous',
                '+app_update', appId,
                '+quit'
            ];

            console.log(`Running SteamCMD: ${EXECUTABLE} ${args.join(' ')}`);
            const process = spawn(EXECUTABLE, args);

            let isFinished = false;

            process.stdout.on('data', (data) => {
                const msg = data.toString();
                // Only emit logs if we haven't finished yet
                if (onLog && !isFinished) onLog(msg);
                console.log(`[SteamCMD] ${msg.trim()}`);

                // Detect success message to handle cases where SteamCMD hangs
                if ((msg.includes('Success! App') && msg.includes('fully installed')) ||
                    (msg.includes('Success! App') && msg.includes('already up to date'))) {
                    console.log('[SteamCMD] Success message detected. Marking as complete.');
                    isFinished = true; // Stop sending logs to frontend

                    // We wait a brief moment for any final cleanup then resolve
                    setTimeout(() => {
                        if (!process.killed) process.kill(); // Force kill if it hangs
                        resolve();
                    }, 2000);
                }
            });

            process.stderr.on('data', (data) => {
                const msg = data.toString();
                if (onLog && !isFinished) onLog(msg);
                console.error(`[SteamCMD Error] ${msg.trim()}`);
            });

            process.on('close', (code) => {
                console.log(`[SteamCMD] Process exited with code ${code}`);
                // SteamCMD exit codes: 0 = success, 7 = reboot required
                if (code === 0 || code === 7 || code === null) { // code is null if we killed it
                    resolve();
                } else {
                    reject(new Error(`SteamCMD exited with code ${code}`));
                }
            });
        });
    }
}

module.exports = new SteamCMD();
