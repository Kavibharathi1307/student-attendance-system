const authTokenKey = 'student_attendance_token';
const authUserKey = 'student_attendance_user';

export function getToken() {
  return sessionStorage.getItem(authTokenKey);
}

export function setToken(token) {
  sessionStorage.setItem(authTokenKey, token);
}

export function clearToken() {
  sessionStorage.removeItem(authTokenKey);
}

export function getStoredUser() {
  const user = sessionStorage.getItem(authUserKey);
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user) {
  sessionStorage.setItem(authUserKey, JSON.stringify(user));
}

export function clearStoredUser() {
  sessionStorage.removeItem(authUserKey);
}
