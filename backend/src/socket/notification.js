import { emitToUser } from "./socket.js";

const NOTIFICATION_EVENTS = {
  SERVICE_COMPLETED: "service_completed",
  USER_ACCEPTED: "user_accepted",
  PAYMENT_RELEASED: "payment_released"
};

const sendNotification = (userId, message, type) => {
  if (!userId || !message || !type) {
    return false;
  }

  const payload = {
    message,
    type,
    createdAt: new Date().toISOString()
  };

  return emitToUser(userId, type, payload);
};

export {
  sendNotification,
  NOTIFICATION_EVENTS
};
