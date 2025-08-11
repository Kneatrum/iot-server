// streaming/thinkpadMonitor.js
const axios = require("axios");
const { getIO } = require("../sockets/socketServer");

class ThinkPadMonitor {
    constructor(url) {
        this.url = url;
    }

    async fetchData() {
        console.log("Fetching ThinkPad data from:", this.url);
        try {
            const response = await axios.get(this.url, { timeout: 2000 });
            return response.data;
        } catch (error) {
            console.error("Error fetching ThinkPad data:", error.message);
            return null;
        }
    }

    findSensorValue(node, targetText, targetType = null) {
        // Add null check for the node
        if (!node) {
            return null;
        }

        // Check if current node matches our criteria
        if (node.Text === targetText && (!targetType || node.Type === targetType)) {
            return parseFloat(node.Value);
        }
        
        // Search in children if they exist
        if (node.Children && Array.isArray(node.Children)) {
            for (const child of node.Children) {
                const result = this.findSensorValue(child, targetText, targetType);
                if (result !== null && result !== undefined && !isNaN(result)) {
                    return result;
                }
            }
        }
        
        return null;
    }

    start(interval = 2000) {
        const io = getIO();
        setInterval(async () => {
            const data = await this.fetchData();

            // Only proceed if data is successfully fetched
            if (data) {
                try {
                    const cpuPackagePower = this.findSensorValue(data, "CPU Package", "Power");
                    const cpuPackageTemp = this.findSensorValue(data, "CPU Package", "Temperature");
                    const cpuTotalLoad = this.findSensorValue(data, "CPU Total", "Load");
                    const memoryLoad = this.findSensorValue(data, "Memory", "Load");

                    // Check if all required values were found
                    const hasValidData = [cpuPackagePower, cpuPackageTemp, cpuTotalLoad, memoryLoad]
                        .every(value => value !== null && value !== undefined && !isNaN(value));

                    if (hasValidData) {
                        const payload = [
                            {
                                deviceId: 0,
                                charts: [
                                    { chartId: 0, dataPoint: cpuPackagePower, timestamp: Date.now() },
                                    { chartId: 1, dataPoint: cpuPackageTemp, timestamp: Date.now() },
                                    { chartId: 2, dataPoint: cpuTotalLoad, timestamp: Date.now() },
                                    { chartId: 3, dataPoint: memoryLoad, timestamp: Date.now() },
                                ]
                            }
                        ];
                        
                        io.emit("thinkpadData", payload);
                        
                        console.log('Extracted values:', {
                            cpuPackagePower: cpuPackagePower + ' W',
                            cpuPackageTemp: cpuPackageTemp + ' °C', 
                            cpuTotalLoad: cpuTotalLoad + ' %',
                            memoryLoad: memoryLoad + ' %'
                        });
                    } else {
                        console.warn('Some sensor values could not be found:', {
                            cpuPackagePower,
                            cpuPackageTemp,
                            cpuTotalLoad,
                            memoryLoad
                        });
                    }
                } catch (error) {
                    console.error('Error processing sensor data:', error.message);
                }
            } else {
                console.log('No data available - skipping this cycle');
            }
        }, interval);
    }
}

module.exports = { ThinkPadMonitor };