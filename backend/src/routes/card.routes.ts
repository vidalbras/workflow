import { Router } from 'express';
import { getCard, updateCard, deleteCard, moveCard } from '../controllers/card.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/:id', getCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);
router.patch('/:id/move', moveCard);

export default router;
