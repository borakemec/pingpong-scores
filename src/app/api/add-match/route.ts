/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const newMatch = await req.json();
    const filePath = path.join(process.cwd(), 'matches.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Add match ID (auto-increment)
    const nextId = Math.max(0, ...data.matches.map((m: any) => m.id)) + 1;
    newMatch.id = nextId;
    data.matches.push(newMatch);

    // Calculate Elo after adding the match
    const { player1Id, player2Id, score } = newMatch;
    const player1 = data.players.find((p: any) => p.id === player1Id);
    const player2 = data.players.find((p: any) => p.id === player2Id);

    const p1Score = score[player1Id];
    const p2Score = score[player2Id];

    // Initialize Elo if missing
    player1.elo = player1.elo ?? 0;
    player2.elo = player2.elo ?? 0;

    const winner = p1Score > p2Score ? player1 : player2;
    const loser = p1Score > p2Score ? player2 : player1;

    const expectedWinner =
      1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
    const expectedLoser = 1 - expectedWinner;
    const pointDiff = Math.abs(p1Score - p2Score);
    const K = 32 * (1 + pointDiff / 10);

    winner.elo = Math.round(winner.elo + K * (1 - expectedWinner));
    loser.elo = Math.round(loser.elo + K * (0 - expectedLoser));

    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 },
    );
  }
}
