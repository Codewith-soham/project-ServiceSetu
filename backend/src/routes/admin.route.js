// Main: admin-only routes.
import { Router } from "express";
import { setPrice } from "../controllers/admin.controller.js";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Update service price by admin
router.put("/services/price", verifyToken, authorizeRoles("admin"), setPrice);

export default router;
