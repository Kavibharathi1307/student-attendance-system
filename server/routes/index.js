import { Router } from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import studentRoutes from './studentRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/students', studentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);

export default router;
