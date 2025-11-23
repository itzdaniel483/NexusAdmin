const { parentPort, workerData } = require('worker_threads');
const AdmZip = require('adm-zip');
const fs = require('fs');

try {
    const { serverPath, outputPath } = workerData;

    // Check if server path exists
    if (!fs.existsSync(serverPath)) {
        throw new Error(`Server path does not exist: ${serverPath}`);
    }

    console.log(`[Worker] Zipping ${serverPath}...`);
    const zip = new AdmZip();
    zip.addLocalFolder(serverPath);

    console.log(`[Worker] Writing zip to ${outputPath}...`);
    zip.writeZip(outputPath);

    // Get file size
    const stats = fs.statSync(outputPath);

    parentPort.postMessage({
        success: true,
        size: stats.size
    });
} catch (error) {
    parentPort.postMessage({
        success: false,
        error: error.message
    });
}
