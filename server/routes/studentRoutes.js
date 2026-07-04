import { Router } from 'express';
import {
  listStudentsHandler,
  getStudentHandler,
  createStudentHandler,
  updateStudentHandler,
  deleteStudentHandler
} from '../controllers/studentController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateStudentCreate, validateStudentUpdate } from '../middleware/validateStudent.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(listStudentsHandler));
router.get('/:id', asyncHandler(getStudentHandler));

router.post('/', authorizeRoles('admin'), validateStudentCreate, asyncHandler(createStudentHandler));
router.put('/:id', authorizeRoles('admin'), validateStudentUpdate, asyncHandler(updateStudentHandler));
router.delete('/:id', authorizeRoles('admin'), asyncHandler(deleteStudentHandler));

export default router;
