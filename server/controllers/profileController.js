import { getProfile, updateProfile, changePassword } from '../services/profileService.js';
import { httpError } from '../utils/httpError.js';

export function getProfileHandler(req, res) {
  const profile = getProfile(req.user.id);
  res.json({ profile });
}

export function updateProfileHandler(req, res) {
  const { fullName, email, department, phone } = req.body;

  if (fullName !== undefined && fullName.trim().length < 2) {
    throw httpError(400, 'Full name must be at least 2 characters.');
  }
  if (email !== undefined && !email.includes('@')) {
    throw httpError(400, 'A valid email address is required.');
  }

  const result = updateProfile(req.user.id, {
    fullName: fullName !== undefined ? fullName.trim() : undefined,
    email: email !== undefined ? email.trim() : undefined,
    department: department !== undefined ? department : undefined,
    phone: phone !== undefined ? phone : undefined
  });

  res.json({ message: 'Profile updated successfully.', ...result });
}

export function changePasswordHandler(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    throw httpError(400, 'Current password is required.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw httpError(400, 'New password must be at least 6 characters.');
  }
  if (newPassword !== confirmPassword) {
    throw httpError(400, 'New password and confirm password do not match.');
  }

  const result = changePassword(req.user.id, { currentPassword, newPassword });
  res.json(result);
}
