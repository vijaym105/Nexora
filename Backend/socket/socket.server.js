import {Server} from 'socket.io';
import { getFrontendUrl } from '../config/urls.js';

let io;

export function initSocket(httpServer){
     io = new Server(httpServer, {
        cors: {
            origin: getFrontendUrl(),
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}