import { env } from './config/env.js';
import { createApp } from './app.js';
import { initializeDatabase } from './database/init.js';

initializeDatabase();

const app = createApp();

app.listen(env.port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
