import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';

export function useSocket(boardId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  const { addCard, updateCard, removeCard, moveCard, addColumn, updateColumn, removeColumn } = useBoardStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !boardId) return;

    const socket = io('/', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('board:join', { boardId });
    });

    socket.on('card:created', ({ card }: any) => addCard(card));
    socket.on('card:updated', ({ card }: any) => updateCard(card));
    socket.on('card:deleted', ({ cardId, columnId }: any) => removeCard(cardId, columnId));
    socket.on('card:moved', ({ cardId, fromColumnId, toColumnId, order }: any) =>
      moveCard(cardId, fromColumnId, toColumnId, order)
    );
    socket.on('column:created', ({ column }: any) => addColumn(column));
    socket.on('column:updated', ({ column }: any) => updateColumn(column));
    socket.on('column:deleted', ({ columnId }: any) => removeColumn(columnId));

    return () => {
      socket.emit('board:leave', { boardId });
      socket.disconnect();
    };
  }, [token, boardId]);

  return socketRef.current;
}
