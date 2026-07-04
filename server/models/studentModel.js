import { db } from '../config/database.js';

const studentFields = `
  s.id,
  s.userId,
  s.fullName,
  s.email,
  s.studentId,
  s.department,
  s.phone,
  s.address,
  s.status,
  s.createdAt
`;

export function getStudents({ q, department, status, page = 1, perPage = 10 }) {
  const offset = (page - 1) * perPage;
  let where = 'WHERE 1=1';
  const params = { offset, perPage };

  if (q) {
    where += ' AND (s.fullName LIKE @q OR s.email LIKE @q)';
    params.q = `%${q}%`;
  }

  if (department) {
    where += ' AND s.department = @department';
    params.department = department;
  }

  if (status) {
    where += ' AND s.status = @status';
    params.status = status;
  }

  const stmt = db.prepare(`SELECT ${studentFields} FROM students s ${where} ORDER BY s.fullName LIMIT @perPage OFFSET @offset`);
  const data = stmt.all(params);

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM students s ${where}`);
  const total = countStmt.get(params).count;

  return { total, perPage, page, data };
}

export function getStudentById(id) {
  return db.prepare(`SELECT ${studentFields} FROM students s WHERE s.id = ?`).get(id);
}

export function getStudentByUserId(userId) {
  return db.prepare(`SELECT ${studentFields} FROM students s WHERE s.userId = ?`).get(userId);
}

export function createStudentRecord({ userId, fullName, email, studentId, department, phone, address, status }) {
  return db
    .prepare(
      `INSERT INTO students (userId, fullName, email, studentId, department, phone, address, status)
       VALUES (@userId, @fullName, @email, @studentId, @department, @phone, @address, @status)`
    )
    .run({ userId, fullName, email, studentId: studentId || null, department: department || null, phone: phone || null, address: address || null, status: status || 'Active' });
}

export function updateStudentRecord(id, { fullName, email, studentId, department, phone, address, status }) {
  db.prepare(
    `UPDATE students
     SET fullName = @fullName, email = @email, studentId = @studentId, department = @department, phone = @phone, address = @address, status = @status
     WHERE id = @id`
  ).run({ id, fullName, email, studentId: studentId || null, department: department || null, phone: phone || null, address: address || null, status: status || 'Active' });
}

export function updateStudentByUserId(userId, { fullName, email, studentId, department, phone, address, status }) {
  db.prepare(
    `UPDATE students
     SET fullName = @fullName, email = @email, studentId = @studentId, department = @department, phone = @phone, address = @address, status = @status
     WHERE userId = @userId`
  ).run({ userId, fullName, email, studentId: studentId || null, department: department || null, phone: phone || null, address: address || null, status: status || 'Active' });
}

export function deleteStudentById(id) {
  return db.prepare('DELETE FROM students WHERE id = ?').run(id);
}
