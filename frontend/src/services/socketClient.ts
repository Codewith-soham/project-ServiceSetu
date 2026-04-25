import { io, Socket } from 'socket.io-client';

const envBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
const rawBaseUrl = envBaseUrl || 'http://localhost:8000/api';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
const socketServerUrl = normalizedBaseUrl.replace(/\/api(?:\/v\d+)?$/i, '');

export const SOCKET_EVENTS = {
  BOOKING_UPDATED: 'booking_updated',
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
