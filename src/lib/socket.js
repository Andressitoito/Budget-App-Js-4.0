// src/lib/socket.js
export const getIO = () => {
  if (!global.io) {
    throw new Error('Socket.IO not initialized. Ensure server.js is running.');
  }
  return global.io;
};