import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        enum: ['maid', 'electrician', 'plumber', 'care-taker'],
        required: true,
        unique: true,
    },

    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const Service = mongoose.model("Service", serviceSchema);

