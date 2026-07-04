import api from './api.js';

export function getAttendanceReport(params) {
  return api.get('/reports/attendance', { params }).then((r) => r.data);
}

export function exportReportPdf(params) {
  return api
    .get('/reports/export/pdf', { params, responseType: 'blob' })
    .then((r) => r.data);
}

export function exportReportExcel(params) {
  return api
    .get('/reports/export/excel', { params, responseType: 'blob' })
    .then((r) => r.data);
}
