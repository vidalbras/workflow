import { Router } from 'express';
import { getBoards, createBoard, getBoardById, updateBoard, deleteBoard } from '../controllers/board.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { createColumn } from '../controllers/column.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoardById);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);
router.post('/:boardId/columns', createColumn);

export default router;
