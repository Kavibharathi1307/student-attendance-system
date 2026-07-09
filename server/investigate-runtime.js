// ============================================================
// RUNTIME INVESTIGATION SCRIPT
// Traces the complete QR generation → attendance flow
// Does NOT modify any existing code
// ============================================================

import crypto from 'node:crypto';
import { db } from './config/database.js';
import { createQrSession, getQrSessionByToken } from './models/qrAttendanceModel.js';
import { findDuplicateAttendance, createAttendanceRecord } from './models/attendanceModel.js';
import { getStudentByUserId } from './models/studentModel.js';
import { getFacultyByUserId } from './models/facultyModel.js';

// ─── CLEANUP: Remove any test data we will create ──────────
const cleanupSubject = 'INVESTIGATE_TEST_' + Date.now();
console.log('=== UNIQUE TEST SUBJECT:', cleanupSubject, '===');
console.log();

// Pre-cleanup: delete any existing attendance for this subject
db.prepare('DELETE FROM attendance WHERE subject = ?').run(cleanupSubject);
db.prepare('DELETE FROM qr_sessions WHERE subject = ?').run(cleanupSubject);
console.log('[CLEANUP] Removed any prior data for subject:', cleanupSubject);

// Also clean up any records from previous runs with the prefix
db.prepare("DELETE FROM attendance WHERE subject LIKE 'INVESTIGATE_TEST_%'").run();
db.prepare("DELETE FROM qr_sessions WHERE subject LIKE 'INVESTIGATE_TEST_%'").run();
console.log('[CLEANUP] Removed all INVESTIGATE_TEST_ records from previous runs');

// ─── STEP 1: Simulate QR Generation (like generateQrHandler) ──
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('STEP 1: GENERATE QR CODE');
console.log('════════════════════════════════════════════════════════');

// What the faculty submits (simulating req.body)
const REQUEST_BODY = {
  subject: cleanupSubject,
  attendanceDate: new Date().toISOString().split('T')[0], // today
  expiryMinutes: 10
};
console.log();
console.log('[1a] Request body received at /qr/generate:');
console.log('  subject:', JSON.stringify(REQUEST_BODY.subject));
console.log('  attendanceDate:', JSON.stringify(REQUEST_BODY.attendanceDate));
console.log('  expiryMinutes:', REQUEST_BODY.expiryMinutes);

// Faculty lookup (simulating controller logic)
// Using faculty id=1 (Demo Faculty, userId=2)
const FACULTY_USER_ID = 2; // Demo Faculty's users.id
const faculty = getFacultyByUserId(FACULTY_USER_ID);
console.log();
console.log('[1b] Faculty lookup:');
console.log('  req.user.id:', FACULTY_USER_ID);
console.log('  getFacultyByUserId(', FACULTY_USER_ID, '):', JSON.stringify(faculty));
console.log('  ⇒ faculty.id:', faculty.id);

// Generate token and session
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + REQUEST_BODY.expiryMinutes * 60 * 1000).toISOString();

console.log();
console.log('[1c] Generated token:', token);

// Insert QR session
const insertResult = createQrSession({
  token,
  facultyId: faculty.id,
  subject: REQUEST_BODY.subject,
  attendanceDate: REQUEST_BODY.attendanceDate,
  expiresAt
});

console.log('[1d] Insert result (createQrSession):');
console.log('  lastInsertRowid:', insertResult.lastInsertRowid);
console.log('  changes:', insertResult.changes);

// ─── STEP 2: Read back the inserted row ──────────────────────
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('STEP 2: READ INSERTED QR SESSION');
console.log('════════════════════════════════════════════════════════');

const insertedSession = getQrSessionByToken(token);
console.log();
console.log('[2a] QR session retrieved by token:');
console.log('  id:', insertedSession.id);
console.log('  token:', insertedSession.token);
console.log('  facultyId:', insertedSession.facultyId);
console.log('  subject:', JSON.stringify(insertedSession.subject));
console.log('  attendanceDate:', JSON.stringify(insertedSession.attendanceDate));
console.log('  expiresAt:', insertedSession.expiresAt);
console.log('  isActive:', insertedSession.isActive);
console.log('  createdAt:', insertedSession.createdAt);

// Verify it's the same session we just created
console.log();
console.log('[2b] Verification: Is this the session we just created?');
console.log('  Token matches:', insertedSession.token === token ? '✓ YES' : '✗ NO');
console.log('  Subject matches:', insertedSession.subject === REQUEST_BODY.subject ? '✓ YES' : '✗ NO');
console.log('  attendanceDate matches:', insertedSession.attendanceDate === REQUEST_BODY.attendanceDate ? '✓ YES' : '✗ NO');

// ─── STEP 3: Simulate Student Scanning (markAttendanceFromQr) ──
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('STEP 3: STUDENT MARKS ATTENDANCE VIA QR');
console.log('════════════════════════════════════════════════════════');

// What the student sends to /qr/mark-attendance
// Student scans QR → gets token from URL → sends POST with { token }
console.log();
console.log('[3a] Request body received at /qr/mark-attendance:');
console.log('  token:', token);

// Student user (Demo Student has users.id=3)
const STUDENT_USER_ID = 3; // Demo Student's users.id
console.log('  req.user.id (from JWT):', STUDENT_USER_ID);

const student = getStudentByUserId(STUDENT_USER_ID);
console.log('  getStudentByUserId(', STUDENT_USER_ID, '):', JSON.stringify(student));
console.log('  ⇒ student.id:', student.id);

// ─── STEP 4: Validate QR session (simulating validateQrSession) ──
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('STEP 4: VALIDATE QR SESSION');
console.log('════════════════════════════════════════════════════════');

const sessionFromScan = getQrSessionByToken(token);
console.log();
console.log('[4a] Session retrieved with token from student request:');
console.log('  session.id:', sessionFromScan.id);
console.log('  token:', sessionFromScan.token);
console.log('  facultyId:', sessionFromScan.facultyId);
console.log('  subject:', JSON.stringify(sessionFromScan.subject));
console.log('  attendanceDate:', JSON.stringify(sessionFromScan.attendanceDate));
console.log('  expiresAt:', sessionFromScan.expiresAt);
console.log('  isActive:', sessionFromScan.isActive);

// Verify it's THE SAME session
console.log();
console.log('[4b] Is this the SAME session that was just generated?');
console.log('  Same id:', sessionFromScan.id === insertedSession.id ? '✓ YES' : '✗ NO');
console.log('  Same token:', sessionFromScan.token === insertedSession.token ? '✓ YES' : '✗ NO');
console.log('  Same subject:', JSON.stringify(sessionFromScan.subject), '===', JSON.stringify(insertedSession.subject), '→', sessionFromScan.subject === insertedSession.subject ? '✓ YES' : '✗ NO');

// Check expiry
console.log();
console.log('[4c] Expiry check:');
console.log('  expiresAt:', sessionFromScan.expiresAt);
console.log('  now:', new Date().toISOString());
console.log('  expired?', new Date(sessionFromScan.expiresAt) < new Date() ? 'YES (would reject)' : 'NO (still valid)');

// Check active
console.log('  isActive:', sessionFromScan.isActive);
console.log('  active?', sessionFromScan.isActive ? 'YES' : 'NO (would reject)');

// ─── STEP 5: The actual duplicate check ─────────────────────
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('STEP 5: DUPLICATE CHECK (findDuplicateAttendance)');
console.log('════════════════════════════════════════════════════════');

const dupCheckParams = {
  studentId: student.id,
  subject: sessionFromScan.subject,
  attendanceDate: sessionFromScan.attendanceDate
};

console.log();
console.log('[5a] Values passed to findDuplicateAttendance():');
console.log('  studentId:', dupCheckParams.studentId);
console.log('  facultyId:', sessionFromScan.facultyId, '(not used in query)');
console.log('  subject:', JSON.stringify(dupCheckParams.subject));
console.log('  attendanceDate:', JSON.stringify(dupCheckParams.attendanceDate));

// Print the EXACT SQL query
const sqlQuery = 'SELECT id FROM attendance WHERE studentId = ? AND subject = ? AND attendanceDate = ?';
console.log();
console.log('[5b] Exact SQL query that will be executed:');
console.log('  ', sqlQuery);
console.log('  Bound parameters: [', dupCheckParams.studentId, ',', JSON.stringify(dupCheckParams.subject), ',', JSON.stringify(dupCheckParams.attendanceDate), ']');

// Execute with logging
const sqliteDebug = db.prepare(sqlQuery);
const dupResult = sqliteDebug.get(dupCheckParams.studentId, dupCheckParams.subject, dupCheckParams.attendanceDate);

console.log();
console.log('[5c] Query result:');
console.log('  Result:', JSON.stringify(dupResult));

if (dupResult) {
  console.log('  → DUPLICATE DETECTED! Match found: attendance.id =', dupResult.id);
  
  // Print the matching row in full
  const matchingRow = db.prepare('SELECT * FROM attendance WHERE id = ?').get(dupResult.id);
  console.log();
  console.log('[5d] Full matching attendance row:');
  console.log('  id:', matchingRow.id);
  console.log('  studentId:', matchingRow.studentId);
  console.log('  facultyId:', matchingRow.facultyId);
  console.log('  subject:', JSON.stringify(matchingRow.subject));
  console.log('  attendanceDate:', JSON.stringify(matchingRow.attendanceDate));
  console.log('  status:', matchingRow.status);
  console.log('  remarks:', JSON.stringify(matchingRow.remarks));
  console.log('  createdAt:', matchingRow.createdAt);
  
  // Compare byte-by-byte
  console.log();
  console.log('[5e] Byte-level comparison of subjects:');
  console.log('  Requested subject bytes:', Buffer.from(dupCheckParams.subject).toString('hex'));
  console.log('  DB subject bytes:        ', Buffer.from(matchingRow.subject).toString('hex'));
  console.log('  Exact match:', dupCheckParams.subject === matchingRow.subject ? '✓ YES' : '✗ NO');
  console.log('  Length match:', dupCheckParams.subject.length === matchingRow.subject.length ? '✓ YES' : '✗ NO (requested=' + dupCheckParams.subject.length + ', db=' + matchingRow.subject.length + ')');
  
  // Check for hidden characters
  for (let i = 0; i < dupCheckParams.subject.length; i++) {
    const c = dupCheckParams.subject.charCodeAt(i);
    if (c < 32 || c > 126) {
      console.log('  ⚠ Non-printable char at position', i, ': charCode =', c);
    }
  }
} else {
  console.log('  → NO duplicate found. Would proceed to INSERT new attendance record.');
}

// ─── STEP 6: Check for other active sessions (potential mix-up) ──
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('STEP 6: VERIFY NO SESSION CONFUSION');
console.log('════════════════════════════════════════════════════════');

// Check all active sessions
const activeSessions = db.prepare('SELECT id, token, subject, attendanceDate, isActive FROM qr_sessions WHERE isActive = 1 AND expiresAt > datetime(\'now\')').all();
console.log();
console.log('[6a] Total active (non-expired) sessions:', activeSessions.length);

// Check if any other session has the same subject+date
const sameSubjectSessions = db.prepare('SELECT id, token, subject, attendanceDate FROM qr_sessions WHERE subject = ? AND attendanceDate = ? AND isActive = 1').all(cleanupSubject, REQUEST_BODY.attendanceDate);
console.log('[6b] Other active sessions with same subject+date:', sameSubjectSessions.length);
if (sameSubjectSessions.length > 1) {
  sameSubjectSessions.forEach(s => console.log('  session id=' + s.id + ' token=' + s.token));
  console.log('  ⚠ MULTIPLE ACTIVE SESSIONS WITH SAME SUBJECT+DATE!');
}

// Check for ANY existing attendance with this subject+date (all students)
console.log();
const existingAny = db.prepare('SELECT id, studentId, subject, attendanceDate FROM attendance WHERE subject = ? AND attendanceDate = ?').all(cleanupSubject, REQUEST_BODY.attendanceDate);
console.log('[6c] Any existing attendance with this subject+date (all students):');
console.log('  count:', existingAny.length);
existingAny.forEach(r => console.log('  id=' + r.id + ' studentId=' + r.studentId + ' subject=' + JSON.stringify(r.subject)));

// Check if the duplicate would have been found specifically for THIS student
const existingForStudent = db.prepare('SELECT id, subject, attendanceDate, remarks FROM attendance WHERE studentId = ? AND attendanceDate = ?').all(student.id, REQUEST_BODY.attendanceDate);
console.log();
console.log('[6d] Existing attendance for student', student.id, 'on date', REQUEST_BODY.attendanceDate, ':');
console.log('  count:', existingForStudent.length);
existingForStudent.forEach(r => console.log('  id=' + r.id + ' subject=' + JSON.stringify(r.subject) + ' remarks=' + JSON.stringify(r.remarks)));

// ─── REPORT ──────────────────────────────────────────────────
console.log();
console.log('════════════════════════════════════════════════════════');
console.log('INVESTIGATION REPORT');
console.log('════════════════════════════════════════════════════════');

if (dupResult) {
  console.log();
  console.log('❌ DUPLICATE CHECK FAILED (409 error)');
  console.log('   The duplicate check found an existing record with:');
  console.log('   - studentId:', dupCheckParams.studentId);
  console.log('   - subject:', JSON.stringify(dupCheckParams.subject));
  console.log('   - attendanceDate:', dupCheckParams.attendanceDate);
  console.log();
  console.log('   MATCH: attendance id=' + dupResult.id);
  
  if (dupCheckParams.subject === matchingRow.subject) {
    console.log('   REASON: Subject matches EXACTLY (same case, same bytes).');
    console.log('   This record already exists in the database for this student/subject/date.');
  } else {
    console.log('   NOTE: Subject does NOT match byte-for-byte! Different case or characters.');
    console.log('   Requested:', JSON.stringify(dupCheckParams.subject));
    console.log('   In DB:    ', JSON.stringify(matchingRow.subject));
  }
} else {
  console.log();
  console.log('✅ DUPLICATE CHECK PASSED');
  console.log('   Attendance would be created successfully.');
  console.log('   No duplicate exists in the database for this student/subject/date combination.');
}

// Cleanup test data
console.log();
console.log('[CLEANUP] Removing test data...');
db.prepare('DELETE FROM attendance WHERE subject = ?').run(cleanupSubject);
db.prepare('DELETE FROM qr_sessions WHERE subject = ?').run(cleanupSubject);
console.log('[CLEANUP] Done.');
