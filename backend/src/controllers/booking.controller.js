// Main: booking creation logic and booking validations.
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";

const createBooking = asyncHandler(async (req, res) => {
    const { providerId, bookingDate, note } = req.body;

    if (!providerId || !bookingDate) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const bookingDateValue = new Date(bookingDate);
    if (Number.isNaN(bookingDateValue.getTime())) {
        throw new ApiError(400, "Invalid booking date");
    }

    if (bookingDateValue < new Date()) {
        throw new ApiError(400, "Booking date cannot be in the past");
    }

    const existingProvider = await ServiceProvider.findById(providerId);

    if (!existingProvider) {
        throw new ApiError(404, "Provider not found");
    }

    if (
        !existingProvider.isAvailable ||
        !existingProvider.isApproved ||
        !existingProvider.isActive
    ) {
        throw new ApiError(400, "Provider not available");
    }

    const startOfDay = new Date(bookingDateValue);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDateValue);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
        provider: providerId,
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "accepted"] }
    });

    if (existingBooking) {
        throw new ApiError(409, "Provider already has a booking on this date");
    }

    const booking = await Booking.create({
        user: req.user._id,
        provider: providerId,
        bookingDate: bookingDateValue,
        note: note || "",
        status: "pending"
    });

    res.status(201).json(
        new ApiResponse(201, booking, "Booking created successfully")
    );
});

export { createBooking };
