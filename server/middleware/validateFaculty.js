import { httpError } from '../utils/httpError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFacultyCreate(request, _response, next) {
  const { fullName, email, department } = request.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return next(httpError(400, 'Full name must be at least 2 characters.'));
  }

  if (!email || typeof email !== 'string' || !emailPattern.test(email.trim())) {
    return next(httpError(400, 'A valid email address is required.'));
  }

  if (department && typeof department !== 'string') {
    return next(httpError(400, 'Department must be a string.'));
  }

  return next();
}

export function validateFacultyUpdate(request, _response, next) {
  const { fullName, email, department } = request.body;

  if (fullName && (typeof fullName !== 'string' || fullName.trim().length < 2)) {
    return next(httpError(400, 'Full name must be at least 2 characters.'));
  }

  if (email && (typeof email !== 'string' || !emailPattern.test(email.trim()))) {
    return next(httpError(400, 'A valid email address is required.'));
  }

  if (department && typeof department !== 'string') {
    return next(httpError(400, 'Department must be a string.'));
  }

  return next();
}
