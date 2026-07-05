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

export function getQrSessionById(id) {
  return db.prepare(`
    SELECT *
    FROM qr_sessions
    WHERE id = ?
  `).get(id);
}

export function getAllQrSessions({ page = 1, perPage = 20 } = {}) {
  const offset = (page - 1) * perPage;
  const data = db.prepare(`
    SELECT qs.*, f.fullName AS facultyName
    FROM qr_sessions qs
    LEFT JOIN faculty f ON f.id = qs.facultyId
    ORDER BY qs.createdAt DESC
    LIMIT ? OFFSET ?
  `).all(perPage, offset);

  const row = db.prepare('SELECT COUNT(*) AS count FROM qr_sessions').get();
  return { total: row.count, perPage, page, data };
}

export function getActiveSessions() {
  return db.prepare(`
    SELECT qs.*, f.fullName AS facultyName
    FROM qr_sessions qs
    LEFT JOIN faculty f ON f.id = qs.facultyId
    WHERE qs.isActive = 1 AND qs.expiresAt > datetime('now')
    ORDER BY qs.createdAt DESC
  `).all();
}

export function deactivateQrSession(token) {
  return db.prepare(`
    UPDATE qr_sessions
    SET isActive = 0
    WHERE token = ?
  `).run(token);
}

export function deactivateQrSessionById(id) {
  return db.prepare(`
    UPDATE qr_sessions
    SET isActive = 0
    WHERE id = ?
  `).run(id);
}