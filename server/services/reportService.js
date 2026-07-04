import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { getAttendanceReport } from '../models/attendanceModel.js';
import { httpError } from '../utils/httpError.js';

const validStatuses = ['Present', 'Absent', 'Late'];

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseFilters(query) {
  const rawFacultyId = query.facultyId ?? query.faculty ?? '';
  const facultyIdValue = normalizeValue(rawFacultyId);
  const facultyId = facultyIdValue ? Number(facultyIdValue) : undefined;

  const filters = {
    student: normalizeValue(query.student),
    department: normalizeValue(query.department),
    facultyId,
    subject: normalizeValue(query.subject),
    date: normalizeValue(query.date),
    dateFrom: normalizeValue(query.dateFrom),
    dateTo: normalizeValue(query.dateTo),
    status: normalizeValue(query.status)
  };

  if (facultyIdValue && Number.isNaN(facultyId)) {
    throw httpError(400, 'facultyId must be a valid number.');
  }

  if (filters.status && !validStatuses.includes(filters.status)) {
    throw httpError(400, 'Invalid attendance status filter.');
  }

  ['date', 'dateFrom', 'dateTo'].forEach((key) => {
    if (filters[key] && Number.isNaN(Date.parse(filters[key]))) {
      throw httpError(400, `Invalid date format for ${key}. Use YYYY-MM-DD.`);
    }
  });

  if (filters.dateFrom && filters.dateTo && new Date(filters.dateFrom) > new Date(filters.dateTo)) {
    throw httpError(400, 'dateFrom cannot be later than dateTo.');
  }

  return filters;
}

export function getReportData(query) {
  const filters = parseFilters(query);
  const data = getAttendanceReport(filters);
  return { total: data.length, data };
}

function formatFilterLine(filters) {
  const applied = [];

  if (filters.dateFrom) applied.push(`From: ${filters.dateFrom}`);
  if (filters.dateTo) applied.push(`To: ${filters.dateTo}`);
  if (filters.department) applied.push(`Department: ${filters.department}`);
  if (filters.facultyId) applied.push(`Faculty ID: ${filters.facultyId}`);
  if (filters.student) applied.push(`Student: ${filters.student}`);
  if (filters.subject) applied.push(`Subject: ${filters.subject}`);
  if (filters.status) applied.push(`Status: ${filters.status}`);

  return applied.length ? applied.join(' • ') : 'None';
}

export async function generatePdfReport(query) {
  const filters = parseFilters(query);
  const reportRows = getAttendanceReport(filters);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).fillColor('#111827').text('Student Attendance Monitoring and Analytics System', {
      align: 'center'
    });

    doc.moveDown(0.4);
    doc.fontSize(12).fillColor('#334155').text('Attendance Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).fillColor('#475569');
    doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, { align: 'left' });
    doc.text(`Total Records: ${reportRows.length}`);
    doc.moveDown(0.5);
    doc.text(`Filters: ${formatFilterLine(filters)}`);
    doc.moveDown(0.8);

    const tableTop = doc.y;
    const columnWidths = {
      date: 70,
      student: 120,
      department: 90,
      faculty: 100,
      subject: 80,
      status: 60,
      remarks: 90
    };

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0F172A');
    doc.text('Date', 40, tableTop, { width: columnWidths.date });
    doc.text('Student', 40 + columnWidths.date, tableTop, { width: columnWidths.student });
    doc.text('Department', 40 + columnWidths.date + columnWidths.student, tableTop, { width: columnWidths.department });
    doc.text('Faculty', 40 + columnWidths.date + columnWidths.student + columnWidths.department, tableTop, { width: columnWidths.faculty });
    doc.text('Subject', 40 + columnWidths.date + columnWidths.student + columnWidths.department + columnWidths.faculty, tableTop, { width: columnWidths.subject });
    doc.text('Status', 40 + columnWidths.date + columnWidths.student + columnWidths.department + columnWidths.faculty + columnWidths.subject, tableTop, { width: columnWidths.status });
    doc.text('Remarks', 40 + columnWidths.date + columnWidths.student + columnWidths.department + columnWidths.faculty + columnWidths.subject + columnWidths.status, tableTop, { width: columnWidths.remarks });

    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(9).fillColor('#334155');

    reportRows.forEach((row) => {
      if (doc.y > 740) {
        doc.addPage();
        doc.y = 40;
      }

      doc.text(row.attendanceDate, { width: columnWidths.date, continued: true });
      doc.text(row.studentName, { width: columnWidths.student, continued: true });
      doc.text(row.facultyDepartment || 'N/A', { width: columnWidths.department, continued: true });
      doc.text(row.facultyName, { width: columnWidths.faculty, continued: true });
      doc.text(row.subject, { width: columnWidths.subject, continued: true });
      doc.text(row.status, { width: columnWidths.status, continued: true });
      doc.text(row.remarks || '', { width: columnWidths.remarks });
    });

    doc.end();
  });
}

export async function generateExcelReport(query) {
  const filters = parseFilters(query);
  const reportRows = getAttendanceReport(filters);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Attendance Report');

  sheet.columns = [
    { header: 'Student ID', key: 'studentId', width: 12 },
    { header: 'Student Name', key: 'studentName', width: 24 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Faculty', key: 'facultyName', width: 22 },
    { header: 'Subject', key: 'subject', width: 18 },
    { header: 'Date', key: 'attendanceDate', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 28 }
  ];

  sheet.addRows(
    reportRows.map((row) => ({
      studentId: row.studentId,
      studentName: row.studentName,
      department: row.facultyDepartment || 'N/A',
      facultyName: row.facultyName,
      subject: row.subject,
      attendanceDate: row.attendanceDate,
      status: row.status,
      remarks: row.remarks || ''
    }))
  );

  sheet.getRow(1).font = { bold: true };

  return workbook.xlsx.writeBuffer();
}
