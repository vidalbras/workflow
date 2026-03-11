import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '../../store/boardStore';
import { boardService } from '../../services/board.service';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard() {
  const { board, moveCard } = useBoardStore();
  const [addingColumn, setAddingColumn] = useState(false);
  const [colTitle, setColTitle] = useState('');

  if (!board) return null;

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    moveCard(draggableId, source.droppableId, destination.droppableId, destination.index);
    try {
      await boardService.moveCard(draggableId, destination.droppableId, destination.index);
    } catch (err) {
      console.error('Failed to move card', err);
    }
  };

  const handleAddColumn = async () => {
    if (!colTitle.trim()) return;
    await boardService.createColumn(board.id, colTitle.trim());
    setColTitle('');
    setAddingColumn(false);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 p-6 min-h-full items-start">
          {board.columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}

          {/* Add column */}
          <div className="w-[280px] shrink-0">
            {addingColumn ? (
              <div className="rounded-2xl p-3 space-y-2" style={{ background: '#f8f9fc', border: '1px solid #e8eaed' }}>
                <input
                  value={colTitle}
                  onChange={(e) => setColTitle(e.target.value)}
                  placeholder="Column name..."
                  autoFocus
                  className="w-full text-sm font-semibold bg-white border border-[#5d5fef] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#5d5fef]/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') { setAddingColumn(false); setColTitle(''); }
                  }}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAddColumn}
                    disabled={!colTitle.trim()}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: '#5d5fef' }}
                  >
                    Add column
                  </button>
                  <button
                    onClick={() => { setAddingColumn(false); setColTitle(''); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingColumn(true)}
                className="w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-400 border-2 border-dashed border-gray-200 hover:border-[#5d5fef] hover:text-[#5d5fef] hover:bg-[#5d5fef]/5 transition-all group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add column
              </button>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
