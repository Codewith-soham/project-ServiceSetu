import Razorplay from 'razorpay';
import crypto from 'crypto';
import { ApiError } from './ApiError';

//create razorpay instance
export const razorpayInstance = new Razorplay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 🔹 Calculate Platform Fee (2%)
export const calculateFees = (price) => {
  if (!price || price <= 0) {
    throw new ApiError(400, "Invalid price");
  }

  const platformFee = Math.round(price * 0.02); // 2%
  const providerAmount = price - platformFee;

  return {
    price,
    platformFee,
    providerAmount,
  };
};

// 🔹 Verify Razorpay Signature
export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
}) => {
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new ApiError(400, "Invalid Razorpay signature");
  }

  return true;
};