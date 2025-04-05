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

    socket.on('joinOrganization', (orgId) => {
      console.log(`Client ${socket.id} joined organization: ${orgId}`);
      socket.join(orgId);
    });

    socket.on('newTransaction', (transaction) => {
      console.log('Emitting newTransaction:', transaction);
      io.to(transaction.organization_id).emit('newTransaction', transaction);
    });

    socket.on('transactionsDeleted', (data) => {
      console.log('Emitting transactionsDeleted:', data);
      io.to(data.organization_id).emit('transactionsDeleted', data);
    });

    socket.on('newCategory', (category) => {
      console.log('Emitting newCategory:', category);
      io.to(category.organization_id).emit('newCategory', category);
    });

    socket.on('categoryDeleted', (data) => {
      console.log('Emitting categoryDeleted:', data);
      io.to(data.organization_id).emit('categoryDeleted', data);
    });

    socket.on('categoryUpdated', (category) => {
      console.log('Emitting categoryUpdated:', category);
      io.to(category.organization_id).emit('categoryUpdated', category);
    });

    socket.on('transactionUpdated', (transaction) => {
      console.log('Emitting transactionUpdated:', transaction);
      io.to(transaction.organization_id).emit('transactionUpdated', transaction);
    });

    socket.on('transactionDeleted', (data) => {
      console.log('Emitting transactionDeleted:', data);
      io.to(data.organization_id).emit('transactionDeleted', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Export io for API routes
  global.io = io;

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000 with Socket.IO');
  });
});