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
            // Try multiple approaches for better compatibility
            let output;
            try {
                // First try: standard df command
                output = execSync("df --output=pcent / 2>/dev/null | tail -1", { encoding: "utf8" });
            } catch (error) {
                // Fallback: use basic df command format
                output = execSync("df / | tail -1 | awk '{print $5}'", { encoding: "utf8" });
            }
            
            const usage = output.replace("%", "").trim();
            const parsedUsage = parseInt(usage);
            
            // Validate the result
            if (isNaN(parsedUsage) || parsedUsage < 0 || parsedUsage > 100) {
                console.warn("Invalid disk usage value:", usage);
                return null;
            }
            
            return parsedUsage;
        } catch (error) {
            console.error("Error getting disk usage:", error.message);
            // Alternative fallback using /proc/mounts and statvfs approach
            try {
                const output = execSync("df -h / | tail -1 | awk '{gsub(/%/, \"\", $5); print $5}'", { encoding: "utf8" });
                const usage = parseInt(output.trim());
                return isNaN(usage) ? null : usage;
            } catch (fallbackError) {
                console.error("Fallback disk usage method also failed:", fallbackError.message);
                return null;
            }
        }
    }

    getUptime() {
        const data = this.readFile("uptime");
        if (!data) return null;
        const seconds = parseFloat(data.split(" ")[0]);
        const hours = seconds / 3600; // convert seconds to hours
        return parseFloat(hours.toFixed(2)); // uptime in hours with 2 decimal places
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
                        uptime: uptime + " hours"
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