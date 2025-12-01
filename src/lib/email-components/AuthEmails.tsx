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
        <title>Verify Your Email - Lunary</title>
      </Head>
      <Preview>
        Welcome to Lunary! Verify your email to start your cosmic journey.
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
              Welcome to Lunary
            </Heading>
            <Text
              style={{ color: '#6b7280', fontSize: '16px', margin: '8px 0 0' }}
            >
              Your Cosmic Journey Begins
            </Text>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi there,</Text>
            <Text>
              Thank you for joining Lunary! To complete your registration and
              start your cosmic journey, please verify your email address.
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
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                ✨ Verify Your Email
              </Link>
            </Section>

            <Text>This link will expire in 24 hours for security reasons.</Text>

            <Text>
              <strong>
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </strong>
            </Text>
            <Section
              style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '6px',
                margin: '20px 0',
                wordBreak: 'break-all' as const,
                fontSize: '14px',
              }}
            >
              <Text style={{ margin: 0 }}>{verificationUrl}</Text>
            </Section>

            <Text>Once verified, you&apos;ll have access to:</Text>
            <Text style={{ margin: '15px 0' }}>
              🌙 Personalized moon phase guidance
              <br />
              ✨ Daily tarot insights
              <br />
              🔮 Astrological horoscopes
              <br />
              📚 Digital grimoire and spells
              <br />
              ☁️ Cross-device sync
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
              If you didn&apos;t create an account with Lunary, you can safely
              ignore this email.
            </Text>
            <Text>
              Questions? Reply to this email or visit our support page.
            </Text>
            <Section
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Text style={{ margin: 0 }}>
                <Link
                  href={unsubscribeUrl}
                  style={{ color: '#6b7280', textDecoration: 'underline' }}
                >
                  Unsubscribe
                </Link>
                {' | '}
                <Link
                  href={`${baseUrl}/profile`}
                  style={{ color: '#6b7280', textDecoration: 'underline' }}
                >
                  Manage Preferences
                </Link>
              </Text>
            </Section>
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙
              for your cosmic journey.
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
          color: '#333',
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
            <Text style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</Text>
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
Welcome to Lunary! 🌙

Thank you for joining us. To complete your registration and start your cosmic journey, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours for security reasons.

Once verified, you'll have access to:
- 🌙 Personalized moon phase guidance
- ✨ Daily tarot insights  
- 🔮 Astrological horoscopes
- 📚 Digital grimoire and spells
- ☁️ Cross-device sync

If you didn't create an account with Lunary, you can safely ignore this email.

Questions? Reply to this email or visit our support page.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
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
