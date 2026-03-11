import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/board.service';
import { useAuth } from '../hooks/useAuth';
import BoardCard from '../components/Board/BoardCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
  });

  const createMutation = useMutation({
    mutationFn: () => boardService.createBoard({ title, description, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setColor(COLORS[0]);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => boardService.updateBoard(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this board and all its content?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Workflow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">Hello, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
            <p className="text-sm text-gray-500 mt-0.5">{boards.length} board{boards.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No boards yet</h3>
            <p className="text-gray-500 mb-4">Create your first board to get started</p>
            <Button onClick={() => setCreateOpen(true)}>Create Board</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board: any) => (
              <BoardCard
                key={board.id}
                board={board}
                onEdit={(id, data) => editMutation.mutate({ id, data })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Board">
        <div className="space-y-4">
          <Input
            label="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Project"
            autoFocus
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What's this board for?"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!title.trim()}
            >
              Create Board
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
