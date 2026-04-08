// Main: review creation and listing.
import { Review } from "../models/review.model.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addReview = asyncHandler(async (req, res) => {
    const { providerId, bookingId, rating, comment } = req.body;

    if (!providerId || !bookingId || typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new ApiError(400, "Provider, booking and valid rating are required");
    }

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
        throw new ApiError(404, "Provider not found");
    }

    const existingReview = await Review.findOne({
        user: req.user._id,
        provider: providerId
    });
    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this provider");
    }

    const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user._id,
        provider: providerId
    });
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.status !== "completed") {
        throw new ApiError(400, "You can only review completed bookings");
    }

    let review;
    try {
        review = await Review.create({
            user: req.user._id,
            provider: providerId,
            booking: bookingId,
            rating,
            comment: comment || ""
        });
    } catch (err) {
        // Handle duplicate unique index errors gracefully (e.g., if a unique index exists on { user, provider }).
        if (err?.code === 11000) {
            throw new ApiError(400, "You have already reviewed this provider");
        }
        throw err;
    }

    const reviews = await Review.find({ provider: providerId }).select("rating");
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

    provider.rating = avgRating;
    provider.totalReviews = totalReviews;
    await provider.save();

    res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

const getProviderReviews = asyncHandler(async (req, res) => {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (req.user?.role === "provider") {
        throw new ApiError(403, "Providers cannot access reviews");
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments({ provider: providerId });

    const reviews = await Review.find({ provider: providerId })
        .populate("user", "fullname")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    res.status(200).json(new ApiResponse(200, {
        data: reviews,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    }, "Reviews retrieved successfully"));
});

export { addReview, getProviderReviews };
