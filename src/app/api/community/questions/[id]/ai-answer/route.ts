import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { searchSimilar } from '@/lib/embeddings';
import { COMMUNITY_QA_SYSTEM_PROMPT } from '@/lib/ai/community-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ASTRAL_GUIDE_USER_ID = 'astral_guide';

/**
 * POST /api/community/questions/[id]/ai-answer
 * Internal: generate AI answer using Astral Guide infrastructure.
 * Called after a question is posted (can be triggered by cron or immediately).
 */
export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const questionId = parseInt(params?.id);

    if (!questionId || isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 },
      );
    }

    // Verify the API key for internal calls
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.INTERNAL_API_KEY;
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the question
    const questionResult = await sql`
      SELECT id, space_id, post_text, topic_tag FROM community_posts
      WHERE id = ${questionId} AND post_type = 'question' AND is_approved = true
      LIMIT 1
    `;

    if (questionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 },
      );
    }

    const question = questionResult.rows[0];

    // Check if AI already answered
    const existingAnswer = await sql`
      SELECT id FROM community_posts
      WHERE parent_id = ${questionId} AND user_id = ${ASTRAL_GUIDE_USER_ID}
      LIMIT 1
    `;

    if (existingAnswer.rows.length > 0) {
      return NextResponse.json(
        {
          error: 'AI answer already exists',
          answerId: existingAnswer.rows[0].id,
        },
        { status: 409 },
      );
    }

    // Search grimoire for relevant knowledge
    let grimoireContext = '';
    try {
      const results = await searchSimilar(question.post_text, 3);
      if (results && results.length > 0) {
        grimoireContext = results
          .map(
            (r: { content: string; similarity: number }) =>
              `[Grimoire: ${r.content.slice(0, 300)}]`,
          )
          .join('\n');
      }
    } catch (e) {
      console.warn('[AI Answer] Grimoire search failed:', e);
    }

    // Build prompt
    const userPrompt = [
      `Question (topic: ${question.topic_tag || 'general'}):`,
      question.post_text,
      grimoireContext ? `\nRelevant knowledge:\n${grimoireContext}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // Generate response using Vercel AI SDK via DeepInfra
    const { generateText } = await import('ai');
    const { getDeepInfraModel } = await import('@/lib/ai/content-generator');

    const { text } = await generateText({
      model: getDeepInfraModel(),
      system: COMMUNITY_QA_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 800,
      temperature: 0.7,
    });

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'AI generated insufficient response' },
        { status: 500 },
      );
    }

    // Insert as community post
    const insertResult = await sql`
      INSERT INTO community_posts (space_id, user_id, post_text, is_anonymous, post_type, parent_id)
      VALUES (${question.space_id}, ${ASTRAL_GUIDE_USER_ID}, ${text}, false, 'answer', ${questionId})
      RETURNING id, created_at
    `;

    const answer = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      answerId: answer.id,
      createdAt: answer.created_at
        ? new Date(answer.created_at).toISOString()
        : null,
    });
  } catch (error) {
    console.error('[community/questions/:id/ai-answer] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to generate AI answer' },
      { status: 500 },
    );
  }
}
