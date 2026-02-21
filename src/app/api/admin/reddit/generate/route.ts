import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateContent } from '@/lib/ai/content-generator';
import { retrieveGrimoireContext } from '@/lib/ai/astral-guide';
import {
  buildRedditPrompt,
  type RedditFormat,
} from '@/lib/social/platform-strategies/reddit';

/**
 * POST — Generate Reddit content (reply or original post)
 */
export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const subreddit = (body.subreddit as string) || 'astrology';
    const format = (body.format as RedditFormat) || 'reply';
    const topic = body.topic as string;
    const question = body.question as string | undefined;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Get grimoire context for the topic
    const { context: grimoireContext } = await retrieveGrimoireContext(
      question || topic,
      3,
    );

    const prompt = buildRedditPrompt(
      subreddit,
      format,
      topic,
      question,
      grimoireContext,
    );

    const result = await generateContent({
      prompt,
      systemPrompt:
        'You are a knowledgeable astrology enthusiast writing on Reddit. Write authentic, helpful content. Return valid JSON only.',
      temperature: 0.7,
      maxTokens: 1200,
    });

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { body: result };
    } catch {
      parsed = { body: result };
    }

    return NextResponse.json({
      success: true,
      content: parsed,
      subreddit,
      format,
      topic,
    });
  } catch (error) {
    console.error('[Reddit Generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 },
    );
  }
}
