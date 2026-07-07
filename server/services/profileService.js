import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { findUserByEmail, findUserById, updateUser } from '../models/userModel.js';
import { getStudentByUserId, updateStudentByUserId } from '../models/studentModel.js';
import { getFacultyByUserId, updateFacultyRecord } from '../models/facultyModel.js';
import { httpError } from '../utils/httpError.js';

export function getProfile(userId) {
  const user = findUserById(userId);
  if (!user) throw httpError(404, 'User not found.');

  const profile = { ...user };

  if (user.role === 'student') {
    const student = getStudentByUserId(userId);
    if (student) {
      profile.studentId = student.studentId;
      profile.department = student.department;
      profile.phone = student.phone;
      profile.address = student.address;
      profile.accountStatus = student.status;
    }
  } else if (user.role === 'faculty') {
    const faculty = getFacultyByUserId(userId);
    if (faculty) {
      profile.department = faculty.department;
      profile.accountStatus = 'Active';
    }
  } else {
    profile.accountStatus = 'Active';
  }

  return profile;
}

export function updateProfile(userId, { fullName, email, department, phone }) {
  const user = findUserById(userId);
  if (!user) throw httpError(404, 'User not found.');

  const resolvedFullName = fullName !== undefined ? fullName.trim() : user.fullName;
  const normalizedEmail = email !== undefined ? email.trim().toLowerCase() : user.email;

  if (email !== undefined) {
    const existingUser = findUserByEmail(normalizedEmail);
    if (existingUser && existingUser.id !== userId) {
      throw httpError(409, 'This email is already in use by another account.');
    }
  }

  updateUser(userId, { fullName: resolvedFullName, email: normalizedEmail });

  if (user.role === 'student') {
    const student = getStudentByUserId(userId);
    updateStudentByUserId(userId, {
      fullName: resolvedFullName,
      email: normalizedEmail,
      studentId: student?.studentId || null,
      department: department !== undefined ? department : (student?.department || null),
      phone: phone !== undefined ? phone : (student?.phone || null),
      address: student?.address || null,
      status: student?.status || 'Active'
    });
  } else if (user.role === 'faculty') {
    const faculty = getFacultyByUserId(userId);
    if (faculty) {
      updateFacultyRecord(faculty.id, {
        fullName: resolvedFullName,
        email: normalizedEmail,
        department: department !== undefined ? department : (faculty.department || null)
      });
    }
  }

  const profile = getProfile(userId);
  const token = jwt.sign(
    { id: profile.id, role: profile.role, email: profile.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return { profile, token };
}

export function changePassword(userId, { currentPassword, newPassword }) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) throw httpError(404, 'User not found.');

  const isValid = bcrypt.compareSync(currentPassword, user.password);
  if (!isValid) throw httpError(400, 'Current password is incorrect.');

  const passwordHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(passwordHash, userId);

  return { message: 'Password updated successfully.' };
}
