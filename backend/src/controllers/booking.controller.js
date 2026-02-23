import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";

//create booking by user

const createBooking = asyncHandler(async (req, res) => {

    const { providerId, bookingDate, address, note } = req.body;

    if (!providerId || !bookingDate || !address) {
        throw new ApiError(400, "All required fields must be provided");
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

    const booking = await Booking.create({
        user: req.user._id,
        provider: providerId,
        category: existingProvider.serviceType,
        bookingDate,
        address,
        note,
        status: "pending"
    });

    res.status(201).json(
        new ApiResponse(201, booking, "Booking created successfully")
    );
});


//update booking status by provider (accept/reject) or by user (cancel)

const bookingStatus = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected_by_provider"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.provider.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this booking");
    }

    if (booking.status !== "pending") {
        throw new ApiError(400, "Booking already processed");
    }

    booking.status = status;
    await booking.save();

    res.status(200).json(
        new ApiResponse(200, booking, `Booking ${status} successfully`)
    );
});


//get all bookings of a user (both provider and user can see their bookings)

const getUserBooking = asyncHandler(async (req, res) => {

    const bookings = await Booking.find({ user: req.user._id })
        .populate("provider", "name serviceType address")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, bookings, "Bookings retrieved successfully")
    );
});


//get all bookings of a provider (only provider can see their bookings)

const getProviderBookings = asyncHandler(async (req, res) => {

    const bookings = await Booking.find({ provider: req.user._id })
        .populate("user", "name email address")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, bookings, "Bookings retrieved successfully")
    );
});

//cancel booking by user (only user can cancel their booking)

const cancelBooking = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;

    const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id   // 🔒 ensures only owner cancels
    });

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (
        ["rejected_by_provider", "completed", "cancelled_by_user"]
        .includes(booking.status)
    ) {
        throw new ApiError(400, "Cannot cancel this booking");
    }

    booking.status = "cancelled_by_user";
    await booking.save();

    res.status(200).json(
        new ApiResponse(200, booking, "Booking cancelled successfully")
    );
});

export {
    createBooking,
    bookingStatus,
    getUserBooking,
    getProviderBookings,
    cancelBooking
};