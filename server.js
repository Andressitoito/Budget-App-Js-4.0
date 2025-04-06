// server.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Log all incoming events for debugging
    socket.onAny((event, ...args) => {
      console.log(`Received event from ${socket.id}: ${event}`, args);
    });

    socket.on('joinOrganization', (orgId) => {
      socket.join(orgId);
    });

    socket.on('newTransaction', (transaction) => {
      io.to(transaction.organization_id).emit('newTransaction', transaction);
    });

    socket.on('transactionsDeleted', (data) => {
      io.to(data.organization_id).emit('transactionsDeleted', data);
    });

    socket.on('newCategory', (category) => {
      io.to(category.organization_id).emit('newCategory', category);
    });

    socket.on('categoryDeleted', (data) => {
      io.to(data.organization_id).emit('categoryDeleted', data);
    });

    socket.on('categoryUpdated', (category) => {
      io.to(category.organization_id).emit('categoryUpdated', category);
    });

    socket.on('transactionUpdated', (transaction) => {
      io.to(transaction.organization_id).emit('transactionUpdated', transaction);
    });

    socket.on('transactionDeleted', (data) => {
      io.to(data.organization_id).emit('transactionDeleted', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  global.io = io;

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000 with Socket.IO');
  });
});