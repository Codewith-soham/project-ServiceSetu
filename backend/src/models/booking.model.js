// Main: booking schema and lifecycle tracking.
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
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

  bookingDate: {
    type: Date,
    required: true
  },

  note: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "rejected_by_provider",
      "cancelled_by_user",
      "service_completed_by_provider",
      "completed"
    ],
    default: "pending"
  },

  providerCompletedAt: {
    type: Date
  },

  completedAt: {
    type: Date
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "held", "released", "refunded"],
    default: "pending"
  }
}, { timestamps: true }); 

export const Booking = mongoose.model("Booking", bookingSchema);