// src/app/api/socket/route.js
import { Server } from 'socket.io';
import { NextResponse } from 'next/server';

let io;

export async function GET(req) {
  const res = NextResponse.next();

  if (!io) {
    // Access the underlying HTTP server from Next.js
    const httpServer = req.socket.server;
    io = new Server(httpServer, {
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

    // Attach io to res for other routes to access
    res.socket = { server: httpServer, io };
    console.log('Socket.io initialized on Next.js server (port 3000)');
  }

  return res;
}