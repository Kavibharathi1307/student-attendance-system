import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminDashboardHandler } from '../controllers/adminDashboardController.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorizeRoles('admin'),
  asyncHandler(adminDashboardHandler)
);

export default router;
