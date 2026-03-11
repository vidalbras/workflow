import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { boardService } from '../services/board.service';
import { useBoardStore } from '../store/boardStore';
import { useSocket } from '../hooks/useSocket';
import KanbanBoard from '../components/Kanban/KanbanBoard';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { setBoard, board } = useBoardStore();
  useSocket(boardId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoardById(boardId!),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (data) setBoard(data);
  }, [data]);

  const totalCards = board?.columns?.reduce((acc, col) => acc + col.cards.length, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-3 bg-[#f0f2f5]">
        <div className="w-8 h-8 border-[3px] border-[#5d5fef] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading board...</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Board not found</p>
          <Link to="/" className="text-sm font-semibold" style={{ color: '#5d5fef' }}>← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Board header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: board.color }}
          >
            {board.title[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 text-[15px] truncate leading-tight">{board.title}</h1>
            {board.description && (
              <p className="text-xs text-gray-400 truncate hidden sm:block">{board.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Stats chips */}
          <div className="hidden sm:flex items-center gap-2">
            <Chip icon="⬜" label={`${board.columns?.length ?? 0} columns`} />
            <Chip icon="📋" label={`${totalCards} tasks`} />
          </div>
        </div>
      </div>

      {/* Board body */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
      <span className="text-xs">{icon}</span>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}
