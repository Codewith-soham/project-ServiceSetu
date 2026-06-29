// Main: Express app wiring (middleware + routes).
//
// IMPORTANT: dotenv MUST load before anything reads process.env.
// Previously it was loaded in server.js AFTER this module was imported,
// which meant CORS_ORIGIN was undefined when cors() initialized.
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import helmet from "helmet"

const app = express()

// ─── CORS ────────────────────────────────────────────────────────────
// Parse allowed origins (supports comma-separated list for multi-env)
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean)

console.log("[app.js] Allowed CORS origins:", allowedOrigins)

const corsOptions = {
    origin: (requestOrigin, callback) => {
        // Allow requests with no origin (curl, server-to-server, mobile apps)
        if (!requestOrigin) return callback(null, true)

        if (allowedOrigins.includes(requestOrigin)) {
            return callback(null, requestOrigin)
        }

        console.warn(`[CORS] Blocked origin: ${requestOrigin}`)
        return callback(new Error(`Origin ${requestOrigin} not allowed by CORS`))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-trace-id",        // Distributed tracing header sent by frontend
        "x-request-id",     // Request correlation ID
        "x-correlation-id", // Alternate correlation ID pattern
        "x-forwarded-for",  // Proxy forwarding
        "Accept",
        "Origin",
    ],
    exposedHeaders: ["set-cookie"],
    preflightContinue: false,   // cors() handles OPTIONS and ends the response itself
    optionsSuccessStatus: 204,  // Respond to preflight with 204 No Content
    maxAge: 86400               // Cache preflight response for 24 hours
}

// Apply CORS to all requests.
// cors() with preflightContinue:false automatically terminates OPTIONS preflight
// requests with the correct Access-Control-* headers — no manual handler needed.
app.use(cors(corsOptions))

// ─── Security Headers (Helmet) ──────────────────────────────────────
// helmet() works fine on Express 5 as of helmet v8+.
// If you hit "PathError: Missing parameter name" it means helmet is
// registering a sub-app with "/*" which Express 5 rejects.
// Fix: use helmet with crossOriginResourcePolicy disabled (it's the
// one that most commonly conflicts with cross-origin API calls anyway).
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        // Don't set crossOriginOpenerPolicy for API servers
        crossOriginOpenerPolicy: false,
    })
)

// ─── Common Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }))          // Parses incoming JSON from req.body
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // Parses form data
app.use(express.static("public"))                  // Serve static files
app.use(cookieParser())                            // Parse cookies (JWT refresh tokens)

// ─── Rate Limiting ──────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: "Too many attempts, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => process.env.NODE_ENV === 'development'
})

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: "Too many requests, please slow down",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development'
})

// ─── Routes ─────────────────────────────────────────────────────────
import healthCheckRouter from "./routes/healthCheck.route.js"
import authRouter from "./routes/auth.route.js"
import providerRouter from "./routes/provider.route.js"
import userRouter from "./routes/user.route.js"
import getProvidersRouter from "./routes/getProviders.route.js"
import bookingRouter from "./routes/booking.route.js"
import adminRouter from "./routes/admin.route.js"
import reviewRouter from "./routes/review.route.js"
import paymentRouter from "./routes/payment.route.js"

app.use("/api/v1/auth", authLimiter, authRouter); // Apply auth limiter to auth routes

// Apply general limiter to other routes
app.use("/api/v1/providers", generalLimiter, providerRouter);
app.use("/api/v1/users", generalLimiter, userRouter);
app.use("/api/v1/getProviders", generalLimiter, getProvidersRouter);
app.use("/api/v1/bookings", generalLimiter, bookingRouter)
app.use("/api/v1/admin", generalLimiter, adminRouter)
app.use("/api/v1/reviews", generalLimiter, reviewRouter)
app.use("/api/v1/healthCheck", healthCheckRouter)
app.use("/api/v1/payments", generalLimiter, paymentRouter)

// ─── Centralized Error Handler ──────────────────────────────────────
// Must be after all routes. Returns consistent JSON:
// { success: false, statusCode, message, stack?(dev) }
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
