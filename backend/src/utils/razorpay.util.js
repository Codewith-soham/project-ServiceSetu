import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ApiError } from './ApiError.js';

let razorpayInstance;

const ensureRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new ApiError(
      500,
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }

  return { keyId, keySecret };
};

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const { keyId, keySecret } = ensureRazorpayConfig();
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
};

const toMoney = (value) => Number(Number(value).toFixed(2));

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getPricingPolicy = () => {
  const platformCommissionRate = toPositiveNumber(process.env.PLATFORM_COMMISSION_RATE, 0.02);
  const gatewayFeeRate = toPositiveNumber(process.env.RAZORPAY_FEE_RATE, 0.02);
  const gatewayFixedFee = toPositiveNumber(process.env.RAZORPAY_FIXED_FEE, 0);
  const roundTo = toPositiveNumber(process.env.PRICE_ROUND_TO, 5);
  const minRoundUpSteps = toPositiveNumber(process.env.MIN_ROUND_UP_STEPS, 1);
  const maxMarkupRate = toPositiveNumber(process.env.MAX_MARKUP_RATE, 0.12);

  return {
    platformCommissionRate,
    gatewayFeeRate,
    gatewayFixedFee,
    roundTo: roundTo > 0 ? roundTo : 5,
    minRoundUpSteps,
    maxMarkupRate,
  };
};

// Universal pricing: provider payout is guaranteed, customer total is rounded for every base price.
export const calculateFees = (basePrice) => {
  if (!basePrice || basePrice <= 0) {
    throw new ApiError(400, "Invalid price");
  }

  const price = toMoney(basePrice);
  const policy = getPricingPolicy();
  const platformFee = toMoney(price * policy.platformCommissionRate);
  const razorpayFee = toMoney(price * policy.gatewayFeeRate + policy.gatewayFixedFee);
  const rawTotal = toMoney(price + platformFee + razorpayFee);
  const minStepIncrement = Math.max(0, Math.ceil(policy.minRoundUpSteps)) * policy.roundTo;
  const roundedByStep = toMoney(Math.ceil(rawTotal / policy.roundTo) * policy.roundTo);
  const roundedTotal = toMoney(
    roundedByStep <= rawTotal ? roundedByStep + minStepIncrement : roundedByStep
  );
  const maxAllowedTotal = toMoney(price * (1 + policy.maxMarkupRate));
  const customerTotal = toMoney(Math.max(rawTotal, Math.min(roundedTotal, maxAllowedTotal)));
  const roundUpMargin = toMoney(customerTotal - rawTotal);
  const providerAmount = price;
  const platformEarning = toMoney(customerTotal - providerAmount - razorpayFee);

  return {
    basePrice: price,
    price,
    rawTotal,
    customerTotal,
    amountToCharge: customerTotal,
    platformFee,
    razorpayFee,
    roundUpMargin,
    providerAmount,
    platformEarning,
    pricingVersion: "v2-universal-step-roundup",
  };
};

//Verify Razorpay Signature
export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
}) => {
  const { keySecret } = ensureRazorpayConfig();
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new ApiError(400, "Invalid Razorpay signature");
  }

  return true;
};