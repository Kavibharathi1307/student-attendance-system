import {
  generateQrSession,
  validateQrSession
} from '../services/qrAttendanceService.js';

export function generateQrHandler(req, res) {
  const { facultyId, subject, attendanceDate } = req.body;

  const session = generateQrSession({
    facultyId,
    subject,
    attendanceDate
  });

  res.status(201).json({
    message: 'QR session created successfully.',
    ...session
  });
}

export function validateQrHandler(req, res) {
  const { token } = req.body;

  const session = validateQrSession(token);

  res.json({
    message: 'QR code is valid.',
    session
  });
}