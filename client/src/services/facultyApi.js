import api from './api.js';

export function listFaculty({ q, department, page = 1 }) {
  return api.get('/faculty', { params: { q, department, page } }).then((r) => r.data);
}

export function getFaculty(id) {
  return api.get(`/faculty/${id}`).then((r) => r.data);
}

export function createFaculty(data) {
  return api.post('/faculty', data).then((r) => r.data);
}

export function updateFaculty(id, data) {
  return api.put(`/faculty/${id}`, data).then((r) => r.data);
}

export function deleteFaculty(id) {
  return api.delete(`/faculty/${id}`).then((r) => r.data);
}
