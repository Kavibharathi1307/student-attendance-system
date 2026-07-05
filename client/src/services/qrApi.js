import api from './api.js';

export function generateQrCode(data) {
  return api.post('/qr/generate', data).then((r) => r.data);
}

export function validateQrToken(token) {
  return api.post('/qr/validate', { token }).then((r) => r.data);
}

export function markAttendanceViaQr(token) {
  return api.post('/qr/mark-attendance', { token }).then((r) => r.data);
}

export function listQrSessions(params) {
  return api.get('/qr/sessions', { params }).then((r) => r.data);
}

export function listActiveQrSessions() {
  return api.get('/qr/sessions/active').then((r) => r.data);
}

export function getQrSessionDetail(id) {
  return api.get(`/qr/sessions/${id}`).then((r) => r.data);
}
