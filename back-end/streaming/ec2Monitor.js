// streaming/ec2Monitor.js
const fs = require("fs");
const { execSync } = require("child_process");
const { getIO } = require("../sockets/socketServer");

class EC2Monitor {
    constructor(procPath = "/proc") {
        this.procPath = procPath; // change to "/host_proc" if running in container with mount
    }

    readFile(file) {
        try {
            return fs.readFileSync(`${this.procPath}/${file}`, "utf8");
        } catch (error) {
            console.error(`Error reading ${file}:`, error.message);
            return null;
        }
    }

    getCpuLoad() {
        const data = this.readFile("loadavg");
        return data ? parseFloat(data.split(" ")[0]) : null;
    }

    getMemoryUsage() {
        const data = this.readFile("meminfo");
        if (!data) return null;
        const lines = data.split("\n");
        const memTotal = parseInt(lines.find(l => l.startsWith("MemTotal"))?.match(/\d+/)?.[0] || 0);
        const memAvailable = parseInt(lines.find(l => l.startsWith("MemAvailable"))?.match(/\d+/)?.[0] || 0);
        if (memTotal && memAvailable) {
            const usedPercent = ((memTotal - memAvailable) / memTotal) * 100;
            return parseFloat(usedPercent.toFixed(2));
        }
        return null;
    }

    getDiskUsage() {
        try {
            const output = execSync("df --output=pcent / | tail -1", { encoding: "utf8" });
            return parseInt(output.replace("%", "").trim());
        } catch (error) {
            console.error("Error getting disk usage:", error.message);
            return null;
        }
    }

    getUptime() {
        const data = this.readFile("uptime");
        if (!data) return null;
        const seconds = parseFloat(data.split(" ")[0]);
        return Math.floor(seconds); // uptime in seconds
    }

    start(interval = 5000) {
        const io = getIO();
        setInterval(() => {
            try {
                const cpuLoad = this.getCpuLoad();
                const memoryUsage = this.getMemoryUsage();
                const diskUsage = this.getDiskUsage();
                const uptime = this.getUptime();

                const hasValidData = [cpuLoad, memoryUsage, diskUsage, uptime]
                    .every(v => v !== null && !isNaN(v));

                if (hasValidData) {
                    const payload = [
                        {
                            deviceId: 1, // unique id for EC2
                            charts: [
                                { chartId: 0, dataPoint: cpuLoad, timestamp: Date.now() },
                                { chartId: 1, dataPoint: memoryUsage, timestamp: Date.now() },
                                { chartId: 2, dataPoint: diskUsage, timestamp: Date.now() },
                                { chartId: 3, dataPoint: uptime, timestamp: Date.now() },
                            ]
                        }
                    ];

                    io.emit("ec2Data", payload);

                    console.log("EC2 Monitor:", {
                        cpuLoad: cpuLoad + " (1-min avg)",
                        memoryUsage: memoryUsage + " %",
                        diskUsage: diskUsage + " %",
                        uptime: uptime + " sec"
                    });
                } else {
                    console.warn("Some EC2 metrics could not be collected:", {
                        cpuLoad, memoryUsage, diskUsage, uptime
                    });
                }
            } catch (error) {
                console.error("Error reading EC2 data:", error.message);
            }
        }, interval);
    }
}

module.exports = { EC2Monitor };
