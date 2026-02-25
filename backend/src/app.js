// Main: Express app wiring (middleware + routes).
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express() 

//cors config -> allows frontend to run on different port/domain 
app.use(cors
    (
        {
            origin: process.env.CORS_ORIGIN || "http://localhost:8000",
            credentials: true
        }
    )
)

//common middleware config 
app.use(express.json({limit: "10mb"})) //parses incoming json data from req.body - supports larger payloads for profiles, images, etc.
app.use(express.urlencoded({extended: true, limit: "10mb"})) //parses form data (data from html forms)
app.use(express.static("public"))  //used to serve static files like images and pdfs stuff
app.use(cookieParser())  //parses cookies sent by the client required to read jwt refresh tokens

//basic healthcheck route 
import healthCheckRouter from "./routes/healthCheck.route.js"
import  authRouter from "./routes/auth.route.js";
import  providerRouter from "./routes/provider.route.js";
import userRouter from "./routes/user.route.js";
import getProvidersRouter from "./routes/getProviders.route.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.route.js";
import reviewRouter from "./routes/review.route.js";
// Auth routes
app.use("/api/v1/auth", authRouter);

// Provider routes (user upgrades)
app.use("/api/v1/providers", providerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/getProviders", getProvidersRouter);
app.use("/api/v1/bookings", bookingRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/reviews", reviewRouter)
app.use("/api/v1/healthCheck", healthCheckRouter)


export { app }