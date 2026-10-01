import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/user.controller.js';
import { verifyAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyAuth, requireRole('admin'));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);

export default router;
