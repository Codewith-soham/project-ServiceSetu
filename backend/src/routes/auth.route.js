// Main: auth routes (register, login).
import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

// ---------------- AUTH ROUTES ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);



export default router;
