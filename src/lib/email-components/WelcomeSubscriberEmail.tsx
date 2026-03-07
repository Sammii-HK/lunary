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

// ─── Welcome to Lunary+ ─────────────────────────────────────────────────

interface WelcomeSubscriberProps {
  userName: string;
  planType: string;
  userEmail?: string;
}

function WelcomeSubscriberEmailComponent({
  userName,
  planType,
  userEmail,
}: WelcomeSubscriberProps) {
  const baseUrl = getBaseUrl();
  const planLabel = planType === 'yearly' ? 'Lunary+ (Yearly)' : 'Lunary+';

  const features = [
    {
      title: 'Personalised daily transits',
      description:
        'Every day, see exactly which planets are hitting your chart and what it means for you.',
      href: `${baseUrl}/dashboard`,
      color: '#fbbf24',
    },
    {
      title: 'Full birth chart with interpretations',
      description:
        'All your placements, houses, and aspects with detailed readings you can revisit any time.',
      href: `${baseUrl}/birth-chart`,
      color: '#c4b5fd',
    },
    {
      title: 'Tarot readings with cosmic context',
      description:
        'Pull cards with your chart and current transits woven into the interpretation.',
      href: `${baseUrl}/tarot`,
      color: '#f9a8d4',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {planLabel} — here are 3 features to try first
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
            Welcome to {planLabel}
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You are in. Everything is unlocked. Here are the three features
            worth exploring first:
          </Text>

          {features.map((feature, i) => (
            <Section
              key={i}
              style={{
                padding: '16px',
                background: 'rgba(147, 112, 219, 0.08)',
                borderRadius: '8px',
                borderLeft: `3px solid ${feature.color}`,
                margin: '12px 0',
              }}
            >
              <Link
                href={`${feature.href}?utm_source=email&utm_medium=lifecycle&utm_campaign=welcome_subscriber`}
                style={{
                  color: feature.color,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                {i + 1}. {feature.title}
              </Link>
              <Text
                style={{
                  color: '#d4d4e8',
                  fontSize: '14px',
                  margin: '4px 0 0 0',
                  lineHeight: '1.6',
                }}
              >
                {feature.description}
              </Text>
            </Section>
          ))}

          <CtaButton
            href={`${baseUrl}/dashboard?utm_source=email&utm_medium=lifecycle&utm_campaign=welcome_subscriber`}
            label='Open Your Dashboard'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Questions or feedback? Reply to this email any time.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export async function renderWelcomeSubscriber(props: WelcomeSubscriberProps) {
  return await render(<WelcomeSubscriberEmailComponent {...props} />);
}
