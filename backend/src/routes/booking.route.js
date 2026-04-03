// Main: booking routes split by user/provider actions.
import { Router } from "express";
import { createBooking, markServiceCompletedByProvider } from "../controllers/booking.controller.js";
import { cancelBookingByUser, confirmServiceCompletionByUser, getUserBookings } from "../controllers/user.controller.js";
import { getProviderBookings, updateBookingStatusByProvider } from "../controllers/serviceProvider.controller.js";
import { requireRole, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create').post(verifyJWT, requireRole("user"), createBooking)
router.get("/user-bookings", verifyJWT, requireRole("user"), getUserBookings)
router.patch("/:bookingId/cancel", verifyJWT, requireRole("user"), cancelBookingByUser)
router.patch("/:bookingId/confirm-completion", verifyJWT, requireRole("user"), confirmServiceCompletionByUser)

router.get("/provider-bookings", verifyJWT, requireRole("provider"), getProviderBookings)
router.patch("/:bookingId/status", verifyJWT, requireRole("provider"), updateBookingStatusByProvider)
router.patch("/:bookingId/complete", verifyJWT, requireRole("provider"), markServiceCompletedByProvider)

export default router;