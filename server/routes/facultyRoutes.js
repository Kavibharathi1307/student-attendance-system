import { Router } from 'express';
import {
  listFacultyHandler,
  getFacultyHandler,
  facultyDashboardHandler,
  createFacultyHandler,
  updateFacultyHandler,
  deleteFacultyHandler
} from '../controllers/facultyController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateFacultyCreate, validateFacultyUpdate } from '../middleware/validateFaculty.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/dashboard', authenticate, authorizeRoles('admin', 'faculty'), asyncHandler(facultyDashboardHandler));
router.get('/', authenticate, asyncHandler(listFacultyHandler));
router.get('/:id', authenticate, asyncHandler(getFacultyHandler));

router.post('/', authenticate, authorizeRoles('admin'), validateFacultyCreate, asyncHandler(createFacultyHandler));
router.put('/:id', authenticate, authorizeRoles('admin'), validateFacultyUpdate, asyncHandler(updateFacultyHandler));
router.delete('/:id', authenticate, authorizeRoles('admin'), asyncHandler(deleteFacultyHandler));

export default router;
