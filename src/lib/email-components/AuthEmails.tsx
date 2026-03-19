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

interface VerificationEmailProps {
  verificationUrl: string;
  userEmail: string;
}

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail: string;
}

export function VerificationEmail({
  verificationUrl,
  userEmail,
}: VerificationEmailProps) {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  return (
    <Html>
      <Head>
        <title>One click to start your trial - Lunary</title>
      </Head>
      <Preview>
        Your birth chart and 7 days of personalised readings are ready. Click to
        verify and start.
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
              style={{ color: '#a78bfa', fontSize: '28px', margin: 0 }}
            >
              One click to start
            </Heading>
            <Text
              style={{ color: '#d1c4ff', fontSize: '16px', margin: '12px 0 0' }}
            >
              Your 7-day trial is waiting
            </Text>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            Click below to verify your email and unlock your full Lunary+ trial:
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <Link
              href={verificationUrl}
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
              Start my trial
            </Link>
          </Section>

          <Text
            style={{ color: '#9ca3af', fontSize: '13px', margin: '8px 0 24px' }}
          >
            This also verifies your email. Link expires in 24 hours.
          </Text>

          <Section
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              margin: '0 0 20px',
            }}
          >
            <Text
              style={{
                color: '#d1c4ff',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px',
              }}
            >
              Here&apos;s what&apos;s included:
            </Text>
            <Text
              style={{ color: '#d1c4ff', fontSize: '14px', margin: '4px 0' }}
            >
              Your full birth chart with all placements
            </Text>
            <Text
              style={{ color: '#d1c4ff', fontSize: '14px', margin: '4px 0' }}
            >
              Daily tarot pulled for your specific energy
            </Text>
            <Text
              style={{ color: '#d1c4ff', fontSize: '14px', margin: '4px 0' }}
            >
              Personalised horoscope and transit alerts
            </Text>
            <Text
              style={{ color: '#d1c4ff', fontSize: '14px', margin: '4px 0' }}
            >
              Astral Guide — ask anything about your chart
            </Text>
          </Section>

          <Text
            style={{ color: '#9ca3af', margin: '16px 0', fontSize: '13px' }}
          >
            If the button doesn&apos;t work, paste this URL in your browser:
          </Text>
          <Section
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              margin: '8px 0 20px',
              wordBreak: 'break-all' as const,
              fontSize: '12px',
              border: '1px dashed rgba(167, 139, 250, 0.35)',
              color: '#e1d9ff',
            }}
          >
            <Text style={{ margin: 0 }}>{verificationUrl}</Text>
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
            <Text style={{ margin: 0 }}>
              If you didn&apos;t create an account with Lunary, you can safely
              ignore this email.
            </Text>
            <Text style={{ margin: '12px 0' }}>
              Questions? Reply to this email or visit our support page.
            </Text>
            <Text style={{ margin: '12px 0' }}>
              <Link
                href={unsubscribeUrl}
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
              © {new Date().getFullYear()} Lunar Computing, Inc. Guided by the
              stars, powered by magic.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function PasswordResetEmail({
  resetUrl,
  userEmail,
}: PasswordResetEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head>
        <title>Reset Your Password - Lunary</title>
      </Head>
      <Preview>
        Reset your Lunary password - this link expires in one hour.
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
              style={{ margin: 0, fontSize: '28px', color: '#a78bfa' }}
            >
              Reset your cosmic password
            </Heading>
            <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
              We received a request to reset the password for{' '}
              <strong style={{ color: '#f9fafb' }}>{userEmail}</strong>.
            </Text>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            Click the secure link below to choose a new password. This link will
            expire in one hour for your protection.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <Link
              href={resetUrl}
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
              Reset Password
            </Link>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            If clicking the button doesn&apos;t work, copy and paste this URL
            into your browser:
          </Text>
          <Section
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '16px',
              borderRadius: '12px',
              wordBreak: 'break-word' as const,
              fontSize: '14px',
              border: '1px dashed rgba(167, 139, 250, 0.35)',
              color: '#e1d9ff',
            }}
          >
            <Text style={{ margin: 0 }}>{resetUrl}</Text>
          </Section>

          <Text style={{ color: '#d1c4ff', margin: '16px 0' }}>
            If you didn&apos;t request this change, you can safely ignore this
            email—your password will remain the same.
          </Text>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '32px',
              fontSize: '13px',
              color: '#9ca3af',
            }}
          >
            <Text style={{ margin: 0 }}>
              Need help? Reply to this email or visit our support page.
            </Text>
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc. Guided by the
              stars, powered by magic.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateVerificationEmailHTML(
  verificationUrl: string,
  userEmail: string,
): Promise<string> {
  return await render(
    <VerificationEmail
      verificationUrl={verificationUrl}
      userEmail={userEmail}
    />,
  );
}

export function generateVerificationEmailText(
  verificationUrl: string,
  userEmail: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  return `
Your 7-day Lunary+ trial is ready.

Click this link to verify your email and start:
${verificationUrl}

Here's what's included:
- Your full birth chart with all placements
- Daily tarot pulled for your specific energy
- Personalised horoscope and transit alerts
- Astral Guide — ask anything about your chart

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc.
  `.trim();
}

export async function generatePasswordResetEmailHTML(
  resetUrl: string,
  userEmail: string,
): Promise<string> {
  return await render(
    <PasswordResetEmail resetUrl={resetUrl} userEmail={userEmail} />,
  );
}

export function generatePasswordResetEmailText(
  resetUrl: string,
  userEmail: string,
): string {
  return `
Reset Your Password - Lunary

We received a request to reset the password for ${userEmail}.

Click the secure link below to set a new password. This link will expire in one hour:

${resetUrl}

If you didn't request this change, you can safely ignore this email and your password will stay the same.

Need help? Reply to this email or visit our support page.

© ${new Date().getFullYear()} Lunar Computing, Inc. Guided by the stars, powered by magic.
  `.trim();
}
