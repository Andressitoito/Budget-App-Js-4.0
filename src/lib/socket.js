// src/lib/socket.js
let io;

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Ensure /api/socket is called.');
  }
  return io;
};

export const setIO = (socketIO) => {
  io = socketIO;
};