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

interface OverdueInvoiceEmailProps {
  userName: string;
  billingPortalUrl: string;
  userEmail?: string;
}

export function OverdueInvoiceEmail({
  userName,
  billingPortalUrl,
  userEmail,
}: OverdueInvoiceEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>Action Required: Your Payment Failed - Lunary</title>
      </Head>
      <Preview>
        Your recent payment failed. Update your payment method to keep your
        access.
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
              style={{ color: '#dc2626', fontSize: '28px', margin: 0 }}
            >
              Payment Failed
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              We were unable to process your most recent payment for your Lunary
              subscription. This can happen if your card expired, had
              insufficient funds, or was declined by your bank.
            </Text>

            <Section
              style={{
                background: '#fef2f2',
                borderLeft: '4px solid #dc2626',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#991b1b', fontSize: '16px' }}
              >
                What happens next
              </Heading>
              <Text style={{ color: '#7f1d1d', marginBottom: 0 }}>
                If the payment issue isn&apos;t resolved, your access to
                personalized horoscopes, tarot readings, transit calendar, and
                other premium features will be paused. Your data will remain
                safe.
              </Text>
            </Section>

            <Text>
              Please update your payment method to continue your cosmic journey
              uninterrupted:
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <Link
                href={billingPortalUrl}
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
                Update Payment Method
              </Link>
            </Section>

            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              If you believe this is an error, please contact your bank or reach
              out to us at{' '}
              <Link
                href='mailto:support@lunary.app'
                style={{ color: '#6366f1' }}
              >
                support@lunary.app
              </Link>
              .
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

export async function generateOverdueInvoiceEmailHTML(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <OverdueInvoiceEmail
      userName={userName}
      billingPortalUrl={billingPortalUrl}
      userEmail={userEmail}
    />,
  );
}

export function generateOverdueInvoiceEmailText(
  userName: string,
  billingPortalUrl: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Action Required: Your Payment Failed - Lunary

Hi ${userName || 'there'},

We were unable to process your most recent payment for your Lunary subscription. This can happen if your card expired, had insufficient funds, or was declined by your bank.

WHAT HAPPENS NEXT:
If the payment issue isn't resolved, your access to personalized horoscopes, tarot readings, transit calendar, and other premium features will be paused. Your data will remain safe.

Please update your payment method to continue your cosmic journey uninterrupted:

Update your payment method: ${billingPortalUrl}

If you believe this is an error, please contact your bank or reach out to us at support@lunary.app.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
