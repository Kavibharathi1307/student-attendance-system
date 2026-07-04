import { httpError } from '../utils/httpError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedStatuses = new Set(['Active', 'Inactive', 'Pending']);

export function validateStudentCreate(request, _response, next) {
  const { fullName, email, studentId, department, phone, address, status } = request.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return next(httpError(400, 'Full name must be at least 2 characters.'));
  }

  if (!email || typeof email !== 'string' || !emailPattern.test(email.trim())) {
    return next(httpError(400, 'A valid email address is required.'));
  }

  if (studentId && typeof studentId !== 'string') {
    return next(httpError(400, 'Student ID must be a string.'));
  }

  if (department && typeof department !== 'string') {
    return next(httpError(400, 'Department must be a string.'));
  }

  if (phone && typeof phone !== 'string') {
    return next(httpError(400, 'Phone must be a string.'));
  }

  if (address && typeof address !== 'string') {
    return next(httpError(400, 'Address must be a string.'));
  }

  if (status && !allowedStatuses.has(status)) {
    return next(httpError(400, 'Status must be Active, Inactive, or Pending.'));
  }

  return next();
}

export function validateStudentUpdate(request, _response, next) {
  const { fullName, email, studentId, department, phone, address, status } = request.body;

  if (fullName && (typeof fullName !== 'string' || fullName.trim().length < 2)) {
    return next(httpError(400, 'Full name must be at least 2 characters.'));
  }

  if (email && (typeof email !== 'string' || !emailPattern.test(email.trim()))) {
    return next(httpError(400, 'A valid email address is required.'));
  }

  if (studentId && typeof studentId !== 'string') {
    return next(httpError(400, 'Student ID must be a string.'));
  }

  if (department && typeof department !== 'string') {
    return next(httpError(400, 'Department must be a string.'));
  }

  if (phone && typeof phone !== 'string') {
    return next(httpError(400, 'Phone must be a string.'));
  }

  if (address && typeof address !== 'string') {
    return next(httpError(400, 'Address must be a string.'));
  }

  if (status && !allowedStatuses.has(status)) {
    return next(httpError(400, 'Status must be Active, Inactive, or Pending.'));
  }

  return next();
}
