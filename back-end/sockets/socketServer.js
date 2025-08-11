// streaming/socketServer.js
const { Server } = require("socket.io");

let ioInstance = null;

function initSocketIO(server) {
    ioInstance = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
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
