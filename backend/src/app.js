// Main: Express app wiring (middleware + routes).
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"

const app = express() 

//cors config -> allows frontend to run on different port/domain 
app.use(cors
    (
        {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true
        }
    )
)

//common middleware config 
app.use(express.json({limit: "10mb"})) //parses incoming json data from req.body - supports larger payloads for profiles, images, etc.
app.use(express.urlencoded({extended: true, limit: "10mb"})) //parses form data (data from html forms)
app.use(express.static("public"))  //used to serve static files like images and pdfs stuff
app.use(cookieParser())  //parses cookies sent by the client required to read jwt refresh tokens

//rate limiting middleware
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many attempts, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please slow down",
    standardHeaders: true,
    legacyHeaders: false,
})

//basic healthcheck route 
import healthCheckRouter from "./routes/healthCheck.route.js"
import  authRouter from "./routes/auth.route.js";
import  providerRouter from "./routes/provider.route.js";
import userRouter from "./routes/user.route.js";
import getProvidersRouter from "./routes/getProviders.route.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.route.js";
import reviewRouter from "./routes/review.route.js";
import paymentRouter from "./routes/payment.route.js";
app.use("/api/v1/auth", authLimiter, authRouter); // Apply auth limiter to auth routes

// Apply general limiter to other routes
app.use("/api/v1/providers", generalLimiter, providerRouter);
app.use("/api/v1/users", generalLimiter, userRouter);
app.use("/api/v1/getProviders", generalLimiter, getProvidersRouter);
app.use("/api/v1/bookings", generalLimiter, bookingRouter)
app.use("/api/v1/admin", generalLimiter, adminRouter)
app.use("/api/v1/reviews", generalLimiter, reviewRouter)
app.use("/api/v1/healthCheck", healthCheckRouter)
app.use("/api/v1/payments", generalLimiter , paymentRouter) // Health check typically doesn't need rate limiting

// Centralized error handler (must be after all routes)
// Returns consistent JSON: { success: false, statusCode, message, stack?(dev) }
app.use((err, req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    next;
    const statusCode = err?.statusCode || err?.status || 500;
    const message = err?.message || "Internal server error";

    const payload = {
        success: false,
        statusCode,
        message
    };

    if (process.env.NODE_ENV !== "production" && err?.stack) {
        payload.stack = err.stack;
    }

    return res.status(statusCode).json(payload);
});

export { app }