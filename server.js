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
      console.log(`Client ${socket.id} joining organization: ${orgId}`);
      socket.join(orgId);
      console.log(`Client ${socket.id} joined rooms:`, socket.rooms);
    });

    socket.on('newTransaction', (transaction) => {
      console.log('Received newTransaction:', transaction);
      io.to(transaction.organization_id).emit('newTransaction', transaction);
      console.log(`Emitted newTransaction to ${transaction.organization_id}`);
    });

    socket.on('transactionsDeleted', (data) => {
      console.log('Received transactionsDeleted:', data);
      io.to(data.organization_id).emit('transactionsDeleted', data);
      console.log(`Emitted transactionsDeleted to ${data.organization_id}`);
    });

    socket.on('newCategory', (category) => {
      console.log('Received newCategory:', category);
      io.to(category.organization_id).emit('newCategory', category);
      console.log(`Emitted newCategory to ${category.organization_id}`);
    });

    socket.on('categoryDeleted', (data) => {
      console.log('Received categoryDeleted:', data);
      io.to(data.organization_id).emit('categoryDeleted', data);
      console.log(`Emitted categoryDeleted to ${data.organization_id}`);
    });

    socket.on('categoryUpdated', (category) => {
      console.log('Received categoryUpdated:', category);
      io.to(category.organization_id).emit('categoryUpdated', category);
      console.log(`Emitted categoryUpdated to ${category.organization_id}`);
    });

    socket.on('transactionUpdated', (transaction) => {
      console.log('Received transactionUpdated:', transaction);
      io.to(transaction.organization_id).emit('transactionUpdated', transaction);
      console.log(`Emitted transactionUpdated to ${transaction.organization_id}`);
    });

    socket.on('transactionDeleted', (data) => {
      console.log('Received transactionDeleted:', data);
      io.to(data.organization_id).emit('transactionDeleted', data);
      console.log(`Emitted transactionDeleted to ${data.organization_id}`);
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