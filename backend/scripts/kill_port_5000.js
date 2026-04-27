const net = require('net');
const { exec } = require('child_process');

function killPort(port) {
    if (process.platform === 'win32') {
        const cmd = `netstat -ano | findstr :${port}`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(`Port ${port} is not in use or error finding process.`);
                return;
            }
            const lines = stdout.split('\n');
            const pids = lines
                .map(line => line.trim().split(/\s+/).pop())
                .filter(pid => pid && !isNaN(pid) && pid !== '0');
            
            const uniquePids = [...new Set(pids)];
            if (uniquePids.length === 0) {
                console.log(`No PID found for port ${port}`);
                return;
            }

            console.log(`Found PIDs for port ${port}: ${uniquePids.join(', ')}`);
            uniquePids.forEach(pid => {
                exec(`taskkill /F /PID ${pid}`, (killErr) => {
                    if (killErr) console.error(`Failed to kill PID ${pid}: ${killErr.message}`);
                    else console.log(`Killed PID ${pid}`);
                });
            });
        });
    } else {
        console.log("Only implemented for win32");
    }
}

killPort(5000);
