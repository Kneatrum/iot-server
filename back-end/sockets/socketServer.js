// streaming/socketServer.js
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

const FRONTEND_HOST = process.env.FRONTEND_HOST || 'http://localhost:3001';

const { Server } = require("socket.io");

let ioInstance = null;

function initSocketIO(server) {
    ioInstance = new Server(server, {
        cors: {
            origin: FRONTEND_HOST,
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket", "polling"], 
        path: "/socket.io",
    });

    ioInstance.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return ioInstance;
}

function getIO() {
    if (!ioInstance) {
        throw new Error("Socket.IO not initialized. Call initSocketIO(server) first.");
    }
    return ioInstance;
}

module.exports = { initSocketIO, getIO };
