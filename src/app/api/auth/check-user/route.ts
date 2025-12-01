import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if user exists in PostgreSQL auth table
    const result = await sql`
      SELECT id FROM "user" WHERE LOWER(email) = LOWER(${email}) LIMIT 1
    `;

    const existsInPostgres = result.rows.length > 0;

    // Check if user has data in subscriptions (means they were a Jazz user)
    const subResult = await sql`
      SELECT user_id FROM subscriptions WHERE LOWER(user_email) = LOWER(${email}) LIMIT 1
    `;

    const hasSubscriptionData = subResult.rows.length > 0;

    // User is a "Jazz migrant" if they have subscription data but no PostgreSQL auth account
    const isJazzUser = hasSubscriptionData && !existsInPostgres;

    return NextResponse.json({
      existsInPostgres,
      hasSubscriptionData,
      isJazzUser,
      // If they're a Jazz user without PostgreSQL account, they should use magic link
      requiresMagicLink: isJazzUser,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 },
    );
  }
}
