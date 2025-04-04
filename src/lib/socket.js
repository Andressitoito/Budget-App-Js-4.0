// src/lib/socket.js
let io;

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call /api/socket first.');
  }
  return io;
};

export const setIO = (socketIO) => {
  io = socketIO;
};