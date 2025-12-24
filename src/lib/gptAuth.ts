import { NextResponse } from 'next/server';

export function requireGptAuth(req: Request): Response | null {
  const secret = process.env.LUNARY_GPT_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        error: 'GPT auth misconfigured',
        message: 'LUNARY_GPT_SECRET is not set on the server.',
      },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${secret}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing GPT secret.' },
      { status: 401 },
    );
  }

  return null;
}
