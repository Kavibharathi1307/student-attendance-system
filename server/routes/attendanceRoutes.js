import { Router } from 'express';
import {
  listAttendanceHandler,
  getAttendanceHandler,
  createAttendanceHandler,
  updateAttendanceHandler,
  deleteAttendanceHandler
} from '../controllers/attendanceController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateAttendanceCreate, validateAttendanceUpdate } from '../middleware/validateAttendance.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(listAttendanceHandler));
router.get('/:id', asyncHandler(getAttendanceHandler));

router.post('/', authorizeRoles('admin', 'faculty'), validateAttendanceCreate, asyncHandler(createAttendanceHandler));
router.put('/:id', authorizeRoles('admin', 'faculty'), validateAttendanceUpdate, asyncHandler(updateAttendanceHandler));
router.delete('/:id', authorizeRoles('admin', 'faculty'), asyncHandler(deleteAttendanceHandler));

export default router;
