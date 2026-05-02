import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import {
  COSMIC_ARCHETYPE_IDS,
  COSMIC_VIBE_QUESTION_IDS,
  computeCosmicVibe,
  getArchetype,
  type CosmicArchetypeId,
  type CosmicVibe,
  type CosmicVibeAnswers,
  type CosmicVibeQuestionId,
} from '@/lib/quiz/cosmic-vibe';

export const dynamic = 'force-dynamic';

// `user_profiles.intention` is a plain TEXT column; the closest existing
// JSON field on this table is `personal_card`. We namespace this quiz
// under `personal_card.cosmicVibe` so we don't collide with anything
// else writing to that record.
const STORAGE_KEY = 'cosmicVibe' as const;

const ALLOWED_QUESTION_IDS = new Set<string>(COSMIC_VIBE_QUESTION_IDS);
const ALLOWED_ARCHETYPE_IDS = new Set<string>(COSMIC_ARCHETYPE_IDS);

interface StoredVibe {
  answers: CosmicVibeAnswers;
  vibe: CosmicVibe;
  savedAt: string;
}

function sanitizeAnswers(input: unknown): CosmicVibeAnswers {
  if (!input || typeof input !== 'object') return {};
  const out: CosmicVibeAnswers = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_QUESTION_IDS.has(key)) continue;
    if (typeof value !== 'string') continue;
    if (value.length > 64) continue;
    out[key as CosmicVibeQuestionId] = value;
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT personal_card FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const personalCard = result.rows[0]?.personal_card as
      | Record<string, unknown>
      | null
      | undefined;
    const stored = personalCard?.[STORAGE_KEY] as StoredVibe | undefined;

    if (!stored) {
      return NextResponse.json({ vibe: null, answers: null });
    }

    return NextResponse.json({
      vibe: stored.vibe,
      answers: stored.answers,
      savedAt: stored.savedAt,
    });
  } catch (error) {
    console.error('[CosmicVibe] GET failed:', error);
    return NextResponse.json(
      { error: 'Failed to load cosmic vibe' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      answers?: unknown;
      vibe?: { archetypeId?: unknown };
    };

    const answers = sanitizeAnswers(body.answers);
    if (Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'No valid answers supplied' },
        { status: 400 },
      );
    }

    // Always recompute the vibe server-side from sanitized answers — never
    // trust client-supplied poetic copy. We do honour a client-suggested
    // archetypeId only if it matches the deterministic recompute, as a
    // belt-and-braces consistency check.
    const computed = computeCosmicVibe(answers);
    const clientArchetypeId =
      typeof body.vibe?.archetypeId === 'string' &&
      ALLOWED_ARCHETYPE_IDS.has(body.vibe.archetypeId)
        ? (body.vibe.archetypeId as CosmicArchetypeId)
        : undefined;

    const finalVibe: CosmicVibe =
      clientArchetypeId && clientArchetypeId === computed.archetypeId
        ? computed
        : { ...computed, ...getArchetypeOverlay(computed.archetypeId) };

    // Read existing personal_card so we can merge instead of overwriting.
    const existing = await sql`
      SELECT personal_card FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;
    const currentPersonalCard =
      (existing.rows[0]?.personal_card as Record<string, unknown> | null) ?? {};

    const stored: StoredVibe = {
      answers,
      vibe: finalVibe,
      savedAt: new Date().toISOString(),
    };

    const merged = {
      ...currentPersonalCard,
      [STORAGE_KEY]: stored,
    };

    await sql`
      INSERT INTO user_profiles (user_id, personal_card)
      VALUES (${user.id}, ${JSON.stringify(merged)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET
        personal_card = ${JSON.stringify(merged)}::jsonb,
        updated_at = NOW()
    `;

    return NextResponse.json({ vibe: finalVibe, savedAt: stored.savedAt });
  } catch (error) {
    console.error('[CosmicVibe] POST failed:', error);
    return NextResponse.json(
      { error: 'Failed to save cosmic vibe' },
      { status: 500 },
    );
  }
}

/**
 * No-op safety: when the client+server archetypes disagree (shouldn't
 * happen, but the determinism contract is strict), we still want to
 * persist the canonical archetype copy from the server-side table.
 */
function getArchetypeOverlay(id: CosmicArchetypeId) {
  const archetype = getArchetype(id);
  return {
    vibeName: archetype.vibeName,
    archetype: archetype.archetype,
    oneLiner: archetype.oneLiner,
    gradient: archetype.gradient,
    archetypeId: archetype.id,
  };
}
