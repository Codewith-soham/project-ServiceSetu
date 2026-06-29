import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";
import axios from "axios";

import { getRazorpayInstance, calculateFees, verifyRazorpaySignature } from "../utils/razorpay.util.js";
import { sendNotification, NOTIFICATION_EVENTS } from "../socket/notification.js";

import { Booking } from "../models/booking.model.js";
import { ServiceProvider } from "../models/serviceProvider.model.js";
import { Service } from "../models/service.model.js";

const getGatewayMode = (keyId) => {
  if (!keyId) return "unconfigured";
  return keyId.startsWith("rzp_live_") ? "live" : "test";
};

const fetchImageDataUrl = async (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent": "ServiceSetu-Backend/1.0"
      }
    });

    const contentType = response.headers?.["content-type"] || "image/png";
    const buffer = Buffer.from(response.data);
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("[payments.qr:image-fetch-failed]", {
      message: error?.message,
      imageUrl,
      code: error?.code
    });
    return null;
  }
};

const checkGatewayStatus = asyncHandler(async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const mode = getGatewayMode(keyId);

  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          configured: false,
          reachable: false,
          mode,
          reason: "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET",
        },
        "Gateway status fetched"
      )
    );
  }

  try {
    const razorpayInstance = getRazorpayInstance();
    await razorpayInstance.orders.all({ count: 1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          configured: true,
          reachable: true,
          mode,
          keyHint: keyId.slice(0, 8) + "...",
        },
        "Gateway status fetched"
      )
    );
  } catch (error) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          configured: true,
          reachable: false,
          mode,
          keyHint: keyId.slice(0, 8) + "...",
          reason: error?.description || error?.message || "Unable to reach Razorpay",
        },
        "Gateway status fetched"
      )
    );
  }
});

// Create Razorpay Order
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    throw new ApiError(400, "Booking ID is required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.status !== "accepted") {
    throw new ApiError(400, "Booking must be accepted to proceed with payment");
  }

  const providerId = booking.provider;
  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  const normalizedServiceType = String(provider.serviceType || "").trim().toLowerCase();
  const service = await Service.findOne({
    serviceType: normalizedServiceType,
  });

  const servicePrice = Number(service?.price);
  const providerPrice = Number(provider?.pricing);
  const effectivePrice = Number.isFinite(servicePrice) && servicePrice > 0
    ? servicePrice
    : Number.isFinite(providerPrice) && providerPrice > 0
      ? providerPrice
      : 500;

  const {
    basePrice,
    rawTotal,
    amountToCharge,
    platformFee,
    providerAmount,
    razorpayFee,
    roundUpMargin,
    platformEarning,
    pricingVersion,
  } = calculateFees(effectivePrice);

  const razorpayInstance = getRazorpayInstance();
  const order = await razorpayInstance.orders.create({
    amount: Math.round(amountToCharge * 100),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  booking.price = basePrice;
  booking.platformFee = platformFee;
  booking.razorpayFee = razorpayFee;
  booking.roundUpMargin = roundUpMargin;
  booking.providerAmount = providerAmount;
  booking.amountToCharge = amountToCharge;
  booking.pricingVersion = pricingVersion;
  booking.razorpayOrderId = order.id;
  booking.razorpayPaymentId = undefined;
  booking.razorpaySignature = undefined;
  await booking.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookingId: booking._id,
        razorpayOrderId: order.id,
        amount: order.amount,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
        breakdown: {
          basePrice,
          rawTotal,
          platformFee,
          razorpayFee,
          roundUpMargin,
          providerPayout: providerAmount,
          providerAmount,
          platformProjectedEarning: platformEarning,
          customerTotal: amountToCharge,
          pricingVersion,
        },
      },
      "Order created successfully"
    )
  );
});

const createPaymentOrderLegacy = asyncHandler(async (req,res) => {
  const { providerId , bookingDate , note, address } = req.body;

    if(!providerId || !bookingDate){
        throw new ApiError(400,'Provider ID and booking date are required');
    }

  const bookingDateValue = new Date(bookingDate);
  if (Number.isNaN(bookingDateValue.getTime())) {
    throw new ApiError(400, "Invalid booking date");
  }

  if (bookingDateValue < new Date()) {
    throw new ApiError(400, "Booking date cannot be in the past");
  }

     // Get provider
  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  // 2 Get service price with fallback for environments missing seeded Service records.
  const normalizedServiceType = String(provider.serviceType || "").trim().toLowerCase();
  const service = await Service.findOne({
    serviceType: normalizedServiceType,
  });

  const servicePrice = Number(service?.price);
  const providerPrice = Number(provider?.pricing);
  const effectivePrice = Number.isFinite(servicePrice) && servicePrice > 0
    ? servicePrice
    : Number.isFinite(providerPrice) && providerPrice > 0
      ? providerPrice
      : 500;

  // Allow multiple bookings per day, but block collisions in the same 30-min slot.
  const slotStart = new Date(bookingDateValue);
  const slotEnd = new Date(bookingDateValue);
  slotEnd.setMinutes(slotEnd.getMinutes() + 29, 59, 999);

  const existingBooking = await Booking.findOne({
    provider: providerId,
    bookingDate: { $gte: slotStart, $lte: slotEnd },
    status: { $in: ["accepted", "payment_held"] },
  });

  if (existingBooking) {
    const isSameUser = existingBooking.user?.toString?.() === req.user?._id?.toString?.();
    const canRetry =
      isSameUser &&
      existingBooking.status === "accepted" &&
      existingBooking.paymentStatus === "pending";

    if (!canRetry) {
      throw new ApiError(409, "Provider already has a booking at this time");
    }

    // Reuse the existing accepted booking by generating a fresh order.
    const {
      basePrice,
      rawTotal,
      amountToCharge,
      platformFee,
      providerAmount,
      razorpayFee,
      roundUpMargin,
      platformEarning,
      pricingVersion,
    } = calculateFees(effectivePrice);

    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amountToCharge * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    existingBooking.note = note ?? existingBooking.note;
    existingBooking.address = address ?? existingBooking.address;
    existingBooking.price = basePrice;
    existingBooking.platformFee = platformFee;
    existingBooking.razorpayFee = razorpayFee;
    existingBooking.roundUpMargin = roundUpMargin;
    existingBooking.providerAmount = providerAmount;
    existingBooking.amountToCharge = amountToCharge;
    existingBooking.pricingVersion = pricingVersion;

    existingBooking.razorpayOrderId = order.id;
    existingBooking.razorpayPaymentId = undefined;
    existingBooking.razorpaySignature = undefined;
    await existingBooking.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookingId: existingBooking._id,
          razorpayOrderId: order.id,
          amount: order.amount,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
          breakdown: {
            basePrice,
            rawTotal,
            platformFee,
            razorpayFee,
            roundUpMargin,
            providerPayout: providerAmount,
            providerAmount,
            platformProjectedEarning: platformEarning,
            customerTotal: amountToCharge,
            pricingVersion,
          },
        },
        "Order refreshed successfully"
      )
    );
  }

  const {
    basePrice,
    rawTotal,
    amountToCharge,
    platformFee,
    providerAmount,
    razorpayFee,
    roundUpMargin,
    platformEarning,
    pricingVersion,
  } = calculateFees(effectivePrice);

  //  Create Razorpay Order
  const razorpayInstance = getRazorpayInstance();
  const order = await razorpayInstance.orders.create({
    amount: Math.round(amountToCharge * 100), // paise
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
    bookingDate: bookingDateValue,
    note,
    address: address || "",
    price: basePrice,
    platformFee,
    razorpayFee,
    roundUpMargin,
    providerAmount,
    amountToCharge,
    pricingVersion,
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
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
        breakdown: {
          basePrice,
          rawTotal,
          platformFee,
          razorpayFee,
          roundUpMargin,
          providerPayout: providerAmount,
          providerAmount,
          platformProjectedEarning: platformEarning,
          customerTotal: amountToCharge,
          pricingVersion,
        },
      },
      "Order created successfully"
    )
  );
});

const createPaymentQr = asyncHandler(async (req, res) => {
  const { bookingId, providerId, bookingDate, note, address } = req.body;

  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }

    if (!["accepted", "awaiting_payment"].includes(String(booking.status))) {
      throw new ApiError(400, "Booking must be accepted to generate a QR payment");
    }

    const provider = await ServiceProvider.findById(booking.provider);
    if (!provider) {
      throw new ApiError(404, "Provider not found");
    }

    const normalizedServiceType = String(provider.serviceType || "").trim().toLowerCase();
    const service = await Service.findOne({ serviceType: normalizedServiceType });

    const servicePrice = Number(service?.price);
    const providerPrice = Number(provider?.pricing);
    const effectivePrice = Number.isFinite(servicePrice) && servicePrice > 0
      ? servicePrice
      : Number.isFinite(providerPrice) && providerPrice > 0
        ? providerPrice
        : 500;

    const hasReusableQr =
      Boolean(booking.razorpayQrCodeId && booking.razorpayQrImageUrl) &&
      (!booking.razorpayQrCloseBy || booking.razorpayQrCloseBy.getTime() > Date.now() + 30_000);

    if (hasReusableQr) {
      const qrImageDataUrl = await fetchImageDataUrl(booking.razorpayQrImageUrl);
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            bookingId: booking._id,
            qrCodeId: booking.razorpayQrCodeId,
            qrImageUrl: `/api/v1/payments/qr-image/${booking._id}`,
            qrImageDataUrl,
            qrCloseBy: booking.razorpayQrCloseBy || null,
            amount: Math.round(Number(booking.amountToCharge || 0) * 100),
            currency: "INR",
            breakdown: {
              basePrice: booking.price,
              rawTotal: null,
              platformFee: booking.platformFee,
              razorpayFee: booking.razorpayFee,
              roundUpMargin: booking.roundUpMargin,
              providerPayout: booking.providerAmount,
              providerAmount: booking.providerAmount,
              platformProjectedEarning: null,
              customerTotal: booking.amountToCharge,
              pricingVersion: booking.pricingVersion,
            },
          },
          "QR reused successfully"
        )
      );
    }

    const {
      basePrice,
      rawTotal,
      amountToCharge,
      platformFee,
      providerAmount,
      razorpayFee,
      roundUpMargin,
      platformEarning,
      pricingVersion,
    } = calculateFees(effectivePrice);

    const razorpayInstance = getRazorpayInstance();
    const closeBySeconds = Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000);

    console.log("[payments.qr:razorpay-check-1]", {
      hasQrCode: !!razorpayInstance.qrCode,
      razorpayMethods: Object.keys(razorpayInstance || {}),
    });

    if (!razorpayInstance.qrCode) {
      throw new ApiError(400, "Razorpay QR Code feature not available. Check account settings.");
    }

    let qr;
    try {
      qr = await razorpayInstance.qrCode.create({
        type: "upi_qr",
        name: "ServiceSetu booking",
        usage: "single_use",
        fixed_amount: true,
        payment_amount: Math.round(amountToCharge * 100),
        description: "Service booking payment",
        close_by: closeBySeconds,
        notes: {
          bookingId: String(booking._id),
          providerId: String(booking.provider),
          userId: String(req.user?._id),
        },
      });
    } catch (err) {
      console.error("[payments.createQr:existing-booking-error]", {
        fullError: JSON.stringify(err, null, 2),
        message: err?.message,
        description: err?.description,
        code: err?.code,
        errorKeys: Object.keys(err || {}),
        errorString: String(err),
      });
      const msg = err?.description || err?.message || "Failed to create Razorpay QR";
      throw new ApiError(400, msg);
    }

    console.log("[payments.qr:response]", { qr: JSON.stringify(qr, null, 2) });

    if (!qr?.id || !qr?.image_url) {
      console.error("[payments.qr:incomplete-response]", {
        qrResponse: JSON.stringify(qr, null, 2),
        hasId: !!qr?.id,
        hasImageUrl: !!qr?.image_url,
      });
      throw new ApiError(500, `Failed to create Razorpay QR - missing ${!qr?.id ? 'id' : 'image_url'}`);
    }

    booking.price = basePrice;
    booking.platformFee = platformFee;
    booking.razorpayFee = razorpayFee;
    booking.roundUpMargin = roundUpMargin;
    booking.providerAmount = providerAmount;
    booking.amountToCharge = amountToCharge;
    booking.pricingVersion = pricingVersion;
    booking.razorpayQrCodeId = qr.id;
    booking.razorpayQrImageUrl = qr.image_url;
    booking.razorpayQrCloseBy = qr.close_by ? new Date(Number(qr.close_by) * 1000) : undefined;
    booking.status = booking.status === "accepted" ? "awaiting_payment" : booking.status;
    await booking.save();

    const qrImageDataUrl = await fetchImageDataUrl(qr.image_url);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookingId: booking._id,
          qrCodeId: qr.id,
          qrImageUrl: `/api/v1/payments/qr-image/${booking._id}`,
          qrImageDataUrl: null,
          qrCloseBy: booking.razorpayQrCloseBy || null,
          amount: Math.round(amountToCharge * 100),
          currency: "INR",
          breakdown: {
            basePrice,
            rawTotal,
            platformFee,
            razorpayFee,
            roundUpMargin,
            providerPayout: providerAmount,
            providerAmount,
            platformProjectedEarning: platformEarning,
            customerTotal: amountToCharge,
            pricingVersion,
          },
        },
        "QR created successfully"
      )
    );
  }

  if (!providerId || !bookingDate) {
    throw new ApiError(400, "Booking ID or provider ID and booking date are required");
  }

  const bookingDateValue = new Date(bookingDate);
  if (Number.isNaN(bookingDateValue.getTime())) {
    throw new ApiError(400, "Invalid booking date");
  }
  if (bookingDateValue < new Date()) {
    throw new ApiError(400, "Booking date cannot be in the past");
  }

  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  const normalizedServiceType = String(provider.serviceType || "").trim().toLowerCase();
  const service = await Service.findOne({ serviceType: normalizedServiceType });

  const servicePrice = Number(service?.price);
  const providerPrice = Number(provider?.pricing);
  const effectivePrice = Number.isFinite(servicePrice) && servicePrice > 0
    ? servicePrice
    : Number.isFinite(providerPrice) && providerPrice > 0
      ? providerPrice
      : 500;

  // Allow multiple bookings per day, but block collisions in the same 30-min slot.
  const slotStart = new Date(bookingDateValue);
  const slotEnd = new Date(bookingDateValue);
  slotEnd.setMinutes(slotEnd.getMinutes() + 29, 59, 999);

  const existingBooking = await Booking.findOne({
    provider: providerId,
    bookingDate: { $gte: slotStart, $lte: slotEnd },
    status: { $in: ["awaiting_payment", "pending", "accepted"] },
  });

  if (existingBooking) {
    const isSameUser = existingBooking.user?.toString?.() === req.user?._id?.toString?.();
    const canRetry =
      isSameUser &&
      existingBooking.status === "awaiting_payment" &&
      existingBooking.paymentStatus === "pending";

    if (!canRetry) {
      throw new ApiError(409, "Provider already has a booking at this time");
    }

    // If we already have an active QR that hasn't expired, reuse it.
    const hasReusableQr =
      Boolean(existingBooking.razorpayQrCodeId && existingBooking.razorpayQrImageUrl) &&
      (!existingBooking.razorpayQrCloseBy || existingBooking.razorpayQrCloseBy.getTime() > Date.now() + 30_000);

    if (hasReusableQr) {
      const qrImageDataUrl = await fetchImageDataUrl(existingBooking.razorpayQrImageUrl);
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            bookingId: existingBooking._id,
            qrCodeId: existingBooking.razorpayQrCodeId,
            qrImageUrl: `/api/v1/payments/qr-image/${existingBooking._id}`,
            qrImageDataUrl,
            qrCloseBy: existingBooking.razorpayQrCloseBy || null,
            amount: Math.round(Number(existingBooking.amountToCharge || 0) * 100),
            currency: "INR",
            breakdown: {
              basePrice: existingBooking.price,
              rawTotal: null,
              platformFee: existingBooking.platformFee,
              razorpayFee: existingBooking.razorpayFee,
              roundUpMargin: existingBooking.roundUpMargin,
              providerPayout: existingBooking.providerAmount,
              providerAmount: existingBooking.providerAmount,
              platformProjectedEarning: null,
              customerTotal: existingBooking.amountToCharge,
              pricingVersion: existingBooking.pricingVersion,
            },
          },
          "QR reused successfully"
        )
      );
    }

    // Otherwise, generate a fresh QR and attach it to the existing booking.
    const {
      basePrice,
      rawTotal,
      amountToCharge,
      platformFee,
      providerAmount,
      razorpayFee,
      roundUpMargin,
      platformEarning,
      pricingVersion,
    } = calculateFees(effectivePrice);

    const razorpayInstance = getRazorpayInstance();
    const closeBySeconds = Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000);

    console.log("[payments.qr:razorpay-check-2]", {
      hasQrCode: !!razorpayInstance.qrCode,
      razorpayMethods: Object.keys(razorpayInstance || {}),
    });

    if (!razorpayInstance.qrCode) {
      throw new ApiError(400, "Razorpay QR Code feature not available. Check account settings.");
    }

    let qr;
    try {
      qr = await razorpayInstance.qrCode.create({
        type: "upi_qr",
        name: "ServiceSetu booking",
        usage: "single_use",
        fixed_amount: true,
        payment_amount: Math.round(amountToCharge * 100),
        description: "Service booking payment",
        close_by: closeBySeconds,
        notes: {
          bookingId: String(existingBooking._id),
          providerId: String(providerId),
          userId: String(req.user?._id),
        },
      });
    } catch (err) {
      console.error("[payments.createQr:existing-fresh-qr-error]", {
        fullError: JSON.stringify(err, null, 2),
        message: err?.message,
        description: err?.description,
        code: err?.code,
        errorKeys: Object.keys(err || {}),
        errorString: String(err),
      });
      const msg = err?.description || err?.message || "Failed to create Razorpay QR";
      throw new ApiError(400, msg);
    }

    console.log("[payments.qr:fresh-response]", { qr: JSON.stringify(qr, null, 2) });

    if (!qr?.id || !qr?.image_url) {
      console.error("[payments.qr:fresh-incomplete-response]", {
        qrResponse: JSON.stringify(qr, null, 2),
        hasId: !!qr?.id,
        hasImageUrl: !!qr?.image_url,
      });
      throw new ApiError(500, `Failed to create Razorpay QR - missing ${!qr?.id ? 'id' : 'image_url'}`);
    }

    existingBooking.note = note ?? existingBooking.note;
    existingBooking.address = address ?? existingBooking.address;
    existingBooking.price = basePrice;
    existingBooking.platformFee = platformFee;
    existingBooking.razorpayFee = razorpayFee;
    existingBooking.roundUpMargin = roundUpMargin;
    existingBooking.providerAmount = providerAmount;
    existingBooking.amountToCharge = amountToCharge;
    existingBooking.pricingVersion = pricingVersion;

    existingBooking.razorpayQrCodeId = qr.id;
    existingBooking.razorpayQrImageUrl = qr.image_url;
    existingBooking.razorpayQrCloseBy = qr.close_by ? new Date(Number(qr.close_by) * 1000) : undefined;
    await existingBooking.save();

    const qrImageDataUrl = await fetchImageDataUrl(qr.image_url);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookingId: existingBooking._id,
          qrCodeId: qr.id,
          qrImageUrl: `/api/v1/payments/qr-image/${booking._id}`,
          qrImageDataUrl: null,
          qrCloseBy: existingBooking.razorpayQrCloseBy || null,
          amount: Math.round(amountToCharge * 100),
          currency: "INR",
          breakdown: {
            basePrice,
            rawTotal,
            platformFee,
            razorpayFee,
            roundUpMargin,
            providerPayout: providerAmount,
            providerAmount,
            platformProjectedEarning: platformEarning,
            customerTotal: amountToCharge,
            pricingVersion,
          },
        },
        "QR refreshed successfully"
      )
    );
  }

  const {
    basePrice,
    rawTotal,
    amountToCharge,
    platformFee,
    providerAmount,
    razorpayFee,
    roundUpMargin,
    platformEarning,
    pricingVersion,
  } = calculateFees(effectivePrice);

  const razorpayInstance = getRazorpayInstance();

  console.log("[payments.qr:razorpay-check-3]", {
    hasQrCode: !!razorpayInstance.qrCode,
    razorpayMethods: Object.keys(razorpayInstance || {}),
  });

  if (!razorpayInstance.qrCode) {
    throw new ApiError(400, "Razorpay QR Code feature not available. Check account settings.");
  }

  let qr;
  try {
    // Create a Razorpay UPI QR (single-use, fixed amount). `payment_amount` is in paise.
    const closeBySeconds = Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000); // 2h expiry
    qr = await razorpayInstance.qrCode.create({
      type: "upi_qr",
      name: "ServiceSetu booking",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: Math.round(amountToCharge * 100),
      description: "Service booking payment",
      close_by: closeBySeconds,
      notes: {
        providerId: String(providerId),
        userId: String(req.user?._id),
      },
    });
  } catch (err) {
    console.error("[payments.createQr:error]", {
      fullError: JSON.stringify(err, null, 2),
      message: err?.message,
      description: err?.description,
      razorpay: err?.error,
      statusCode: err?.statusCode,
      code: err?.code,
      errorKeys: Object.keys(err || {}),
      errorString: String(err),
    });
    const msg =
      err?.error?.description ||
      err?.description ||
      err?.error?.message ||
      err?.message ||
      "Failed to create Razorpay QR";
    // Razorpay often returns 400 when QR feature isn't enabled.
    throw new ApiError(400, msg);
  }

  console.log("[payments.qr:new-booking-response]", { qr: JSON.stringify(qr, null, 2) });

  if (!qr?.id || !qr?.image_url) {
    console.error("[payments.qr:new-booking-incomplete]", {
      qrResponse: JSON.stringify(qr, null, 2),
      hasId: !!qr?.id,
      hasImageUrl: !!qr?.image_url,
    });
    throw new ApiError(500, `Failed to create Razorpay QR - missing ${!qr?.id ? 'id' : 'image_url'}`);
  }

  const booking = await Booking.create({
    user: req.user._id,
    provider: providerId,
    bookingDate: bookingDateValue,
    note,
    address: address || "",
    price: basePrice,
    platformFee,
    razorpayFee,
    roundUpMargin,
    providerAmount,
    amountToCharge,
    pricingVersion,
    razorpayQrCodeId: qr.id,
    razorpayQrImageUrl: qr.image_url,
    razorpayQrCloseBy: qr.close_by ? new Date(Number(qr.close_by) * 1000) : undefined,
    status: "awaiting_payment",
    paymentStatus: "pending",
  });

  const qrImageDataUrl = await fetchImageDataUrl(qr.image_url);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        bookingId: booking._id,
        qrCodeId: qr.id,
        qrImageUrl: qr.image_url,
        qrImageDataUrl,
        qrCloseBy: booking.razorpayQrCloseBy || null,
        amount: Math.round(amountToCharge * 100),
        currency: "INR",
        breakdown: {
          basePrice,
          rawTotal,
          platformFee,
          razorpayFee,
          roundUpMargin,
          providerPayout: providerAmount,
          providerAmount,
          platformProjectedEarning: platformEarning,
          customerTotal: amountToCharge,
          pricingVersion,
        },
      },
      "QR created successfully"
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
  booking.status = "payment_held";
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = signature;

  await booking.save();

  const provider = await ServiceProvider.findById(booking.provider).select("user").lean();
  if (provider?.user) {
    sendNotification(
      provider.user,
      "Payment received, proceed with job",
      NOTIFICATION_EVENTS.PAYMENT_HELD
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Payment verified"));
});

const getBookingPaymentStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (!booking.razorpayOrderId && !booking.razorpayQrCodeId) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookingId: booking._id,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.status,
          razorpayOrderId: null,
          gateway: { hasOrder: false, hasQr: Boolean(booking.razorpayQrCodeId) },
        },
        "Payment status fetched"
      )
    );
  }

  const razorpayInstance = getRazorpayInstance();
  let payments = [];
  let gatewayKind = "order";

  if (booking.razorpayOrderId) {
    const paymentsResponse = await razorpayInstance.orders.fetchPayments(booking.razorpayOrderId);
    payments = Array.isArray(paymentsResponse?.items) ? paymentsResponse.items : [];
    gatewayKind = "order";
  } else if (booking.razorpayQrCodeId) {
    const paymentsResponse = await razorpayInstance.qrCode.fetchPayments(booking.razorpayQrCodeId);
    payments = Array.isArray(paymentsResponse?.items) ? paymentsResponse.items : [];
    gatewayKind = "qr";
  }

  const bestPayment =
    payments.find((p) => p?.status === "captured") ||
    payments.find((p) => p?.status === "authorized") ||
    payments[0] ||
    null;

  const gatewayStatus = bestPayment?.status || (payments.length ? "unknown" : "not_found");
  const isPaidOnGateway = gatewayStatus === "captured" || gatewayStatus === "authorized";

  if (isPaidOnGateway && booking.paymentStatus !== "paid") {
    booking.paymentStatus = "paid";
    booking.status = booking.status === "awaiting_payment" ? "pending" : booking.status;
    booking.razorpayPaymentId = booking.razorpayPaymentId || bestPayment?.id;
    await booking.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.status,
        razorpayOrderId: booking.razorpayOrderId,
        razorpayPaymentId: booking.razorpayPaymentId || bestPayment?.id || null,
        gateway: {
          kind: gatewayKind,
          paymentsFound: payments.length,
          status: gatewayStatus,
          amount: bestPayment?.amount || null,
          currency: bestPayment?.currency || null,
          method: bestPayment?.method || null,
          created_at: bestPayment?.created_at || null,
        },
      },
      "Payment status fetched"
    )
  );
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

  const provider = await ServiceProvider.findOne({ user: req.user._id })
    .select("_id payoutDetails")
    .lean();
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

  const payoutDetails = provider.payoutDetails || {};
  const hasBankDetails = Boolean(
    payoutDetails.accountHolderName &&
    payoutDetails.accountNumber &&
    payoutDetails.ifscCode &&
    payoutDetails.bankName
  );

  if (!hasBankDetails) {
    throw new ApiError(400, "Provider payout details are incomplete. Please update bank details before release.");
  }

  booking.isOtpVerified = true;
  booking.status = "completed";
  booking.paymentStatus = "released";
  booking.payoutStatus = "processing";
  booking.payoutProcessedAt = new Date();
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
    const razorpayInstance = getRazorpayInstance();
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

// Proxy QR image endpoint
const proxyQrImage = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (!booking.razorpayQrImageUrl) {
    throw new ApiError(404, "QR image not found");
  }

  try {
    const response = await axios.get(booking.razorpayQrImageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });

    const contentType = response.headers?.["content-type"] || "image/png";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(response.data);
  } catch (error) {
    console.warn("[payments.proxyQrImage:error]", {
      message: error?.message,
      bookingId,
    });
    throw new ApiError(500, "Failed to fetch QR image");
  }
});

// Proxy QR image endpoint
const proxyQrImage = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (!booking.razorpayQrImageUrl) {
    throw new ApiError(404, "QR image not found");
  }

  try {
    const response = await axios.get(booking.razorpayQrImageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });

    const contentType = response.headers?.["content-type"] || "image/png";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(response.data);
  } catch (error) {
    console.error("[payments.proxyQrImage:error]", {
      message: error?.message,
      bookingId,
    });
    throw new ApiError(500, "Failed to fetch QR image");
  }
});

// Flag non-cooperative user
const flagUser = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    throw new ApiError(400, "Flag reason is required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  const provider = await ServiceProvider.findOne({ user: req.user._id });
  if (!provider) {
    throw new ApiError(403, "Only providers can flag users");
  }

  if (booking.provider.toString() !== provider._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.status !== "service_completed_by_provider") {
    throw new ApiError(400, "Can only flag after marking service complete");
  }

  booking.providerFlaggedAt = new Date();
  booking.providerFlagReason = reason;
  await booking.save();

  sendNotification(
    "admin",
    `User flagged on booking ${bookingId}`,
    NOTIFICATION_EVENTS.USER_FLAGGED,
    { bookingId: String(booking._id), reason }
  );

  return res.status(200).json(
    new ApiResponse(200, booking, "User flagged successfully")
  );
});

// User disputes completion
const disputeBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 20) {
    throw new ApiError(400, "Dispute reason must be at least 20 characters");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.status !== "service_completed_by_provider") {
    throw new ApiError(400, "Can only dispute completed services");
  }

  booking.status = "disputed";
  booking.disputeReason = reason;
  booking.disputedAt = new Date();
  await booking.save();

  sendNotification(
    "admin",
    `Booking disputed: ${bookingId}`,
    NOTIFICATION_EVENTS.BOOKING_DISPUTED,
    { bookingId: String(booking._id), reason }
  );

  return res.status(200).json(
    new ApiResponse(200, booking, "Dispute registered")
  );
});

export {
  checkGatewayStatus,
  createPaymentOrder,
  createPaymentQr,
  verifyPayment,
  getBookingPaymentStatus,
  acceptCompletion,
  verifyCompletionOtp,
  refundPayment,
  rejectCompletion,
  flagUser,
  disputeBooking,
  proxyQrImage
}