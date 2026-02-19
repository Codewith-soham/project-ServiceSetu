import { Router } from "express";
import { becomeProvider } from "../controllers/serviceProvider.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ---------------- PROVIDER UPGRADE ----------------
// Only logged-in users can become providers
router.post("/become", verifyToken, becomeProvider);

export default router;
