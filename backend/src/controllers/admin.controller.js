import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Service } from '../models/service.model.js';
import { Booking } from '../models/booking.model.js';
import { ServiceProvider } from '../models/serviceProvider.model.js';
import { sendNotification, NOTIFICATION_EVENTS } from '../socket/notification.js';
import { getRazorpayInstance } from '../utils/razorpay.util.js';

const setPrice = asyncHandler(async (req, res) => {
    const { serviceType, price } = req.body;

    if(!serviceType || typeof price !== 'number' || price <= 0) {
        throw new ApiError(400, "Service type and valid price are required");
    }

    const updateService = await Service.findOneAndUpdate(
        {
            serviceType
        },
        {
            price   
        },
        {new: true}
    )

    if(!updateService) {
        throw new ApiError(404, "Service not found");
    }

    res.status(200).json(
        new ApiResponse(200, updateService, `Price updated ${serviceType} successfully`)
    );
})

// Get all disputes and flagged bookings
const getDisputes = asyncHandler(async (req, res) => {
    const disputes = await Booking.find({
        status: { $in: ["disputed", "service_completed_by_provider"] },
        $or: [
            { status: "disputed", disputeReason: { $exists: true } },
            { providerFlaggedAt: { $exists: true } }
        ]
    })
    .populate("user", "fullname email phone")
    .populate("provider", "fullname")
    .sort({ disputedAt: -1, providerFlaggedAt: -1 })
    .lean();

    return res.status(200).json(
        new ApiResponse(200, disputes, "Disputes fetched successfully")
    );
});

// Admin approves provider's flag - release payment to provider
const forceRelease = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    if (booking.status !== "disputed" && !booking.providerFlaggedAt) {
        throw new ApiError(400, "Only disputed or flagged bookings can be released");
    }

    booking.status = "completed";
    booking.paymentStatus = "released";
    booking.payoutStatus = "processing";
    booking.payoutProcessedAt = new Date();
    booking.completedAt = new Date();
    await booking.save();

    sendNotification(
        booking.user,
        "Admin approved provider. Payment released.",
        NOTIFICATION_EVENTS.PAYMENT_RELEASED
    );

    const provider = await ServiceProvider.findById(booking.provider).select("user").lean();
    if (provider?.user) {
        sendNotification(
            provider.user,
            "Admin approved your claim. Payment released.",
            NOTIFICATION_EVENTS.PAYMENT_RELEASED
        );
    }

    return res.status(200).json(
        new ApiResponse(200, booking, "Payment released to provider")
    );
});

// Admin approves user's dispute - refund to user
const forceRefund = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    if (booking.status !== "disputed") {
        throw new ApiError(400, "Only disputed bookings can be refunded");
    }

    if (booking.paymentStatus === "paid") {
        const razorpayInstance = getRazorpayInstance();
        await razorpayInstance.payments.refund(booking.razorpayPaymentId);
        booking.paymentStatus = "refunded";
    }

    booking.status = "cancelled_by_admin";
    await booking.save();

    sendNotification(
        booking.user,
        "Admin approved your dispute. Refund initiated.",
        NOTIFICATION_EVENTS.REFUND_INITIATED
    );

    return res.status(200).json(
        new ApiResponse(200, booking, "Refund initiated to user")
    );
});

export {
    setPrice,
    getDisputes,
    forceRelease,
    forceRefund
}