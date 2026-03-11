import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocketHandlers = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('board:join', ({ boardId }: { boardId: string }) => {
      socket.join(boardId);
    });

    socket.on('board:leave', ({ boardId }: { boardId: string }) => {
      socket.leave(boardId);
    });

    socket.on('disconnect', () => {
      // cleanup handled automatically by socket.io
    });
  });
};
