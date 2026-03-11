import { Router } from 'express';
import { updateColumn, deleteColumn, reorderColumns } from '../controllers/column.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { createCard } from '../controllers/card.controller';

const router = Router();

router.use(authMiddleware);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);
router.patch('/reorder', reorderColumns);
router.post('/:columnId/cards', createCard);

export default router;
