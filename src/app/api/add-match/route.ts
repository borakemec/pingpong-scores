import { pool } from '@/lib/db';

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const match = await req.json();
    const { player1Id, player2Id, date, score } = match;

    // Get next ID manually
    const nextIdResult = await client.query(
      'SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM matches',
    );
    const nextId = nextIdResult.rows[0].next_id;

    // Get current player ELOs
    const res = await client.query('SELECT * FROM players WHERE id = ANY($1)', [
      [player1Id, player2Id],
    ]);

    const player1 = res.rows.find(p => p.id === player1Id);
    const player2 = res.rows.find(p => p.id === player2Id);
    if (!player1 || !player2) throw new Error('Player(s) not found');

    const p1Score = score[player1Id];
    const p2Score = score[player2Id];

    const winner = p1Score > p2Score ? player1 : player2;
    const loser = p1Score > p2Score ? player2 : player1;

    const expectedWinner =
      1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
    const pointDiff = Math.abs(p1Score - p2Score);
    const K = 32 * (1 + pointDiff / 10);

    const eloDelta = Math.round(K * (1 - expectedWinner));

    // Start transaction
    await client.query('BEGIN');

    // Insert the match with elo_delta
    await client.query(
      'INSERT INTO matches (id, player1_id, player2_id, date, score, elo_delta) VALUES ($1, $2, $3, $4, $5, $6)',
      [nextId, player1Id, player2Id, date, score, eloDelta],
    );

    // Update players' elo
    await client.query('UPDATE players SET elo = elo + $1 WHERE id = $2', [
      eloDelta,
      winner.id,
    ]);
    await client.query('UPDATE players SET elo = elo - $1 WHERE id = $2', [
      eloDelta,
      loser.id,
    ]);

    await client.query('COMMIT');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    console.error('Match insert error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
    });
  } finally {
    client.release();
  }
}
