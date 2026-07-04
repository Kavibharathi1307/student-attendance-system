import { getUserProfile, loginUser, registerUser } from '../services/authService.js';

export function register(request, response) {
  const result = registerUser(request.body);

  response.status(201).json({
    message: 'Registration successful.',
    ...result
  });
}

export function login(request, response) {
  const result = loginUser(request.body);

  response.json({
    message: 'Login successful.',
    ...result
  });
}

export function profile(request, response) {
  const user = getUserProfile(request.user.id);

  response.json({ user });
}
