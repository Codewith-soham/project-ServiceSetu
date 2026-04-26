import dotenv from 'dotenv';
import http from 'http';
import { app } from './src/app.js';
import connectDB from './src/db/connection.js';
import { initializeSocket } from './src/socket/socket.js';

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
	path: path.resolve(__dirname,".env")
});

console.log("CORS_ORIGIN LOADED:", process.env.CORS_ORIGIN);

const port = process.env.PORT || 8000;   //get the port from environment variable or use default 8000

connectDB()
    .then(() => {
        const httpServer = http.createServer(app);
        initializeSocket(httpServer);

        httpServer.listen(port, "0.0.0.0", () => {
            console.log(`Server is running on port ${port}`);
        })
    })
    .catch((err) => {
        console.error("Failed to connect to the database", err);
    })
