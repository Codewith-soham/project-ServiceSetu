import { io, Socket } from 'socket.io-client';

const envBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
const rawBaseUrl = envBaseUrl || 'http://localhost:8000/api';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
const socketServerUrl = normalizedBaseUrl.replace(/\/api(?:\/v\d+)?$/i, '');

export const SOCKET_EVENTS = {
  BOOKING_UPDATED: 'booking_updated',
  PAYMENT_HELD: 'payment_held',
  PROVIDER_OTP_RECEIVED: 'provider_otp',
  BOOKING_DISPUTED: 'booking_disputed',
  USER_FLAGGED: 'user_flagged',
  REFUND_INITIATED: 'refund_initiated',
} as const;

export const createAuthenticatedSocket = (): Socket => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('serviceSetu_accessToken')
      : null;

  const socket = io(socketServerUrl, {
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth: token ? { token: `Bearer ${token}` } : undefined,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  // Debug logging
  socket.on('connect', () => {
    console.log(`[Socket.IO Client] Connected to server at ${socketServerUrl}`);
  });
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO Client] Disconnected: ${reason}`);
  });
  socket.on('connect_error', (error) => {
    console.error(`[Socket.IO Client] Connection error:`, error.message);
  });

  return socket;
};

/**
 * Socket Event Usage Guide:
 *
 * In UserDashboard:
 * - PAYMENT_HELD: User dashboard refreshes + toast "Payment received"
 * - PROVIDER_OTP_RECEIVED: Display OTP on dashboard with countdown
 * - BOOKING_DISPUTED: Notify about dispute status change
 *
 * In ProviderDashboard:
 * - BOOKING_UPDATED: Refresh bookings list
 * - PAYMENT_HELD: Show "Payment received, proceed with job" message
 * - BOOKING_DISPUTED: Show dispute notification
 * - USER_FLAGGED: Show flag status (admin notified)
 *
 * In AdminDashboard (future):
 * - BOOKING_DISPUTED: Show new dispute alert
 * - USER_FLAGGED: Show new flag alert
 *
 * Example usage:
 * const socket = createAuthenticatedSocket();
 * socket.on(SOCKET_EVENTS.PAYMENT_HELD, (payload) => {
 *   console.log('Payment received:', payload);
 *   // Update UI accordingly
 * });
 * socket.connect();
 */
