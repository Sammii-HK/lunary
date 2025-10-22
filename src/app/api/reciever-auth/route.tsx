import { NextResponse, NextRequest } from 'next/server';
export const runtime = 'edge'; // or 'nodejs' – match the real route

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = process.env.CRON_SECRET ?? '';
  return NextResponse.json({
    runtime: (globalThis as any).EdgeRuntime ? 'edge' : 'node',
    gotHeader: auth.length > 0,
    headerLen: auth.length,
    startsWithBearer: auth.startsWith('Bearer '),
    hasSecret: expected.length > 0,
    secretLen: expected.length,
    equal: auth === `Bearer ${expected}`, // true/false only
  });
}
