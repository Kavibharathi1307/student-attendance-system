import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databaseFile = path.resolve(__dirname, '..', env.databasePath);

export const db = new Database(databaseFile);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
