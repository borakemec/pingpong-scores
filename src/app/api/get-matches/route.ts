import { pool } from '@/lib/db';

export async function GET() {
  try {
    const playersRes = await pool.query('SELECT * FROM players');
    const matchesRes = await pool.query(
      'SELECT * FROM matches ORDER BY date DESC',
    );

    const players = playersRes.rows.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image,
      elo: p.elo,
    }));

    const matches = matchesRes.rows.map(m => ({
      id: m.id,
      player1Id: m.player1_id,
      player2Id: m.player2_id,
      date: m.date,
      score: m.score,
      eloDelta: m.elo_delta,
    }));

    return new Response(
      JSON.stringify({
        players,
        matches,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
    });
  }
}
