import { Router } from "express";
import { createBooking, bookingStatus } from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/create').post(verifyToken, createBooking)
router.patch("/:bookingId/status", bookingStatus); //patch -- update booking status by provider (accept/reject) or by user (cancel)

export default router;