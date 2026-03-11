import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  createdAt: string;
}

interface BoardCardProps {
  board: Board;
  onEdit: (id: string, data: { title: string; description?: string; color: string }) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const [color, setColor] = useState(board.color);

  const handleSave = () => {
    onEdit(board.id, { title, description, color });
    setEditOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
        <div className="h-2" style={{ backgroundColor: board.color }} />
        <div className="p-4">
          <div className="flex items-start justify-between">
            <Link to={`/board/${board.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {board.title}
              </h3>
              {board.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
              )}
            </Link>
            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(board.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {new Date(board.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Board">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim()}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
