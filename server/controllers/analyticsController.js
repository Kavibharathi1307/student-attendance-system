import { getDashboardStats } from '../services/analyticsService.js';

export function dashboardHandler(_req, res) {
  const stats = getDashboardStats();
  res.json(stats);
}
