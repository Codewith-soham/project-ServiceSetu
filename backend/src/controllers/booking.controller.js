// Main: booking creation logic and booking validations.
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Service } from "../models/service.model.js";
import { sendNotification, NOTIFICATION_EVENTS } from "../socket/notification.js";
import { calculateFees } from "../utils/razorpay.util.js";
import { isValidObjectId } from "mongoose";

const emitBookingUpdateToParticipants = async (booking, action) => {
    if (!booking?._id || !booking?.user || !booking?.provider) {
        return;
    }

    const participants = new Set([String(booking.user)]);
    const providerProfile = await ServiceProvider.findById(booking.provider).select("user").lean();
    if (providerProfile?.user) {
        participants.add(String(providerProfile.user));
    }

    const payload = {
        bookingId: String(booking._id),
        status: booking.status,
        action,
        updatedAt: new Date().toISOString()
    };

    for (const userId of participants) {
        sendNotification(userId, "Booking updated", NOTIFICATION_EVENTS.BOOKING_UPDATED, payload);
    }
};

const createBooking = asyncHandler(async (req, res) => {
    
    const { providerId, bookingDate, note, address } = req.body;

    if (!providerId || !bookingDate) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (typeof providerId !== "string" || !isValidObjectId(providerId)) {
        throw new ApiError(400, "Invalid provider id");
    }

    const bookingDateValue = new Date(bookingDate);
    if (Number.isNaN(bookingDateValue.getTime())) {
        throw new ApiError(400, "Invalid booking date");
    }

    if (bookingDateValue < new Date()) {
        throw new ApiError(400, "Booking date cannot be in the past");
    }

    const existingProvider = await ServiceProvider.findById(providerId);

    if (!existingProvider) {
        throw new ApiError(404, "Provider not found");
    }

    if (
        !existingProvider.isAvailable ||
        !existingProvider.isApproved ||
        !existingProvider.isActive
    ) {
        throw new ApiError(400, "Provider not available");
    }

    const service = await Service.findOne({ serviceType: existingProvider.serviceType });

    // Allow multiple bookings per day, but block collisions in the same 30-min slot.
    const slotStart = new Date(bookingDateValue);
    const slotEnd = new Date(bookingDateValue);
    slotEnd.setMinutes(slotEnd.getMinutes() + 29, 59, 999);

    const existingBooking = await Booking.findOne({
        provider: providerId,
        bookingDate: { $gte: slotStart, $lte: slotEnd },
        status: { $in: ["pending", "accepted", "payment_held"] }
    });

    if (existingBooking) {
        throw new ApiError(409, "Provider already has a booking at this time");
    }

    // Fallback for environments where Service seed data is missing.
    const servicePrice = Number(service?.price);
    const providerPrice = Number(existingProvider.pricing);
    const price = Number.isFinite(servicePrice) && servicePrice > 0
        ? servicePrice
        : Number.isFinite(providerPrice) && providerPrice > 0
            ? providerPrice
            : 500;
    const {
        platformFee,
        providerAmount,
        razorpayFee,
        amountToCharge,
        roundUpMargin,
        pricingVersion,
    } = calculateFees(price);

    const booking = await Booking.create({
        user: req.user._id,
        provider: providerId,
        bookingDate: bookingDateValue,
        note: note || "",
        address: address || "",
        price,
        platformFee,
        providerAmount,
        razorpayFee,
        amountToCharge,
        roundUpMargin,
        pricingVersion,
        status: "pending"
    });

    await emitBookingUpdateToParticipants(booking, "created");

    res.status(201).json(
        new ApiResponse(201, booking, "Booking created successfully")
    );
});

const markServiceCompletedByProvider = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    if (!bookingId) {
        throw new ApiError(400, "Booking id is required");
    }

    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
        throw new ApiError(403, "Only providers can complete bookings");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.provider.toString() !== provider._id.toString()) {
        throw new ApiError(403, "You are not authorized to complete this booking");
    }

    if (booking.status !== "payment_held") {
        throw new ApiError(400, "Only bookings with payment held can be marked as completed");
    }

    booking.status = "service_completed_by_provider";
    booking.providerCompletedAt = new Date();

    await booking.save();

    sendNotification(
        booking.user,
        "Service marked as completed",
        NOTIFICATION_EVENTS.SERVICE_COMPLETED
    );
    await emitBookingUpdateToParticipants(booking, "marked_completed_by_provider");

    return res.status(200).json(
        new ApiResponse(200, booking, "Service marked as completed by provider")
    );
});

const getProviderBookings = asyncHandler(async (req, res) => {
    const providerProfile = await ServiceProvider.findOne({ user: req.user._id });

    if (!providerProfile) {
        throw new ApiError(403, "Only providers can view provider bookings");
    }

    const bookings = await Booking.find({ provider: providerProfile._id })
        .populate("user", "fullname email address phone")
        .sort({ createdAt: -1 })
        .lean();

    const normalizedBookings = bookings.map((booking) => ({
        ...booking,
        serviceAddress: booking.address || booking?.user?.address || ""
    }));

    return res.status(200).json(
        new ApiResponse(200, normalizedBookings, "Provider bookings fetched successfully")
    );
});

const getProviderEarnings = asyncHandler(async (req, res) => {
    const providerProfile = await ServiceProvider.findOne({ user: req.user._id });

    if (!providerProfile) {
        throw new ApiError(403, "Only providers can view earnings");
    }

    const completedBookings = await Booking.find({
        provider: providerProfile._id,
        status: "completed",
    })
        .select("price providerAmount platformFee razorpayFee amountToCharge completedAt bookingDate")
        .lean();

    const totals = completedBookings.reduce(
        (acc, booking) => {
            acc.totalProviderEarnings += Number(booking.providerAmount || 0);
            acc.totalPlatformCommission += Number(booking.platformFee || 0);
            acc.totalGatewayFees += Number(booking.razorpayFee || 0);
            acc.totalCollected += Number(booking.amountToCharge || booking.price || 0);
            return acc;
        },
        {
            totalProviderEarnings: 0,
            totalPlatformCommission: 0,
            totalGatewayFees: 0,
            totalCollected: 0,
        }
    );

    const monthlyBreakdownMap = completedBookings.reduce((acc, booking) => {
        const basisDate = booking.completedAt || booking.bookingDate;
        if (!basisDate) return acc;
        const d = new Date(basisDate);
        const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthKey]) {
            acc[monthKey] = {
                month: monthKey,
                bookings: 0,
                providerEarnings: 0,
                platformCommission: 0,
                gatewayFees: 0,
            };
        }

        acc[monthKey].bookings += 1;
        acc[monthKey].providerEarnings += Number(booking.providerAmount || 0);
        acc[monthKey].platformCommission += Number(booking.platformFee || 0);
        acc[monthKey].gatewayFees += Number(booking.razorpayFee || 0);
        return acc;
    }, {});

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totals: {
                    ...totals,
                    totalBookings: completedBookings.length,
                },
                monthlyBreakdown: Object.values(monthlyBreakdownMap).sort((a, b) =>
                    a.month < b.month ? 1 : -1
                ),
            },
            "Provider earnings fetched successfully"
        )
    );
});

const acceptBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const providerProfile = await ServiceProvider.findOne({ user: req.user._id });
    if (!providerProfile) {
        throw new ApiError(403, "Only providers can accept bookings");
    }

    const booking = await Booking.findById(id);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.provider.toString() !== providerProfile._id.toString()) {
        throw new ApiError(403, "You are not authorized to accept this booking");
    }

    if (booking.status !== "pending") {
        throw new ApiError(400, "Only pending bookings can be accepted");
    }

    booking.status = "accepted";
    await booking.save();
    await emitBookingUpdateToParticipants(booking, "accepted_by_provider");

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking accepted successfully")
    );
});

const rejectBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const providerProfile = await ServiceProvider.findOne({ user: req.user._id });
    if (!providerProfile) {
        throw new ApiError(403, "Only providers can reject bookings");
    }

    const booking = await Booking.findById(id);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.provider.toString() !== providerProfile._id.toString()) {
        throw new ApiError(403, "You are not authorized to reject this booking");
    }

    if (booking.status !== "pending") {
        throw new ApiError(400, "Only pending bookings can be rejected");
    }

    booking.status = "rejected_by_provider";
    await booking.save();
    await emitBookingUpdateToParticipants(booking, "rejected_by_provider");

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking rejected successfully")
    );
});

export {
    createBooking,
    markServiceCompletedByProvider,
    getProviderBookings,
    getProviderEarnings,
    acceptBooking,
    rejectBooking
};
