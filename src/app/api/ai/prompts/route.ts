import { NextRequest, NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import {
  getOrGenerateDailyPrompt,
  getOrGenerateWeeklyPrompt,
  getUnreadPrompts,
  markPromptAsRead,
  type PromptType,
} from '@/lib/ai/prompt-generator';

const jsonResponse = (payload: unknown, status = 200, init?: ResponseInit) =>
  NextResponse.json(payload, {
    status,
    ...init,
  });

/**
 * GET /api/ai/prompts
 * Fetches daily/weekly prompts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const promptType = searchParams.get('type') as PromptType | null;
    const autoGenerate = searchParams.get('autoGenerate') !== 'false'; // Default true

    // If auto-generate is enabled, generate prompts if they don't exist
    if (autoGenerate) {
      if (promptType === 'daily' || !promptType) {
        await getOrGenerateDailyPrompt(
          user.id,
          user.displayName,
          user.birthday,
          user.timezone || 'Europe/London',
        );
      }
      if (promptType === 'weekly' || !promptType) {
        await getOrGenerateWeeklyPrompt(
          user.id,
          user.displayName,
          user.birthday,
          user.timezone || 'Europe/London',
        );
      }
    }

    // Fetch unread prompts
    const prompts = await getUnreadPrompts(user.id, promptType || undefined);

    return jsonResponse({
      success: true,
      prompts,
      hasNewPrompts: prompts.some((p) => p.isNew),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Prompts] Unexpected error', error);
    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch prompts',
      },
      500,
    );
  }
}

/**
 * POST /api/ai/prompts/:id/read
 * Marks a prompt as read
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { promptId } = body;

    if (!promptId || typeof promptId !== 'number') {
      return jsonResponse({ error: 'Prompt ID is required' }, 400);
    }

    const success = await markPromptAsRead(user.id, promptId);

    if (!success) {
      return jsonResponse({ error: 'Prompt not found or already read' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'Prompt marked as read',
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Prompts] Unexpected error', error);
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark prompt as read',
      },
      500,
    );
  }
}
