import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { boardService } from '../services/board.service';
import { useBoardStore } from '../store/boardStore';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import KanbanBoard from '../components/Kanban/KanbanBoard';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { setBoard, board } = useBoardStore();
  const { user, logout } = useAuth();
  useSocket(boardId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardService.getBoardById(boardId!),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (data) setBoard(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Board not found or error loading.</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f2f5' }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: board.color }}
            />
            <h1 className="font-bold text-gray-900 truncate">{board.title}</h1>
            {board.description && (
              <span className="text-sm text-gray-500 hidden md:block truncate">{board.description}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <KanbanBoard />
      </main>
    </div>
  );
}
