// instrumentation.js
import { createServer } from 'http';
import { Server } from 'socket.io';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const httpServer = createServer();
    const io = new Server(httpServer);

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

    global.io = io;
    console.log('Socket.io server initialized');

    // Attach to Next.js port (3000 by default)
    httpServer.listen(3000, () => {
      console.log('Socket.io listening on port 3000');
    });
  }
}