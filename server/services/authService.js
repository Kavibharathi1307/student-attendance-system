import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';
import { httpError } from '../utils/httpError.js';

export function registerUser({ fullName, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw httpError(409, 'A user with this email already exists.');
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const user = createUser({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: passwordHash,
    role
  });

  return {
    user,
    token: createToken(user)
  };
}

export function loginUser({ email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = findUserByEmail(normalizedEmail);

  if (!user || user.role !== role) {
    throw httpError(401, 'Invalid email, password, or role.');
  }

  const passwordMatches = bcrypt.compareSync(password, user.password);

  if (!passwordMatches) {
    throw httpError(401, 'Invalid email, password, or role.');
  }

  const publicUser = findUserById(user.id);

  return {
    user: publicUser,
    token: createToken(publicUser)
  };
}

export function getUserProfile(userId) {
  const user = findUserById(userId);

  if (!user) {
    throw httpError(404, 'User profile not found.');
  }

  return user;
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}
