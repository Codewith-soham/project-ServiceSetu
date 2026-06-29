// Main: auth routes (register, login, logout, refresh token).
import express from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ---------------- AUTH ROUTES ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.post("/refresh-token", refreshAccessToken);

export default router;
