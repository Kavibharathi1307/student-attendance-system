import { Router } from 'express';
import { dashboardHandler } from '../controllers/analyticsController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('admin','faculty'), asyncHandler(dashboardHandler));

export default router;
