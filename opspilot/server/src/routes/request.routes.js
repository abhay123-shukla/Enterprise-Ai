import { Router } from 'express';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequest,
  assignRequest,
  generateDraftReply,
  summarizeThread
} from '../controllers/request.controller.js';
import { verifyAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createRequestSchema, updateRequestSchema } from '../validators/request.validator.js';

const router = Router();

router.use(verifyAuth);

router.post('/', validate(createRequestSchema), createRequest);
router.get('/my', getMyRequests);
router.get('/', requireRole('agent', 'admin'), getAllRequests);
router.get('/:id', getRequestById);
router.patch('/:id', validate(updateRequestSchema), updateRequest);
router.post('/:id/assign', requireRole('agent', 'admin'), assignRequest);
router.post('/:id/draft-reply', requireRole('agent', 'admin'), generateDraftReply);
router.post('/:id/summarize', requireRole('agent', 'admin'), summarizeThread);

export default router;
