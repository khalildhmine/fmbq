import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';

// For Next.js API routes, we need a different approach
export const dynamic = 'force-dynamic';

// Store the Socket.IO instance in a global variable
let io;

export async function GET(req) {
  // Return status information about the Socket.IO server
  return NextResponse.json({
    status: 'Socket.IO endpoint ready',
    message: 'This endpoint is used for WebSocket connections. Socket.IO is initialized on server start.',
    timestamp: new Date().toISOString()
  });
}

// This function will be called by the server.js file
export function initSocketIO(httpServer) {
  if (!io) {
    console.log('Initializing Socket.IO server with HTTP server...');
    
    try {
      io = new SocketIOServer(httpServer, {
        cors: {
          origin: '*', // Adjust for production
          methods: ['GET', 'POST'],
          credentials: false,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      io.on('connection', socket => {
        console.log('[SOCKET] Client connected:', socket.id);

        // User or admin joins a chat room
        socket.on('join_chat', ({ caseId }) => {
          if (caseId) {
            socket.join(caseId);
            console.log(`[SOCKET] ${socket.id} joined chat room: ${caseId}`);
            io.to(caseId).emit('user_joined', { socketId: socket.id, caseId });
          }
        });

        // Admin joins the admin room
        socket.on('join_admin', ({ userId }) => {
          socket.join('admin_room');
          console.log('[SOCKET] Admin joined admin_room:', socket.id);
          socket.emit('admin_joined', { socketId: socket.id });
        });

        // Admin joins a chat room explicitly
        socket.on('join_admin_chat', ({ caseId }) => {
          if (caseId) {
            socket.join(caseId);
            console.log(`[SOCKET] Admin ${socket.id} joined chat room: ${caseId}`);
            io.to(caseId).emit('admin_joined', { socketId: socket.id, caseId });
          }
        });

        // Handle chat messages from users or admins
        socket.on('chat_message', async message => {
          console.log('[SOCKET] chat_message received:', message);
          if (message.caseId) {
            const messageData = {
              ...message,
              _id: message._id || `${Date.now()}-${Math.random()}`,
              chatId: message.caseId,
            };

            // Broadcast to chat room and admin room
            io.to(message.caseId).emit('new_message', messageData);
            io.to('admin_room').emit('new_message', messageData);
            console.log('[SOCKET] Emitted new_message to room and admin_room:', message.caseId);
          }
        });

        // Admin accepts a chat
        socket.on('chat_accepted', ({ caseId, agentName }) => {
          if (caseId) {
            socket.join(caseId);
            io.to(caseId).emit('chat_accepted', { agentName });
            io.to(caseId).emit('admin_joined', { socketId: socket.id, caseId });
            console.log('[SOCKET] Emitted chat_accepted and admin_joined to room:', caseId);
          }
        });

        // Admin or user closes a chat
        socket.on('chat_closed', ({ caseId }) => {
          if (caseId) {
            io.to(caseId).emit('chat_closed', { caseId });
            console.log('[SOCKET] Emitted chat_closed to room:', caseId);
          }
        });

        // Handle heartbeat for connection health
        socket.on('heartbeat', data => {
          socket.emit('heartbeat_response', {
            timestamp: Date.now(),
            status: 'connected',
          });
        });

        // Handle client disconnection
        socket.on('disconnect', reason => {
          console.log('[SOCKET] Client disconnected:', socket.id, 'Reason:', reason);
        });
      });

      io.engine.on('connection_error', error => {
        console.error('[SOCKET] Connection error:', error);
      });
      
      console.log('Socket.IO server initialized successfully');
      return io;
    } catch (error) {
      console.error('Socket.IO initialization error:', error);
      return null;
    }
  }
  
  return io;
}

// Export the io instance getter
export function getIO() {
  return io;
}
