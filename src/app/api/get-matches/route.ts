import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'matches.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return new Response(data, {
    headers: { 'Content-Type': 'application/json' },
  });
}
