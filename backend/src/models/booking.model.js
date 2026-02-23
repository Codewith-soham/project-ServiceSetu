import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    required: true
  },

  serviceType: {
    type: String,
    enum: ["care taker", "maid", "electrician", "plumber"],
    required: true
  },

  bookingDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected_by_provider", "cancelled_by_user", "completed"],
    default: "pending"
  }
}, { timestamps: true }); 

export const Booking = mongoose.model("Booking", bookingSchema);