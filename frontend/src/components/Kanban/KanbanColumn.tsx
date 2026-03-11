import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column } from '../../store/boardStore';
import KanbanCard from './KanbanCard';
import { boardService } from '../../services/board.service';
import { useBoardStore } from '../../store/boardStore';

const COLUMN_COLORS: Record<string, string> = {
  'Todo': '#6b7280',
  'To Do': '#6b7280',
  'In Progress': '#f59e0b',
  'In Review': '#8b5cf6',
  'Done': '#10b981',
  'Blocked': '#ef4444',
};

function getColumnAccent(title: string): string {
  return COLUMN_COLORS[title] || '#5d5fef';
}

export default function KanbanColumn({ column }: { column: Column }) {
  const { addCard, updateColumn, removeColumn } = useBoardStore();
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [colTitle, setColTitle] = useState(column.title);
  const accent = getColumnAccent(column.title);

  const handleAddCard = async () => {
    if (!cardTitle.trim()) return;
    const card = await boardService.createCard(column.id, { title: cardTitle.trim() });
    addCard(card);
    setCardTitle('');
    setAddingCard(false);
  };

  const handleRenameColumn = async () => {
    if (!colTitle.trim() || colTitle === column.title) {
      setColTitle(column.title);
      setEditingTitle(false);
      return;
    }
    const updated = await boardService.updateColumn(column.id, { title: colTitle });
    updateColumn(updated);
    setEditingTitle(false);
  };

  const handleDeleteColumn = async () => {
    if (!confirm(`Delete "${column.title}" and all its cards?`)) return;
    await boardService.deleteColumn(column.id);
    removeColumn(column.id);
  };

  const doneCount = column.cards.filter(c => c.priority === 'LOW').length;

  return (
    <div className="flex flex-col w-[280px] shrink-0 rounded-2xl overflow-hidden"
      style={{ background: '#f8f9fc', border: '1px solid #e8eaed' }}>

      {/* Column header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Accent dot */}
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: accent }} />

            {editingTitle ? (
              <input
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                onBlur={handleRenameColumn}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameColumn(); if (e.key === 'Escape') { setColTitle(column.title); setEditingTitle(false); } }}
                className="flex-1 text-sm font-bold bg-white border border-[#5d5fef] rounded-lg px-2 py-0.5 outline-none"
                autoFocus
              />
            ) : (
              <span
                className="text-[13px] font-bold text-gray-700 truncate cursor-default"
                onDoubleClick={() => setEditingTitle(true)}
              >
                {column.title}
              </span>
            )}

            {/* Count badge */}
            <span className="text-[11px] font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded-md border border-gray-100 shrink-0">
              {column.cards.length}
            </span>
          </div>

          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => setAddingCard(true)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Add card"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleDeleteColumn}
              className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
              title="Delete column"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar (visual only) */}
        {column.cards.length > 0 && (
          <div className="mt-2 h-0.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(doneCount / column.cards.length) * 100}%`, background: accent }}
            />
          </div>
        )}
      </div>

      {/* Cards drop zone */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 px-2 pb-2 space-y-2 min-h-[80px] transition-colors rounded-xl mx-1"
            style={{ background: snapshot.isDraggingOver ? 'rgba(93,95,239,0.04)' : 'transparent' }}
          >
            {column.cards.map((card, index) => (
              <KanbanCard key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}

            {/* Drop hint */}
            {snapshot.isDraggingOver && column.cards.length === 0 && (
              <div className="h-16 border-2 border-dashed border-[#5d5fef]/30 rounded-xl flex items-center justify-center">
                <span className="text-xs text-[#5d5fef]/50 font-medium">Drop here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add card */}
      <div className="px-2 pb-2">
        {addingCard ? (
          <div className="bg-white rounded-xl p-2 space-y-2 shadow-sm border border-gray-100">
            <textarea
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="Card title..."
              rows={2}
              autoFocus
              className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                if (e.key === 'Escape') { setAddingCard(false); setCardTitle(''); }
              }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleAddCard}
                disabled={!cardTitle.trim()}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ background: '#5d5fef' }}
              >
                Add
              </button>
              <button
                onClick={() => { setAddingCard(false); setCardTitle(''); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
