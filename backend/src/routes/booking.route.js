import { Router } from "express";
import { createBooking, bookingStatus , getUserBooking, getProviderBookings, cancelBooking } from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create').post(verifyToken, createBooking)
router.patch("/:bookingId/status", verifyToken, bookingStatus); //patch -- update booking status by provider (accept/reject) or by user (cancel)
router.get("/user-bookings", verifyToken, getUserBooking) //get all bookings of a user (both provider and user can see their bookings)
router.get("/provider-bookings", verifyToken, getProviderBookings) //get all bookings of a provider (only provider can see their bookings)
router.patch("/:bookingId/cancel", verifyToken, cancelBooking) //cancel booking by user (only user can cancel their booking)

export default router;