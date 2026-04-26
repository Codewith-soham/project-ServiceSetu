// Entry point: connect DB, create HTTP server, start listening.
// NOTE: dotenv is loaded inside app.js (before any middleware reads env vars).
import http from 'http';
import { app } from './src/app.js';
import connectDB from './src/db/connection.js';
import { initializeSocket } from './src/socket/socket.js';

const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        const httpServer = http.createServer(app);
        initializeSocket(httpServer);

        httpServer.listen(port, "0.0.0.0", () => {
            console.log(`Server is running on port ${port}`);
            console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        })
    })
    .catch((err) => {
        console.error("Failed to connect to the database", err);
        process.exit(1);
    })
