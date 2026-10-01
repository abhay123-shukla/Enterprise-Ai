import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';
import { verifyAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyAuth);
router.get('/', requireRole('agent', 'admin'), getAnalytics);

export default router;
