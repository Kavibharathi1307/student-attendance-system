import {
  generateQrSession,
  validateQrSession,
  listQrSessions,
  listActiveQrSessions,
  markAttendanceFromQr,
  getQrSessionDetail
} from '../services/qrAttendanceService.js';
import { getFacultyByUserId } from '../models/facultyModel.js';
import { httpError } from '../utils/httpError.js';

export function generateQrHandler(req, res) {
  const { facultyId: bodyFacultyId, subject, attendanceDate, expiryMinutes } = req.body;

  let facultyId;

  if (req.user.role === 'admin' && bodyFacultyId) {
    facultyId = bodyFacultyId;
  } else {
    const faculty = getFacultyByUserId(req.user.id);
    if (!faculty) throw httpError(404, 'Faculty profile not found.');
    facultyId = faculty.id;
  }

  const session = generateQrSession({
    facultyId,
    subject,
    attendanceDate,
    expiryMinutes
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

export function markAttendanceHandler(req, res) {
  const { token } = req.body;

  const result = markAttendanceFromQr({ token, userId: req.user.id });

  res.status(201).json({
    message: 'Attendance marked successfully.',
    ...result
  });
}

export function listQrSessionsHandler(req, res) {
  const { page, perPage } = req.query;
  const result = listQrSessions({ page: Number(page) || 1, perPage: Number(perPage) || 20 });
  res.json(result);
}

export function listActiveQrSessionsHandler(req, res) {
  const sessions = listActiveQrSessions();
  res.json({ data: sessions });
}

export function getQrSessionDetailHandler(req, res) {
  const session = getQrSessionDetail(Number(req.params.id));
  res.json(session);
}