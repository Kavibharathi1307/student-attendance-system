import { getFilteredAnalytics } from '../services/analyticsService.js';

export function dashboardHandler(req, res) {
  const { dateFrom, dateTo, department, facultyId, subject } = req.query;
  const stats = getFilteredAnalytics({ dateFrom, dateTo, department, facultyId, subject });
  res.json(stats);
}
