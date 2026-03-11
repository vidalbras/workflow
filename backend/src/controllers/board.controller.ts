import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

const prisma = new PrismaClient();

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boards = await prisma.board.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(boards);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, color } = req.body;
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    const board = await prisma.board.create({
      data: { title, description, color: color || '#6366f1', ownerId: req.userId! },
    });
    res.status(201).json(board);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBoardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.id, ownerId: req.userId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' },
              include: {
                assignee: { select: { id: true, name: true, email: true } },
                labels: true,
                comments: {
                  include: { author: { select: { id: true, name: true } } },
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    res.json(board);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await prisma.board.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    const updated = await prisma.board.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await prisma.board.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    await prisma.board.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
