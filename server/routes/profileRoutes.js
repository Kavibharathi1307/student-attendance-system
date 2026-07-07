import { Router } from 'express';
import { getProfileHandler, updateProfileHandler, changePasswordHandler } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(getProfileHandler));
router.put('/', asyncHandler(updateProfileHandler));
router.put('/change-password', asyncHandler(changePasswordHandler));

export default router;
