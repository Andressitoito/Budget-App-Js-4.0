// server.js (example, adjust if yours differs)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);
  global.io = io; // For use in API routes

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

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});