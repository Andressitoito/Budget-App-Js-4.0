// src/app/api/socket/route.js
import { Server } from 'socket.io';

export const config = {
  api: {
    bodyParser: false, // Required for WebSocket
  },
};

let io;

export async function GET(req) {
  if (!io) {
    const { socket: { server } } = req;
    io = new Server(server, {
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

    console.log('Socket.io initialized on Next.js server (port 3000)');
  }

  return new Response('Socket.IO server running', { status: 200 });
}