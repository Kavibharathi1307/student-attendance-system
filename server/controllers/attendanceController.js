import {
  listAttendance,
  listAttendanceHistory,
  exportAttendanceHistoryCsv,
  getAttendanceDetails,
  createAttendance as createAttendanceService,
  updateAttendance as updateAttendanceService,
  deleteAttendance as deleteAttendanceService
} from '../services/attendanceService.js';

export function attendanceHistoryHandler(request, response) {
  const { page, limit, subject, status, from, to, student, faculty } = request.query;
  const pageNum = Number(page) || 1;
  const perPage = Number(limit) || 10;

  const result = listAttendanceHistory({
    user: request.user,
    subject,
    status,
    dateFrom: from,
    dateTo: to,
    student,
    facultyId: faculty ? Number(faculty) : undefined,
    page: pageNum,
    perPage
  });

  response.json(result);
}

export function attendanceHistoryCsvHandler(request, response) {
  const { subject, status, from, to, student, faculty } = request.query;

  const data = exportAttendanceHistoryCsv({
    user: request.user,
    subject,
    status,
    dateFrom: from,
    dateTo: to,
    student,
    facultyId: faculty ? Number(faculty) : undefined
  });

  const header = 'Date,Student,Register Number,Faculty,Subject,Status\n';
  const rows = data.map((r) =>
    `"${r.attendanceDate}","${r.studentName}","${r.registerNumber || ''}","${r.facultyName}","${r.subject}","${r.status}"`
  ).join('\n');

  response.setHeader('Content-Type', 'text/csv');
  response.setHeader('Content-Disposition', 'attachment; filename=attendance-history.csv');
  response.send(header + rows);
}

export function listAttendanceHandler(request, response) {
  const { q, department, facultyId, subject, date, status, page } = request.query;
  const pageNum = Number(page) || 1;

  const result = listAttendance({ q, department, facultyId: facultyId ? Number(facultyId) : undefined, subject, date, status, page: pageNum, perPage: 10 });

  response.json(result);
}

export function getAttendanceHandler(request, response) {
  const { id } = request.params;
  const rec = getAttendanceDetails(Number(id));

  response.json({ attendance: rec });
}

export function createAttendanceHandler(request, response) {
  const payload = request.body;

  const result = createAttendanceService(payload);

  response.status(201).json({ message: 'Attendance recorded', ...result });
}

export function updateAttendanceHandler(request, response) {
  const { id } = request.params;
  const payload = request.body;

  const updated = updateAttendanceService(Number(id), payload);

  response.json({ message: 'Attendance updated', attendance: updated });
}

export function deleteAttendanceHandler(request, response) {
  const { id } = request.params;

  deleteAttendanceService(Number(id));

  response.json({ message: 'Attendance deleted' });
}
