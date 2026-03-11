import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from '../../store/boardStore';
import CardDetailModal from './CardDetailModal';

interface KanbanCardProps {
  card: Card;
  index: number;
}

const PRIORITY = {
  LOW:    { label: 'Low',    color: '#10b981', bg: '#f0fdf4', dot: '#10b981' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  HIGH:   { label: 'High',   color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
  URGENT: { label: 'Urgent', color: '#8b5cf6', bg: '#faf5ff', dot: '#8b5cf6' },
};

export default function KanbanCard({ card, index }: KanbanCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const p = PRIORITY[card.priority];
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
            className="group relative bg-white rounded-xl cursor-pointer transition-all duration-150"
            style={{
              boxShadow: snapshot.isDragging
                ? '0 16px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)'
                : '0 1px 2px rgba(0,0,0,0.06)',
              transform: snapshot.isDragging ? 'rotate(2deg) scale(1.02)' : undefined,
              borderLeft: `3px solid ${p.color}`,
            }}
          >
            <div className="p-3">
              {/* Labels */}
              {card.labels.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {card.labels.map((label) => (
                    <span
                      key={label.id}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: label.color + '20', color: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <p className="text-[13px] font-semibold text-gray-800 leading-snug group-hover:text-[#5d5fef] transition-colors">
                {card.title}
              </p>

              {/* Description */}
              {card.description && (
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
                {/* Priority */}
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                  style={{ background: p.bg, color: p.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.dot }} />
                  {p.label}
                </div>

                <div className="flex items-center gap-2">
                  {/* Due date */}
                  {card.dueDate && (
                    <div
                      className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                      style={{
                        color: isOverdue ? '#ef4444' : '#9ca3af',
                        background: isOverdue ? '#fef2f2' : 'transparent',
                      }}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}

                  {/* Comments */}
                  {card.comments.length > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {card.comments.length}
                    </div>
                  )}

                  {/* Assignee */}
                  {card.assignee && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: '#5d5fef' }}
                      title={card.assignee.name}
                    >
                      {card.assignee.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <CardDetailModal card={card} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  );
}
