import {
  getStudents,
  getStudentById,
  getStudentByUserId,
  createStudentRecord,
  updateStudentRecord,
  deleteStudentById
} from '../models/studentModel.js';

import { findUserByEmail, createUser, updateUser, deleteUser } from '../models/userModel.js';
import { httpError } from '../utils/httpError.js';

export function listStudents({ q, department, status, page = 1, perPage = 10 }) {
  const result = getStudents({ q, department, status, page, perPage });

  return {
    total: result.total,
    perPage: result.perPage,
    page: result.page,
    data: result.data
  };
}

export function getStudentDetails(id) {
  const student = getStudentById(id);

  if (!student) {
    throw httpError(404, 'Student not found.');
  }

  return student;
}

export function createStudent({ fullName, email, studentId, department, phone, address, status }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(normalizedEmail);

  if (existing) {
    throw httpError(409, 'A user with this email already exists.');
  }

  const tempPassword = Math.random().toString(36).slice(2, 10) + 'A1!';

  const user = createUser({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: tempPassword,
    role: 'student'
  });

  const student = getStudentByUserId(user.id);

  if (!student) {
    throw httpError(500, 'Student record could not be created.');
  }

  updateStudentRecord(student.id, {
    fullName: fullName.trim(),
    email: normalizedEmail,
    studentId: studentId || null,
    department: department || null,
    phone: phone || null,
    address: address || null,
    status: status || 'Active'
  });

  return { user, student: getStudentById(student.id) };
}

export function updateStudent(id, { fullName, email, studentId, department, phone, address, status }) {
  const student = getStudentById(id);

  if (!student) {
    throw httpError(404, 'Student not found.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = findUserByEmail(normalizedEmail);

  if (existing && existing.id !== student.userId) {
    throw httpError(409, 'A user with this email already exists.');
  }

  updateUser(student.userId, { fullName: fullName.trim(), email: normalizedEmail });

  updateStudentRecord(id, {
    fullName: fullName.trim(),
    email: normalizedEmail,
    studentId: studentId || null,
    department: department || null,
    phone: phone || null,
    address: address || null,
    status: status || 'Active'
  });

  return getStudentById(id);
}

export function deleteStudent(id) {
  const student = getStudentById(id);

  if (!student) {
    throw httpError(404, 'Student not found.');
  }

  deleteUser(student.userId);

  return { success: true };
}
