import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'matches.json');

export async function POST(req: Request) {
  try {
    const newMatch = await req.json();

    // Read the existing file
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    // Assign a new match ID
    const nextId = parsed.matches.length > 0 ? parsed.matches.at(-1).id + 1 : 1;
    newMatch.id = nextId;

    // Add new match
    parsed.matches.push(newMatch);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    return NextResponse.json({ success: true, match: newMatch });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.log(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
