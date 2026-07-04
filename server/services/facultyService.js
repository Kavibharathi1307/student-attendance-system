import {
  countFaculty,
  getFaculty,
  getFacultyById,
  getFacultyByUserId,
  updateFacultyRecord,
  deleteFacultyById
} from '../models/facultyModel.js';

import { findUserByEmail, createUser, updateUser, deleteUser } from '../models/userModel.js';
import { httpError } from '../utils/httpError.js';

export function listFaculty({ q, department, page = 1, perPage = 10 }) {
  const total = countFaculty({ q, department });
  const rows = getFaculty({ q, department, page, perPage });

  return {
    total,
    perPage,
    page,
    data: rows
  };
}

export function getFacultyDetails(id) {
  const faculty = getFacultyById(id);

  if (!faculty) {
    throw httpError(404, 'Faculty not found.');
  }

  return faculty;
}

export function createFaculty({ fullName, email, department }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(normalizedEmail);

  if (existing) {
    throw httpError(409, 'A user with this email already exists.');
  }

  // create user with a random temporary password (admin will reset)
  const tempPassword = Math.random().toString(36).slice(2, 10) + 'A1!';

  const user = createUser({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: tempPassword,
    role: 'faculty',
    department
  });

  const faculty = getFacultyByUserId(user.id);

  return { user, faculty };
}

export function updateFaculty(id, { fullName, email, department }) {
  const faculty = getFacultyById(id);

  if (!faculty) {
    throw httpError(404, 'Faculty not found.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = findUserByEmail(normalizedEmail);

  if (existing && existing.id !== faculty.userId) {
    throw httpError(409, 'A user with this email already exists.');
  }

  // update users table
  updateUser(faculty.userId, { fullName: fullName.trim(), email: normalizedEmail });

  // update faculty record
  updateFacultyRecord(id, { fullName: fullName.trim(), email: normalizedEmail, department });

  return getFacultyById(id);
}

export function deleteFaculty(id) {
  const faculty = getFacultyById(id);

  if (!faculty) {
    throw httpError(404, 'Faculty not found.');
  }

  // deleting the user will cascade to faculty
  deleteUser(faculty.userId);

  return { success: true };
}
