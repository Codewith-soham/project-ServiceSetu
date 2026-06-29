// Main: admin-only routes.
import { Router } from "express";
import { setPrice, getDisputes, forceRelease, forceRefund } from "../controllers/admin.controller.js";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Update service price by admin
router.put("/services/price", verifyToken, authorizeRoles("admin"), setPrice);

// Dispute management
router.get("/disputes", verifyToken, authorizeRoles("admin"), getDisputes);
router.patch("/bookings/:bookingId/force-release", verifyToken, authorizeRoles("admin"), forceRelease);
router.patch("/bookings/:bookingId/force-refund", verifyToken, authorizeRoles("admin"), forceRefund);

export default router;
