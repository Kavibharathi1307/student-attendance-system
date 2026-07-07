import { Router } from 'express';
import {
  generateQrHandler,
  validateQrHandler,
  markAttendanceHandler,
  listQrSessionsHandler,
  listActiveQrSessionsHandler,
  getQrSessionDetailHandler
} from '../controllers/qrAttendanceController.js';

import {
  authenticate,
  authorizeRoles
} from '../middleware/authMiddleware.js';

import { validateGenerateQr } from '../middleware/validateQrAttendance.js';

import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Faculty/Admin generate a QR session
router.post(
  '/generate',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  validateGenerateQr,
  asyncHandler(generateQrHandler)
);

// Students (or logged-in users) validate a scanned QR
router.post(
  '/validate',
  authenticate,
  asyncHandler(validateQrHandler)
);

// Student marks attendance via QR scan
router.post(
  '/mark-attendance',
  authenticate,
  authorizeRoles('student'),
  asyncHandler(markAttendanceHandler)
);

// Admin/Faculty list all QR sessions
router.get(
  '/sessions',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  asyncHandler(listQrSessionsHandler)
);

// Admin/Faculty list active QR sessions
router.get(
  '/sessions/active',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  asyncHandler(listActiveQrSessionsHandler)
);

// Admin/Faculty get session details
router.get(
  '/sessions/:id',
  authenticate,
  authorizeRoles('admin', 'faculty'),
  asyncHandler(getQrSessionDetailHandler)
);

export default router;