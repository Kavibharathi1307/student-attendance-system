import { db } from '../config/database.js';

export function getAdminDashboardStats() {
  const base = getDashboardStats();
  const today = new Date().toISOString().split('T')[0];

  const todayTotal = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE attendanceDate = ?').get(today).count || 0;
  const todayPresent = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE attendanceDate = ? AND status = 'Present'").get(today).count || 0;
  const todayAbsent = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE attendanceDate = ? AND status = 'Absent'").get(today).count || 0;

  const activeQrSessions = db.prepare("SELECT COUNT(*) as count FROM qr_sessions WHERE isActive = 1 AND expiresAt > datetime('now')").get().count || 0;

  const rawTrend = db.prepare(`
    SELECT attendanceDate as date,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late
    FROM attendance
    WHERE attendanceDate >= date('now', '-6 days')
    GROUP BY attendanceDate
    ORDER BY attendanceDate ASC
  `).all();

  const trendMap = {};
  for (const row of rawTrend) trendMap[row.date] = row;

  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    weeklyTrend.push(trendMap[key] || { date: key, present: 0, absent: 0, late: 0 });
  }

  return {
    totalStudents: base.totalStudents,
    totalFaculty: base.totalFaculty,
    totalAttendance: base.totalAttendance,
    overallAttendancePct: base.present.pct,
    todayAttendance: todayTotal,
    presentToday: todayPresent,
    absentToday: todayAbsent,
    activeQrSessions,
    recentAttendance: base.recentAttendance,
    weeklyTrend
  };
}

export function getDashboardStats() {
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count || 0;
  const totalFaculty = db.prepare('SELECT COUNT(*) as count FROM faculty').get().count || 0;
  const totalAttendance = db.prepare('SELECT COUNT(*) as count FROM attendance').get().count || 0;

  const present = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE status = 'Present'").get().count || 0;
  const absent = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE status = 'Absent'").get().count || 0;
  const late = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE status = 'Late'").get().count || 0;

  const presentPct = totalAttendance ? Math.round((present / totalAttendance) * 100) : 0;
  const absentPct = totalAttendance ? Math.round((absent / totalAttendance) * 100) : 0;
  const latePct = totalAttendance ? Math.round((late / totalAttendance) * 100) : 0;

  const deptStmt = db.prepare(
    `SELECT COALESCE(f.department, 'Unknown') as department,
      COUNT(*) as total,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late
     FROM attendance a
     JOIN faculty f ON f.id = a.facultyId
     GROUP BY department ORDER BY total DESC`
  );

  const departmentWise = deptStmt.all();

  const monthlyStmt = db.prepare(
    `SELECT substr(attendanceDate,1,7) as month, COUNT(*) as total
     FROM attendance
     GROUP BY month ORDER BY month ASC`
  );

  const monthly = monthlyStmt.all();

  const weeklyStmt = db.prepare(
    `SELECT strftime('%Y-%W', attendanceDate) as week, COUNT(*) as total
     FROM attendance
     GROUP BY week ORDER BY week ASC`
  );

  const weekly = weeklyStmt.all();

  const recentAttendanceStmt = db.prepare(
    `SELECT a.id, a.attendanceDate, a.status, a.subject, a.remarks,
      s.fullName as studentName, f.fullName as facultyName
     FROM attendance a
     JOIN students s ON s.id = a.studentId
     JOIN faculty f ON f.id = a.facultyId
     ORDER BY a.attendanceDate DESC, a.id DESC LIMIT 10`
  );

  const recentAttendance = recentAttendanceStmt.all();

  const recentStudentsStmt = db.prepare('SELECT id, userId, fullName, email, createdAt FROM students ORDER BY createdAt DESC LIMIT 5');
  const recentStudents = recentStudentsStmt.all();

  return {
    totalStudents,
    totalFaculty,
    totalAttendance,
    present: { count: present, pct: presentPct },
    absent: { count: absent, pct: absentPct },
    late: { count: late, pct: latePct },
    departmentWise,
    monthly,
    weekly,
    recentAttendance,
    recentStudents
  };
}
