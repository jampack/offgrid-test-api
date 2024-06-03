import express from 'express';
import {Server} from "socket.io";
import http from "http";
import SystemMonitorController from './controllers/systemMonitorController.js';
import SystemMonitorService from "./services/systemMonitorService.js";
import {DatabaseService} from "./services/databaseService.js";

const app = express()
const port = process.env.PORT || 8000;

const httpServer = http.createServer(app);

const controller = new SystemMonitorController();
const databaseService = new DatabaseService();

let count = 0;

let socket = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins
    },
    transports: ['websocket']
});

app.get('/', (req, res) => {
    const controller = new SystemMonitorController();
    return controller.getSystemData();
})

const startDataCollection = () => {
    setInterval(async () => {
        const data = await controller.getSystemData();
        await databaseService.writeData(data);
        const lastTenSecondsData = await databaseService.readLastDataPoints(1);
        socket.emit('perfData', lastTenSecondsData);
    }, 1000);
}

const startServer = () => {
    startDataCollection();
    httpServer.listen(port, () => {
        // console.clear();
        console.log(`Server running on port ${port}`);
        console.log(`http://localhost:${port}`);
    })
};

// httpServer.on("error", (e) => {
//     if (e.code === "EADDRINUSE") {
//         console.error("Address already in use, retrying in a few seconds...");
//         setTimeout(() => {
//             startServer();
//         }, 3000);
//     }else{
//         console.log("Server error", e);
//     }
// });

socket.on('connect', (socket) => {
    console.log('a user connected');
    socket.emit('user_connected', {message: 'a new client connected'})
    socket.on('connect_error', (error) => {
        console.log('A user failed to connect', error);
    });
})

// on error
socket.on('error', (error) => {
    console.log(error);
});

startServer();