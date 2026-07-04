import { httpError } from '../utils/httpError.js';

const allowedStatus = new Set(['Present', 'Absent', 'Late']);

export function validateAttendanceCreate(request, _response, next) {
  const { studentId, facultyId, subject, attendanceDate, status } = request.body;

  if (!studentId || isNaN(Number(studentId))) {
    return next(httpError(400, 'A valid studentId is required.'));
  }

  if (!facultyId || isNaN(Number(facultyId))) {
    return next(httpError(400, 'A valid facultyId is required.'));
  }

  if (!subject || typeof subject !== 'string') {
    return next(httpError(400, 'Subject is required.'));
  }

  if (!attendanceDate || typeof attendanceDate !== 'string') {
    return next(httpError(400, 'attendanceDate is required (YYYY-MM-DD).'));
  }

  if (!status || !allowedStatus.has(status)) {
    return next(httpError(400, 'Status must be Present, Absent, or Late.'));
  }

  return next();
}

export function validateAttendanceUpdate(request, _response, next) {
  const { status, attendanceDate } = request.body;

  if (attendanceDate && typeof attendanceDate !== 'string') {
    return next(httpError(400, 'attendanceDate must be a string (YYYY-MM-DD).'));
  }

  if (status && !allowedStatus.has(status)) {
    return next(httpError(400, 'Status must be Present, Absent, or Late.'));
  }

  return next();
}
