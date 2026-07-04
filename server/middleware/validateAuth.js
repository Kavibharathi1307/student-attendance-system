import { httpError } from '../utils/httpError.js';

const allowedRoles = new Set(['admin', 'faculty', 'student']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(request, _response, next) {
  const { fullName, email, password, role } = request.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return next(httpError(400, 'Full name must be at least 2 characters.'));
  }

  if (!isValidEmail(email)) {
    return next(httpError(400, 'A valid email address is required.'));
  }

  if (!isValidPassword(password)) {
    return next(
      httpError(
        400,
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      )
    );
  }

  if (!allowedRoles.has(role)) {
    return next(httpError(400, 'Role must be admin, faculty, or student.'));
  }

  return next();
}

export function validateLogin(request, _response, next) {
  const { email, password, role } = request.body;

  if (!isValidEmail(email)) {
    return next(httpError(400, 'A valid email address is required.'));
  }

  if (!password || typeof password !== 'string') {
    return next(httpError(400, 'Password is required.'));
  }

  if (!allowedRoles.has(role)) {
    return next(httpError(400, 'Role must be admin, faculty, or student.'));
  }

  return next();
}

function isValidEmail(email) {
  return typeof email === 'string' && emailPattern.test(email.trim());
}

function isValidPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
