import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateContent } from '@/lib/ai/content-generator';
import { retrieveGrimoireContext } from '@/lib/ai/astral-guide';
import {
  buildRedditPrompt,
  SUBREDDIT_TONES,
  type RedditFormat,
} from '@/lib/social/platform-strategies/reddit';

interface BatchItem {
  subreddit: string;
  subredditDisplay: string;
  topic: string;
  title?: string;
  body: string;
  flair?: string;
  format: RedditFormat;
}

/**
 * POST — Generate a daily batch of Reddit content (mix of posts and replies)
 * Picks topics across subreddits using a date-based rotation.
 * Alternates between original posts and reply-format answers.
 */
export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const count = Math.min(Number(body.count) || 5, 10);

    // Date-based rotation seed
    const dayIndex = Math.floor(Date.now() / 86400000);
    const subredditNames = Object.keys(SUBREDDIT_TONES);

    // Build a pool of (subreddit, topic, format) entries rotating daily
    const pool: Array<{
      subreddit: string;
      topic: string;
      format: RedditFormat;
    }> = [];

    for (const subName of subredditNames) {
      const sub = SUBREDDIT_TONES[subName];
      const questions = sub.commonQuestions;
      const startIdx = dayIndex % questions.length;

      // 1 original post + 1 reply per subreddit, rotating by day
      pool.push({
        subreddit: subName,
        topic: questions[startIdx % questions.length],
        format: 'post',
      });
      pool.push({
        subreddit: subName,
        topic: questions[(startIdx + 1) % questions.length],
        format: 'reply',
      });
    }

    // Shuffle pool deterministically based on day
    const shuffled = pool
      .map((item, i) => ({
        item,
        sort: ((dayIndex * 31 + i * 17) % 97) / 97,
      }))
      .sort((a, b) => a.sort - b.sort)
      .map((x) => x.item);

    const selected = shuffled.slice(0, count);

    // Generate content for each selected topic
    const results: BatchItem[] = [];

    for (const { subreddit, topic, format } of selected) {
      try {
        const { context: grimoireContext } = await retrieveGrimoireContext(
          topic,
          3,
        );

        const prompt = buildRedditPrompt(
          subreddit,
          format,
          topic,
          format === 'reply' ? topic : undefined,
          grimoireContext,
        );

        const result = await generateContent({
          prompt,
          systemPrompt:
            'You are a knowledgeable astrology enthusiast writing on Reddit. Write authentic, helpful content. Return valid JSON only.',
          temperature: 0.7,
          maxTokens: 1200,
        });

        let parsed: { title?: string; body: string; flair?: string };
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { body: result };
        } catch {
          parsed = { body: result };
        }

        results.push({
          subreddit,
          subredditDisplay:
            SUBREDDIT_TONES[subreddit]?.displayName ?? subreddit,
          topic,
          title: parsed.title,
          body: parsed.body,
          flair: parsed.flair,
          format,
        });
      } catch (err) {
        console.error(
          `[Reddit Batch] Failed to generate for ${subreddit}:`,
          err,
        );
      }
    }

    return NextResponse.json({
      success: true,
      batch: results,
      dayIndex,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Reddit Batch] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch' },
      { status: 500 },
    );
  }
}
