import { sendEmail } from '@/lib/email';
import {
  generateQuizResultEmailHTML,
  generateQuizResultEmailText,
} from '@/lib/email-components/QuizResultEmail';
import type { QuizResult } from '@/lib/quiz/types';

export interface SendQuizResultEmailParams {
  to: string;
  result: QuizResult;
  userId?: string;
}

export interface SendQuizResultEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Deliver the quiz result email after signup completion.
 *
 * Sends a single transactional email containing the user's full Chart Ruler
 * Profile. After this fires, the user falls into Lunary's existing nurture
 * sequence — do not chain additional drip emails from here.
 *
 * Resend contact/audience tagging: this codebase does not currently use the
 * Resend Contacts/Audiences API, so the `quiz:chart-ruler` tag is attached
 * to the message via UTM + tracking metadata instead. When contact tagging
 * is added, wire it in at the marked integration point below.
 */
export async function sendQuizResultEmail({
  to,
  result,
  userId,
}: SendQuizResultEmailParams): Promise<SendQuizResultEmailResult> {
  try {
    const archetypeLabel =
      result.archetype?.label ?? 'Your Chart Ruler Profile';
    const subject = `Your Chart Ruler Profile: ${archetypeLabel}`;

    const html = await generateQuizResultEmailHTML(result, to);
    const text = generateQuizResultEmailText(result, to);

    // INTEGRATION POINT: tag contact with `quiz:chart-ruler` once Resend
    // Contacts/Audiences is wired up. Current Resend SDK usage in this
    // codebase doesn't touch `resend.contacts.*`, so we carry the tag via
    // UTM + notificationType for now.
    const tagLabel = `quiz:${result.quizSlug}`;

    const response = await sendEmail({
      to,
      subject,
      html,
      text,
      tracking: {
        userId,
        notificationType: tagLabel,
        notificationId: `${result.quizSlug}-result-${result.meta.chartKey}`,
        utm: {
          source: 'email',
          medium: 'lifecycle',
          campaign: 'quiz_result',
          content: result.quizSlug,
        },
      },
    });

    const messageId =
      'id' in response && typeof response.id === 'string'
        ? response.id
        : undefined;

    return { success: true, messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error sending email';
    console.error('sendQuizResultEmail failed:', message);
    return { success: false, error: message };
  }
}
