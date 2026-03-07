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

// ─── Shared Components (dark theme) ─────────────────────────────────────

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

// ─── Day 3: What You Missed ────────────────────────────────────────────

interface WinBackDay3Props {
  userName: string;
  sunSign?: string;
  missedDays: number;
  userEmail?: string;
}

function WinBackDay3Email({
  userName,
  sunSign,
  missedDays,
  userEmail,
}: WinBackDay3Props) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>{`${missedDays} days of personalised guidance you missed`}</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Chart is Still Here
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            It has been {missedDays} days since your trial ended. In that time,
            the planets have kept moving — and your chart has been tracking it
            all.
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
              style={{
                color: '#c4b5fd',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
              }}
            >
              What you missed:
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              {missedDays} personalised daily transit readings
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Moon phase guidance tailored to your natal Moon
            </Text>
            {sunSign && (
              <Text
                style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
              >
                Transits to your {sunSign} Sun and other placements
              </Text>
            )}
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Cosmic timing for decisions, planning, and reflection
            </Text>
          </Section>

          <Text style={textStyle}>
            Your birth chart, saved readings, and journal entries are all still
            waiting. Nothing has been deleted.
          </Text>

          <CtaButton
            href={`${baseUrl}/pricing?utm_source=email&utm_medium=lifecycle&utm_campaign=winback&utm_content=day3`}
            label='Pick Up Where You Left Off'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Your data is safe. Subscribe any time to reactivate everything.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 7: Last Chance with Discount ───────────────────────────────────

interface WinBackDay7Props {
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function WinBackDay7Email({ userName, sunSign, userEmail }: WinBackDay7Props) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>A week without your chart — come back for 20% off</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            We Would Love You Back
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            It has been a week since your trial ended. We built Lunary to make
            astrology genuinely useful — not just content to scroll past, but a
            tool that helps you understand yourself and navigate your life with
            more awareness.
          </Text>

          {sunSign && (
            <Text style={textStyle}>
              Your {sunSign} Sun chart is still saved with all your placements,
              readings, and journal entries. Nothing has been lost.
            </Text>
          )}

          <Section
            style={{
              padding: '20px',
              background: 'rgba(167, 139, 250, 0.12)',
              borderRadius: '8px',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              margin: '24px 0',
              textAlign: 'center' as const,
            }}
          >
            <Text
              style={{
                color: '#a78bfa',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: '0 0 4px 0',
              }}
            >
              Come back and save 20%
            </Text>
            <Text
              style={{
                color: '#e2e8f0',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '8px 0',
                letterSpacing: '2px',
              }}
            >
              RETURN20
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '13px',
                margin: '4px 0 0 0',
              }}
            >
              Valid for 7 days
            </Text>
          </Section>

          <CtaButton
            href={`${baseUrl}/pricing?promo=RETURN20&utm_source=email&utm_medium=lifecycle&utm_campaign=winback&utm_content=day7`}
            label='Reactivate with 20% Off'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            This is the last email in this series. No more follow-ups.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Render Functions ───────────────────────────────────────────────────

export async function renderWinBackDay3(props: WinBackDay3Props) {
  return await render(<WinBackDay3Email {...props} />);
}

export async function renderWinBackDay7(props: WinBackDay7Props) {
  return await render(<WinBackDay7Email {...props} />);
}
