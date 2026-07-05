import { getAdminDashboardStats } from '../services/analyticsService.js';

export function adminDashboardHandler(_req, res) {
  const stats = getAdminDashboardStats();
  res.json(stats);
}
