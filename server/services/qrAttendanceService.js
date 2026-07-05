import crypto from 'node:crypto';
import {
  createQrSession,
  getQrSessionByToken,
  getQrSessionById,
  getAllQrSessions,
  getActiveSessions,
  deactivateQrSession,
  deactivateQrSessionById
} from '../models/qrAttendanceModel.js';
import { createAttendance } from './attendanceService.js';
import { getStudentByUserId } from '../models/studentModel.js';
import { httpError } from '../utils/httpError.js';

export function generateQrSession({ facultyId, subject, attendanceDate, expiryMinutes = 2 }) {
  const token = crypto.randomUUID();

  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

  const result = createQrSession({
    token,
    facultyId,
    subject,
    attendanceDate,
    expiresAt
  });

  return {
    id: result.lastInsertRowid,
    token,
    expiresAt
  };
}

export function validateQrSession(token) {
  const session = getQrSessionByToken(token);

  if (!session) {
    throw httpError(404, 'QR session not found.');
  }

  if (new Date(session.expiresAt) < new Date()) {
    deactivateQrSession(token);
    throw httpError(400, 'QR session has expired. Please ask your faculty to generate a new QR code.');
  }

  if (!session.isActive) {
    throw httpError(400, 'QR session is inactive.');
  }

  return session;
}

export function listQrSessions({ page, perPage } = {}) {
  return getAllQrSessions({ page, perPage });
}

export function listActiveQrSessions() {
  return getActiveSessions();
}

export function markAttendanceFromQr({ token, userId }) {
  const session = validateQrSession(token);

  const student = getStudentByUserId(userId);

  if (!student) {
    throw httpError(404, 'Student profile not found. Please contact the admin.');
  }

  const attendance = createAttendance({
    studentId: student.id,
    facultyId: session.facultyId,
    subject: session.subject,
    attendanceDate: session.attendanceDate,
    status: 'Present',
    remarks: 'Marked via QR scan'
  });

  return {
    attendanceId: attendance.id,
    studentName: student.fullName,
    subject: session.subject,
    attendanceDate: session.attendanceDate,
    status: 'Present'
  };
}

export function deactivateExpiredSessions() {
  const active = getActiveSessions();
  const now = new Date();

  for (const session of active) {
    if (new Date(session.expiresAt) < now) {
      deactivateQrSessionById(session.id);
    }
  }
}

export function getQrSessionDetail(id) {
  const session = getQrSessionById(id);

  if (!session) {
    throw httpError(404, 'QR session not found.');
  }

  return session;
}