import { useState } from 'react';
import { Card } from '../../store/boardStore';
import { boardService } from '../../services/board.service';
import { useBoardStore } from '../../store/boardStore';

interface Props { card: Card; isOpen: boolean; onClose: () => void; }

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: '#10b981', bg: '#f0fdf4' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  HIGH:   { label: 'High',   color: '#ef4444', bg: '#fef2f2' },
  URGENT: { label: 'Urgent', color: '#8b5cf6', bg: '#faf5ff' },
};

export default function CardDetailModal({ card, isOpen, onClose }: Props) {
  const { updateCard, removeCard } = useBoardStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const p = PRIORITY_CONFIG[card.priority];

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await boardService.updateCard(card.id, { title, description, priority, dueDate: dueDate || undefined });
      updateCard(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    await boardService.deleteCard(card.id);
    removeCard(card.id, card.columnId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">

        {/* Priority stripe */}
        <div className="h-1 w-full" style={{ background: p.color }} />

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-base font-bold text-gray-900 border-b-2 pb-0.5 outline-none transition-colors"
                  style={{ borderColor: '#5d5fef' }}
                  autoFocus
                />
              ) : (
                <h2 className="text-base font-bold text-gray-900 leading-snug">{card.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                    style={{ background: '#5d5fef' }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
              {editing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-sm font-semibold bg-transparent outline-none"
                  style={{ color: PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG].color }}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-sm font-semibold" style={{ color: p.color }}>{p.label}</span>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</label>
              {editing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm font-medium bg-transparent outline-none text-gray-700"
                />
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  {card.dueDate ? new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            {editing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add a description..."
                className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 outline-none focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/10 transition-all resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {card.description || <span className="text-gray-400 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Assignee */}
          {card.assignee && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Assignee</label>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#5d5fef' }}>
                  {card.assignee.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{card.assignee.name}</span>
              </div>
            </div>
          )}

          {/* Labels */}
          {card.labels.length > 0 && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Labels</label>
              <div className="flex gap-1.5 flex-wrap">
                {card.labels.map((label) => (
                  <span
                    key={label.id}
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ background: label.color + '20', color: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Comments ({card.comments.length})
            </label>
            {card.comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet</p>
            ) : (
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {card.comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: '#5d5fef' }}>
                      {c.author.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[11px] font-semibold text-gray-600 mb-0.5">{c.author.name}</p>
                      <p className="text-[13px] text-gray-700">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
