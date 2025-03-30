// lib/socket.js
const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join organization room
    socket.on('joinOrganization', (orgId) => {
      socket.join(orgId);
      console.log(`${socket.id} joined organization ${orgId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initSocket;