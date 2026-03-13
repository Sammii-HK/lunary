import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

function EmailContainer({ children }: { children: React.ReactNode }) {
  return (
    <Container
      style={{
        background: '#101020',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 20px 45px rgba(106, 90, 205, 0.25)',
        border: '1px solid rgba(147, 112, 219, 0.2)',
        color: '#f1f1ff',
      }}
    >
      {children}
    </Container>
  );
}

function EmailFooter({
  userEmail,
  baseUrl,
}: {
  userEmail?: string;
  baseUrl: string;
}) {
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return (
    <Section
      style={{
        textAlign: 'center' as const,
        marginTop: '40px',
        color: '#6b7280',
        fontSize: '14px',
        borderTop: '1px solid rgba(147, 112, 219, 0.15)',
        paddingTop: '20px',
      }}
    >
      <Text style={{ margin: 0 }}>Lunar Computing, Inc.</Text>
      <Link
        href={unsubscribeUrl}
        style={{ color: '#9ca3af', fontSize: '12px' }}
      >
        Unsubscribe
      </Link>
    </Section>
  );
}

function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
      <Link
        href={href}
        style={{
          background: 'linear-gradient(135deg, #6a5acd 0%, #9370db 100%)',
          color: '#ffffff',
          padding: '14px 32px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          display: 'inline-block',
        }}
      >
        {label}
      </Link>
    </Section>
  );
}

const bodyStyle = {
  background: '#0a0a1a',
  padding: '20px',
  fontFamily: 'sans-serif',
};

const textStyle = { color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' };

// ─── Email 2: Benefit-Focused (24hr) ───────────────────────────────────

interface AbandonedCheckoutEmail2Props {
  userName: string;
  planType?: string;
  userEmail?: string;
}

function AbandonedCheckoutEmail2Component({
  userName,
  userEmail,
}: AbandonedCheckoutEmail2Props) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Here is exactly what you get with Lunary+</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Here Is What You Were About to Unlock
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            Yesterday you were a click away from unlocking the full Lunary
            experience. Here is exactly what is waiting for you:
          </Text>

          <Section
            style={{
              padding: '16px',
              background: 'rgba(147, 112, 219, 0.1)',
              borderRadius: '8px',
              borderLeft: '3px solid #9370db',
              margin: '16px 0',
            }}
          >
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Personalised daily transits mapped to YOUR birth chart
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Astral Guide chat: ask any question, get answers from 2,000+
              grimoire articles
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Moon phase dashboard calibrated to your placements
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Tarot readings with cosmic context from your transits
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Full synastry chart comparisons
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              All content ad-free, privacy-first
            </Text>
          </Section>

          <Text style={textStyle}>
            Your checkout was not completed and you were not charged. You can
            pick up right where you left off.
          </Text>

          <CtaButton
            href={`${baseUrl}/pricing?utm_source=email&utm_medium=lifecycle&utm_campaign=abandoned_checkout_drip2`}
            label='Continue to Checkout'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Have a question? Just reply to this email.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Email 3: Coupon Offer (72hr) ──────────────────────────────────────

interface AbandonedCheckoutEmail3Props {
  userName: string;
  couponCode?: string;
  discountPercent?: number;
  userEmail?: string;
}

function AbandonedCheckoutEmail3Component({
  userName,
  couponCode = 'WELCOME15',
  discountPercent = 15,
  userEmail,
}: AbandonedCheckoutEmail3Props) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>A little something to help you decide</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            A Little Something for You
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            We know subscribing is a commitment, so we wanted to make it a
            little easier. Here is {discountPercent}% off your first month of
            Lunary+:
          </Text>

          <Section
            style={{
              padding: '20px',
              background: 'rgba(147, 112, 219, 0.15)',
              borderRadius: '8px',
              border: '1px dashed rgba(147, 112, 219, 0.4)',
              textAlign: 'center' as const,
              margin: '16px 0',
            }}
          >
            <Text
              style={{
                color: '#c4b5fd',
                fontSize: '14px',
                margin: '0 0 8px 0',
                textTransform: 'uppercase' as const,
                letterSpacing: '1px',
              }}
            >
              Your code
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
                letterSpacing: '3px',
              }}
            >
              {couponCode}
            </Text>
          </Section>

          <Text style={textStyle}>
            As a quick reminder, here is what you will unlock:
          </Text>

          <Section
            style={{
              padding: '16px',
              background: 'rgba(147, 112, 219, 0.1)',
              borderRadius: '8px',
              borderLeft: '3px solid #9370db',
              margin: '16px 0',
            }}
          >
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Personalised daily transits mapped to your birth chart
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Astral Guide chat with 2,000+ grimoire articles
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Full synastry charts, moon dashboard, and ad-free experience
            </Text>
          </Section>

          <CtaButton
            href={`${baseUrl}/pricing?coupon=${encodeURIComponent(couponCode)}&utm_source=email&utm_medium=lifecycle&utm_campaign=abandoned_checkout_drip3`}
            label={`Claim Your ${discountPercent}% Off`}
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            This offer expires in 48 hours.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Render Functions ──────────────────────────────────────────────────

export async function renderAbandonedCheckoutEmail2(
  props: AbandonedCheckoutEmail2Props,
): Promise<string> {
  return await render(<AbandonedCheckoutEmail2Component {...props} />);
}

export async function renderAbandonedCheckoutEmail3(
  props: AbandonedCheckoutEmail3Props,
): Promise<string> {
  return await render(<AbandonedCheckoutEmail3Component {...props} />);
}
