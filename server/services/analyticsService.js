import { db } from '../config/database.js';

function buildFilter(filters) {
  let where = 'WHERE 1=1';
  const params = {};

  if (filters.dateFrom) {
    where += ' AND a.attendanceDate >= @dateFrom';
    params.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    where += ' AND a.attendanceDate <= @dateTo';
    params.dateTo = filters.dateTo;
  }
  if (filters.department) {
    where += ' AND f.department = @department';
    params.department = filters.department;
  }
  if (filters.facultyId) {
    where += ' AND a.facultyId = @facultyId';
    params.facultyId = filters.facultyId;
  }
  if (filters.subject) {
    where += ' AND a.subject = @subject';
    params.subject = filters.subject;
  }

  return { where, params };
}

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

export function getFilteredAnalytics(filters = {}) {
  const { where, params } = buildFilter(filters);
  const withFaculty = 'JOIN faculty f ON f.id = a.facultyId';
  const baseFrom = 'attendance a';

  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count || 0;
  const totalFaculty = db.prepare('SELECT COUNT(*) as count FROM faculty').get().count || 0;

  const totalAttendanceRow = db.prepare(`SELECT COUNT(*) as count FROM ${baseFrom} ${withFaculty} ${where}`).get(params);
  const totalAttendance = totalAttendanceRow?.count || 0;

  const present = db.prepare(`SELECT COUNT(*) as count FROM ${baseFrom} ${withFaculty} ${where} AND a.status = 'Present'`).get(params).count || 0;
  const absent = db.prepare(`SELECT COUNT(*) as count FROM ${baseFrom} ${withFaculty} ${where} AND a.status = 'Absent'`).get(params).count || 0;
  const late = db.prepare(`SELECT COUNT(*) as count FROM ${baseFrom} ${withFaculty} ${where} AND a.status = 'Late'`).get(params).count || 0;

  const presentPct = totalAttendance ? Math.round((present / totalAttendance) * 100) : 0;
  const absentPct = totalAttendance ? Math.round((absent / totalAttendance) * 100) : 0;
  const latePct = totalAttendance ? Math.round((late / totalAttendance) * 100) : 0;

  const departmentWise = db.prepare(`
    SELECT COALESCE(f.department, 'Unknown') as department,
      COUNT(*) as total,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late
    FROM attendance a
    JOIN faculty f ON f.id = a.facultyId
    ${where}
    GROUP BY department ORDER BY total DESC
  `).all(params);

  const monthly = db.prepare(`
    SELECT substr(attendanceDate,1,7) as month, COUNT(*) as total
    FROM attendance a ${withFaculty} ${where}
    GROUP BY month ORDER BY month ASC
  `).all(params);

  const weekly = db.prepare(`
    SELECT strftime('%Y-%W', attendanceDate) as week, COUNT(*) as total
    FROM attendance a ${withFaculty} ${where}
    GROUP BY week ORDER BY week ASC
  `).all(params);

  const recentAttendance = db.prepare(`
    SELECT a.id, a.attendanceDate, a.status, a.subject, a.remarks,
      s.fullName as studentName, IFNULL(s.studentId, '') as registerNumber, f.fullName as facultyName
    FROM attendance a
    JOIN students s ON s.id = a.studentId
    JOIN faculty f ON f.id = a.facultyId
    ${where}
    ORDER BY a.attendanceDate DESC, a.id DESC LIMIT 10
  `).all(params);

  const recentStudents = db.prepare('SELECT id, userId, fullName, email, createdAt FROM students ORDER BY createdAt DESC LIMIT 5').all();

  let qrWhere = 'WHERE 1=1';
  const qrParams = {};
  if (filters.dateFrom) { qrWhere += ' AND attendanceDate >= @dateFrom'; qrParams.dateFrom = filters.dateFrom; }
  if (filters.dateTo) { qrWhere += ' AND attendanceDate <= @dateTo'; qrParams.dateTo = filters.dateTo; }
  const activeQrSessions = db.prepare(`SELECT COUNT(*) as count FROM qr_sessions ${qrWhere} AND isActive = 1 AND expiresAt > datetime('now')`).get(qrParams).count || 0;

  const subjectWise = db.prepare(`
    SELECT a.subject,
      COUNT(*) as total,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late
    FROM attendance a ${withFaculty} ${where}
    GROUP BY a.subject ORDER BY total DESC
  `).all(params);

  const trendStart = filters.dateFrom || new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
  const trendEnd = filters.dateTo || new Date().toISOString().split('T')[0];

  let trendWhere = where;
  const trendParams = { ...params };
  if (!filters.dateFrom) { trendWhere += ' AND a.attendanceDate >= @trendStart'; trendParams.trendStart = trendStart; }
  if (!filters.dateTo) { trendWhere += ' AND a.attendanceDate <= @trendEnd'; trendParams.trendEnd = trendEnd; }

  const rawTrend = db.prepare(`
    SELECT attendanceDate as date,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late
    FROM attendance a ${withFaculty} ${trendWhere}
    GROUP BY attendanceDate
    ORDER BY attendanceDate ASC
  `).all(trendParams);

  const trendMap = {};
  for (const row of rawTrend) trendMap[row.date] = row;
  const weeklyTrend = [];
  const startDate = new Date(trendStart);
  const endDate = new Date(trendEnd);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    weeklyTrend.push(trendMap[key] || { date: key, present: 0, absent: 0, late: 0 });
  }

  const facultyWise = db.prepare(`
    SELECT f.id, f.fullName as facultyName,
      COUNT(*) as total,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present
    FROM attendance a
    JOIN faculty f ON f.id = a.facultyId
    ${where}
    GROUP BY f.id ORDER BY total DESC
  `).all(params);

  const departmentPercentage = departmentWise.map(d => ({
    department: d.department,
    percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    total: d.total
  }));

  const bestDepartment = departmentWise.length > 0
    ? departmentWise.reduce((best, d) => {
        const pct = d.total > 0 ? (d.present / d.total) * 100 : 0;
        return pct > (best.pct || 0) ? { name: d.department, pct: Math.round(pct) } : best;
      }, { name: 'N/A', pct: 0 })
    : { name: 'N/A', pct: 0 };

  const worstDepartment = departmentWise.length > 0
    ? departmentWise.reduce((worst, d) => {
        const pct = d.total > 0 ? (d.present / d.total) * 100 : 0;
        return (worst.pct === undefined || pct < worst.pct) ? { name: d.department, pct: Math.round(pct) } : worst;
      }, { name: 'N/A', pct: 100 })
    : { name: 'N/A', pct: 0 };

  const mostActiveFaculty = facultyWise.length > 0
    ? facultyWise.reduce((best, f) => f.total > (best.count || 0) ? { name: f.facultyName, count: f.total } : best, { name: 'N/A', count: 0 })
    : { name: 'N/A', count: 0 };

  const totalQrSessions = db.prepare(`SELECT COUNT(*) as count FROM qr_sessions ${qrWhere}`).get(qrParams).count || 0;

  const daysWithAttendance = db.prepare(`SELECT COUNT(DISTINCT attendanceDate) as count FROM attendance a ${withFaculty} ${where}`).get(params).count || 0;
  const avgAttendancePerDay = daysWithAttendance > 0 ? Math.round(totalAttendance / daysWithAttendance) : 0;

  const departments = db.prepare("SELECT DISTINCT department FROM faculty WHERE department IS NOT NULL AND department != '' ORDER BY department").all().map(r => r.department);
  const departmentsCount = departments.length;
  const subjects = db.prepare('SELECT DISTINCT subject FROM attendance ORDER BY subject').all().map(r => r.subject);
  const facultyList = db.prepare('SELECT id, fullName, department FROM faculty ORDER BY fullName').all();

  const topStudents = db.prepare(`
    SELECT s.id, s.fullName, IFNULL(s.studentId, '') as registerNumber,
      COUNT(a.id) as total,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as presentCount,
      ROUND(100.0 * SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id)) as attendancePct
    FROM students s
    JOIN attendance a ON a.studentId = s.id
    JOIN faculty f ON f.id = a.facultyId
    ${where}
    GROUP BY s.id
    HAVING COUNT(a.id) > 0
    ORDER BY attendancePct DESC, presentCount DESC
    LIMIT 10
  `).all(params);

  const mostRegularStudent = topStudents.length > 0 ? { name: topStudents[0].fullName, pct: topStudents[0].attendancePct } : { name: 'N/A', pct: 0 };

  const facultyPerformance = db.prepare(`
    SELECT f.id, f.fullName as facultyName, f.department,
      COUNT(DISTINCT a.subject) as subjects,
      COUNT(a.id) as attendanceTaken,
      COUNT(DISTINCT a.studentId) as studentsCovered
    FROM faculty f
    JOIN attendance a ON a.facultyId = f.id
    ${where}
    GROUP BY f.id
    ORDER BY attendanceTaken DESC
  `).all(params);

  const studentCountsByDept = db.prepare("SELECT department, COUNT(*) as count FROM students WHERE department IS NOT NULL AND department != '' GROUP BY department").all();
  const facultyCountsByDept = db.prepare("SELECT department, COUNT(*) as count FROM faculty WHERE department IS NOT NULL AND department != '' GROUP BY department").all();

  const departmentStats = departments.map(name => {
    const studentCount = studentCountsByDept.find(s => s.department === name)?.count || 0;
    const facCount = facultyCountsByDept.find(f => f.department === name)?.count || 0;
    const att = departmentWise.find(d => d.department === name);
    const deptTotal = att?.total || 0;
    const deptPct = deptTotal > 0 ? Math.round((att.present / deptTotal) * 100) : 0;
    return { department: name, studentCount, facultyCount: facCount, totalAttendance: deptTotal, attendancePct: deptPct };
  });

  const today = new Date().toISOString().split('T')[0];
  const attendanceToday = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE attendanceDate = ?').get(today).count || 0;
  const presentToday = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE attendanceDate = ? AND status = 'Present'").get(today).count || 0;
  const qrSessionsToday = db.prepare('SELECT COUNT(*) as count FROM qr_sessions WHERE attendanceDate = ?').get(today).count || 0;

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
    recentStudents,
    activeQrSessions,
    subjectWise,
    weeklyTrend,
    facultyWise,
    departmentPercentage,
    departmentsCount,
    topStudents,
    facultyPerformance,
    departmentStats,
    attendanceToday,
    presentToday,
    qrSessionsToday,
    insights: {
      bestDepartment,
      worstDepartment,
      totalAttendancePct: presentPct,
      mostActiveFaculty,
      mostRegularStudent,
      totalQrSessions,
      avgAttendancePerDay,
      attendanceToday,
      qrSessionsToday
    },
    filterOptions: {
      departments,
      subjects,
      facultyList
    }
  };
}
