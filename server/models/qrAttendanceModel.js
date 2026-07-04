import { db } from '../config/database.js';

export function createQrSession({
  token,
  facultyId,
  subject,
  attendanceDate,
  expiresAt
}) {
  return db.prepare(`
    INSERT INTO qr_sessions
    (token, facultyId, subject, attendanceDate, expiresAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    token,
    facultyId,
    subject,
    attendanceDate,
    expiresAt
  );
}

export function getQrSessionByToken(token) {
  return db.prepare(`
    SELECT *
    FROM qr_sessions
    WHERE token = ?
  `).get(token);
}

export function deactivateQrSession(token) {
  return db.prepare(`
    UPDATE qr_sessions
    SET isActive = 0
    WHERE token = ?
  `).run(token);
}