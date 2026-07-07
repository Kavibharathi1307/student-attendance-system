import { httpError } from '../utils/httpError.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateGenerateQr(request, _response, next) {
  const { subject, attendanceDate, expiryMinutes } = request.body;

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return next(httpError(400, 'Subject is required.'));
  }

  if (!attendanceDate || typeof attendanceDate !== 'string' || !DATE_REGEX.test(attendanceDate)) {
    return next(httpError(400, 'Valid attendance date is required (YYYY-MM-DD).'));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attDate = new Date(attendanceDate + 'T00:00:00');
  if (attDate < today) {
    return next(httpError(400, 'Attendance date cannot be in the past.'));
  }

  if (expiryMinutes !== undefined) {
    const num = Number(expiryMinutes);

    if (!Number.isInteger(num) || num < 1 || num > 60) {
      return next(httpError(400, 'Expiry minutes must be an integer between 1 and 60.'));
    }
  }

  return next();
}
