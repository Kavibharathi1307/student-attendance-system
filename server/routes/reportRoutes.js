import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { attendanceReportHandler, exportPdfHandler, exportExcelHandler } from '../controllers/reportController.js';

const router = Router();

router.use(authenticate, authorizeRoles('admin', 'faculty'));

router.get('/attendance', asyncHandler(attendanceReportHandler));
router.get('/export/pdf', asyncHandler(exportPdfHandler));
router.get('/export/excel', asyncHandler(exportExcelHandler));

export default router;
