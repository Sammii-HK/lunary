import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createApiKey, getUserApiKeys } from '@/lib/api/keys';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await getUserApiKeys(session.user.id);
    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = body.name || 'API Key';

    const existingKeys = await getUserApiKeys(session.user.id);
    if (existingKeys.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 API keys allowed per account' },
        { status: 400 },
      );
    }

    const result = await createApiKey(session.user.id, 'free', name);

    return NextResponse.json({
      key: result.key,
      id: result.id,
      message:
        'API key created successfully. Save this key - you will not be able to see it again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 },
    );
  }
}
