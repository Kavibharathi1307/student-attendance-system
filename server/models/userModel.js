import { db } from '../config/database.js';

const publicUserFields = `
  id,
  fullName,
  email,
  role,
  createdAt
`;

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserById(id) {
  return db.prepare(`SELECT ${publicUserFields} FROM users WHERE id = ?`).get(id);
}

export function createUser({ fullName, email, password, role, department = null }) {
  const transaction = db.transaction((user) => {
    const result = db
      .prepare(
        `
          INSERT INTO users (fullName, email, password, role)
          VALUES (@fullName, @email, @password, @role)
        `
      )
      .run(user);

    if (user.role === 'student') {
      db.prepare(
        `
          INSERT INTO students (userId, fullName, email)
          VALUES (@userId, @fullName, @email)
        `
      ).run({
        userId: result.lastInsertRowid,
        fullName: user.fullName,
        email: user.email
      });
    }

    if (user.role === 'faculty') {
      db.prepare(
        `
          INSERT INTO faculty (userId, fullName, email, department)
          VALUES (@userId, @fullName, @email, @department)
        `
      ).run({
        userId: result.lastInsertRowid,
        fullName: user.fullName,
        email: user.email,
        department: user.department || null
      });
    }

    return findUserById(result.lastInsertRowid);
  });

  return transaction({ fullName, email, password, role, department });
}

export function updateUser(userId, { fullName, email }) {
  db.prepare(
    `
      UPDATE users
      SET fullName = @fullName, email = @email
      WHERE id = @userId
    `
  ).run({ userId, fullName, email });

  return findUserById(userId);
}

export function deleteUser(userId) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}
