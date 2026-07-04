import crypto from 'node:crypto';
import {
  createQrSession,
  getQrSessionByToken,
  deactivateQrSession
} from '../models/qrAttendanceModel.js';
import { httpError } from '../utils/httpError.js';

export function generateQrSession({ facultyId, subject, attendanceDate }) {
  const token = crypto.randomUUID();

  const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

  createQrSession({
    token,
    facultyId,
    subject,
    attendanceDate,
    expiresAt
  });

  return {
    token,
    expiresAt
  };
}

export function validateQrSession(token) {
  const session = getQrSessionByToken(token);

  if (!session) {
    throw httpError(404, 'QR session not found.');
  }

  if (!session.isActive) {
    throw httpError(400, 'QR session is inactive.');
  }

  if (new Date(session.expiresAt) < new Date()) {
    deactivateQrSession(token);
    throw httpError(400, 'QR code has expired.');
  }

  return session;
}