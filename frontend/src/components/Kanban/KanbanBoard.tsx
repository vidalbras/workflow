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

    // Optimistic update
    moveCard(draggableId, source.droppableId, destination.droppableId, destination.index);

    try {
      await boardService.moveCard(draggableId, destination.droppableId, destination.index);
    } catch (err) {
      // Revert on error - refetch board
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
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin min-h-full">
        {board.columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}

        <div className="w-72 shrink-0">
          {addingColumn ? (
            <div className="bg-gray-100 rounded-xl p-3 space-y-2">
              <input
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                placeholder="Column name..."
                autoFocus
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') { setAddingColumn(false); setColTitle(''); }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumn}
                  disabled={!colTitle.trim()}
                  className="flex-1 text-sm bg-indigo-600 text-white rounded-lg py-1.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Add Column
                </button>
                <button
                  onClick={() => { setAddingColumn(false); setColTitle(''); }}
                  className="px-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add column
            </button>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
