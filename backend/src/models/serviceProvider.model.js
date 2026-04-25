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

    address: {
        type: String
    },

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    pricing: {
        type: Number,
        default: 0
    },

    payoutDetails: {
        accountHolderName: {
            type: String,
            default: ""
        },
        accountNumber: {
            type: String,
            default: ""
        },
        ifscCode: {
            type: String,
            default: ""
        },
        bankName: {
            type: String,
            default: ""
        },
        upiId: {
            type: String,
            default: ""
        },
        preferredMethod: {
            type: String,
            enum: ["bank", "upi"],
            default: "bank"
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        updatedAt: {
            type: Date
        }
    },

    image: {
        type: String,
        default: ""
    },
    
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }

}, { timestamps: true });

serviceProviderSchema.index({ location: '2dsphere' }); // for geospatial queries

export const ServiceProvider = mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
);
