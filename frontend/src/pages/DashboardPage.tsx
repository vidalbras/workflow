import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/board.service';

const BOARD_COLORS = [
  '#5d5fef','#ec4899','#f59e0b','#10b981',
  '#3b82f6','#8b5cf6','#ef4444','#14b8a6',
];

const COLOR_NAMES: Record<string, string> = {
  '#5d5fef': 'Violet', '#ec4899': 'Pink', '#f59e0b': 'Amber',
  '#10b981': 'Emerald', '#3b82f6': 'Blue', '#8b5cf6': 'Purple',
  '#ef4444': 'Red', '#14b8a6': 'Teal',
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBoard, setEditBoard] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', color: BOARD_COLORS[0] });
  const [search, setSearch] = useState('');

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: boardService.getBoards,
  });

  const createMutation = useMutation({
    mutationFn: () => boardService.createBoard(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setCreateOpen(false);
      setForm({ title: '', description: '', color: BOARD_COLORS[0] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: any) => boardService.updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setEditBoard(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const filtered = boards.filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (board: any) => {
    setEditBoard(board);
    setForm({ title: board.title, description: board.description || '', color: board.color });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Top header */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">My Boards</h1>
          <p className="text-xs text-gray-400 mt-0.5">{boards.length} board{boards.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards..."
              className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/20 outline-none w-48 transition-all"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#5d5fef' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(93,95,239,0.08)' }}>
              <svg className="w-9 h-9" style={{ color: '#5d5fef' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {search ? 'No boards found' : 'No boards yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-xs">
              {search ? 'Try a different search term' : 'Create your first board to start organizing work'}
            </p>
            {!search && (
              <button
                onClick={() => setCreateOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#5d5fef' }}
              >
                Create your first board
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((board: any) => (
              <BoardCard
                key={board.id}
                board={board}
                onEdit={openEdit}
                onDelete={(id: string) => {
                  if (confirm('Delete this board and all its content?')) deleteMutation.mutate(id);
                }}
              />
            ))}

            {/* Create new card */}
            <button
              onClick={() => setCreateOpen(true)}
              className="group flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#5d5fef] hover:bg-[#5d5fef]/5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-[#5d5fef] flex items-center justify-center mb-2 transition-colors">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#5d5fef] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-[#5d5fef] transition-colors">New board</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(createOpen || editBoard) && (
        <BoardModal
          title={editBoard ? 'Edit Board' : 'Create Board'}
          form={form}
          setForm={setForm}
          onClose={() => { setCreateOpen(false); setEditBoard(null); setForm({ title: '', description: '', color: BOARD_COLORS[0] }); }}
          onSubmit={() => {
            if (editBoard) editMutation.mutate({ id: editBoard.id, data: form });
            else createMutation.mutate();
          }}
          loading={createMutation.isPending || editMutation.isPending}
          colors={BOARD_COLORS}
          colorNames={COLOR_NAMES}
        />
      )}
    </div>
  );
}

function BoardCard({ board, onEdit, onDelete }: any) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ background: board.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: board.color }}
          >
            {board.title[0]?.toUpperCase()}
          </div>
          <div className={`flex items-center gap-1 transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => { e.preventDefault(); onEdit(board); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(board.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <Link to={`/board/${board.id}`}>
          <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1 hover:text-[#5d5fef] transition-colors">
            {board.title}
          </h3>
          {board.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{board.description}</p>
          )}
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] text-gray-400">
              {new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: board.color + '15', color: board.color }}
          >
            Active
          </span>
        </div>
      </div>
    </div>
  );
}

function BoardModal({ title, form, setForm, onClose, onSubmit, loading, colors, colorNames }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Board name</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Product Roadmap"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/20 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && form.title.trim() && onSubmit()}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="What's this board for?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/20 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c: string) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  title={colorNames[c]}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!form.title.trim() || loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: '#5d5fef' }}
            >
              {loading ? 'Saving...' : title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
