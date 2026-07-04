import { Router } from 'express';
import { getStudents } from '../models/studentModel.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler((req, res) => {
  const { q, page } = req.query;
  const result = getStudents({ q, page: Number(page) || 1, perPage: 20 });
  res.json(result);
}));

export default router;
