import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column } from '../../store/boardStore';
import KanbanCard from './KanbanCard';
import { boardService } from '../../services/board.service';
import { useBoardStore } from '../../store/boardStore';

interface KanbanColumnProps {
  column: Column;
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const { addCard, updateColumn, removeColumn } = useBoardStore();
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [colTitle, setColTitle] = useState(column.title);

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
    if (!confirm(`Delete column "${column.title}" and all its cards?`)) return;
    await boardService.deleteColumn(column.id);
    removeColumn(column.id);
  };

  return (
    <div className="flex flex-col w-72 shrink-0 bg-gray-100 rounded-xl">
      <div className="flex items-center justify-between px-3 py-2.5">
        {editingTitle ? (
          <input
            value={colTitle}
            onChange={(e) => setColTitle(e.target.value)}
            onBlur={handleRenameColumn}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameColumn()}
            className="flex-1 text-sm font-semibold bg-white border border-indigo-400 rounded px-2 py-1 focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-semibold text-gray-700 hover:text-gray-900 px-1"
            onDoubleClick={() => setEditingTitle(true)}
          >
            {column.title}
            <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
              {column.cards.length}
            </span>
          </button>
        )}
        <button
          onClick={handleDeleteColumn}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-1"
          title="Delete column"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2 pb-2 space-y-2 min-h-[100px] transition-colors rounded-lg ${
              snapshot.isDraggingOver ? 'bg-indigo-50' : ''
            }`}
          >
            {column.cards.map((card, index) => (
              <KanbanCard key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-2">
        {addingCard ? (
          <div className="space-y-2">
            <textarea
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="Card title..."
              rows={2}
              autoFocus
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                if (e.key === 'Escape') { setAddingCard(false); setCardTitle(''); }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                disabled={!cardTitle.trim()}
                className="flex-1 text-sm bg-indigo-600 text-white rounded-lg py-1.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={() => { setAddingCard(false); setCardTitle(''); }}
                className="px-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
