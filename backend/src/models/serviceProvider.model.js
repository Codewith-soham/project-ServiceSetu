// Main: provider schema linked to a user.
import mongoose from "mongoose";

const serviceProviderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    serviceType: {
        type: String,
        enum: ['maid', 'electrician', 'plumber', 'care-taker'],
        required: true,
        lowercase: true
    },

    price: {
        type: Number,
        default: 0
    },

    isApproved: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isAvailable: {
        type: Boolean,
        default: false
    },

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },
    
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        }
    },
     coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    }

}, { timestamps: true });

providerSchema.index({ location: '2dsphere' }); // for geospatial queries

export const ServiceProvider = mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
);
