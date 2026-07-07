import { Router } from 'express';
import {
  listAttendanceHandler,
  attendanceHistoryHandler,
  attendanceHistoryCsvHandler,
  getAttendanceHandler,
  createAttendanceHandler,
  updateAttendanceHandler,
  deleteAttendanceHandler
} from '../controllers/attendanceController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateAttendanceCreate, validateAttendanceUpdate } from '../middleware/validateAttendance.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(listAttendanceHandler));
router.get('/history', authenticate, asyncHandler(attendanceHistoryHandler));
router.get('/history/export/csv', authenticate, asyncHandler(attendanceHistoryCsvHandler));
router.get('/:id', authenticate, asyncHandler(getAttendanceHandler));

router.post('/', authenticate, authorizeRoles('admin', 'faculty'), validateAttendanceCreate, asyncHandler(createAttendanceHandler));
router.put('/:id', authenticate, authorizeRoles('admin', 'faculty'), validateAttendanceUpdate, asyncHandler(updateAttendanceHandler));
router.delete('/:id', authenticate, authorizeRoles('admin', 'faculty'), asyncHandler(deleteAttendanceHandler));

export default router;
