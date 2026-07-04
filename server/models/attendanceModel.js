import { db } from '../config/database.js';

const attendanceFields = `
  a.id,
  a.studentId,
  a.facultyId,
  a.subject,
  a.attendanceDate,
  a.status,
  a.remarks,
  a.createdAt,
  s.fullName as studentName,
  f.fullName as facultyName,
  f.department as facultyDepartment
`;

const attendanceJoin = 'FROM attendance a JOIN students s ON s.id = a.studentId JOIN faculty f ON f.id = a.facultyId';

function buildAttendanceFilterQuery({ q, student, department, facultyId, subject, date, dateFrom, dateTo, status }) {
  let where = 'WHERE 1=1';
  const params = {};

  if (q) {
    params.q = `%${q}%`;
    const num = Number(q);
    if (!isNaN(num)) {
      where += ' AND (s.fullName LIKE @q OR a.studentId = @studentId)';
      params.studentId = num;
    } else {
      params.studentId = -1;
      where += ' AND (s.fullName LIKE @q OR a.studentId = @studentId)';
    }
  }

  if (student) {
    params.student = `%${student}%`;
    const num = Number(student);
    if (!isNaN(num)) {
      where += ' AND (s.fullName LIKE @student OR a.studentId = @studentIdFilter)';
      params.studentIdFilter = num;
    } else {
      where += ' AND s.fullName LIKE @student';
    }
  }

  if (department) {
    where += ' AND f.department = @department';
    params.department = department;
  }

  if (facultyId) {
    where += ' AND a.facultyId = @facultyId';
    params.facultyId = facultyId;
  }

  if (subject) {
    where += ' AND a.subject LIKE @subject';
    params.subject = `%${subject}%`;
  }

  if (date) {
    where += ' AND a.attendanceDate = @date';
    params.date = date;
  }

  if (dateFrom) {
    where += ' AND a.attendanceDate >= @dateFrom';
    params.dateFrom = dateFrom;
  }

  if (dateTo) {
    where += ' AND a.attendanceDate <= @dateTo';
    params.dateTo = dateTo;
  }

  if (status) {
    where += ' AND a.status = @status';
    params.status = status;
  }

  return { where, params };
}

export function countAttendance(filters) {
  const { where, params } = buildAttendanceFilterQuery(filters);
  const stmt = db.prepare(`SELECT COUNT(*) as count ${attendanceJoin} ${where}`);
  const row = stmt.get(params);
  return row?.count || 0;
}

export function getAttendance({ q, department, facultyId, subject, date, dateFrom, dateTo, status, page = 1, perPage = 10 }) {
  const offset = (page - 1) * perPage;
  const { where, params } = buildAttendanceFilterQuery({ q, department, facultyId, subject, date, dateFrom, dateTo, status });
  const stmt = db.prepare(`SELECT ${attendanceFields} ${attendanceJoin} ${where} ORDER BY a.attendanceDate DESC LIMIT @perPage OFFSET @offset`);
  return stmt.all({ ...params, offset, perPage });
}

export function getAttendanceReport(filters) {
  const { where, params } = buildAttendanceFilterQuery(filters);
  const stmt = db.prepare(`SELECT ${attendanceFields} ${attendanceJoin} ${where} ORDER BY a.attendanceDate DESC`);
  return stmt.all(params);
}

export function getAttendanceById(id) {
  return db.prepare(`SELECT ${attendanceFields} ${attendanceJoin} WHERE a.id = ?`).get(id);
}

export function findDuplicateAttendance({ studentId, subject, attendanceDate }) {
  return db
    .prepare('SELECT id FROM attendance WHERE studentId = ? AND subject = ? AND attendanceDate = ?')
    .get(studentId, subject, attendanceDate);
}

export function createAttendanceRecord({ studentId, facultyId, subject, attendanceDate, status, remarks }) {
  return db
    .prepare('INSERT INTO attendance (studentId, facultyId, subject, attendanceDate, status, remarks) VALUES (@studentId, @facultyId, @subject, @attendanceDate, @status, @remarks)')
    .run({ studentId, facultyId, subject, attendanceDate, status, remarks });
}

export function updateAttendanceRecord(id, { studentId, facultyId, subject, attendanceDate, status, remarks }) {
  db.prepare(
    `UPDATE attendance SET studentId = @studentId, facultyId = @facultyId, subject = @subject, attendanceDate = @attendanceDate, status = @status, remarks = @remarks WHERE id = @id`
  ).run({ id, studentId, facultyId, subject, attendanceDate, status, remarks });
}

export function deleteAttendanceById(id) {
  return db.prepare('DELETE FROM attendance WHERE id = ?').run(id);
}
