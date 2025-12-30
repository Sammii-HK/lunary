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

interface PromoEndingEmailProps {
  userName: string;
  daysRemaining: number;
  endDateLabel: string;
  promoCode: string;
  userEmail?: string;
}

export function PromoEndingEmail({
  userName,
  daysRemaining,
  endDateLabel,
  promoCode,
  userEmail,
}: PromoEndingEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const dayLabel = daysRemaining === 1 ? 'day' : 'days';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>Your Free Period Ends Soon - Lunary</title>
      </Head>
      <Preview>
        {`Your free period ends in ${daysRemaining} ${dayLabel}.`}
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
              Your Free Period Ends Soon
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Your free period from promo code {promoCode} is ending soon.
            </Text>

            <Section
              style={{
                background: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                padding: '18px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Text style={{ margin: 0, color: '#78350f' }}>
                {endDateLabel
                  ? `Ends on ${endDateLabel} (${daysRemaining} ${dayLabel} left).`
                  : `Ends in ${daysRemaining} ${dayLabel}.`}
              </Text>
            </Section>

            <Text>
              If you want to keep access after this period, add a payment method
              or update your plan. If you want it to end, no action is needed.
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
                Review Plans
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
              © {new Date().getFullYear()} Lunar Computing, Inc. Made with care
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

export async function generatePromoEndingEmailHTML(
  userName: string,
  daysRemaining: number,
  endDateLabel: string,
  promoCode: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <PromoEndingEmail
      userName={userName}
      daysRemaining={daysRemaining}
      endDateLabel={endDateLabel}
      promoCode={promoCode}
      userEmail={userEmail}
    />,
  );
}

export function generatePromoEndingEmailText(
  userName: string,
  daysRemaining: number,
  endDateLabel: string,
  promoCode: string,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const dayLabel = daysRemaining === 1 ? 'day' : 'days';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Your Free Period Ends Soon - Lunary

Hi ${userName || 'there'},

Your free period from promo code ${promoCode} is ending soon.
${endDateLabel ? `Ends on ${endDateLabel} (${daysRemaining} ${dayLabel} left).` : `Ends in ${daysRemaining} ${dayLabel}.`}

If you want to keep access after this period, add a payment method or update your plan.
If you want it to end, no action is needed.

Review plans: ${baseUrl}/pricing

Unsubscribe: ${unsubscribeUrl}
`;
}
