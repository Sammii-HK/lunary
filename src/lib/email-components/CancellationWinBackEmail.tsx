/**
 * CancellationWinBackEmail
 *
 * Sent within seconds of a customer.subscription.deleted Stripe event.
 * Personal note from Sammii no marketing template. Honest, warm, brief.
 * Offers MOONRISE20 (20% off forever, requires card) rather than free time.
 */
import { render } from '@react-email/render';
import { PersonalEmail, P, Signature, Cta } from './PersonalEmail';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

interface CancellationWinBackEmailProps {
  userName: string;
  userEmail?: string;
}

export function CancellationWinBackEmail({
  userName,
  userEmail,
}: CancellationWinBackEmailProps) {
  const baseUrl = getBaseUrl();
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <PersonalEmail
      preview={`I noticed you cancelled. If it was price, I have something for you.`}
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        I noticed you cancelled your Lunary subscription. I wanted to reach out
        personally.
      </P>

      <P>
        If price was the reason, I have a permanent 20% reduction I can offer
        you. Use <strong>MOONRISE20</strong> when you re-subscribe and it comes
        off every billing cycle, not just the first one.
      </P>

      <Cta href={`${baseUrl}/pricing`} label='Re-subscribe with 20% off' />

      <P>
        If it was something else, a feature that felt missing, something that
        did not quite click, or just the wrong time, I would genuinely like to
        know. Reply to this email. I read every one.
      </P>

      <P>
        Your birth chart and everything else you set up is still there. If you
        come back, it picks up right where you left it.
      </P>

      <Signature />
    </PersonalEmail>
  );
}

export async function generateCancellationWinBackEmailHTML(
  userName: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <CancellationWinBackEmail userName={userName} userEmail={userEmail} />,
  );
}

export function generateCancellationWinBackEmailText(
  userName: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const firstName = userName?.split(' ')[0] || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Hi ${firstName},

I noticed you cancelled your Lunary subscription. I wanted to reach out personally.

If price was the reason, I have a permanent 20% reduction I can offer you. Use MOONRISE20 when you re-subscribe and it comes off every billing cycle, not just the first one.

Re-subscribe with 20% off: ${baseUrl}/pricing

If it was something else, a feature that felt missing, something that did not quite click, or just the wrong time, I would genuinely like to know. Reply to this email. I read every one.

Your birth chart and everything else you set up is still there. If you come back, it picks up right where you left it.

Sammii
Founder, Lunary

---
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}
