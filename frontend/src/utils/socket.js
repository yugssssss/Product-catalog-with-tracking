import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect',       () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect',    (r) => console.log('🔌 Socket disconnected:', r));
  socket.on('connect_error', (e) => console.warn('Socket error:', e.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getSocket = () => socket;
