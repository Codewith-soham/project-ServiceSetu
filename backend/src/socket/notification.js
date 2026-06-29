import { emitToUser } from "./socket.js";

const NOTIFICATION_EVENTS = {
  SERVICE_COMPLETED: "service_completed",
  USER_ACCEPTED: "user_accepted",
  PAYMENT_RELEASED: "payment_released",
  BOOKING_UPDATED: "booking_updated",
  PAYMENT_HELD: "payment_held",
  PROVIDER_OTP_RECEIVED: "provider_otp",
  BOOKING_DISPUTED: "booking_disputed",
  USER_FLAGGED: "user_flagged",
  REFUND_INITIATED: "refund_initiated"
};

const sendNotification = (userId, message, type, meta = {}) => {
  if (!userId || !message || !type) {
    return false;
  }

  const payload = {
    message,
    type,
    createdAt: new Date().toISOString(),
    ...meta
  };

  const success = emitToUser(userId, type, payload);
  if (success) {
    console.log(`[Notification] Event '${type}' sent to user ${userId}`);
  } else {
    console.warn(`[Notification] Failed to send '${type}' to user ${userId} - user offline or not connected`);
  }
  return success;
};

export {
  sendNotification,
  NOTIFICATION_EVENTS
};
