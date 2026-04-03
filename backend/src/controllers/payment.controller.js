import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";

import { razorpayInstance, calculateFees, verifyRazorpaySignature } from "../utils/razorpay.util.js";
import { sendNotification, NOTIFICATION_EVENTS } from "../socket/notification.js";

import { Booking } from "../models/booking.model.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Service } from "../models/service.model.js";

//create controller

const createPaymentOrder = asyncHandler(async (req,res) => {
    const { providerId , bookingDate , note } = req.body;

    if(!providerId || !bookingDate){
        throw new ApiError(400,'Provider ID and booking date are required');
    }

     // Get provider
  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  // 2 Get service price
  const service = await Service.findOne({
    serviceType: provider.serviceType,
  });

  if (!service) {
    throw new ApiError(404, "Service pricing not found");
  }

  const { price, platformFee, providerAmount } = calculateFees(
    service.price
  );

  //  Create Razorpay Order
  const order = await razorpayInstance.orders.create({
    amount: price * 100, // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  if (!order) {
    throw new ApiError(500, "Failed to create Razorpay order");
  }

  // Create Booking
  const booking = await Booking.create({
    user: req.user._id,
    provider: providerId,
    bookingDate,
    note,
    price,
    platformFee,
    providerAmount,
    razorpayOrderId: order.id,
    status: "awaiting_payment",
    paymentStatus: "pending",
  });

  //  Response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        bookingId: booking._id,
        razorpayOrderId: order.id,
        amount: order.amount,
      },
      "Order created successfully"
    )
  );
});

//verifyPayyment 
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature: signature,
  } = req.body;

  const booking = await Booking.findOne({ razorpayOrderId });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.paymentStatus === "paid") {
    throw new ApiError(400, "Already verified");
  }

  verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature,
  });

  booking.paymentStatus = "paid";
  booking.status = "pending";
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = signature;

  await booking.save();

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment verified"));
});


//accept completion by user (OTP generation)
const acceptCompletion = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.status !== "service_completed_by_provider") {
    throw new ApiError(400, "Service not completed yet");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  booking.completionOtp = hashedOtp;
  booking.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await booking.save();

  const provider = await ServiceProvider.findById(booking.provider).select("user").lean();
  if (provider?.user) {
    sendNotification(
      provider.user,
      "User accepted. Share OTP",
      NOTIFICATION_EVENTS.USER_ACCEPTED
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { otp }, // ⚠️ remove in production
      "OTP generated"
    )
  );
});


//verify completion OTP and release payment
const verifyCompletionOtp = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { otp } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  const provider = await ServiceProvider.findOne({ user: req.user._id }).select("_id").lean();
  if (!provider) {
    throw new ApiError(403, "Only provider allowed");
  }

  if (booking.provider.toString() !== provider._id.toString()) {
    throw new ApiError(403, "Only provider allowed");
  }

  if (!booking.completionOtp) {
    throw new ApiError(400, "OTP not generated");
  }

  if (booking.otpExpiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOtp !== booking.completionOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  booking.isOtpVerified = true;
  booking.status = "completed";
  booking.paymentStatus = "released";
  booking.completedAt = new Date();

  booking.completionOtp = undefined;
  booking.otpExpiresAt = undefined;

  await booking.save();

  sendNotification(
    booking.user,
    "Payment completed successfully",
    NOTIFICATION_EVENTS.PAYMENT_RELEASED
  );

  return res.status(200).json(
    new ApiResponse(200, booking, "Payment released")
  );
});

//refund payment
const refundPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.status === "completed") {
    throw new ApiError(400, "Cannot refund completed booking");
  }

  if (booking.paymentStatus === "paid") {
    await razorpayInstance.payments.refund(
      booking.razorpayPaymentId
    );
    booking.paymentStatus = "refunded";
  }

  booking.status = "cancelled_by_user";

  await booking.save();

  return res.status(200).json(
    new ApiResponse(200, booking, "Refund processed")
  );
});

//reject completion
const rejectCompletion = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.status !== "service_completed_by_provider") {
    throw new ApiError(400, "Invalid state");
  }

  // 🔁 Send back to provider
  booking.status = "accepted";

  await booking.save();

  return res.status(200).json(
    new ApiResponse(200, booking, "User rejected completion")
  );
});

export {
    createPaymentOrder,
  verifyPayment,
  acceptCompletion,
  verifyCompletionOtp,
  refundPayment,
  rejectCompletion
}