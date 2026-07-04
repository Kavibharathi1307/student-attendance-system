import { Router } from 'express';
import {
  generateQrHandler,
  validateQrHandler
} from '../controllers/qrAttendanceController.js';

import {
  authenticate,
  authorizeRoles
} from '../middleware/authMiddleware.js';

import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Every QR API requires login
router.use(authenticate);

// Faculty/Admin generate a QR session
router.post(
  '/generate',
  authorizeRoles('admin', 'faculty'),
  asyncHandler(generateQrHandler)
);

// Students (or logged-in users) validate a scanned QR
router.post(
  '/validate',
  asyncHandler(validateQrHandler)
);

export default router;