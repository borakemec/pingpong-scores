import { pool } from '@/lib/db';

const ADMIN_PASSWORD = process.env.DELETE_PASSWORD ?? '821Fovrd!3131';

export async function DELETE(req: Request) {
  const client = await pool.connect();

  try {
    const { matchId, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 401 },
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Get the match info
    const matchRes = await client.query('SELECT * FROM matches WHERE id = $1', [
      matchId,
    ]);

    if (matchRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return new Response(
        JSON.stringify({ success: false, error: 'Match not found' }),
        { status: 404 },
      );
    }

    const match = matchRes.rows[0];
    const p1 = match.player1_id;
    const p2 = match.player2_id;
    const s1 = match.score[p1];
    const s2 = match.score[p2];
    const eloDelta = match.elo_delta;

    const winnerId = s1 > s2 ? p1 : p2;
    const loserId = s1 > s2 ? p2 : p1;

    // Revert Elo
    await client.query('UPDATE players SET elo = elo - $1 WHERE id = $2', [
      eloDelta,
      winnerId,
    ]);
    await client.query('UPDATE players SET elo = elo + $1 WHERE id = $2', [
      eloDelta,
      loserId,
    ]);

    // Delete the match
    await client.query('DELETE FROM matches WHERE id = $1', [matchId]);

    await client.query('COMMIT');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Delete match error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
    });
  } finally {
    client.release();
  }
}
