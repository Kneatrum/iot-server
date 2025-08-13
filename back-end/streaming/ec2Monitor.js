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
            // Method 1: Try the simplest df command first
            let output = execSync("df /", { encoding: "utf8" });
            const lines = output.trim().split('\n');
            
            // Get the last line (should be the filesystem info)
            const lastLine = lines[lines.length - 1];
            const columns = lastLine.trim().split(/\s+/);
            
            // Find the usage percentage column (usually has % symbol)
            let usageColumn = columns.find(col => col.includes('%'));
            
            if (usageColumn) {
                const usage = parseInt(usageColumn.replace('%', ''));
                
                // Validate the result
                if (!isNaN(usage) && usage >= 0 && usage <= 100) {
                    return usage;
                }
            }
            
            // Method 2: If above fails, try with explicit column selection
            output = execSync("df / | awk 'NR==2 {print $5}'", { encoding: "utf8" });
            const usage = parseInt(output.replace('%', '').trim());
            
            if (!isNaN(usage) && usage >= 0 && usage <= 100) {
                return usage;
            }
            
            console.warn("Could not parse disk usage from df output");
            return null;
            
        } catch (error) {
            console.error("Error getting disk usage:", error.message);
            
            // Method 3: Final fallback - try different df approaches
            try {
                const commands = [
                    "df --output=pcent / | tail -1",
                    "df -P / | awk 'NR==2 {print $5}'",
                    "df -h / | tail -1 | awk '{print $5}'"
                ];
                
                for (const cmd of commands) {
                    try {
                        const output = execSync(cmd, { encoding: "utf8" });
                        const usage = parseInt(output.replace('%', '').trim());
                        
                        if (!isNaN(usage) && usage >= 0 && usage <= 100) {
                            return usage;
                        }
                    } catch (cmdError) {
                        continue; // Try next command
                    }
                }
                
                return null;
            } catch (fallbackError) {
                console.error("All disk usage methods failed:", fallbackError.message);
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