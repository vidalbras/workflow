import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card } from '../../store/boardStore';
import { boardService } from '../../services/board.service';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';

interface CardDetailModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

const priorityConfig = {
  LOW: { label: 'Low', color: '#22c55e' },
  MEDIUM: { label: 'Medium', color: '#f59e0b' },
  HIGH: { label: 'High', color: '#ef4444' },
  URGENT: { label: 'Urgent', color: '#8b5cf6' },
};

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export default function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  const { updateCard, removeCard } = useBoardStore();
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : '');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    // For now just optimistically show - in a real app we'd have a comment endpoint
    setComment('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-lg font-semibold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent pb-1"
              autoFocus
            />
          ) : (
            <h2 className="flex-1 text-lg font-semibold text-gray-900">{card.title}</h2>
          )}
          <div className="flex items-center gap-2 shrink-0">
            {!editing && (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
            )}
            {editing && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
              </>
            )}
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            {editing ? (
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{priorityConfig[p].label}</option>
                ))}
              </select>
            ) : (
              <Badge label={priorityConfig[card.priority].label} color={priorityConfig[card.priority].color} />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
            {editing ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <span className="text-sm text-gray-600">
                {card.dueDate ? new Date(card.dueDate).toLocaleDateString() : '—'}
              </span>
            )}
          </div>
          {card.assignee && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <span className="text-sm text-gray-600">{card.assignee.name}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {card.description || <span className="text-gray-400 italic">No description</span>}
            </p>
          )}
        </div>

        {card.labels.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Labels</label>
            <div className="flex gap-1 flex-wrap">
              {card.labels.map((label) => (
                <Badge key={label.id} label={label.name} color={label.color} />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Comments ({card.comments.length})
          </label>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
            {card.comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-700 text-xs font-bold">{c.author.name[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-gray-700">{c.author.name}</p>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
            />
            <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>Post</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
