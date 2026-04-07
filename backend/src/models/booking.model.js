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

  address: {
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
    enum: ["pending", "paid", "held", "released", "refunded"],
    default: "pending"
  },

  platformFee: {
  type: Number,
  required: true,
},

providerAmount: {
  type: Number,
  required: true,
},

razorpayOrderId: {
  type: String,
},

razorpayPaymentId: {
  type: String,
},

razorpaySignature: {
  type: String,
},

amountToCharge: {
  type: Number,
  default: 0,
},

razorpayFee: {
  type: Number,
  default: 0,
},

roundUpMargin: {
  type: Number,
  default: 0,
},

pricingVersion: {
  type: String,
  default: "v1-adaptive-roundup",
},

completionOtp: {
  type: String,
},

otpExpiresAt: {
  type: Date,
},

isOtpVerified: {
  type: Boolean,
  default: false,
},

}, { timestamps: true }); 

export const Booking = mongoose.model("Booking", bookingSchema);