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

interface TrialExpiredEmailProps {
  userName: string;
  missedInsights: number;
  userEmail?: string;
}

export function TrialExpiredEmail({
  userName,
  missedInsights,
  userEmail,
}: TrialExpiredEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const insightLabel = missedInsights !== 1 ? 's' : '';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>Your Trial Has Ended - Lunary</title>
      </Head>
      <Preview>
        {`Your free trial has ended. You've missed ${missedInsights} personalized insight${insightLabel}!`}
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
              Your Trial Has Ended
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Your free trial has ended, but your cosmic journey doesn&apos;t
              have to!
            </Text>

            <Section
              style={{
                background: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#92400e', fontSize: '16px' }}
              >
                You&apos;ve missed {missedInsights} personalized insight
                {insightLabel} 🌙
              </Heading>
              <Text style={{ color: '#78350f', marginBottom: 0 }}>
                Your birth chart analysis, daily horoscopes, and tarot patterns
                are waiting for you.
              </Text>
            </Section>

            <Text>Rejoin Lunary to continue receiving:</Text>
            <Text style={{ margin: '15px 0' }}>
              🌟 Personalized birth chart insights
              <br />
              🔮 Daily horoscopes tailored to your chart
              <br />
              ✨ Personalized tarot readings
              <br />
              🌙 Transit calendars and cosmic guidance
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
                Continue Your Journey →
              </Link>
            </Section>
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

export async function generateTrialExpiredEmailHTML(
  userName: string,
  missedInsights: number,
  userEmail?: string,
): Promise<string> {
  return await render(
    <TrialExpiredEmail
      userName={userName}
      missedInsights={missedInsights}
      userEmail={userEmail}
    />,
  );
}

export function generateTrialExpiredEmailText(
  userName: string,
  missedInsights: number,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const insightLabel = missedInsights !== 1 ? 's' : '';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Your Trial Has Ended - Lunary

Hi ${userName || 'there'},

Your free trial has ended, but your cosmic journey doesn't have to!

You've missed ${missedInsights} personalized insight${insightLabel} 🌙

Your birth chart analysis, daily horoscopes, and tarot patterns are waiting for you.

Rejoin Lunary to continue receiving:
- 🌟 Personalized birth chart insights
- 🔮 Daily horoscopes tailored to your chart
- ✨ Personalized tarot readings
- 🌙 Transit calendars and cosmic guidance

Continue your journey: ${baseUrl}/pricing

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
