import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from '../../store/boardStore';
import Badge from '../ui/Badge';
import CardDetailModal from './CardDetailModal';

interface KanbanCardProps {
  card: Card;
  index: number;
}

const priorityConfig = {
  LOW: { label: 'Low', color: '#22c55e' },
  MEDIUM: { label: 'Medium', color: '#f59e0b' },
  HIGH: { label: 'High', color: '#ef4444' },
  URGENT: { label: 'Urgent', color: '#8b5cf6' },
};

export default function KanbanCard({ card, index }: KanbanCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const priority = priorityConfig[card.priority];

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setDetailOpen(true)}
            className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-400 rotate-1' : ''
            }`}
          >
            {card.labels.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {card.labels.map((label) => (
                  <Badge key={label.id} label={label.name} color={label.color} />
                ))}
              </div>
            )}
            <p className="text-sm font-medium text-gray-900 leading-snug">{card.title}</p>
            {card.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
            )}
            <div className="flex items-center justify-between mt-2 gap-2">
              <Badge label={priority.label} color={priority.color} />
              <div className="flex items-center gap-2">
                {card.dueDate && (
                  <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {new Date(card.dueDate).toLocaleDateString()}
                  </span>
                )}
                {card.comments.length > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {card.comments.length}
                  </span>
                )}
                {card.assignee && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {card.assignee.name[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <CardDetailModal card={card} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  );
}
