import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

interface DeletionScheduledEmailProps {
  userEmail: string;
  scheduledDate: string;
  cancelUrl: string;
}

interface DeletionCancelledEmailProps {
  userEmail: string;
}

interface RefundRequestedEmailProps {
  userEmail: string;
  requestId: string;
  amount?: string;
  status: string;
}

interface WelcomeEmailProps {
  userEmail: string;
  userName?: string;
}

export function DeletionScheduledEmail({
  userEmail,
  scheduledDate,
  cancelUrl,
}: DeletionScheduledEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head>
        <title>Account Deletion Scheduled - Lunary</title>
      </Head>
      <Preview>
        Your Lunary account is scheduled for deletion on {scheduledDate}
      </Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#f1f1ff',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#0b0b12',
        }}
      >
        <Container
          style={{
            background: '#101020',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(106, 90, 205, 0.25)',
            border: '1px solid rgba(147, 112, 219, 0.2)',
            color: '#f1f1ff',
          }}
        >
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '32px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='80'
              height='80'
              style={{ margin: '0 auto 16px', display: 'block' }}
            />
            <Heading
              as='h1'
              style={{ color: '#ef4444', fontSize: '28px', margin: 0 }}
            >
              Account Deletion Scheduled
            </Heading>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            We&apos;ve received your request to delete your Lunary account for{' '}
            <strong style={{ color: '#f9fafb' }}>{userEmail}</strong>.
          </Text>

          <Section
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '20px',
              borderRadius: '12px',
              margin: '24px 0',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Text
              style={{
                color: '#fca5a5',
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Your account will be permanently deleted on:
            </Text>
            <Text
              style={{
                color: '#ffffff',
                margin: '8px 0 0',
                fontSize: '20px',
                fontWeight: '700',
              }}
            >
              {scheduledDate}
            </Text>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            This gives you a 30-day grace period to change your mind. After this
            date, all your data will be permanently erased including:
          </Text>

          <Section style={{ margin: '16px 0 24px 24px' }}>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              • Your profile and birth chart data
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              • Saved tarot readings and journal entries
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              • AI conversation history
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              • Subscription and purchase history
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <Link
              href={cancelUrl}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                padding: '16px 32px',
                textDecoration: 'none',
                borderRadius: '999px',
                fontWeight: '600',
                fontSize: '16px',
              }}
            >
              Cancel Deletion Request
            </Link>
          </Section>

          <Text
            style={{ color: '#9ca3af', margin: '16px 0', fontSize: '14px' }}
          >
            If you want to download your data before deletion, visit your
            profile page and use the &quot;Export Data&quot; option.
          </Text>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '32px',
              fontSize: '13px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(147, 112, 219, 0.2)',
              paddingTop: '20px',
            }}
          >
            <Text style={{ margin: 0 }}>
              Questions? Reply to this email or contact support.
            </Text>
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function DeletionCancelledEmail({
  userEmail,
}: DeletionCancelledEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head>
        <title>Account Deletion Cancelled - Lunary</title>
      </Head>
      <Preview>Your Lunary account deletion has been cancelled</Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#f1f1ff',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#0b0b12',
        }}
      >
        <Container
          style={{
            background: '#101020',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(106, 90, 205, 0.25)',
            border: '1px solid rgba(147, 112, 219, 0.2)',
            color: '#f1f1ff',
          }}
        >
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '32px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='80'
              height='80'
              style={{ margin: '0 auto 16px', display: 'block' }}
            />
            <Heading
              as='h1'
              style={{ color: '#22c55e', fontSize: '28px', margin: 0 }}
            >
              Deletion Cancelled
            </Heading>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            Good news! Your account deletion request for{' '}
            <strong style={{ color: '#f9fafb' }}>{userEmail}</strong> has been
            cancelled.
          </Text>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            Your account and all your data remain safe. You can continue using
            Lunary as usual.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <Link
              href={`${baseUrl}/`}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                padding: '16px 32px',
                textDecoration: 'none',
                borderRadius: '999px',
                fontWeight: '600',
                fontSize: '16px',
              }}
            >
              Continue Your Journey
            </Link>
          </Section>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '32px',
              fontSize: '13px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(147, 112, 219, 0.2)',
              paddingTop: '20px',
            }}
          >
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function RefundRequestedEmail({
  userEmail,
  requestId,
  amount,
  status,
}: RefundRequestedEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head>
        <title>Refund Request Received - Lunary</title>
      </Head>
      <Preview>We&apos;ve received your refund request #{requestId}</Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#f1f1ff',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#0b0b12',
        }}
      >
        <Container
          style={{
            background: '#101020',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(106, 90, 205, 0.25)',
            border: '1px solid rgba(147, 112, 219, 0.2)',
            color: '#f1f1ff',
          }}
        >
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '32px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='80'
              height='80'
              style={{ margin: '0 auto 16px', display: 'block' }}
            />
            <Heading
              as='h1'
              style={{ color: '#a78bfa', fontSize: '28px', margin: 0 }}
            >
              Refund Request Received
            </Heading>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            We&apos;ve received your refund request for your Lunary
            subscription.
          </Text>

          <Section
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '20px',
              borderRadius: '12px',
              margin: '24px 0',
              border: '1px solid rgba(167, 139, 250, 0.35)',
            }}
          >
            <Text style={{ color: '#d1c4ff', margin: '0 0 12px' }}>
              <strong>Request ID:</strong> {requestId}
            </Text>
            {amount && (
              <Text style={{ color: '#d1c4ff', margin: '0 0 12px' }}>
                <strong>Amount:</strong> {amount}
              </Text>
            )}
            <Text style={{ color: '#d1c4ff', margin: 0 }}>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  color:
                    status === 'approved'
                      ? '#22c55e'
                      : status === 'pending'
                        ? '#f59e0b'
                        : '#9ca3af',
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </Text>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            {status === 'approved'
              ? 'Your refund has been approved and will be processed within 5-10 business days.'
              : 'We will review your request and get back to you within 2-3 business days.'}
          </Text>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '32px',
              fontSize: '13px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(147, 112, 219, 0.2)',
              paddingTop: '20px',
            }}
          >
            <Text style={{ margin: 0 }}>
              Questions about your refund? Reply to this email.
            </Text>
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function WelcomeEmail({ userEmail, userName }: WelcomeEmailProps) {
  const baseUrl = getBaseUrl();
  const displayName = userName || 'Cosmic Traveler';

  return (
    <Html>
      <Head>
        <title>Welcome to Lunary</title>
      </Head>
      <Preview>Welcome to Lunary - Your cosmic journey begins now</Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#f1f1ff',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#0b0b12',
        }}
      >
        <Container
          style={{
            background: '#101020',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(106, 90, 205, 0.25)',
            border: '1px solid rgba(147, 112, 219, 0.2)',
            color: '#f1f1ff',
          }}
        >
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '32px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='80'
              height='80'
              style={{ margin: '0 auto 16px', display: 'block' }}
            />
            <Heading
              as='h1'
              style={{ color: '#a78bfa', fontSize: '28px', margin: 0 }}
            >
              Welcome to Lunary
            </Heading>
            <Text
              style={{ color: '#d1c4ff', fontSize: '16px', margin: '12px 0 0' }}
            >
              Hello, {displayName}
            </Text>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            Your cosmic journey has officially begun. Lunary is your personal
            companion for exploring astrology, tarot, moon phases, and spiritual
            growth.
          </Text>

          <Section
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '20px',
              borderRadius: '12px',
              margin: '24px 0',
              border: '1px solid rgba(167, 139, 250, 0.35)',
            }}
          >
            <Text
              style={{
                color: '#a78bfa',
                margin: '0 0 16px',
                fontWeight: '600',
              }}
            >
              Get started with:
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              ★ Set up your birth chart for personalized insights
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              ★ Check today&apos;s moon phase and cosmic weather
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              ★ Pull a daily tarot card for guidance
            </Text>
            <Text style={{ color: '#d1c4ff', margin: '8px 0' }}>
              ★ Explore the Grimoire for cosmic knowledge
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <Link
              href={`${baseUrl}/profile`}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                padding: '16px 32px',
                textDecoration: 'none',
                borderRadius: '999px',
                fontWeight: '600',
                fontSize: '16px',
              }}
            >
              Complete Your Profile
            </Link>
          </Section>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '32px',
              fontSize: '13px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(147, 112, 219, 0.2)',
              paddingTop: '20px',
            }}
          >
            <Text style={{ margin: '12px 0' }}>
              <Link
                href={`${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`}
                style={{ color: '#9ca3af', textDecoration: 'underline' }}
              >
                Unsubscribe
              </Link>
              {' | '}
              <Link
                href={`${baseUrl}/profile`}
                style={{ color: '#9ca3af', textDecoration: 'underline' }}
              >
                Manage Preferences
              </Link>
            </Text>
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateDeletionScheduledEmailHTML(
  userEmail: string,
  scheduledDate: string,
  cancelUrl: string,
): Promise<string> {
  return await render(
    <DeletionScheduledEmail
      userEmail={userEmail}
      scheduledDate={scheduledDate}
      cancelUrl={cancelUrl}
    />,
  );
}

export async function generateDeletionCancelledEmailHTML(
  userEmail: string,
): Promise<string> {
  return await render(<DeletionCancelledEmail userEmail={userEmail} />);
}

export async function generateRefundRequestedEmailHTML(
  userEmail: string,
  requestId: string,
  amount: string | undefined,
  status: string,
): Promise<string> {
  return await render(
    <RefundRequestedEmail
      userEmail={userEmail}
      requestId={requestId}
      amount={amount}
      status={status}
    />,
  );
}

export async function generateWelcomeEmailHTML(
  userEmail: string,
  userName?: string,
): Promise<string> {
  return await render(
    <WelcomeEmail userEmail={userEmail} userName={userName} />,
  );
}

export function generateDeletionScheduledEmailText(
  userEmail: string,
  scheduledDate: string,
  cancelUrl: string,
): string {
  return `
Account Deletion Scheduled - Lunary

We've received your request to delete your Lunary account for ${userEmail}.

Your account will be permanently deleted on: ${scheduledDate}

This gives you a 30-day grace period to change your mind. After this date, all your data will be permanently erased including:
- Your profile and birth chart data
- Saved tarot readings and journal entries
- AI conversation history
- Subscription and purchase history

To cancel this request, visit: ${cancelUrl}

If you want to download your data before deletion, visit your profile page and use the "Export Data" option.

Questions? Reply to this email or contact support.

© ${new Date().getFullYear()} Lunar Computing, Inc.
  `.trim();
}

export function generateWelcomeEmailText(
  userEmail: string,
  userName?: string,
): string {
  const displayName = userName || 'Cosmic Traveler';
  const baseUrl = getBaseUrl();

  return `
Welcome to Lunary, ${displayName}!

Your cosmic journey has officially begun. Lunary is your personal companion for exploring astrology, tarot, moon phases, and spiritual growth.

Get started with:
★ Set up your birth chart for personalized insights
★ Check today's moon phase and cosmic weather
★ Pull a daily tarot card for guidance
★ Explore the Grimoire for cosmic knowledge

Complete your profile: ${baseUrl}/profile

---
Unsubscribe: ${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc.
  `.trim();
}
