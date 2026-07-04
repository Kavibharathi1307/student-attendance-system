import { db } from '../config/database.js';

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
