import { Router } from 'express';
import { login, profile, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateLogin, validateRegister } from '../middleware/validateAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.get('/profile', authenticate, asyncHandler(profile));

export default router;
