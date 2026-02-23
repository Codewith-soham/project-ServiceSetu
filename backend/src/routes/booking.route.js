// Main: booking routes split by user/provider actions.
import { Router } from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { cancelBookingByUser, confirmServiceCompletionByUser, getUserBookings } from "../controllers/user.controller.js";
import { getProviderBookings, markServiceCompletedByProvider, updateBookingStatusByProvider } from "../controllers/serviceProvider.controller.js";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create').post(verifyToken, authorizeRoles("user"), createBooking)
router.get("/user-bookings", verifyToken, authorizeRoles("user"), getUserBookings)
router.patch(":bookingId/cancel", verifyToken, authorizeRoles("user"), cancelBookingByUser)
router.patch(":bookingId/confirm-completion", verifyToken, authorizeRoles("user"), confirmServiceCompletionByUser)

router.get("/provider-bookings", verifyToken, authorizeRoles("provider"), getProviderBookings)
router.patch(":bookingId/status", verifyToken, authorizeRoles("provider"), updateBookingStatusByProvider)
router.patch(":bookingId/complete-by-provider", verifyToken, authorizeRoles("provider"), markServiceCompletedByProvider)

export default router;