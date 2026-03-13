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

// ─── Email 2: Your cosmic toolkit (Day 2) ──────────────────────────────

interface WelcomeDay2Props {
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function WelcomeDay2EmailComponent({
  userName,
  sunSign,
  userEmail,
}: WelcomeDay2Props) {
  const baseUrl = getBaseUrl();
  const utm = 'utm_source=email&utm_medium=lifecycle&utm_campaign=welcome_day2';

  const pillars = [
    {
      title: 'Real astronomical precision',
      description:
        'Lunary uses astronomy-engine for every calculation: real planetary positions, not AI guesswork or recycled tables.',
      color: '#fbbf24',
    },
    {
      title: 'Free birth chart with 24+ celestial bodies',
      description:
        'Placidus houses, all major and minor asteroids, and detailed aspect tables. No paywall, no sign-up tricks.',
      color: '#c4b5fd',
    },
    {
      title: '2,000+ grimoire articles',
      description:
        'Placements, transits, moon phases, retrogrades, crystals, tarot: all free, all searchable, all written for real learners.',
      color: '#f9a8d4',
    },
    {
      title: 'Personalised daily dashboard',
      description: sunSign
        ? `As a ${sunSign}, your dashboard shows the transits, moon phases, and sky events that matter most to you right now.`
        : 'Your dashboard surfaces the transits, moon phases, and sky events that matter most to you right now.',
      color: '#34d399',
    },
    {
      title: 'Privacy-first, ad-free, indie',
      description:
        'No trackers selling your birth data. No ads cluttering your readings. Just a small, independent team building something honest.',
      color: '#60a5fa',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>5 things Lunary gives you that other apps don't</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your cosmic toolkit
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You signed up a couple of days ago, so here is a quick look at what
            makes Lunary different from every other astrology app out there.
          </Text>

          {pillars.map((pillar, i) => (
            <Section
              key={i}
              style={{
                padding: '16px',
                background: 'rgba(147, 112, 219, 0.08)',
                borderRadius: '8px',
                borderLeft: `3px solid ${pillar.color}`,
                margin: '12px 0',
              }}
            >
              <Text
                style={{
                  color: pillar.color,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                }}
              >
                {i + 1}. {pillar.title}
              </Text>
              <Text
                style={{
                  color: '#d4d4e8',
                  fontSize: '14px',
                  margin: '4px 0 0 0',
                  lineHeight: '1.6',
                }}
              >
                {pillar.description}
              </Text>
            </Section>
          ))}

          <Text style={textStyle}>
            That is the short version. The best way to see it is to explore for
            yourself.
          </Text>

          <CtaButton
            href={`${baseUrl}/dashboard?${utm}`}
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

// ─── Email 3: Unlock your full picture (Day 5) ─────────────────────────

interface WelcomeDay5Props {
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function WelcomeDay5EmailComponent({
  userName,
  sunSign,
  userEmail,
}: WelcomeDay5Props) {
  const baseUrl = getBaseUrl();
  const utm = 'utm_source=email&utm_medium=lifecycle&utm_campaign=welcome_day5';

  const proFeatures = [
    {
      title: 'Personalised sky events based on YOUR chart',
      description: sunSign
        ? `As a ${sunSign}, you will see exactly which transits are activating your placements, not generic forecasts for millions of people.`
        : 'See exactly which transits are activating your placements, not generic forecasts for millions of people.',
      color: '#fbbf24',
    },
    {
      title: 'Moon phase dashboard calibrated to your placements',
      description:
        'Each lunar phase hits your chart differently. Lunary+ shows you what each phase means for your specific houses and aspects.',
      color: '#c4b5fd',
    },
    {
      title: 'Daily transit notifications specific to your chart',
      description:
        'Get a heads-up when a planet crosses one of your natal points, so you are never caught off guard by a big shift.',
      color: '#f9a8d4',
    },
    {
      title: 'Astral Guide chat',
      description:
        'Ask questions and get answers grounded in the grimoire. It retrieves real knowledge from over 2,000 articles, not hallucinated fluff.',
      color: '#34d399',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>Here is what you are missing on the free tier</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Unlock your full picture
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You have had a few days to explore Lunary, and hopefully the free
            tools have already been useful. But there is a whole layer of
            personalisation waiting behind Lunary+ that most users never realise
            exists.
          </Text>
          <Text style={textStyle}>Here is what the Pro tier unlocks:</Text>

          {proFeatures.map((feature, i) => (
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
              <Text
                style={{
                  color: feature.color,
                  fontSize: '15px',
                  fontWeight: 'bold',
                  margin: '0 0 4px 0',
                }}
              >
                {feature.title}
              </Text>
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

          <Text style={textStyle}>
            No commitment required. Try Lunary+ free for 7 days and see how much
            deeper your practice can go when everything is calibrated to your
            chart.
          </Text>

          <CtaButton
            href={`${baseUrl}/pricing?${utm}`}
            label='Start Your Free Trial'
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

// ─── Render Functions ───────────────────────────────────────────────────

export async function renderWelcomeDay2(
  props: WelcomeDay2Props,
): Promise<string> {
  return await render(<WelcomeDay2EmailComponent {...props} />);
}

export async function renderWelcomeDay5(
  props: WelcomeDay5Props,
): Promise<string> {
  return await render(<WelcomeDay5EmailComponent {...props} />);
}
