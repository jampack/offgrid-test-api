import express from 'express';
import {Server} from "socket.io";
import http from "http";
import SystemMonitorController from './controllers/systemMonitorController.js';
import {DatabaseService} from "./services/databaseService.js";

const app = express()
const port = process.env.PORT || 8000;

const httpServer = http.createServer(app);

const controller = new SystemMonitorController();
const databaseService = new DatabaseService();

let socket = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins
    },
    transports: ['websocket']
});

app.get('/health', (req, res) => {
    res.send('Server is up and running');
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
        console.log(`Server running on port ${port}`);
        console.log('url:', `http://localhost:${port}`);
        console.log('ws:', `ws://localhost:${port}`);
        console.log('Press Ctrl+C to stop');
        console.log('----------------------------------')
    })
};

socket.on('connect', (socket) => {
    console.log('a user connected with', 'id:', socket.id);
})

// on error
socket.on('error', (error) => {
    console.error('Socket error:', error);
});

startServer();