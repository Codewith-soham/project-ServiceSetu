import express from 'express';
import cors from 'cors';   
import dotenv from 'dotenv';
import { app } from './src/app.js';

dotenv.config({             //setup dotenv to load environment variables from .env file
    path: "./env"
});

const port = process.env.PORT || 8000;   //get the port from environment variable or use default 8000


app.listen(port, (req,res) => {
    console.log(`Server running on port ${port}`);
    
})