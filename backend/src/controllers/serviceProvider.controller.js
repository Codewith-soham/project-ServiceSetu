// Main: provider profile actions and provider-side booking updates.
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { getCoordinatesFromAddress } from "../utils/geocode.util.js";

const becomeProvider = asyncHandler(async (req, res) => {

    const { serviceType, address } = req.body;

    // improved validation
    if (!serviceType || serviceType.trim() === "" || !address || address.trim() === "") {
        throw new ApiError(400, "Service type and address are required");
    }

    const userId = req.user._id;

    // extra safety check
    const user = await User.findById(userId);
    if (user.role === "provider") {
        throw new ApiError(400, "You are already a provider");
    }

    const existingProvider = await ServiceProvider.findOne({ user: userId });

    if (existingProvider) {
        throw new ApiError(400, "You are already a provider");
    }

    const coords = await getCoordinatesFromAddress(address);

   const provider = await ServiceProvider.create({
    user: userId,
    serviceType: serviceType.trim(),
    address: address.trim(),
    location: {
        type: "Point",
        coordinates: [coords.longitude, coords.latitude]
    }
});

    return res.status(201).json(
        new ApiResponse(201, provider, "You are now a provider")
    );
});

const getProviderBookings = asyncHandler(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
        throw new ApiError(403, "Unauthorized to view provider bookings");
    }

    const bookings = await Booking.find({ provider: provider._id })
        .populate("user", "fullname email address")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, bookings, "Bookings retrieved successfully")
    );
});

const updateBookingStatusByProvider = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    if (!["accepted", "rejected_by_provider"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
        throw new ApiError(403, "Unauthorized to update this booking");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.provider.toString() !== provider._id.toString()) {
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

const markServiceCompletedByProvider = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
        throw new ApiError(403, "Unauthorized to update this booking");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.provider.toString() !== provider._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this booking");
    }

    if (booking.status !== "accepted") {
        throw new ApiError(400, "Only accepted bookings can be marked as completed");
    }

    booking.status = "service_completed_by_provider";
    booking.providerCompletedAt = new Date();
    await booking.save();

    res.status(200).json(
        new ApiResponse(200, booking, "Booking marked as completed by provider")
    );
});

export {
    becomeProvider,
    getProviderBookings,
    updateBookingStatusByProvider,
    markServiceCompletedByProvider
};