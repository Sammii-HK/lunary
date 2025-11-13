import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getCorsHeaders, isValidOrigin } from '@/lib/origin-validation';

const requestSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = isValidOrigin(origin) ? getCorsHeaders(origin) : {};

  try {
    const json = await request.json();
    const { token, newPassword } = requestSchema.parse(json);

    await auth.api.resetPassword({
      body: {
        newPassword,
        token,
      },
      query: {
        token,
      },
    });

    return NextResponse.json(
      { status: true },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: false,
          error: 'INVALID_REQUEST',
          details: error.flatten(),
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unable to reset password';

    return NextResponse.json(
      { status: false, error: 'RESET_FAILED', message },
      { status: 400, headers: corsHeaders },
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
