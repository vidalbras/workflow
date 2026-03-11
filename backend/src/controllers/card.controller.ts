import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

const prisma = new PrismaClient();

const cardInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  labels: true,
  comments: {
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.body;
    const columnId = req.params.columnId;
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    if (!column || column.board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }
    const count = await prisma.card.count({ where: { columnId } });
    const card = await prisma.card.create({
      data: { title, description, priority, dueDate: dueDate ? new Date(dueDate) : undefined, assigneeId, columnId, order: count },
      include: cardInclude,
    });
    io.to(column.boardId).emit('card:created', { card });
    res.status(201).json(card);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id },
      include: { ...cardInclude, column: { include: { board: true } } },
    });
    if (!card || (card.column as any).board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    res.json(card);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.card.findUnique({
      where: { id: req.params.id },
      include: { column: { include: { board: true } } },
    });
    if (!existing || (existing.column as any).board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    const data: any = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data,
      include: cardInclude,
    });
    io.to((existing.column as any).board.id).emit('card:updated', { card });
    res.json(card);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id },
      include: { column: { include: { board: true } } },
    });
    if (!card || (card.column as any).board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    const boardId = (card.column as any).board.id;
    await prisma.card.delete({ where: { id: req.params.id } });
    io.to(boardId).emit('card:deleted', { cardId: req.params.id, columnId: card.columnId });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const moveCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { columnId: newColumnId, order: newOrder } = req.body;
    const cardId = req.params.id;
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });
    if (!card || (card.column as any).board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    const boardId = (card.column as any).board.id;
    const fromColumnId = card.columnId;

    // Reorder cards in destination column
    await prisma.card.updateMany({
      where: { columnId: newColumnId, order: { gte: newOrder }, id: { not: cardId } },
      data: { order: { increment: 1 } },
    });

    const updated = await prisma.card.update({
      where: { id: cardId },
      data: { columnId: newColumnId, order: newOrder },
      include: cardInclude,
    });

    io.to(boardId).emit('card:moved', {
      cardId,
      fromColumnId,
      toColumnId: newColumnId,
      order: newOrder,
      card: updated,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
