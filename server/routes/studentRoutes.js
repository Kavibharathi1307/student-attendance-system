import { Router } from 'express';
import {
  listStudentsHandler,
  getStudentHandler,
  studentDashboardHandler,
  createStudentHandler,
  updateStudentHandler,
  deleteStudentHandler
} from '../controllers/studentController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateStudentCreate, validateStudentUpdate } from '../middleware/validateStudent.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/dashboard', authenticate, asyncHandler(studentDashboardHandler));
router.get('/', authenticate, asyncHandler(listStudentsHandler));
router.get('/:id', authenticate, asyncHandler(getStudentHandler));

router.post('/', authenticate, authorizeRoles('admin'), validateStudentCreate, asyncHandler(createStudentHandler));
router.put('/:id', authenticate, authorizeRoles('admin'), validateStudentUpdate, asyncHandler(updateStudentHandler));
router.delete('/:id', authenticate, authorizeRoles('admin'), asyncHandler(deleteStudentHandler));

export default router;
