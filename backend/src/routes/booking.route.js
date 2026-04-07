// Main: booking routes split by user/provider actions.
import { Router } from "express";
import {
	createBooking,
	markServiceCompletedByProvider,
	getProviderBookings,
	getProviderEarnings,
	acceptBooking,
	rejectBooking
} from "../controllers/booking.controller.js";
import { cancelBookingByUser, confirmServiceCompletionByUser, getUserBookings } from "../controllers/user.controller.js";
import { updateBookingStatusByProvider } from "../controllers/serviceProvider.controller.js";
import { requireRole, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create').post(verifyJWT, requireRole("user"), createBooking)
router.get("/user-bookings", verifyJWT, requireRole("user"), getUserBookings)
router.patch("/:bookingId/cancel", verifyJWT, requireRole("user"), cancelBookingByUser)
router.patch("/:bookingId/confirm-completion", verifyJWT, requireRole("user"), confirmServiceCompletionByUser)

// Keep static provider route before dynamic `/:id` routes.
router.get("/provider", verifyJWT, requireRole("provider"), getProviderBookings)
router.get("/provider/earnings", verifyJWT, requireRole("provider"), getProviderEarnings)
router.post("/:id/accept", verifyJWT, requireRole("provider"), acceptBooking)
router.post("/:id/reject", verifyJWT, requireRole("provider"), rejectBooking)
router.post("/:id/complete", verifyJWT, requireRole("provider"), (req, res, next) => {
	req.params.bookingId = req.params.id;
	return markServiceCompletedByProvider(req, res, next);
})

router.get("/provider-bookings", verifyJWT, requireRole("provider"), getProviderBookings)
router.patch("/:bookingId/status", verifyJWT, requireRole("provider"), updateBookingStatusByProvider)
router.patch("/:bookingId/complete", verifyJWT, requireRole("provider"), markServiceCompletedByProvider)

export default router;