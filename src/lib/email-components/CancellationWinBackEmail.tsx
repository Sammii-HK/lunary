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

interface CancellationWinBackEmailProps {
  userName: string;
  userEmail?: string;
}

export function CancellationWinBackEmail({
  userName,
  userEmail,
}: CancellationWinBackEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>We&apos;ll Miss You - Lunary</title>
      </Head>
      <Preview>
        We&apos;re sorry to see you go. Here&apos;s a gift if you change your
        mind.
      </Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#333',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Container
          style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '30px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='120'
              style={{ margin: '0 auto 20px', display: 'block' }}
            />
            <Heading
              as='h1'
              style={{ color: '#6366f1', fontSize: '28px', margin: 0 }}
            >
              We&apos;ll Miss You
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              We&apos;re sorry to see you go. We hope Lunary brought some cosmic
              clarity to your days.
            </Text>
            <Text>
              If you ever want to return, we&apos;d love to have you back.
              Here&apos;s a gift for whenever you&apos;re ready:
            </Text>

            <Section
              style={{
                margin: '30px 0',
                background: '#f4f4f5',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <Text style={{ fontWeight: 600, marginBottom: '8px' }}>
                Before you go, can we learn from you?
              </Text>
              <Text style={{ margin: '4px 0' }}>
                • What could we improve so Lunary feels more helpful?
              </Text>
              <Text style={{ margin: '4px 0' }}>
                • What didn&apos;t feel quite right or felt missing?
              </Text>
              <Text style={{ margin: '4px 0' }}>
                • What would make you excited to return?
              </Text>
              <Text style={{ marginTop: '12px', color: '#4338ca' }}>
                Reply to this email or send your thoughts to{' '}
                <Link
                  href='mailto:feedback@lunary.app'
                  style={{ color: '#4338ca' }}
                >
                  feedback@lunary.app
                </Link>
                .
              </Text>
            </Section>

            <Section
              style={{
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                borderLeft: '4px solid #6366f1',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
                textAlign: 'center' as const,
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#4338ca', fontSize: '16px' }}
              >
                1 Month Free
              </Heading>
              <Text
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#6366f1',
                  margin: '10px 0',
                  letterSpacing: '2px',
                }}
              >
                GUIDANCE
              </Text>
              <Text style={{ color: '#3730a3', margin: 0, fontSize: '14px' }}>
                Use this code when you&apos;re ready to return
              </Text>
            </Section>

            <Text>
              Your cosmic data is safe with us. If you return, everything will
              be waiting for you—your birth chart, journal entries, and
              patterns.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <Link
                href={`${baseUrl}/pricing`}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  padding: '16px 32px',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                Return to Lunary →
              </Link>
            </Section>

            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              No pressure—this code doesn&apos;t expire. Take your time.
            </Text>
          </Section>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '40px',
              color: '#6b7280',
              fontSize: '14px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px',
            }}
          >
            <Text style={{ margin: 0 }}>
              © {new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙
              for your cosmic journey.
            </Text>
            <Text style={{ margin: '10px 0 0 0' }}>
              <Link href={unsubscribeUrl} style={{ color: '#6b7280' }}>
                Unsubscribe
              </Link>
              {' | '}
              <Link href={`${baseUrl}/profile`} style={{ color: '#6b7280' }}>
                Manage Preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
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
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
We'll Miss You - Lunary 🌙

Hi ${userName || 'there'},

We're sorry to see you go. We hope Lunary brought some cosmic clarity to your days.

If you ever want to return, we'd love to have you back. Here's a gift for whenever you're ready:

---
1 MONTH FREE
Code: GUIDANCE
Use this code when you're ready to return
---

Before you go, can we learn from you?
- What could we improve so Lunary feels more helpful?
- What didn't feel quite right or felt missing?
- What would make you excited to return?

Reply to this email or send your thoughts to feedback@lunary.app.

Your cosmic data is safe with us. If you return, everything will be waiting for you—your birth chart, journal entries, and patterns.

Return to Lunary: ${baseUrl}/pricing

No pressure—this code doesn't expire. Take your time.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
