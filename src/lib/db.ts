// lib/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // put your Railway URL in .env
  ssl: { rejectUnauthorized: false },
});
