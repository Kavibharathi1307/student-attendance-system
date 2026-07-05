import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, 'schema.sql');

export function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  ensureFacultyDepartmentColumn();
  ensureStudentColumns();
  ensureAttendanceTable();
  seedDefaultAdmin();
  seedDefaultFaculty();
  seedDefaultStudent();
}

function ensureFacultyDepartmentColumn() {
  try {
    const info = db.prepare("PRAGMA table_info('faculty')").all();
    const hasDepartment = info.some((col) => col.name === 'department');

    if (!hasDepartment) {
      db.prepare('ALTER TABLE faculty ADD COLUMN department TEXT').run();
    }
  } catch (err) {
    // if faculty table does not exist yet, skip - it will be created by schema
  }
}

function ensureStudentColumns() {
  try {
    const info = db.prepare("PRAGMA table_info('students')").all();
    const cols = info.map((col) => col.name);

    if (!cols.includes('studentId')) {
      db.prepare("ALTER TABLE students ADD COLUMN studentId TEXT").run();
    }
    if (!cols.includes('department')) {
      db.prepare("ALTER TABLE students ADD COLUMN department TEXT").run();
    }
    if (!cols.includes('phone')) {
      db.prepare("ALTER TABLE students ADD COLUMN phone TEXT").run();
    }
    if (!cols.includes('address')) {
      db.prepare("ALTER TABLE students ADD COLUMN address TEXT").run();
    }
    if (!cols.includes('status')) {
      db.prepare("ALTER TABLE students ADD COLUMN status TEXT DEFAULT 'Active'").run();
    }
  } catch (err) {
    // if students table does not exist yet, skip - it will be created by schema
  }
}

function ensureAttendanceTable() {
  try {
    const info = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='attendance'").get();

    if (!info) {
      db.prepare(
        `
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId INTEGER NOT NULL,
          facultyId INTEGER NOT NULL,
          subject TEXT NOT NULL,
          attendanceDate TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('Present','Absent','Late')),
          remarks TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (facultyId) REFERENCES faculty(id) ON DELETE CASCADE
        );
        `
      ).run();
    }
  } catch (err) {
    // ignore
  }
}

function seedDefaultAdmin() {
  const existingAdmin = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('admin@student.com');

  if (existingAdmin) {
    return;
  }

  const passwordHash = bcrypt.hashSync('Admin@123', 12);

  db.prepare(
    `
      INSERT INTO users (fullName, email, password, role)
      VALUES (@fullName, @email, @password, @role)
    `
  ).run({
    fullName: 'Default Admin',
    email: 'admin@student.com',
    password: passwordHash,
    role: 'admin'
  });
}

function seedDefaultFaculty() {
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('faculty@student.com');

  if (existing) {
    return;
  }

  const passwordHash = bcrypt.hashSync('Faculty@123', 12);

  const result = db.prepare(
    `INSERT INTO users (fullName, email, password, role)
     VALUES (@fullName, @email, @password, @role)`
  ).run({
    fullName: 'Demo Faculty',
    email: 'faculty@student.com',
    password: passwordHash,
    role: 'faculty'
  });

  db.prepare(
    `INSERT INTO faculty (userId, fullName, email, department)
     VALUES (@userId, @fullName, @email, @department)`
  ).run({
    userId: result.lastInsertRowid,
    fullName: 'Demo Faculty',
    email: 'faculty@student.com',
    department: 'Computer Science'
  });
}

function seedDefaultStudent() {
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('student@student.com');

  if (existing) {
    return;
  }

  const passwordHash = bcrypt.hashSync('Student@123', 12);

  const result = db.prepare(
    `INSERT INTO users (fullName, email, password, role)
     VALUES (@fullName, @email, @password, @role)`
  ).run({
    fullName: 'Demo Student',
    email: 'student@student.com',
    password: passwordHash,
    role: 'student'
  });

  db.prepare(
    `INSERT INTO students (userId, fullName, email, studentId, department, status)
     VALUES (@userId, @fullName, @email, @studentId, @department, @status)`
  ).run({
    userId: result.lastInsertRowid,
    fullName: 'Demo Student',
    email: 'student@student.com',
    studentId: 'STU001',
    department: 'Computer Science',
    status: 'Active'
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
  console.log('Database initialized.');
}
