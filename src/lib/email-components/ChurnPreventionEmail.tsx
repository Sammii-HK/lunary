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

interface ChurnPreventionProps {
  userName: string;
  sunSign?: string;
  daysSinceLastVisit: number;
  userEmail?: string;
}

function ChurnPreventionEmailComponent({
  userName,
  sunSign,
  daysSinceLastVisit,
  userEmail,
}: ChurnPreventionProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>
        The planets have been busy — here is what changed in your chart
      </Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            A Lot Has Shifted
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            It has been {daysSinceLastVisit} days since you last checked in. The
            planets do not pause — and a few things have shifted in your chart
            since then.
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
              While you were away:
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              The Moon has moved through {Math.floor(daysSinceLastVisit / 2.5)}{' '}
              signs, shifting your emotional rhythm
            </Text>
            {sunSign && (
              <Text
                style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
              >
                New transits are forming to your {sunSign} Sun and other natal
                placements
              </Text>
            )}
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Your personalised daily guidance has been tracking it all
            </Text>
          </Section>

          <Text style={textStyle}>
            Your chart and all your saved data are exactly where you left them.
            It takes 30 seconds to catch up on what is active for you right now.
          </Text>

          <CtaButton
            href={`${baseUrl}/dashboard?utm_source=email&utm_medium=lifecycle&utm_campaign=churn_prevention`}
            label='See What Changed'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            This is a one-time nudge. We will not keep emailing.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export async function renderChurnPrevention(props: ChurnPreventionProps) {
  return await render(<ChurnPreventionEmailComponent {...props} />);
}
