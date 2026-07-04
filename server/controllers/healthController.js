import { db } from '../config/database.js';

export function getHealth(_request, response) {
  const databaseStatus = db.prepare('SELECT 1 AS ok').get();

  response.json({
    status: 'ok',
    database: databaseStatus.ok === 1 ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString()
  });
}
