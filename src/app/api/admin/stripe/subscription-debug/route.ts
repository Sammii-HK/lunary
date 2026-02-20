import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';

function getBaseUrl() {
  if (process.env.VERCEL) {
    return 'https://lunary.app';
  }
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const payload = await request.json().catch(() => ({}));
    const { userId, customerId, userEmail } = payload;

    if (!userId && !customerId && !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Provide any of userId, customerId, or userEmail',
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${getBaseUrl()}/api/stripe/get-subscription`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          customerId,
          userEmail,
          forceRefresh: true,
        }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe sync failed',
          details: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error fetching subscription';
    console.error('[subscription-debug] error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
