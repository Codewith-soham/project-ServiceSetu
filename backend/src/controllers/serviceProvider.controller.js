// Main: provider profile actions and provider-side booking updates.
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { getCoordinatesFromAddress } from "../utils/geocode.util.js";
import mongoose from "mongoose";

const becomeProvider = asyncHandler(async (req, res) => {

    const { serviceType, address } = req.body;

    // improved validation
    if (!serviceType || serviceType.trim() === "" || !address || address.trim() === "") {
        throw new ApiError(400, "Service type and address are required");
    }

    const userId = req.user._id;

    const { longitude, latitude } = await getCoordinatesFromAddress(address);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        throw new ApiError(400, "Unable to geocode the provided address");
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Ensure user exists and isn't already a provider
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.role === "provider") {
            throw new ApiError(400, "You are already a provider");
        }

        const existingProvider = await ServiceProvider.findOne({ user: userId }).session(session);
        if (existingProvider) {
            throw new ApiError(400, "You are already a provider");
        }

        const [provider] = await ServiceProvider.create([{
            user: userId,
            serviceType: serviceType.trim(),
            address: address.trim(),
            isApproved: true,
            isAvailable: true,
            isActive: true,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }], { session });

        await User.findByIdAndUpdate(
            userId,
            { role: "provider" },
            { session }
        );

        await session.commitTransaction();
        return res.status(201).json(
            new ApiResponse(201, provider, "You are now a provider")
        );
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
});

const getProviderBookings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
        throw new ApiError(403, "Unauthorized to view provider bookings");
    }

    const total = await Booking.countDocuments({ provider: provider._id });

    const bookings = await Booking.find({ provider: provider._id })
        .populate("user", "fullname email address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    res.status(200).json(
        new ApiResponse(200, {
            data: bookings,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        }, "Bookings retrieved successfully")
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