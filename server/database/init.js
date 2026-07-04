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
  ensureAttendanceTable();
  seedDefaultAdmin();
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
  console.log('Database initialized.');
}
