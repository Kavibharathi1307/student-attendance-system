import api from './api.js';

export function listStudents(params = {}) {
  return api.get('/students', { params }).then((response) => response.data);
}

export function getStudent(id) {
  return api.get(`/students/${id}`).then((response) => response.data);
}

export function createStudent(data) {
  return api.post('/students', data).then((response) => response.data);
}

export function updateStudent(id, data) {
  return api.put(`/students/${id}`, data).then((response) => response.data);
}

export function deleteStudent(id) {
  return api.delete(`/students/${id}`).then((response) => response.data);
}
