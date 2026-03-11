import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

const prisma = new PrismaClient();

export const createColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const boardId = req.params.boardId;
    const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: req.userId } });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    const count = await prisma.column.count({ where: { boardId } });
    const column = await prisma.column.create({
      data: { title, order: count, boardId },
    });
    io.to(boardId).emit('column:created', { column });
    res.status(201).json(column);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const column = await prisma.column.findUnique({
      where: { id: req.params.id },
      include: { board: true },
    });
    if (!column || column.board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }
    const updated = await prisma.column.update({
      where: { id: req.params.id },
      data: req.body,
    });
    io.to(column.boardId).emit('column:updated', { column: updated });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteColumn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const column = await prisma.column.findUnique({
      where: { id: req.params.id },
      include: { board: true },
    });
    if (!column || column.board.ownerId !== req.userId) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }
    await prisma.column.delete({ where: { id: req.params.id } });
    io.to(column.boardId).emit('column:deleted', { columnId: req.params.id });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const reorderColumns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, columns } = req.body as { boardId: string; columns: { id: string; order: number }[] };
    const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: req.userId } });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    await Promise.all(
      columns.map(({ id, order }) => prisma.column.update({ where: { id }, data: { order } }))
    );
    io.to(boardId).emit('columns:reordered', { columns });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
