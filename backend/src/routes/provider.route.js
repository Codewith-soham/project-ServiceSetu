// Main: provider upgrade routes.
import { Router } from "express";
import { becomeProvider } from "../controllers/serviceProvider.controller.js";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware.js";
import { getNearbyProviders } from "../controllers/publicProviderNearby.js";

const router = Router();

// ---------------- PROVIDER UPGRADE ----------------
// Only logged-in users can become providers
router.post("/become", verifyToken, authorizeRoles("user"), becomeProvider);
router.get("/nearby", getNearbyProviders);

export default router;
