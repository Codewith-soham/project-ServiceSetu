// Main: review creation and listing.
import { Review } from "../models/review.model.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addReview = asyncHandler(async (req, res) => {
    const { providerId, rating, comment } = req.body;

    if (!providerId || typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new ApiError(400, "Provider and valid rating are required");
    }

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
        throw new ApiError(404, "Provider not found");
    }

    const review = await Review.create({
        user: req.user._id,
        provider: providerId,
        rating,
        comment: comment || ""
    });

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

    const reviews = await Review.find({ provider: providerId })
        .populate("user", "fullname")
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, reviews, "Reviews retrieved successfully"));
});

export { addReview, getProviderReviews };
