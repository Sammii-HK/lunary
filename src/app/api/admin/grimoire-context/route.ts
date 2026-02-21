import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  retrieveGrimoireContext,
  buildAstralContext,
} from '@/lib/ai/astral-guide';
import { z } from 'zod';

const requestSchema = z.object({
  query: z.string().min(1).max(500),
  mode: z.enum(['lightweight', 'full']).default('lightweight'),
  limit: z.number().int().min(1).max(10).default(3),
  category: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { query, mode, limit, category } = parsed.data;

  try {
    // Grimoire knowledge retrieval (both modes)
    const { context: grimoireKnowledge, sources: rawSources } =
      await retrieveGrimoireContext(
        category ? `${category}: ${query}` : query,
        limit,
      );

    const sources = rawSources.map((s) => ({
      title: s.title,
      slug: s.slug,
      category: s.category,
      similarity: s.similarity,
    }));

    // Lightweight mode — grimoire knowledge only
    if (mode === 'lightweight') {
      return NextResponse.json({ grimoireKnowledge, sources });
    }

    // Full mode — requires userId
    const { userId } = parsed.data;
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for full mode' },
        { status: 400 },
      );
    }

    const astralContext = await buildAstralContext(userId);

    return NextResponse.json({
      grimoireKnowledge,
      sources,
      transits: astralContext.currentTransits,
      moonPhase: astralContext.moonPhase,
      todaysTarot: astralContext.todaysTarot,
    });
  } catch (error) {
    console.error('[grimoire-context] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve grimoire context' },
      { status: 500 },
    );
  }
}
