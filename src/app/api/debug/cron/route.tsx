import { NextResponse } from 'next/server';
export const runtime = 'edge'; // or 'nodejs' – whichever you use in the posting route

export async function GET() {
  const present = typeof process.env.CRON_SECRET === 'string' && process.env.CRON_SECRET.length > 0;
  return NextResponse.json({
    runtime: (globalThis as any).EdgeRuntime ? 'edge' : 'node',
    hasCronSecret: present,
    len: present ? process.env.CRON_SECRET!.length : 0, // length only, to verify it’s not empty
  });
}
