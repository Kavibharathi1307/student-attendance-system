import http from 'node:http';

const BASE = 'http://localhost:5000/api';
let results = { passed: 0, failed: 0, tests: [] };

function request(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(cleanPath, BASE.endsWith('/') ? BASE : BASE + '/');
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: `Request failed: ${e.message}` }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, condition, detail = '') {
  if (condition) {
    results.passed++;
    console.log(`  ✓ ${name}`);
  } else {
    results.failed++;
    console.log(`  ✗ ${name} ${detail ? '-- ' + detail : ''}`);
  }
  results.tests.push({ name, passed: condition, detail });
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}`);
}

async function run() {
  console.log('COMPREHENSIVE API TEST SUITE');
  console.log('='.repeat(60));

  // ===== LOGIN CREDENTIALS =====
  let adminToken, facultyToken, studentToken;
  let adminUser, facultyUser, studentUser;
  let createdStudentId, createdFacultyId, createdAttendanceId;
  let qrToken;

  // ===== AUTHENTICATION TESTS =====
  section('AUTHENTICATION');

  // Login with wrong password
  let r = await request('POST', '/auth/login', { email: 'admin@student.com', password: 'wrongpass', role: 'admin' });
  test('Login with wrong password returns 401', r.status === 401, `Got ${r.status}`);

  // Login with invalid email format
  r = await request('POST', '/auth/login', { email: 'notanemail', password: 'Admin@123', role: 'admin' });
  test('Login with invalid email returns 400', r.status === 400, `Got ${r.status}`);

  // Login with empty fields
  r = await request('POST', '/auth/login', { email: '', password: '', role: '' });
  test('Login with empty fields returns 400', r.status === 400, `Got ${r.status}`);

  // Login with invalid role
  r = await request('POST', '/auth/login', { email: 'admin@student.com', password: 'Admin@123', role: 'superadmin' });
  test('Login with invalid role returns 400', r.status === 400 || r.status === 401, `Got ${r.status}`);

  // Valid Admin Login
  r = await request('POST', '/auth/login', { email: 'admin@student.com', password: 'Admin@123', role: 'admin' });
  test('Admin login returns 200', r.status === 200, `Got ${r.status}`);
  if (r.status === 200) {
    adminToken = r.body.token;
    adminUser = r.body.user;
    test('Admin login returns token', !!adminToken);
    test('Admin login returns user with role admin', r.body.user?.role === 'admin');
  }

  // Valid Faculty Login
  r = await request('POST', '/auth/login', { email: 'faculty@student.com', password: 'Faculty@123', role: 'faculty' });
  test('Faculty login returns 200', r.status === 200, `Got ${r.status}`);
  if (r.status === 200) {
    facultyToken = r.body.token;
    facultyUser = r.body.user;
    test('Faculty login returns token', !!facultyToken);
    test('Faculty login returns user with role faculty', r.body.user?.role === 'faculty');
  }

  // Valid Student Login
  r = await request('POST', '/auth/login', { email: 'student@student.com', password: 'Student@123', role: 'student' });
  test('Student login returns 200', r.status === 200, `Got ${r.status}`);
  if (r.status === 200) {
    studentToken = r.body.token;
    studentUser = r.body.user;
    test('Student login returns token', !!studentToken);
    test('Student login returns user with role student', r.body.user?.role === 'student');
  }

  // Admin login with wrong role
  r = await request('POST', '/auth/login', { email: 'admin@student.com', password: 'Admin@123', role: 'student' });
  test('Admin login with student role returns 401', r.status === 401, `Got ${r.status}`);

  // ===== PROTECTED ROUTES =====
  section('PROTECTED ROUTES');

  r = await request('GET', '/students');
  test('Protected route without token returns 401', r.status === 401, `Got ${r.status}`);

  r = await request('GET', '/students', null, 'invalid-jwt-token');
  test('Protected route with invalid JWT returns 401', r.status === 401 || r.status === 403, `Got ${r.status}`);

  r = await request('GET', '/admin/dashboard', null, studentToken);
  test('Student accessing admin route returns 403', r.status === 403, `Got ${r.status}`);

  r = await request('GET', '/admin/dashboard', null, facultyToken);
  test('Faculty accessing admin route returns 403', r.status === 403, `Got ${r.status}`);

  // ===== STUDENT MANAGEMENT (ADMIN) =====
  section('STUDENT MANAGEMENT (CRUD)');

  // Create student
  r = await request('POST', '/students', {
    fullName: 'Test Student',
    email: 'teststudent@test.com',
    studentId: 'TEST001',
    department: 'Computer Science',
    phone: '1234567890',
    address: 'Test Address'
  }, adminToken);
  test('Create student returns 201', r.status === 201, `Got ${r.status}`);
  if (r.status === 201) {
    createdStudentId = r.body.student?.id || r.body.data?.id || r.body.id;
    test('Create student returns student data', !!createdStudentId);
  }

  // Create duplicate student (same email)
  r = await request('POST', '/students', {
    fullName: 'Another Student',
    email: 'teststudent@test.com',
    studentId: 'TEST002'
  }, adminToken);
  test('Create duplicate student email returns 409', r.status === 409, `Got ${r.status}`);

  // Create duplicate student (same studentId)
  r = await request('POST', '/students', {
    fullName: 'Another Student',
    email: 'teststudent2@test.com',
    studentId: 'TEST001',
    department: 'Computer Science'
  }, adminToken);
  test('Create duplicate student ID returns 409', r.status === 409, `Got ${r.status}`);

  // Create student with empty fields
  r = await request('POST', '/students', {}, adminToken);
  test('Create student with empty fields returns 400', r.status === 400, `Got ${r.status}`);

  // Create student with invalid email
  r = await request('POST', '/students', {
    fullName: 'Bad Email',
    email: 'notanemail',
    studentId: 'TEST003',
    department: 'CS'
  }, adminToken);
  test('Create student with invalid email returns 400', r.status === 400, `Got ${r.status}`);

  // List students
  r = await request('GET', '/students', null, adminToken);
  test('List students returns 200', r.status === 200, `Got ${r.status}`);
  if (r.status === 200) {
    test('List students returns array', Array.isArray(r.body?.students || r.body?.data || r.body), `Type: ${typeof r.body}`);
  }

  // Get student by ID
  if (createdStudentId) {
    r = await request('GET', `/students/${createdStudentId}`, null, adminToken);
    test('Get student by ID returns 200', r.status === 200, `Got ${r.status}`);
  }

  // Get non-existent student
  r = await request('GET', '/students/99999', null, adminToken);
  test('Get non-existent student returns 404', r.status === 404, `Got ${r.status}`);

  // Update student
  if (createdStudentId) {
    r = await request('PUT', `/students/${createdStudentId}`, { fullName: 'Updated Student' }, adminToken);
    test('Update student returns 200', r.status === 200, `Got ${r.status}`);

    // Delete student
    r = await request('DELETE', `/students/${createdStudentId}`, null, adminToken);
    test('Delete student returns 200', r.status === 200 || r.status === 204, `Got ${r.status}`);
  }

  // ===== FACULTY MANAGEMENT (ADMIN) =====
  section('FACULTY MANAGEMENT (CRUD)');

  // Create faculty
  r = await request('POST', '/faculty', {
    fullName: 'Test Faculty',
    email: 'testfaculty@test.com',
    department: 'Computer Science'
  }, adminToken);
  test('Create faculty returns 201', r.status === 201, `Got ${r.status}`);
  if (r.status === 201) {
    createdFacultyId = r.body.faculty?.id || r.body.data?.id || r.body.id;
    test('Create faculty returns faculty data', !!createdFacultyId);
  }

  // Create duplicate faculty (same email)
  r = await request('POST', '/faculty', {
    fullName: 'Another Faculty',
    email: 'testfaculty@test.com',
    department: 'Mathematics'
  }, adminToken);
  test('Create duplicate faculty email returns 409', r.status === 409, `Got ${r.status}`);

  // Create faculty with empty fields
  r = await request('POST', '/faculty', {}, adminToken);
  test('Create faculty with empty fields returns 400', r.status === 400, `Got ${r.status}`);

  // List faculty
  r = await request('GET', '/faculty', null, adminToken);
  test('List faculty returns 200', r.status === 200, `Got ${r.status}`);

  // Get faculty by ID
  if (createdFacultyId) {
    r = await request('GET', `/faculty/${createdFacultyId}`, null, adminToken);
    test('Get faculty by ID returns 200', r.status === 200, `Got ${r.status}`);
  }

  // Get non-existent faculty
  r = await request('GET', '/faculty/99999', null, adminToken);
  test('Get non-existent faculty returns 404', r.status === 404, `Got ${r.status}`);

  // Update faculty
  if (createdFacultyId) {
    r = await request('PUT', `/faculty/${createdFacultyId}`, { fullName: 'Updated Faculty' }, adminToken);
    test('Update faculty returns 200', r.status === 200, `Got ${r.status}`);
  }

  // ===== QR SESSIONS =====
  section('QR SESSIONS');

  // Faculty generates QR
  r = await request('POST', '/qr/generate', {
    subject: 'Mathematics',
    attendanceDate: '2026-07-07',
    expiryMinutes: 30
  }, facultyToken);
  test('Generate QR returns 201', r.status === 201, `Got ${r.status}`);
  if (r.status === 201) {
    qrToken = r.body.token || r.body.data?.token;
    test('Generate QR returns token', !!qrToken);
  }

  // Generate QR with past date
  r = await request('POST', '/qr/generate', {
    subject: 'Physics',
    attendanceDate: '2020-01-01',
    expiryMinutes: 30
  }, facultyToken);
  test('Generate QR with past date returns 400', r.status === 400, `Got ${r.status}`);

  // Generate QR with invalid expiry (0 minutes)
  r = await request('POST', '/qr/generate', {
    subject: 'Physics',
    attendanceDate: '2026-07-07',
    expiryMinutes: 0
  }, facultyToken);
  test('Generate QR with 0 expiry returns 400', r.status === 400, `Got ${r.status}`);

  // Generate QR with expiry > 60
  r = await request('POST', '/qr/generate', {
    subject: 'Physics',
    attendanceDate: '2026-07-07',
    expiryMinutes: 120
  }, facultyToken);
  test('Generate QR with expiry > 60 returns 400', r.status === 400, `Got ${r.status}`);

  // Generate QR with invalid date format
  r = await request('POST', '/qr/generate', {
    subject: 'Physics',
    attendanceDate: '07-07-2026',
    expiryMinutes: 30
  }, facultyToken);
  test('Generate QR with invalid date format returns 400', r.status === 400, `Got ${r.status}`);

  // Validate QR token
  if (qrToken) {
    r = await request('POST', '/qr/validate', { token: qrToken }, studentToken);
    test('Validate valid QR returns 200', r.status === 200, `Got ${r.status}`);

    // Validate invalid token
    r = await request('POST', '/qr/validate', { token: 'invalid-token-12345' }, studentToken);
    test('Validate invalid QR token returns 404', r.status === 404, `Got ${r.status}`);

    // Validate empty token
    r = await request('POST', '/qr/validate', { token: '' }, studentToken);
    test('Validate empty QR token returns 400', r.status === 400, `Got ${r.status}`);
  }

  // Faculty cannot mark attendance via QR (should be student)
  if (qrToken) {
    r = await request('POST', '/qr/mark-attendance', { token: qrToken }, facultyToken);
    test('Faculty marking QR attendance (wrong role) returns 403', r.status === 403, `Got ${r.status}`);
  }

  // Student marks attendance via QR
  if (qrToken && studentToken) {
    r = await request('POST', '/qr/mark-attendance', { token: qrToken }, studentToken);
    test('Student marks attendance via QR returns 201', r.status === 201, `Got ${r.status}`);

    // Reusing QR token (duplicate attendance)
    r = await request('POST', '/qr/mark-attendance', { token: qrToken }, studentToken);
    test('Reusing QR token returns 409 or 400 (attendance already marked)', 
         r.status === 409 || r.status === 400, `Got ${r.status}`);
  }

  // List QR sessions
  r = await request('GET', '/qr/sessions', null, adminToken);
  test('List QR sessions returns 200', r.status === 200, `Got ${r.status}`);

  r = await request('GET', '/qr/sessions/active', null, adminToken);
  test('List active QR sessions returns 200', r.status === 200, `Got ${r.status}`);

  // ===== ATTENDANCE =====
  section('ATTENDANCE MANAGEMENT');

  // Create attendance record
  r = await request('GET', '/students', null, adminToken);
  let allStudents = [];
  if (r.status === 200) {
    allStudents = r.body?.students || r.body?.data || r.body || [];
    if (!Array.isArray(allStudents)) allStudents = [];
  }
  let firstStudentId = allStudents[0]?.id;
  let facultyListResponse = await request('GET', '/faculty', null, adminToken);
  let allFaculty = [];
  if (facultyListResponse.status === 200) {
    allFaculty = facultyListResponse.body?.faculty || facultyListResponse.body?.data || facultyListResponse.body || [];
    if (!Array.isArray(allFaculty)) allFaculty = [];
  }
  let firstFacultyId = allFaculty[0]?.id;

  if (firstStudentId && firstFacultyId) {
    r = await request('POST', '/attendance', {
      studentId: firstStudentId,
      facultyId: firstFacultyId,
      subject: 'Mathematics',
      attendanceDate: '2026-07-07',
      status: 'Present',
      remarks: 'Test attendance'
    }, adminToken);
    test('Create attendance returns 201', r.status === 201, `Got ${r.status}`);
    if (r.status === 201) {
      createdAttendanceId = r.body.attendance?.id || r.body.data?.id || r.body.id;
    }
  }

  // Create duplicate attendance
  if (firstStudentId && firstFacultyId) {
    r = await request('POST', '/attendance', {
      studentId: firstStudentId,
      facultyId: firstFacultyId,
      subject: 'Mathematics',
      attendanceDate: '2026-07-07',
      status: 'Present'
    }, adminToken);
    test('Create duplicate attendance returns 409', r.status === 409, `Got ${r.status}`);
  }

  // Create attendance with invalid status
  if (firstStudentId && firstFacultyId) {
    r = await request('POST', '/attendance', {
      studentId: firstStudentId,
      facultyId: firstFacultyId,
      subject: 'Mathematics',
      attendanceDate: '2026-07-07',
      status: 'Unknown'
    }, adminToken);
    test('Create attendance with invalid status returns 400', r.status === 400, `Got ${r.status}`);
  }

  // List attendance
  r = await request('GET', '/attendance', null, adminToken);
  test('List attendance returns 200', r.status === 200, `Got ${r.status}`);

  // Get attendance history
  r = await request('GET', '/attendance/history', null, adminToken);
  test('Attendance history returns 200', r.status === 200, `Got ${r.status}`);

  // Get attendance by ID
  if (createdAttendanceId) {
    r = await request('GET', `/attendance/${createdAttendanceId}`, null, adminToken);
    test('Get attendance by ID returns 200', r.status === 200, `Got ${r.status}`);
  }

  // Get non-existent attendance
  r = await request('GET', '/attendance/99999', null, adminToken);
  test('Get non-existent attendance returns 404', r.status === 404, `Got ${r.status}`);

  // Update attendance
  if (createdAttendanceId) {
    r = await request('PUT', `/attendance/${createdAttendanceId}`, { status: 'Late' }, adminToken);
    test('Update attendance returns 200', r.status === 200, `Got ${r.status}`);
  }

  // Delete attendance
  if (createdAttendanceId) {
    r = await request('DELETE', `/attendance/${createdAttendanceId}`, null, adminToken);
    test('Delete attendance returns 200', r.status === 200 || r.status === 204, `Got ${r.status}`);
  }

  // ===== ADMIN DASHBOARD =====
  section('ADMIN DASHBOARD');

  r = await request('GET', '/admin/dashboard', null, adminToken);
  test('Admin dashboard returns 200', r.status === 200, `Got ${r.status}`);

  // ===== ANALYTICS =====
  section('ANALYTICS');

  r = await request('GET', '/analytics', null, adminToken);
  test('Analytics returns 200 for admin', r.status === 200, `Got ${r.status}`);

  r = await request('GET', '/analytics', null, facultyToken);
  test('Analytics returns 200 for faculty', r.status === 200, `Got ${r.status}`);

  r = await request('GET', '/analytics', null, studentToken);
  test('Analytics returns 403 for student', r.status === 403, `Got ${r.status}`);

  // Analytics with filters
  r = await request('GET', '/analytics?department=Computer+Science', null, adminToken);
  test('Analytics with department filter returns 200', r.status === 200, `Got ${r.status}`);

  // ===== REPORTS =====
  section('REPORTS');

  r = await request('GET', '/reports/attendance', null, adminToken);
  test('Reports attendance returns 200', r.status === 200, `Got ${r.status}`);

  r = await request('GET', '/reports/attendance?department=Computer+Science', null, adminToken);
  test('Reports with department filter returns 200', r.status === 200, `Got ${r.status}`);

  r = await request('GET', '/reports/export/pdf?department=Computer+Science', null, adminToken);
  test('PDF export returns 200', r.status === 200, `Got ${r.status}`);

  r = await request('GET', '/reports/export/excel?department=Computer+Science', null, adminToken);
  test('Excel export returns 200', r.status === 200, `Got ${r.status}`);

  // Student accessing report
  r = await request('GET', '/reports/attendance', null, studentToken);
  test('Student accessing reports returns 403', r.status === 403, `Got ${r.status}`);

  // ===== PROFILE =====
  section('PROFILE');

  r = await request('GET', '/profile', null, adminToken);
  test('Get profile returns 200', r.status === 200, `Got ${r.status}`);

  r = await request('PUT', '/profile', { fullName: 'Updated Admin Name', email: 'admin@student.com' }, adminToken);
  test('Update profile returns 200', r.status === 200, `Got ${r.status}`);

  // Update profile without email (should use existing)
  r = await request('PUT', '/profile', { fullName: 'Default Admin' }, adminToken);
  test('Update profile without email returns 200', r.status === 200, `Got ${r.status}`);

  // Change password
  r = await request('PUT', '/profile/change-password', {
    currentPassword: 'Admin@123',
    newPassword: 'NewAdmin@123',
    confirmPassword: 'NewAdmin@123'
  }, adminToken);
  test('Change password returns 200', r.status === 200, `Got ${r.status}`);

  // Change password with wrong current password
  r = await request('PUT', '/profile/change-password', {
    currentPassword: 'wrongpassword',
    newPassword: 'NewAdmin@456',
    confirmPassword: 'NewAdmin@456'
  }, adminToken);
  test('Change password with wrong current returns 400', r.status === 400, `Got ${r.status}`);

  // Change password back to original
  r = await request('PUT', '/profile/change-password', {
    currentPassword: 'NewAdmin@123',
    newPassword: 'Admin@123',
    confirmPassword: 'Admin@123'
  }, adminToken);
  test('Revert password to original returns 200', r.status === 200, `Got ${r.status}`);

  // ===== FACULTY DASHBOARD =====
  section('FACULTY DASHBOARD');

  r = await request('GET', '/faculty/dashboard', null, facultyToken);
  test('Faculty dashboard returns 200', r.status === 200, `Got ${r.status}`);

  // ===== STUDENT DASHBOARD =====
  section('STUDENT DASHBOARD');

  r = await request('GET', '/students/dashboard', null, studentToken);
  test('Student dashboard returns 200', r.status === 200, `Got ${r.status}`);

  // Student accessing faculty-only route
  r = await request('GET', '/faculty/dashboard', null, studentToken);
  test('Student accessing faculty dashboard returns 403', r.status === 403, `Got ${r.status}`);

  // ===== LARGE INPUT / SPECIAL CHARACTERS =====
  section('INPUT VALIDATION - LARGE / SPECIAL CHARACTERS');

  // Very long name
  r = await request('POST', '/students', {
    fullName: 'A'.repeat(1000),
    email: 'largeinput@test.com',
    studentId: 'LARGE001',
    department: 'Computer Science'
  }, adminToken);
  test('Very large name handles gracefully (400 or 201)', 
       r.status === 400 || r.status === 201, `Got ${r.status}`);
  if (r.status === 201) {
    let largeId = r.body.student?.id || r.body.data?.id || r.body.id;
    await request('DELETE', `/students/${largeId}`, null, adminToken);
  }

  // Special characters in input
  r = await request('POST', '/students', {
    fullName: '<script>alert("xss")</script>',
    email: 'xss_test@test.com',
    studentId: 'XSS001',
    department: '</table><script>'
  }, adminToken);
  test('Special chars in input handles gracefully (400 or 201)', 
       r.status === 400 || r.status === 201, `Got ${r.status}`);
  if (r.status === 201) {
    let xssId = r.body.student?.id || r.body.data?.id || r.body.id;
    await request('DELETE', `/students/${xssId}`, null, adminToken);
  }

  // ===== SQL INJECTION TESTS =====
  section('SQL INJECTION PROTECTION');

  r = await request('POST', '/auth/login', {
    email: "' OR '1'='1",
    password: "' OR '1'='1",
    role: "admin"
  });
  test('SQL injection login attempt returns 400 or 401', 
       r.status === 400 || r.status === 401, `Got ${r.status}`);

  r = await request('GET', `/students/1; DROP TABLE students;--`, null, adminToken);
  test('SQL injection in URL parameter returns 404 or 400', 
       r.status === 404 || r.status === 400, `Got ${r.status}`);

  r = await request('GET', `/students/1 UNION SELECT * FROM users`, null, adminToken);
  test('SQL injection UNION in URL returns 404 or 400', 
       r.status === 404 || r.status === 400, `Got ${r.status}`);

  // ===== NOT FOUND =====
  section('NOT FOUND / 404');

  r = await request('GET', '/nonexistent-route');
  test('Non-existent route returns 404', r.status === 404, `Got ${r.status}`);

  // ===== CLEANUP =====
  section('CLEANUP');

  // Delete created faculty
  if (createdFacultyId) {
    r = await request('DELETE', `/faculty/${createdFacultyId}`, null, adminToken);
    test('Cleanup: Delete test faculty returns 200', r.status === 200 || r.status === 204, `Got ${r.status}`);
  }

  // ===== SUMMARY =====
  const total = results.passed + results.failed;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  TEST SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Total:  ${total}`);
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Rate:   ${(results.passed / total * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log(`\n  FAILED TESTS:`);
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`    ✗ ${t.name}${t.detail ? ' -- ' + t.detail : ''}`);
    });
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Test suite error:', e);
  process.exit(1);
});
