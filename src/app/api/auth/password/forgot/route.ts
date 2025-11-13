import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const requestSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url().optional(),
});

const normalizeBase = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed.replace(/\/+$/, '')}`;
};

const ensureTrailingPath = (base: string, path: string) => {
  const normalizedBase = base.replace(/\/+$/, '');
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, redirectTo } = requestSchema.parse(json);

    const fallbackOrigin = (() => {
      try {
        return new URL(request.url).origin;
      } catch {
        return undefined;
      }
    })();

    const adminBase = normalizeBase(
      process.env.NEXT_PUBLIC_ADMIN_APP_URL ||
        process.env.ADMIN_APP_HOST ||
        process.env.ADMIN_DASHBOARD_HOST,
    );

    const appBase = normalizeBase(process.env.NEXT_PUBLIC_APP_URL);

    const defaultRedirect =
      redirectTo ||
      (adminBase ? ensureTrailingPath(adminBase, '/auth/reset') : undefined) ||
      (appBase ? ensureTrailingPath(appBase, '/auth/reset') : undefined) ||
      (fallbackOrigin
        ? ensureTrailingPath(fallbackOrigin, '/auth/reset')
        : undefined);

    const response = await auth.api.forgetPassword({
      body: {
        email,
        ...(defaultRedirect ? { redirectTo: defaultRedirect } : {}),
      },
    });

    return NextResponse.json(
      {
        status: true,
        message:
          response?.message ||
          'If this email exists in our system, look for a reset link shortly.',
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: false,
          error: 'INVALID_REQUEST',
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unable to process request';

    return NextResponse.json(
      { status: false, error: 'RESET_FAILED', message },
      { status: 500 },
    );
  }
}
