import fs from 'fs';
import path from 'path';

export async function DELETE(req: Request) {
  try {
    const { matchId } = await req.json();
    const filePath = path.join(process.cwd(), 'matches.json');

    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    parsed.matches = parsed.matches.filter((m: any) => m.id !== matchId);

    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
    });
  }
}
