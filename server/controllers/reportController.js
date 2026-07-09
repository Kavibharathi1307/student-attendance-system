import { getReportData, generatePdfReport, generateExcelReport } from '../services/reportService.js';

export function attendanceReportHandler(req, res) {
  const report = getReportData(req.query);
  res.json(report);
}

export async function exportPdfHandler(req, res) {
  const buffer = await generatePdfReport(req.query, req.user);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.pdf"');
  res.send(buffer);
}

export async function exportExcelHandler(req, res) {
  const buffer = await generateExcelReport(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.xlsx"');
  res.send(buffer);
}
