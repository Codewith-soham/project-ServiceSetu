import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express() 

//cors config -> allows frontend to run on different port/domain 
app.use(cors
    (
        {
            origin: process.env.CORS_ORIGIN || "http://localhost:8000"
        }
    )
)

//common middleware config 
app.use(express.json({limit: "16kb"})) //pareses incoming json data from rew.body (accpets only around 16kb) defines req.body
app.use(express.urlencoded({extended: true, limit: "16kb"})) //parses form data (data from html forms)
app.use(express.static("public"))  //used to serve static files like images and pdfs stuff
app.use(cookieParser())  //parses cookies sent by the client required to read jwt refresh tokens

//basic healthcheck route 
import healthCheckRouter from "./routes/healthCheck.route.js"
import  authRouter from "./routes/auth.route.js";
import  providerRouter from "./routes/provider.route.js";

// Auth routes
app.use("/api/v1/auth", authRouter);

// Provider routes (user upgrades)
app.use("/api/v1/providers", providerRouter);



app.use("/api/v1/healthCheck", healthCheckRouter)


export { app }