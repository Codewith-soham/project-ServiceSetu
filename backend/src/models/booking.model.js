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

  price: {
    type: Number,
    required: true
  }, 

  status: {
  type: String,
  enum: [
    "awaiting_payment",
    "pending",
    "accepted",
    "rejected_by_provider",
    "service_completed_by_provider",
    "completed",
    "cancelled_by_user",
  ],
  default: "awaiting_payment",
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