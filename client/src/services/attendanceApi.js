import api from './api.js';

export function listAttendance(params) {
  return api.get('/attendance', { params }).then((r) => r.data);
}

export function getAttendance(id) {
  return api.get(`/attendance/${id}`).then((r) => r.data);
}

export function createAttendance(data) {
  return api.post('/attendance', data).then((r) => r.data);
}

export function updateAttendance(id, data) {
  return api.put(`/attendance/${id}`, data).then((r) => r.data);
}

export function deleteAttendance(id) {
  return api.delete(`/attendance/${id}`).then((r) => r.data);
}

export function listStudents(params) {
  return api.get('/students', { params }).then((r) => r.data);
}

export function listFaculty(params) {
  return api.get('/faculty', { params }).then((r) => r.data);
}

export function getAttendanceHistory(params) {
  return api.get('/attendance/history', { params }).then((r) => r.data);
}

export function exportAttendanceHistoryCsv(params) {
  return api
    .get('/attendance/history/export/csv', { params, responseType: 'blob' })
    .then((r) => r.data);
}
