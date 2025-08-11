const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? './.env' : `./.env.${env}`;
require('dotenv').config({path: envFile});

require('./schedules/exchange-rate-cronjob.js');

const createApp = require('./expressServer.js');

const { getAllUsersAndDevices } = require('./databases/postgres/services.js');
const { updateDeviceCache, getDeviceMetadata } = require('./deviceRegistry.js');
const { databaseinitialized, sequelize }   = require('./databases/postgres/models/index.js');

const http = require("http");
const { initSocketIO } = require("./sockets/socketServer");
const { ThinkPadMonitor } = require("./streaming/thinkpadMonitor");
const { getURL } = require('./sockets/hostnameUtil.js');

const mqttClient = require('./mqtt/subscriber');

const backEndPort = 3000;

const { writeData } = require('./databases/influxdb/db_write.js');

function determineDataType(message){
    const messageStr = message.toString();
    // Try to parse as number or JSON
    let dataPoint;
    // Try parsing as number first
    const numValue = Number(messageStr);
    
    if (!isNaN(numValue)) {
        // It's a valid number
        dataPoint = numValue;
    } else {
        // Check if it might be a boolean represented as string
        if (messageStr.toLowerCase() === 'true') {
        dataPoint = true;
        } else if (messageStr.toLowerCase() === 'false') {
        dataPoint = false;
        } else {
        // It's not a number or boolean, keep as string
        dataPoint = messageStr;
        }
    }

    return dataPoint;
}

async function startServer() {
    try {
        const app = await createApp();

        mqttClient.on('message', (topic, message) => {
            latestMessage = `Received message: ${message.toString()} on topic: ${topic}`;
            let tokens = topic.split('/');
            if(!tokens) return;
            let uniqueHash = tokens[0];
            let field = tokens[tokens.length - 1];
            if(!uniqueHash) return;
            let metadata = getDeviceMetadata(uniqueHash);
            let dataPoint = determineDataType(message);
            writeData(metadata, dataPoint, field);
        });

        try {
            const usersAndDevices = await getAllUsersAndDevices();
            
            if (usersAndDevices) {
                updateDeviceCache(usersAndDevices); 
            } else {
                console.error("No users and devices found");
            }
        } catch (error) {
            console.error("Error fetching users and devices:", error);
        }

        const server = http.createServer(app);
        initSocketIO(server);

        if (env !== 'production') {
            const url =   getURL();  
            if (url) {
                const thinkPadMonitor = new ThinkPadMonitor(url);
                thinkPadMonitor.start(2000); // Emit every 2 seconds
            } else {
                console.error("Could not start ThinkPadMonitor: Failed to get URL");
            }
        }

        server.listen(backEndPort, () => {
            console.log(`Web server & Socket.IO listening at ${backEndPort}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error); // Log the overall error
        throw error; // Rethrow the error to ensure the process exits
    }
}

(async () => {  // Immediately Invoked Async Function Expression (IIFE)
    await databaseinitialized;

    if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: true });
        console.log("Database synced.");
    }

    await startServer();
})(); // Call the IIFE immediately
