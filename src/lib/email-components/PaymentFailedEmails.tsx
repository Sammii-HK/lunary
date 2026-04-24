/**
 * PaymentFailedEmails
 *
 * Dunning sequence fired by the Mini-side agent via /api/cron/dunning.
 *
 * Day 1 — soft heads up. Stripe will retry automatically.
 * Day 3 — access may pause. Warmer nudge, still recoverable.
 * Day 7 — final notice. Subscription will cancel if the card isn't updated.
 *
 * UK English. No em dashes. Sentence case. Reuses the PersonalEmail layout
 * so it reads like a note from Sammii, not a system alert.
 */
import { render } from '@react-email/render';
import { PersonalEmail, P, Signature, Cta } from './PersonalEmail';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export type PaymentFailedDayOffset = 1 | 3 | 7;

interface PaymentFailedEmailProps {
  userName: string;
  billingPortalUrl: string;
  userEmail?: string;
}

// ── Day 1 ───────────────────────────────────────────────────────────────

export function PaymentFailedDay1Email({
  userName,
  billingPortalUrl,
  userEmail,
}: PaymentFailedEmailProps) {
  const firstName = userName?.split(' ')[0] || 'there';
  return (
    <PersonalEmail
      preview={`Your payment didn't go through. Stripe will retry, but here's the link if you'd rather fix it now.`}
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>
      <P>
        Your last Lunary payment didn&apos;t go through. No panic, your card
        issuer will usually retry over the next few days and it often clears on
        its own.
      </P>
      <P>
        If you&apos;d rather sort it now, the billing portal takes about thirty
        seconds.
      </P>
      <Cta href={billingPortalUrl} label='Update card' />
      <P>
        Nothing has changed on your account yet. Your chart, transits and
        everything else are right where you left them.
      </P>
      <Signature />
    </PersonalEmail>
  );
}

export async function generatePaymentFailedDay1HTML(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <PaymentFailedDay1Email
      userName={userName}
      billingPortalUrl={billingPortalUrl}
      userEmail={userEmail}
    />,
  );
}

export function generatePaymentFailedDay1Text(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const firstName = userName?.split(' ')[0] || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;
  return `
Hi ${firstName},

Your last Lunary payment didn't go through. No panic, your card issuer will usually retry over the next few days and it often clears on its own.

If you'd rather sort it now, the billing portal takes about thirty seconds.

Update card: ${billingPortalUrl}

Nothing has changed on your account yet. Your chart, transits and everything else are right where you left them.

Sammii
Founder, Lunary

---
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

// ── Day 3 ───────────────────────────────────────────────────────────────

export function PaymentFailedDay3Email({
  userName,
  billingPortalUrl,
  userEmail,
}: PaymentFailedEmailProps) {
  const firstName = userName?.split(' ')[0] || 'there';
  return (
    <PersonalEmail
      preview={`Quick nudge about your card. Access may pause in a few days if it isn't updated.`}
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>
      <P>
        Just a quick nudge. Your card is still declining the retry on your
        Lunary subscription.
      </P>
      <P>
        If it isn&apos;t updated in the next few days, access to your
        personalised horoscopes, transit calendar and premium tools will pause.
        Your data and setup stay safe, it&apos;s only the premium side that
        switches off.
      </P>
      <Cta href={billingPortalUrl} label='Update card' />
      <P>
        Most declines are something tiny like an expired card or a bank flag on
        a subscription. Thirty seconds in the portal usually sorts it.
      </P>
      <Signature />
    </PersonalEmail>
  );
}

export async function generatePaymentFailedDay3HTML(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <PaymentFailedDay3Email
      userName={userName}
      billingPortalUrl={billingPortalUrl}
      userEmail={userEmail}
    />,
  );
}

export function generatePaymentFailedDay3Text(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const firstName = userName?.split(' ')[0] || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;
  return `
Hi ${firstName},

Just a quick nudge. Your card is still declining the retry on your Lunary subscription.

If it isn't updated in the next few days, access to your personalised horoscopes, transit calendar and premium tools will pause. Your data and setup stay safe, it's only the premium side that switches off.

Update card: ${billingPortalUrl}

Most declines are something tiny like an expired card or a bank flag on a subscription. Thirty seconds in the portal usually sorts it.

Sammii
Founder, Lunary

---
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

// ── Day 7 (final) ───────────────────────────────────────────────────────

export function PaymentFailedDay7Email({
  userName,
  billingPortalUrl,
  userEmail,
}: PaymentFailedEmailProps) {
  const firstName = userName?.split(' ')[0] || 'there';
  return (
    <PersonalEmail
      preview={`Final notice. Your Lunary subscription will cancel if the card isn't updated.`}
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>
      <P>
        This is the last reminder. Your card has been declining for a week now,
        so Stripe is about to cancel your Lunary subscription on my end.
      </P>
      <P>
        If that&apos;s what you want, you don&apos;t need to do anything. Your
        account stays, just on the free tier.
      </P>
      <P>
        If it&apos;s genuinely just a card issue, this link fixes it and keeps
        your subscription live. No new charge today, only the outstanding
        invoice.
      </P>
      <Cta href={billingPortalUrl} label='Keep my subscription' />
      <P>
        And if something else has shifted and you&apos;d rather talk to a human,
        reply to this email. I read every one.
      </P>
      <Signature />
    </PersonalEmail>
  );
}

export async function generatePaymentFailedDay7HTML(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <PaymentFailedDay7Email
      userName={userName}
      billingPortalUrl={billingPortalUrl}
      userEmail={userEmail}
    />,
  );
}

export function generatePaymentFailedDay7Text(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const firstName = userName?.split(' ')[0] || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;
  return `
Hi ${firstName},

This is the last reminder. Your card has been declining for a week now, so Stripe is about to cancel your Lunary subscription on my end.

If that's what you want, you don't need to do anything. Your account stays, just on the free tier.

If it's genuinely just a card issue, this link fixes it and keeps your subscription live. No new charge today, only the outstanding invoice.

Keep my subscription: ${billingPortalUrl}

And if something else has shifted and you'd rather talk to a human, reply to this email. I read every one.

Sammii
Founder, Lunary

---
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

// ── Dispatcher helper ──────────────────────────────────────────────────

export async function renderPaymentFailedEmail(
  dayOffset: PaymentFailedDayOffset,
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): Promise<{ subject: string; html: string; text: string }> {
  switch (dayOffset) {
    case 1:
      return {
        subject: "Your card didn't go through (no action needed yet)",
        html: await generatePaymentFailedDay1HTML(
          userName,
          billingPortalUrl,
          userEmail,
        ),
        text: generatePaymentFailedDay1Text(
          userName,
          billingPortalUrl,
          userEmail,
        ),
      };
    case 3:
      return {
        subject: 'Quick nudge: your Lunary access may pause soon',
        html: await generatePaymentFailedDay3HTML(
          userName,
          billingPortalUrl,
          userEmail,
        ),
        text: generatePaymentFailedDay3Text(
          userName,
          billingPortalUrl,
          userEmail,
        ),
      };
    case 7:
      return {
        subject: 'Final notice: your Lunary subscription is about to cancel',
        html: await generatePaymentFailedDay7HTML(
          userName,
          billingPortalUrl,
          userEmail,
        ),
        text: generatePaymentFailedDay7Text(
          userName,
          billingPortalUrl,
          userEmail,
        ),
      };
  }
}
