import { Router } from 'express';
import {
  listFacultyHandler,
  getFacultyHandler,
  createFacultyHandler,
  updateFacultyHandler,
  deleteFacultyHandler
} from '../controllers/facultyController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateFacultyCreate, validateFacultyUpdate } from '../middleware/validateFaculty.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(listFacultyHandler));
router.get('/:id', asyncHandler(getFacultyHandler));

router.post('/', authorizeRoles('admin'), validateFacultyCreate, asyncHandler(createFacultyHandler));
router.put('/:id', authorizeRoles('admin'), validateFacultyUpdate, asyncHandler(updateFacultyHandler));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(deleteFacultyHandler));

export default router;
