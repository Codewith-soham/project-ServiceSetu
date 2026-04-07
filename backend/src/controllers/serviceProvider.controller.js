// Main: provider profile actions and provider-side booking updates.
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { getCoordinatesFromAddress } from "../utils/geocode.util.js";
import mongoose from "mongoose";
import { deleteCloudinaryAsset, uploadBufferToCloudinary } from "../utils/cloudinary.util.js";

const becomeProvider = asyncHandler(async (req, res) => {

    console.log("BODY: ", req.body);
    


    const traceId = req.headers['x-trace-id'] || null;
    console.log("[provider.become:start]", {
        traceId,
        userId: req.user?._id?.toString?.() || null,
        serviceType: req.body?.serviceType,
        address: req.body?.address,
        pricing: req.body?.pricing,
        isAvailable: req.body?.isAvailable,
        hasImage: !!req.file,
    });
    

    const { serviceType, address, pricing, isAvailable } = req.body;
    const providerImageFile = req.file;
    let uploadedPublicId = "";

    // improved validation
    if (!serviceType || serviceType.trim() === "" || !address || address.trim() === "") {
        throw new ApiError(400, "Service type and address are required");
    }

    if (!providerImageFile) {
        throw new ApiError(400, "Provider image is required");
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

        const providerId = new mongoose.Types.ObjectId();
        const uploadResult = await uploadBufferToCloudinary(providerImageFile.buffer, {
            folder: `servicesetu/providers/${providerId}`,
            public_id: "profile",
            resource_type: "image",
            overwrite: true
        });
        uploadedPublicId = uploadResult?.public_id || "";

        const parsedPricing = Number(pricing);
        const parsedIsAvailable = isAvailable === undefined
            ? true
            : String(isAvailable).toLowerCase() === "true";

        const [provider] = await ServiceProvider.create([{
            _id: providerId,
            user: userId,
            serviceType: serviceType.trim(),
            address: address.trim(),
            pricing: Number.isFinite(parsedPricing) ? parsedPricing : 0,
            image: uploadResult?.secure_url || "",
            isApproved: true,
            isAvailable: parsedIsAvailable,
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

        console.log("[provider.become:role-updated]", {
            traceId,
            userId: userId.toString(),
            nextRole: "provider",
        });

        await session.commitTransaction();
        console.log("[provider.become:success]", {
            traceId,
            providerId: provider._id.toString(),
            userId: userId.toString(),
        });
        return res.status(201).json(
            new ApiResponse(201, provider, "You are now a provider")
        );
    } catch (err) {
        await session.abortTransaction();

        console.error("[provider.become:error]", {
            traceId,
            message: err?.message,
        });

        if (uploadedPublicId) {
            try {
                await deleteCloudinaryAsset(uploadedPublicId);
            } catch {
                // Ignore Cloudinary cleanup failures after DB rollback.
            }
        }

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