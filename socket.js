// socket.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    path: '/socket.io', // Explicit path
  });

  io.on('connection', (socket) => {
    console.log(`${socket.id} joined`);
    socket.on('joinOrganization', (orgId) => {
      socket.join(orgId);
      console.log(`${socket.id} joined organization ${orgId}`);
    });
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  global.io = io; // Make it accessible for API routes if needed

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});