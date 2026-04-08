import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String, 
    }
} , { timestamps: true });

// Prevent same user from posting multiple reviews for same provider
reviewSchema.index({ user: 1, provider: 1 }, { unique: true });

// Prevent multiple reviews per booking by same user
reviewSchema.index({ booking: 1, user: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model("Review", reviewSchema);