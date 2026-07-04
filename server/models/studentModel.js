import { db } from '../config/database.js';

export function getStudents({ q, page = 1, perPage = 10 }) {
  const offset = (page - 1) * perPage;
  let where = 'WHERE 1=1';
  const params = { offset, perPage };

  if (q) {
    where += ' AND fullName LIKE @q';
    params.q = `%${q}%`;
    if (!isNaN(Number(q))) {
      where += ' OR userId = @id';
      params.id = Number(q);
    }
  }

  const stmt = db.prepare(`SELECT id, userId, fullName, email, createdAt FROM students ${where} ORDER BY fullName LIMIT @perPage OFFSET @offset`);
  const data = stmt.all(params);

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM students ${where}`);
  const total = countStmt.get(params).count;

  return { total, perPage, page, data };
}
