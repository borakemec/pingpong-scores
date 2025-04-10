import fs from 'fs';
import path from 'path';

type Match = {
  id: number;
  player1Id: number;
  player2Id: number;
  date: string;
  score: {
    [playerId: string]: number;
  };
};

// Define your password here (you can move to an environment variable later)
const ADMIN_PASSWORD = process.env.DELETE_PASSWORD || '821Fovrd!3131';

export async function DELETE(req: Request) {
  try {
    const { matchId, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 401 },
      );
    }

    const filePath = path.join(process.cwd(), 'matches.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    parsed.matches = parsed.matches.filter((m: Match) => m.id !== matchId);

    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
    });
  }
}
