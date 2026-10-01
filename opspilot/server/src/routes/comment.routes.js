import { Router } from 'express';
import { getComments, addComment } from '../controllers/comment.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyAuth);

router.get('/:requestId', getComments);
router.post('/:requestId', addComment);

export default router;
