import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const CURRENT_VERSIONS = {
  tos: '2024-12-06',
  privacy: '2024-12-06',
  cookies: '2024-12-06',
};

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT DISTINCT ON (consent_type)
        consent_type, version, accepted_at
      FROM consent_log
      WHERE user_id = ${session.user.id}
      ORDER BY consent_type, accepted_at DESC
    `;

    const consents: Record<string, { version: string; accepted_at: string }> =
      {};
    for (const row of result.rows) {
      consents[row.consent_type] = {
        version: row.version,
        accepted_at: row.accepted_at,
      };
    }

    return NextResponse.json({
      consents,
      currentVersions: CURRENT_VERSIONS,
    });
  } catch (error) {
    console.error('Get consent error:', error);
    return NextResponse.json(
      { error: 'Failed to get consent status' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { consent_type, version } = body;

    if (!consent_type || !version) {
      return NextResponse.json(
        { error: 'consent_type and version required' },
        { status: 400 },
      );
    }

    const validTypes = ['tos', 'privacy', 'cookies', 'marketing'];
    if (!validTypes.includes(consent_type)) {
      return NextResponse.json(
        { error: 'Invalid consent type' },
        { status: 400 },
      );
    }

    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await sql`
      INSERT INTO consent_log (
        user_id, consent_type, version, ip_address, user_agent
      ) VALUES (
        ${session.user.id},
        ${consent_type},
        ${version},
        ${ip},
        ${userAgent}
      )
    `;

    return NextResponse.json({
      success: true,
      consent_type,
      version,
    });
  } catch (error) {
    console.error('Record consent error:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 },
    );
  }
}
