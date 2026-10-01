import { Router } from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/knowledge.controller.js';
import { verifyAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { articleSchema } from '../validators/knowledge.validator.js';

const router = Router();

// Publicly readable for authenticated users (or even public internally)
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Protected mutation routes
router.post('/', verifyAuth, requireRole('agent', 'admin'), validate(articleSchema), createArticle);
router.patch('/:id', verifyAuth, requireRole('agent', 'admin'), updateArticle);
router.delete('/:id', verifyAuth, requireRole('agent', 'admin'), deleteArticle);

export default router;
