import { db } from '../config/database.js';

const facultyFields = `
  f.id,
  f.userId,
  f.fullName,
  f.email,
  f.department,
  f.createdAt
`;

export function countFaculty({ q, department }) {
  let where = 'WHERE 1=1';
  const params = {};

  if (q) {
    where += ' AND (f.fullName LIKE @q OR f.email LIKE @q)';
    params.q = `%${q}%`;
  }

  if (department) {
    where += ' AND f.department = @department';
    params.department = department;
  }

  const stmt = db.prepare(`SELECT COUNT(*) as count FROM faculty f ${where}`);
  const row = stmt.get(params);
  return row?.count || 0;
}

export function getFaculty({ q, department, page = 1, perPage = 10 }) {
  const offset = (page - 1) * perPage;
  let where = 'WHERE 1=1';
  const params = { offset, perPage };

  if (q) {
    where += ' AND (f.fullName LIKE @q OR f.email LIKE @q OR f.department LIKE @q)';
    params.q = `%${q}%`;
  }

  if (department) {
    where += ' AND f.department = @department';
    params.department = department;
  }

  const stmt = db.prepare(
    `SELECT ${facultyFields} FROM faculty f ${where} ORDER BY f.fullName LIMIT @perPage OFFSET @offset`
  );

  return stmt.all(params);
}

export function getFacultyById(id) {
  return db.prepare(`SELECT ${facultyFields} FROM faculty f WHERE f.id = ?`).get(id);
}

export function getFacultyByUserId(userId) {
  return db.prepare(`SELECT ${facultyFields} FROM faculty f WHERE f.userId = ?`).get(userId);
}

export function updateFacultyRecord(facultyId, { fullName, email, department }) {
  db.prepare(
    `
      UPDATE faculty
      SET fullName = @fullName, email = @email, department = @department
      WHERE id = @facultyId
    `
  ).run({ facultyId, fullName, email, department });
}

export function createFacultyRecord({ userId, fullName, email, department }) {
  return db
    .prepare(
      `INSERT INTO faculty (userId, fullName, email, department) VALUES (@userId, @fullName, @email, @department)`
    )
    .run({ userId, fullName, email, department });

}

export function deleteFacultyById(id) {
  return db.prepare('DELETE FROM faculty WHERE id = ?').run(id);
}
