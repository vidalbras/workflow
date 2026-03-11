import { create } from 'zustand';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  columnId: string;
  assigneeId?: string;
  assignee?: { id: string; name: string; email: string };
  labels: Label[];
  comments: Comment[];
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  ownerId: string;
  columns: Column[];
  createdAt: string;
}

interface BoardState {
  board: Board | null;
  setBoard: (board: Board) => void;
  updateBoard: (data: Partial<Board>) => void;
  addColumn: (column: Column) => void;
  updateColumn: (column: Partial<Column> & { id: string }) => void;
  removeColumn: (columnId: string) => void;
  addCard: (card: Card) => void;
  updateCard: (card: Partial<Card> & { id: string }) => void;
  removeCard: (cardId: string, columnId: string) => void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  setBoard: (board) => set({ board }),
  updateBoard: (data) => set((s) => s.board ? { board: { ...s.board, ...data } } : s),
  addColumn: (column) =>
    set((s) => s.board ? { board: { ...s.board, columns: [...s.board.columns, column] } } : s),
  updateColumn: (col) =>
    set((s) =>
      s.board
        ? { board: { ...s.board, columns: s.board.columns.map((c) => (c.id === col.id ? { ...c, ...col } : c)) } }
        : s
    ),
  removeColumn: (columnId) =>
    set((s) =>
      s.board ? { board: { ...s.board, columns: s.board.columns.filter((c) => c.id !== columnId) } } : s
    ),
  addCard: (card) =>
    set((s) => {
      if (!s.board) return s;
      return {
        board: {
          ...s.board,
          columns: s.board.columns.map((col) =>
            col.id === card.columnId ? { ...col, cards: [...col.cards, card] } : col
          ),
        },
      };
    }),
  updateCard: (card) =>
    set((s) => {
      if (!s.board) return s;
      return {
        board: {
          ...s.board,
          columns: s.board.columns.map((col) => ({
            ...col,
            cards: col.cards.map((c) => (c.id === card.id ? { ...c, ...card } : c)),
          })),
        },
      };
    }),
  removeCard: (cardId, columnId) =>
    set((s) => {
      if (!s.board) return s;
      return {
        board: {
          ...s.board,
          columns: s.board.columns.map((col) =>
            col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
          ),
        },
      };
    }),
  moveCard: (cardId, fromColumnId, toColumnId, newOrder) =>
    set((s) => {
      if (!s.board) return s;
      let movedCard: Card | undefined;
      const columns = s.board.columns.map((col) => {
        if (col.id === fromColumnId) {
          movedCard = col.cards.find((c) => c.id === cardId);
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        return col;
      });
      if (!movedCard) return s;
      const updated = { ...movedCard, columnId: toColumnId, order: newOrder };
      const final = columns.map((col) => {
        if (col.id === toColumnId) {
          const cards = [...col.cards];
          cards.splice(newOrder, 0, updated);
          return { ...col, cards: cards.map((c, i) => ({ ...c, order: i })) };
        }
        return col;
      });
      return { board: { ...s.board, columns: final } };
    }),
}));
