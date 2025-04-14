// lib/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DB_URL, // put your Railway URL in .env
  ssl: { rejectUnauthorized: false },
});
