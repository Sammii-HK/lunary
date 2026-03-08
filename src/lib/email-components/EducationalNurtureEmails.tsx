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

// ─── Shared Components (matching BirthChartDripEmails dark theme) ────────

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

function ContentBox({
  children,
  borderColor = '#9370db',
  bgColor = 'rgba(147, 112, 219, 0.1)',
}: {
  children: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
}) {
  return (
    <Section
      style={{
        padding: '16px',
        background: bgColor,
        borderRadius: '8px',
        borderLeft: `3px solid ${borderColor}`,
        margin: '16px 0',
      }}
    >
      {children}
    </Section>
  );
}

const bodyStyle = {
  background: '#0a0a1a',
  padding: '20px',
  fontFamily: 'sans-serif',
};

const textStyle = { color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' };
const labelStyle = {
  color: '#c4b5fd',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  marginTop: '24px',
};
const teaserStyle = {
  color: '#9ca3af',
  fontSize: '13px',
  textAlign: 'center' as const,
};

// ─── Day 2: How to Read Your Birth Chart ────────────────────────────────

interface ReadChartEmailProps {
  userName: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  userEmail?: string;
}

function ReadYourChartEmail({
  userName,
  sunSign,
  moonSign,
  risingSign,
  userEmail,
}: ReadChartEmailProps) {
  const baseUrl = getBaseUrl();
  const hasChart = sunSign && moonSign && risingSign;

  return (
    <Html>
      <Head />
      <Preview>
        How to read your birth chart (it is simpler than you think)
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
            How to Read Your Birth Chart
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            Your birth chart can look overwhelming at first — all those lines,
            symbols, and numbers. But it breaks down into three simple layers,
            and once you understand them, the whole chart clicks.
          </Text>

          <Text style={labelStyle}>1. Planets — what energy is at play</Text>
          <ContentBox borderColor='#fbbf24' bgColor='rgba(251, 191, 36, 0.08)'>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Each planet represents a different part of you. The Sun is your
              identity. The Moon is your emotions. Mercury is how you think.
              Venus is how you love. Mars is how you act.
            </Text>
          </ContentBox>

          <Text style={labelStyle}>2. Signs — how that energy expresses</Text>
          <ContentBox borderColor='#f9a8d4' bgColor='rgba(249, 168, 212, 0.08)'>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              The zodiac sign a planet sits in colours how it shows up. Mars in
              Aries is bold and direct. Mars in Pisces is gentle and intuitive.
              Same energy, different style.
            </Text>
          </ContentBox>

          <Text style={labelStyle}>3. Houses — where it shows up in life</Text>
          <ContentBox borderColor='#93c5fd' bgColor='rgba(147, 197, 253, 0.08)'>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              The 12 houses map to areas of life — career, relationships, home,
              creativity. A planet in the 7th house? That energy plays out in
              partnerships. In the 10th? It shapes your career.
            </Text>
          </ContentBox>

          {hasChart && (
            <>
              <Text style={{ ...labelStyle, color: '#a78bfa' }}>
                Your chart at a glance:
              </Text>
              <ContentBox>
                <Text
                  style={{
                    color: '#fbbf24',
                    fontSize: '15px',
                    margin: '8px 0',
                  }}
                >
                  <strong>Sun in {sunSign}</strong> — your core identity
                </Text>
                <Text
                  style={{
                    color: '#93c5fd',
                    fontSize: '15px',
                    margin: '8px 0',
                  }}
                >
                  <strong>Moon in {moonSign}</strong> — your emotional world
                </Text>
                <Text
                  style={{
                    color: '#c4b5fd',
                    fontSize: '15px',
                    margin: '8px 0',
                  }}
                >
                  <strong>Rising in {risingSign}</strong> — how others see you
                </Text>
              </ContentBox>
            </>
          )}

          <Text style={textStyle}>
            That is the formula: <strong>planet + sign + house</strong>. Every
            placement in your chart follows this pattern. Your full chart has
            around 40 placements — each one telling you something different
            about yourself.
          </Text>

          <CtaButton
            href={`${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_nurture&utm_content=day2`}
            label='Explore Your Full Chart'
          />
          <Text style={teaserStyle}>
            Tomorrow: What are transits, and why the planets moving right now
            matter to you
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 3: What Are Transits ───────────────────────────────────────────

interface TransitsEmailProps {
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function WhatAreTransitsEmail({
  userName,
  sunSign,
  userEmail,
}: TransitsEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>
        The planets are still moving — here is how they affect you
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
            What Are Transits?
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            Yesterday you learned that your birth chart is a snapshot of the sky
            when you were born. But the planets did not stop moving after that
            moment — they are still orbiting right now, forming new patterns
            with your chart every day.
          </Text>
          <Text style={textStyle}>
            These moving planets are called <strong>transits</strong>, and they
            are the reason astrology is not just about your personality — it is
            about timing.
          </Text>

          <Text style={labelStyle}>
            Fast transits — daily and weekly shifts
          </Text>
          <ContentBox borderColor='#fbbf24' bgColor='rgba(251, 191, 36, 0.08)'>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              The Moon changes sign every 2.5 days, shifting your mood and
              emotional energy. Mercury, Venus, and Mars move through signs over
              weeks, affecting your communication, relationships, and
              motivation.
            </Text>
          </ContentBox>

          <Text style={labelStyle}>Slow transits — life chapters</Text>
          <ContentBox borderColor='#ef4444' bgColor='rgba(239, 68, 68, 0.08)'>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Saturn, Jupiter, and the outer planets spend months or years in
              each sign. When Saturn transits your 7th house, relationships get
              serious. When Jupiter crosses your Midheaven, career opportunities
              open up. These are the big life chapters.
            </Text>
          </ContentBox>

          {sunSign && (
            <>
              <Text style={labelStyle}>What this means for you</Text>
              <ContentBox>
                <Text
                  style={{
                    color: '#d4d4e8',
                    fontSize: '15px',
                    margin: '4px 0',
                  }}
                >
                  With your Sun in <strong>{sunSign}</strong>, the transits
                  hitting your Sun sign right now are shaping your sense of
                  identity and direction. Your personalised dashboard in Lunary
                  tracks every transit to your chart automatically — so you
                  always know what is active.
                </Text>
              </ContentBox>
            </>
          )}

          <Text style={textStyle}>
            This is why daily horoscopes exist — they are a simplified version
            of transits. But your personalised transits are far more specific
            because they are calculated from your exact birth chart, not just
            your Sun sign.
          </Text>

          <CtaButton
            href={`${baseUrl}/dashboard?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_nurture&utm_content=day3`}
            label='See Your Active Transits'
          />
          <Text style={teaserStyle}>
            Tomorrow: Your Venus sign — what it reveals about how you love
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 5: Houses — Where Life Happens ─────────────────────────────────

interface HousesEmailProps {
  userName: string;
  userEmail?: string;
}

function HousesEmail({ userName, userEmail }: HousesEmailProps) {
  const baseUrl = getBaseUrl();

  const houses = [
    { num: '1st', area: 'Self and identity', color: '#ef4444' },
    { num: '4th', area: 'Home and family', color: '#93c5fd' },
    { num: '7th', area: 'Partnerships and relationships', color: '#f9a8d4' },
    { num: '10th', area: 'Career and public reputation', color: '#fbbf24' },
  ];

  return (
    <Html>
      <Head />
      <Preview>The 12 houses — where the planets play out in your life</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Houses: Where Life Happens
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You know that planets represent energy and signs show how that
            energy expresses. But <strong>houses</strong> tell you where — which
            area of life gets activated.
          </Text>
          <Text style={textStyle}>
            Your birth chart is divided into 12 houses, each ruling a different
            part of your life. The four most important ones are called the
            angular houses:
          </Text>

          {houses.map((h) => (
            <Text
              key={h.num}
              style={{
                color: h.color,
                fontSize: '15px',
                margin: '8px 0',
                paddingLeft: '16px',
              }}
            >
              <strong>{h.num} House</strong> — {h.area}
            </Text>
          ))}

          <ContentBox borderColor='#a78bfa' bgColor='rgba(167, 139, 250, 0.08)'>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              The other eight houses cover everything else: money (2nd),
              communication (3rd), creativity (5th), daily routines (6th),
              transformation (8th), travel and philosophy (9th), friendships
              (11th), and your subconscious (12th).
            </Text>
          </ContentBox>

          <Text style={textStyle}>
            When you see something like "Venus in the 5th house" in your chart,
            it means your love energy (Venus) naturally flows into creativity,
            romance, and self-expression (5th house). Someone with Venus in the
            10th house channels that same love energy into their career and
            public life instead.
          </Text>
          <Text style={textStyle}>
            Houses are why two people with the same Sun sign can live very
            different lives — the planets land in different houses for each
            person based on your birth time and location.
          </Text>

          <CtaButton
            href={`${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_nurture&utm_content=day5`}
            label='See Your House Placements'
          />
          <Text style={teaserStyle}>
            Tomorrow: Your Big 3 together — the full picture of who you are
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Render Functions ───────────────────────────────────────────────────

export async function renderReadYourChart(props: ReadChartEmailProps) {
  return await render(<ReadYourChartEmail {...props} />);
}

export async function renderWhatAreTransits(props: TransitsEmailProps) {
  return await render(<WhatAreTransitsEmail {...props} />);
}

export async function renderHouses(props: HousesEmailProps) {
  return await render(<HousesEmail {...props} />);
}
