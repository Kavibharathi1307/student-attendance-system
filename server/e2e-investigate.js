// ============================================================
// E2E RUNTIME INVESTIGATION
// Starts the server, makes actual HTTP requests,
// and traces every value through the full flow.
// ============================================================

import { createApp } from './app.js';
import { db } from './config/database.js';

const PORT = 5678; // Use a different port to avoid conflicts
const BASE = `http://localhost:${PORT}/api`;

// ─── Helper: HTTP request using fetch ───────────────
async function api(method, path, body = null, token = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

// ─── Unique test subject ────────────────────────────
const testId = Date.now();
const testSubject = `E2E_TEST_${testId}`;
const testDate = new Date().toISOString().split('T')[0]; // today

console.log('══════════════════════════════════════════════════════════════');
console.log('  E2E RUNTIME INVESTIGATION');
console.log('  Test ID:', testId);
console.log('  Subject:', testSubject);
console.log('  Date:', testDate);
console.log('══════════════════════════════════════════════════════════════');
console.log();

// Pre-cleanup
db.prepare('DELETE FROM attendance WHERE subject = ?').run(testSubject);
db.prepare('DELETE FROM qr_sessions WHERE subject = ?').run(testSubject);
console.log('[SETUP] Cleaned any prior data for subject:', testSubject);

// ─── Start server ──────────────────────────────────
const app = createApp();
let server;

await new Promise((resolve) => {
  server = app.listen(PORT, () => {
    console.log('[SERVER] Started on port', PORT);
    resolve();
  });
});

try {
  // ═════════════════════════════════════════════════════════
  // STEP 1: Login as Faculty
  // ═════════════════════════════════════════════════════════
  console.log();
  console.log('──────────────────────────────────────────────────────────');
  console.log('STEP 1: FACULTY LOGIN');
  console.log('──────────────────────────────────────────────────────────');

  const facultyLogin = await api('POST', '/auth/login', {
    email: 'faculty@student.com',
    password: 'Faculty@123',
    role: 'faculty'
  });

  console.log('  Login response status:', facultyLogin.status);
  console.log('  User:', JSON.stringify(facultyLogin.data.user));
  console.log('  Token:', facultyLogin.data.token ? facultyLogin.data.token.substring(0, 20) + '...' : 'NONE');

  if (!facultyLogin.data.token) {
    throw new Error('Faculty login failed!');
  }

  const FACULTY_TOKEN = facultyLogin.data.token;
  const FACULTY_USER_ID = facultyLogin.data.user.id;

  // ═════════════════════════════════════════════════════════
  // STEP 2: Generate QR Code
  // ═════════════════════════════════════════════════════════
  console.log();
  console.log('──────────────────────────────────────────────────────────');
  console.log('STEP 2: GENERATE QR CODE');
  console.log('──────────────────────────────────────────────────────────');

  const REQUEST_BODY = {
    subject: testSubject,
    attendanceDate: testDate,
    expiryMinutes: 10
  };

  console.log('  Request body sent to POST /qr/generate:');
  console.log('    subject:', JSON.stringify(REQUEST_BODY.subject));
  console.log('    attendanceDate:', JSON.stringify(REQUEST_BODY.attendanceDate));
  console.log('    expiryMinutes:', REQUEST_BODY.expiryMinutes);

  const qrResponse = await api('POST', '/qr/generate', REQUEST_BODY, FACULTY_TOKEN);

  console.log('  Response status:', qrResponse.status);
  console.log('  Response body:', JSON.stringify(qrResponse.data, null, 2));

  if (qrResponse.status !== 201) {
    throw new Error('QR generation failed!');
  }

  const QR_TOKEN = qrResponse.data.token;
  const QR_SESSION_ID = qrResponse.data.id;

  console.log();
  console.log('  QR Token:', QR_TOKEN);
  console.log('  QR Session ID:', QR_SESSION_ID);

  // ═════════════════════════════════════════════════════════
  // STEP 3: Read back the QR session from DB
  // ═════════════════════════════════════════════════════════
  console.log();
  console.log('──────────────────────────────────────────────────────────');
  console.log('STEP 3: READ QR SESSION FROM DATABASE');
  console.log('──────────────────────────────────────────────────────────');

  const insertedSession = db.prepare('SELECT * FROM qr_sessions WHERE token = ?').get(QR_TOKEN);

  console.log('  id:', insertedSession.id);
  console.log('  token:', insertedSession.token);
  console.log('  facultyId:', insertedSession.facultyId);
  console.log('  subject:', JSON.stringify(insertedSession.subject));
  console.log('  attendanceDate:', JSON.stringify(insertedSession.attendanceDate));
  console.log('  expiresAt:', insertedSession.expiresAt);
  console.log('  isActive:', insertedSession.isActive);
  console.log('  createdAt:', insertedSession.createdAt);

  // Verify
  const verifySession = (
    insertedSession.token === QR_TOKEN
    && insertedSession.subject === testSubject
    && insertedSession.attendanceDate === testDate
  );
  console.log('  Verifies correctly:', verifySession ? '✓ YES' : '✗ NO');

  // ═════════════════════════════════════════════════════════
  // STEP 4: Login as Student
  // ═════════════════════════════════════════════════════════
  console.log();
  console.log('──────────────────────────────────────────────────────────');
  console.log('STEP 4: STUDENT LOGIN');
  console.log('──────────────────────────────────────────────────────────');

  const studentLogin = await api('POST', '/auth/login', {
    email: 'student@student.com',
    password: 'Student@123',
    role: 'student'
  });

  console.log('  Login response status:', studentLogin.status);
  console.log('  User:', JSON.stringify(studentLogin.data.user));
  console.log('  Token:', studentLogin.data.token ? studentLogin.data.token.substring(0, 20) + '...' : 'NONE');

  if (!studentLogin.data.token) {
    throw new Error('Student login failed!');
  }

  const STUDENT_TOKEN = studentLogin.data.token;
  const STUDENT_USER_ID = studentLogin.data.user.id;

  console.log('  Student users.id:', STUDENT_USER_ID);

  // Look up the student record
  const studentRecord = db.prepare('SELECT * FROM students WHERE userId = ?').get(STUDENT_USER_ID);
  console.log('  Student record (students table):', JSON.stringify(studentRecord));
  console.log('  ⇒ student.id that will be used:', studentRecord.id);

  // ═════════════════════════════════════════════════════════
  // STEP 5: Mark Attendance via QR
  // ═════════════════════════════════════════════════════════
  console.log();
  console.log('──────────────────────────────────────────────────────────');
  console.log('STEP 5: MARK ATTENDANCE VIA QR');
  console.log('──────────────────────────────────────────────────────────');

  console.log('  Request body sent to POST /qr/mark-attendance:');
  console.log('    token:', QR_TOKEN);

  console.log();
  console.log('  JWT payload (decoded):');
  const jwtParts = STUDENT_TOKEN.split('.');
  const jwtPayload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
  console.log('    id:', jwtPayload.id);
  console.log('    role:', jwtPayload.role);
  console.log('    email:', jwtPayload.email);

  console.log();
  console.log('  This means req.user.id =', jwtPayload.id);
  console.log('  getStudentByUserId(', jwtPayload.id, ') will return student.id =', studentRecord.id);

  const attendanceResponse = await api('POST', '/qr/mark-attendance', { token: QR_TOKEN }, STUDENT_TOKEN);

  console.log();
  console.log('  Response status:', attendanceResponse.status);
  console.log('  Response body:', JSON.stringify(attendanceResponse.data, null, 2));

  if (attendanceResponse.status === 409) {
    // ═════════════════════════════════════════════════════════
    // DUPLICATE DETECTED! Trace the cause.
    // ═════════════════════════════════════════════════════════
    console.log();
    console.log('  ❌ DUPLICATE ERROR DETECTED!');
    console.log('  Error message:', attendanceResponse.data.error || attendanceResponse.data.message);

    // Check what the duplicate check would find
    console.log();
    console.log('  DUPLICATE CHECK DEBUG:');
    console.log('  Calling findDuplicateAttendance with:');
    console.log('    studentId:', studentRecord.id);
    console.log('    subject:', JSON.stringify(testSubject));
    console.log('    attendanceDate:', testDate);

    const sql = 'SELECT id, studentId, facultyId, subject, attendanceDate, status, remarks, createdAt FROM attendance WHERE studentId = ? AND subject = ? AND attendanceDate = ?';
    const dupMatch = db.prepare(sql).get(studentRecord.id, testSubject, testDate);

    if (dupMatch) {
      console.log();
      console.log('  ⚠ MATCH FOUND! Row:', JSON.stringify(dupMatch, null, 2));

      // Check byte comparison
      const dupSql = 'SELECT id FROM attendance WHERE studentId = ? AND subject = ? AND attendanceDate = ?';
      const dupResult = db.prepare(dupSql).get(studentRecord.id, testSubject, testDate);
      console.log('  Query result:', JSON.stringify(dupResult));

      // Check for SQLite case sensitivity
      const caseTest = db.prepare("SELECT (? = ?) AS result").get(testSubject, dupMatch.subject);
      console.log('  SQLite case comparison (subject1 = subject2):', caseTest.result);
      console.log('  Requested subject length:', testSubject.length);
      console.log('  DB subject length:', dupMatch.subject.length);
      console.log('  Requested subject bytes:', Buffer.from(testSubject).toString('hex'));
      console.log('  DB subject bytes:        ', Buffer.from(dupMatch.subject).toString('hex'));

      // When was this record created?
      console.log();
      console.log('  This row was created at:', dupMatch.createdAt);
      console.log('  This is', Date.now() - new Date(dupMatch.createdAt).getTime(), 'ms ago');

      // Check if the record was created BEFORE or DURING this test
      const matchingSession = db.prepare('SELECT * FROM qr_sessions WHERE token = ?').get(QR_TOKEN);
      if (matchingSession) {
        console.log('  Current QR session created at:', matchingSession.createdAt);
        console.log('  Duplicate was created before current QR?',
          new Date(dupMatch.createdAt) < new Date(matchingSession.createdAt) ? '✓ YES (pre-existing)' : '✗ NO (created during/before test)');
      }
    } else {
      console.log('  No match found (unexpected - the error suggests a match exists)');
    }

    // Check ALL attendance for this student today
    console.log();
    console.log('  ALL attendance for student', studentRecord.id, 'on', testDate, ':');
    const allToday = db.prepare('SELECT * FROM attendance WHERE studentId = ? AND attendanceDate = ?').all(studentRecord.id, testDate);
    allToday.forEach(r => console.log('    id=' + r.id + ' subject=' + JSON.stringify(r.subject) + ' status=' + r.status));

  } else if (attendanceResponse.status === 201) {
    // ═════════════════════════════════════════════════════════
    // SUCCESS! Attendance marked.
    // ═════════════════════════════════════════════════════════
    console.log();
    console.log('  ✅ ATTENDANCE CREATED SUCCESSFULLY!');
    console.log('  Attendance ID:', attendanceResponse.data.attendanceId);

    // Verify it was inserted
    const newAttendance = db.prepare('SELECT * FROM attendance WHERE id = ?').get(attendanceResponse.data.attendanceId);
    console.log('  New record:', JSON.stringify(newAttendance));
  } else {
    console.log();
    console.log('  Unexpected response:', attendanceResponse.status);
    console.log('  Body:', JSON.stringify(attendanceResponse.data));
  }

} finally {
  // Cleanup
  console.log();
  console.log('──────────────────────────────────────────────────────────');
  console.log('CLEANUP');
  console.log('──────────────────────────────────────────────────────────');
  db.prepare('DELETE FROM attendance WHERE subject = ?').run(testSubject);
  db.prepare('DELETE FROM qr_sessions WHERE subject = ?').run(testSubject);
  console.log('  Cleaned up test data for subject:', testSubject);

  // Stop server
  server.close(() => {
    console.log('  Server stopped.');
  });
}
