import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { getActivePersona } from '@/lib/personas/get-active';
import { getPersonaConfig } from '@/lib/personas/library';
import { DEFAULT_PERSONA, isPersonaId } from '@/lib/personas/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function loadPersonalCard(
  userId: string,
): Promise<Record<string, unknown>> {
  const result = await sql`
    SELECT personal_card
    FROM user_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  const personalCard = result.rows[0]?.personal_card;
  return personalCard && typeof personalCard === 'object'
    ? (personalCard as Record<string, unknown>)
    : {};
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const personalCard = await loadPersonalCard(user.id);
    const personaId = getActivePersona(personalCard);
    return NextResponse.json({
      success: true,
      persona: getPersonaConfig(personaId),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[personas] GET failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load persona' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const personaId = isPersonaId(body?.personaId)
      ? body.personaId
      : DEFAULT_PERSONA;
    const existing = await loadPersonalCard(user.id);
    const next = JSON.stringify({ ...existing, activePersona: personaId });

    await sql`
      INSERT INTO user_profiles (user_id, personal_card, updated_at)
      VALUES (${user.id}, ${next}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        personal_card = COALESCE(user_profiles.personal_card, '{}'::jsonb) || ${next}::jsonb,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      persona: getPersonaConfig(personaId),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[personas] POST failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save persona' },
      { status: 500 },
    );
  }
}
