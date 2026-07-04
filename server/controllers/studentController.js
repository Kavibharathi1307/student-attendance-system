import {
  listStudents,
  getStudentDetails,
  createStudent as createStudentService,
  updateStudent as updateStudentService,
  deleteStudent as deleteStudentService
} from '../services/studentService.js';

export function listStudentsHandler(request, response) {
  const { q, department, status, page } = request.query;
  const pageNum = Number(page) || 1;

  const result = listStudents({ q, department, status, page: pageNum, perPage: 10 });

  response.json(result);
}

export function getStudentHandler(request, response) {
  const { id } = request.params;
  const student = getStudentDetails(Number(id));

  response.json({ student });
}

export function createStudentHandler(request, response) {
  const { fullName, email, studentId, department, phone, address, status } = request.body;

  const result = createStudentService({ fullName, email, studentId, department, phone, address, status });

  response.status(201).json({ message: 'Student created', ...result });
}

export function updateStudentHandler(request, response) {
  const { id } = request.params;
  const { fullName, email, studentId, department, phone, address, status } = request.body;

  const updated = updateStudentService(Number(id), { fullName, email, studentId, department, phone, address, status });

  response.json({ message: 'Student updated', student: updated });
}

export function deleteStudentHandler(request, response) {
  const { id } = request.params;

  deleteStudentService(Number(id));

  response.json({ message: 'Student deleted' });
}
