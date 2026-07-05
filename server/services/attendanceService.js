import {
  countAttendance,
  getAttendance,
  getAllAttendance,
  getAttendanceById,
  getAttendanceStats,
  findDuplicateAttendance,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceById
} from '../models/attendanceModel.js';

import { getStudentByUserId } from '../models/studentModel.js';
import { getFacultyByUserId } from '../models/facultyModel.js';
import { httpError } from '../utils/httpError.js';
import { db } from '../config/database.js';

export function listAttendanceHistory({ user, ...filters }) {
  if (user.role === 'student') {
    const student = getStudentByUserId(user.id);
    if (!student) throw httpError(404, 'Student profile not found.');
    filters.studentId = student.id;
  } else if (user.role === 'faculty') {
    const faculty = getFacultyByUserId(user.id);
    if (!faculty) throw httpError(404, 'Faculty profile not found.');
    filters.facultyId = faculty.id;
  }

  const total = countAttendance(filters);
  const data = getAttendance(filters);
  const stats = getAttendanceStats(filters);

  return { total, perPage: filters.perPage || 10, page: filters.page || 1, data, stats };
}

export function listAttendance(filters) {
  const total = countAttendance(filters);
  const data = getAttendance(filters);

  return { total, perPage: filters.perPage || 10, page: filters.page || 1, data };
}

export function getAttendanceDetails(id) {
  const rec = getAttendanceById(id);

  if (!rec) throw httpError(404, 'Attendance record not found.');

  return rec;
}

export function createAttendance({ studentId, facultyId, subject, attendanceDate, status, remarks }) {
  if (!studentId || !facultyId || !subject || !attendanceDate || !status) {
    throw httpError(400, 'Missing required fields.');
  }

  const dup = findDuplicateAttendance({ studentId, subject, attendanceDate });

  if (dup) {
    throw httpError(409, 'Attendance for this student, subject, and date already exists.');
  }

  const result = createAttendanceRecord({ studentId, facultyId, subject, attendanceDate, status, remarks });

  return { id: result.lastInsertRowid };
}

export function updateAttendance(id, payload) {
  const rec = getAttendanceById(id);

  if (!rec) throw httpError(404, 'Attendance record not found.');

  const dup = findDuplicateAttendance({ studentId: payload.studentId, subject: payload.subject, attendanceDate: payload.attendanceDate });

  if (dup && dup.id !== id) {
    throw httpError(409, 'Attendance for this student, subject, and date already exists.');
  }

  updateAttendanceRecord(id, payload);

  return getAttendanceById(id);
}

export function exportAttendanceHistoryCsv({ user, ...filters }) {
  if (user.role === 'student') {
    throw httpError(403, 'Students cannot export attendance data.');
  } else if (user.role === 'faculty') {
    const faculty = getFacultyByUserId(user.id);
    if (!faculty) throw httpError(404, 'Faculty profile not found.');
    filters.facultyId = faculty.id;
  }

  return getAllAttendance(filters);
}

export function deleteAttendance(id) {
  const rec = getAttendanceById(id);

  if (!rec) throw httpError(404, 'Attendance record not found.');

  deleteAttendanceById(id);

  return { success: true };
}
