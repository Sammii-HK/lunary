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

// ─── Day 3: Have You Tried These Yet? ──────────────────────────────────

interface PostUpgradeDay3Props {
  userName: string;
  userEmail?: string;
}

function PostUpgradeDay3Email({ userName, userEmail }: PostUpgradeDay3Props) {
  const baseUrl = getBaseUrl();

  const features = [
    {
      title: 'Astral Guide chat',
      description:
        'Ask any question about your chart. Your placements, your transits, your compatibility. The Astral Guide knows your chart inside out.',
      href: `${baseUrl}/astral-guide`,
      color: '#fbbf24',
    },
    {
      title: 'Synastry',
      description:
        'Compare your chart with someone special. See where your energies align, where they challenge each other, and what makes the connection unique.',
      href: `${baseUrl}/compatibility`,
      color: '#f9a8d4',
    },
    {
      title: 'Personalised transits',
      description:
        'Check what is active in YOUR sky today. Not a generic forecast for your sun sign, but the actual planets hitting your actual chart right now.',
      href: `${baseUrl}/dashboard`,
      color: '#c4b5fd',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>3 premium features worth exploring this week</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Have you tried these yet?
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You have had Lunary+ for a few days now. Here are three features
            that are worth exploring this week:
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
                href={`${feature.href}?utm_source=email&utm_medium=lifecycle&utm_campaign=post_upgrade&utm_content=day3`}
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
            href={`${baseUrl}/dashboard?utm_source=email&utm_medium=lifecycle&utm_campaign=post_upgrade&utm_content=day3`}
            label='Explore Your Dashboard'
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

// ─── Day 7: Your First Week in Review ──────────────────────────────────

interface PostUpgradeDay7Props {
  userName: string;
  daysActive?: number;
  userEmail?: string;
}

function PostUpgradeDay7Email({
  userName,
  daysActive,
  userEmail,
}: PostUpgradeDay7Props) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Your first week with Lunary+, in numbers</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your first week in review
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You have been a Lunary+ member for 7 days. That is your first full
            week of personalised cosmic guidance.
          </Text>

          {daysActive !== undefined && (
            <Section
              style={{
                textAlign: 'center' as const,
                margin: '24px 0',
                padding: '20px',
                background: 'rgba(147, 112, 219, 0.08)',
                borderRadius: '8px',
              }}
            >
              <Text
                style={{
                  color: '#c4b5fd',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                }}
              >
                {daysActive} / 7
              </Text>
              <Text
                style={{
                  color: '#d4d4e8',
                  fontSize: '14px',
                  margin: 0,
                }}
              >
                days active this week
              </Text>
            </Section>
          )}

          <Text style={textStyle}>
            The magic of Lunary compounds over time. Each day you check in, you
            build a clearer picture of your cosmic patterns. The transits shift,
            the moon changes phase, and your chart responds in ways that only
            become visible with consistent attention.
          </Text>

          <Text
            style={{
              color: '#c4b5fd',
              fontSize: '15px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Features you might not have discovered yet:
          </Text>
          <Section
            style={{
              padding: '16px',
              background: 'rgba(147, 112, 219, 0.08)',
              borderRadius: '8px',
              margin: '12px 0',
            }}
          >
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '15px',
                margin: '4px 0',
              }}
            >
              <strong style={{ color: '#fbbf24' }}>Journal</strong> — Record
              your thoughts alongside your daily transits. Over time, you will
              start to see which cosmic patterns affect you most.
            </Text>
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '15px',
                margin: '4px 0',
              }}
            >
              <strong style={{ color: '#f9a8d4' }}>Streaks</strong> — Build a
              daily practice. The more consistently you check in, the richer
              your insights become.
            </Text>
          </Section>

          <CtaButton
            href={`${baseUrl}/dashboard?utm_source=email&utm_medium=lifecycle&utm_campaign=post_upgrade&utm_content=day7`}
            label='Continue Your Journey'
          />

          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Thank you for choosing Lunary+. We are glad you are here.
          </Text>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Render Functions ──────────────────────────────────────────────────

export async function renderPostUpgradeDay3(props: PostUpgradeDay3Props) {
  return await render(<PostUpgradeDay3Email {...props} />);
}

export async function renderPostUpgradeDay7(props: PostUpgradeDay7Props) {
  return await render(<PostUpgradeDay7Email {...props} />);
}
