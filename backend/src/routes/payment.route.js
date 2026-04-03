import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
  acceptCompletion,
  verifyCompletionOtp,
  refundPayment,
  rejectCompletion,
} from "../controllers/payment.controller.js";

import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Common middleware
router.use(verifyJWT);

// USER ROUTES
router.post("/create-order", requireRole("user"), createPaymentOrder);
router.post("/verify", requireRole("user"), verifyPayment);
router.patch("/:bookingId/accept", requireRole("user"), acceptCompletion);
router.patch("/:bookingId/refund", requireRole("user"), refundPayment);
router.patch(
  "/:bookingId/reject",
  requireRole("user"),
  rejectCompletion
);

// PROVIDER ROUTE
router.patch(
  "/:bookingId/verify-otp",
  requireRole("provider"),
  verifyCompletionOtp
);

export default router;