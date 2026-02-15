import dotenv from 'dotenv';
import { app } from './src/app.js';
import connectDB from './src/db/connection.js';

dotenv.config({             //setup dotenv to load environment variables from .env file
    path: "./.env"
});

const port = process.env.PORT || 8000;   //get the port from environment variable or use default 8000

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    })
    .catch(() => {
        console.error("Failed to connect to the database", err);
    })