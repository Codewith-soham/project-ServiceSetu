import { Router } from "express";
import {
  checkGatewayStatus,
  createPaymentOrder,
  createPaymentQr,
  verifyPayment,
  getBookingPaymentStatus,
  acceptCompletion,
  verifyCompletionOtp,
  refundPayment,
  rejectCompletion,
  flagUser,
  disputeBooking,
  proxyQrImage,
} from "../controllers/payment.controller.js";

import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Common middleware
router.use(verifyJWT);

// USER ROUTES
router.get("/status", checkGatewayStatus);
router.post("/:bookingId/create-order", requireRole("user"), createPaymentOrder);
router.post("/create-qr", requireRole("user"), createPaymentQr);
router.post("/verify", requireRole("user"), verifyPayment);
router.get("/bookings/:bookingId/status", requireRole("user"), getBookingPaymentStatus);
router.get("/qr-image/:bookingId", requireRole("user"), proxyQrImage);
router.patch("/:bookingId/accept", requireRole("user"), acceptCompletion);
router.patch("/:bookingId/refund", requireRole("user"), refundPayment);
router.patch("/:bookingId/reject", requireRole("user"), rejectCompletion);
router.patch("/:bookingId/dispute", requireRole("user"), disputeBooking);

// PROVIDER ROUTE
router.patch("/:bookingId/verify-otp", requireRole("provider"), verifyCompletionOtp);
router.patch("/:bookingId/flag-user", requireRole("provider"), flagUser);

export default router;