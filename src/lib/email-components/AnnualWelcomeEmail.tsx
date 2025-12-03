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

interface AnnualWelcomeEmailProps {
  userName: string;
  userEmail?: string;
}

export function AnnualWelcomeEmail({
  userName,
  userEmail,
}: AnnualWelcomeEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>Welcome to Lunary+ Annual - Lunary</title>
      </Head>
      <Preview>
        Welcome to Lunary+ Annual! Here are your exclusive features.
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
            <Text
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px',
              }}
            >
              Annual Member
            </Text>
            <Heading
              as='h1'
              style={{ color: '#6366f1', fontSize: '28px', margin: 0 }}
            >
              Welcome to Lunary+ Annual!
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Thank you for choosing Lunary+ Annual! As an annual member, you
              have access to exclusive features designed for deeper cosmic
              exploration.
            </Text>

            <Section
              style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
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
                Your Exclusive Annual Features:
              </Heading>
              <Text style={{ color: '#78350f', margin: 0 }}>
                🌟 <strong>Yearly Forecast</strong> - Your personalised cosmic
                outlook for the entire year
                <br />
                <br />
                📊 <strong>Data Export</strong> - Download your journal entries
                and insights
                <br />
                <br />⭐ <strong>Priority Features</strong> - Early access to
                new features
                <br />
                <br />
                💎 <strong>Best Value</strong> - Save compared to monthly
              </Text>
            </Section>

            <Section
              style={{
                background: '#f3f4f6',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#6366f1', fontSize: '16px' }}
              >
                Start Exploring:
              </Heading>
              <Text style={{ margin: 0 }}>
                🔮 <strong>Yearly Forecast</strong> - See what the cosmos has in
                store
                <br />
                💬 <strong>Astral Guide</strong> - Your AI companion with memory
                <br />
                📓 <strong>Book of Shadows</strong> - Journal with pattern
                analysis
                <br />
                🌙 <strong>Moon Circles</strong> - Lunar rituals and guidance
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <Link
                href={`${baseUrl}/forecast`}
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
                View Your Yearly Forecast →
              </Link>
            </Section>

            <Text>
              We&apos;re thrilled to have you as an annual member. If you have
              any questions, just reply to this email.
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

export async function generateAnnualWelcomeEmailHTML(
  userName: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <AnnualWelcomeEmail userName={userName} userEmail={userEmail} />,
  );
}

export function generateAnnualWelcomeEmailText(
  userName: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Welcome to Lunary+ Annual! 🌟

Hi ${userName || 'there'},

Thank you for choosing Lunary+ Annual! As an annual member, you have access to exclusive features designed for deeper cosmic exploration.

Your Exclusive Annual Features:
- 🌟 Yearly Forecast - Your personalised cosmic outlook for the entire year
- 📊 Data Export - Download your journal entries and insights
- ⭐ Priority Features - Early access to new features
- 💎 Best Value - Save compared to monthly

Start Exploring:
- 🔮 Yearly Forecast - See what the cosmos has in store
- 💬 Astral Guide - Your AI companion with memory
- 📓 Book of Shadows - Journal with pattern analysis
- 🌙 Moon Circles - Lunar rituals and guidance

View your Yearly Forecast: ${baseUrl}/forecast

We're thrilled to have you as an annual member. If you have any questions, just reply to this email.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
