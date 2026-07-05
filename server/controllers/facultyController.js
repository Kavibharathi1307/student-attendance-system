import {
  listFaculty,
  getFacultyDetails,
  getFacultyDashboard,
  createFaculty as createFacultyService,
  updateFaculty as updateFacultyService,
  deleteFaculty as deleteFacultyService
} from '../services/facultyService.js';

export function listFacultyHandler(request, response) {
  const { q, department, page } = request.query;
  const pageNum = Number(page) || 1;

  const result = listFaculty({ q, department, page: pageNum, perPage: 10 });

  response.json(result);
}

export function getFacultyHandler(request, response) {
  const { id } = request.params;
  const faculty = getFacultyDetails(Number(id));

  response.json({ faculty });
}

export function createFacultyHandler(request, response) {
  const { fullName, email, department } = request.body;

  const result = createFacultyService({ fullName, email, department });

  response.status(201).json({ message: 'Faculty created', ...result });
}

export function updateFacultyHandler(request, response) {
  const { id } = request.params;
  const { fullName, email, department } = request.body;

  const updated = updateFacultyService(Number(id), { fullName, email, department });

  response.json({ message: 'Faculty updated', faculty: updated });
}

export function facultyDashboardHandler(request, response) {
  const result = getFacultyDashboard(request.user.id);
  response.json(result);
}

export function deleteFacultyHandler(request, response) {
  const { id } = request.params;

  deleteFacultyService(Number(id));

  response.json({ message: 'Faculty deleted' });
}
