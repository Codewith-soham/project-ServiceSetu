import dotenv from 'dotenv';
import http from 'http';
import { app } from './src/app.js';
import connectDB from './src/db/connection.js';
import { initializeSocket } from './src/socket/socket.js';

dotenv.config({             //setup dotenv to load environment variables from .env file
    path: "../.env"
});

const port = process.env.PORT || 8000;   //get the port from environment variable or use default 8000

connectDB()
    .then(() => {
        const httpServer = http.createServer(app);
        initializeSocket(httpServer);

        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    })
    .catch((err) => {
        console.error("Failed to connect to the database", err);
    })