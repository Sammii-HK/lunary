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

interface BirthChartEmailProps {
  userName: string;
  sign: string;
  planet: string;
  interpretation: {
    lifeThemes?: string;
    coreTraits?: string[];
    strengths?: string[];
  };
  userEmail?: string;
}

interface GenericCtaEmailProps {
  userName: string;
  userEmail?: string;
}

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

// ─── Day 1: Sun Sign ────────────────────────────────────────────────────

function BirthChartDay1Email({
  userName,
  sign,
  interpretation,
  userEmail,
}: BirthChartEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Your Sun in {sign} — here&apos;s what it means</Preview>
      <Body
        style={{
          background: '#0a0a1a',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Sun in {sign}
          </Heading>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Your Sun sign is the foundation of your cosmic identity — it&apos;s
            who you are at your core. With your Sun in <strong>{sign}</strong>,
            here&apos;s what that reveals:
          </Text>
          {interpretation.lifeThemes && (
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '15px',
                lineHeight: '1.8',
                padding: '16px',
                background: 'rgba(147, 112, 219, 0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid #9370db',
              }}
            >
              {interpretation.lifeThemes}
            </Text>
          )}
          {interpretation.coreTraits &&
            interpretation.coreTraits.length > 0 && (
              <>
                <Text
                  style={{
                    color: '#c4b5fd',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginTop: '24px',
                  }}
                >
                  Core Traits:
                </Text>
                {interpretation.coreTraits.slice(0, 3).map((trait, i) => (
                  <Text
                    key={i}
                    style={{
                      color: '#d4d4e8',
                      fontSize: '15px',
                      margin: '4px 0',
                      paddingLeft: '16px',
                    }}
                  >
                    • {trait}
                  </Text>
                ))}
              </>
            )}
          <CtaButton
            href={`${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=birth_drip&utm_content=day1`}
            label='Explore Your Full Chart'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Tomorrow: Your Moon sign — your emotional world
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 4: Venus ───────────────────────────────────────────────────────

function BirthChartDay4Email({
  userName,
  sign,
  interpretation,
  userEmail,
}: BirthChartEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Your Venus in {sign} — love &amp; relationships</Preview>
      <Body
        style={{
          background: '#0a0a1a',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <EmailContainer>
          <Heading
            style={{
              color: '#f9a8d4',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Venus in {sign}
          </Heading>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Venus reveals how you love, what you value, and what brings you
            pleasure. With Venus in <strong>{sign}</strong>, here&apos;s your
            love language:
          </Text>
          {interpretation.lifeThemes && (
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '15px',
                lineHeight: '1.8',
                padding: '16px',
                background: 'rgba(249, 168, 212, 0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid #f9a8d4',
              }}
            >
              {interpretation.lifeThemes}
            </Text>
          )}
          {interpretation.strengths && interpretation.strengths.length > 0 && (
            <>
              <Text
                style={{
                  color: '#f9a8d4',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '24px',
                }}
              >
                In Relationships:
              </Text>
              {interpretation.strengths.slice(0, 3).map((s, i) => (
                <Text
                  key={i}
                  style={{
                    color: '#d4d4e8',
                    fontSize: '15px',
                    margin: '4px 0',
                    paddingLeft: '16px',
                  }}
                >
                  • {s}
                </Text>
              ))}
            </>
          )}
          <CtaButton
            href={`${baseUrl}/compatibility?utm_source=email&utm_medium=lifecycle&utm_campaign=birth_drip&utm_content=day4`}
            label='Check Your Compatibility'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Tomorrow: Your Mars sign — drive &amp; ambition
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 5: Mars ────────────────────────────────────────────────────────

function BirthChartDay5Email({
  userName,
  sign,
  interpretation,
  userEmail,
}: BirthChartEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Your Mars in {sign} — drive &amp; ambition</Preview>
      <Body
        style={{
          background: '#0a0a1a',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <EmailContainer>
          <Heading
            style={{
              color: '#ef4444',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Mars in {sign}
          </Heading>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Mars is your drive, ambition, and how you assert yourself. With Mars
            in <strong>{sign}</strong>, here&apos;s how you take action:
          </Text>
          {interpretation.lifeThemes && (
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '15px',
                lineHeight: '1.8',
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                borderLeft: '3px solid #ef4444',
              }}
            >
              {interpretation.lifeThemes}
            </Text>
          )}
          {interpretation.coreTraits &&
            interpretation.coreTraits.length > 0 && (
              <>
                <Text
                  style={{
                    color: '#fca5a5',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginTop: '24px',
                  }}
                >
                  Your Drive Style:
                </Text>
                {interpretation.coreTraits.slice(0, 3).map((trait, i) => (
                  <Text
                    key={i}
                    style={{
                      color: '#d4d4e8',
                      fontSize: '15px',
                      margin: '4px 0',
                      paddingLeft: '16px',
                    }}
                  >
                    • {trait}
                  </Text>
                ))}
              </>
            )}
          <CtaButton
            href={`${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=birth_drip&utm_content=day5`}
            label='See Your Full Chart'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Tomorrow: Your Big 3 together — the full picture
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 6: Big 3 Summary ───────────────────────────────────────────────

interface Big3EmailProps {
  userName: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  userEmail?: string;
}

function BirthChartDay6Email({
  userName,
  sunSign,
  moonSign,
  risingSign,
  userEmail,
}: Big3EmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>
        Your Big 3: {sunSign} Sun, {moonSign} Moon, {risingSign} Rising
      </Preview>
      <Body
        style={{
          background: '#0a0a1a',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Big 3 — The Full Picture
          </Heading>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Over the past few days, we&apos;ve explored each part of your Big 3.
            Together, they paint a complete picture of who you are:
          </Text>
          <Section
            style={{
              padding: '20px',
              background: 'rgba(147, 112, 219, 0.08)',
              borderRadius: '8px',
              margin: '16px 0',
            }}
          >
            <Text
              style={{ color: '#fbbf24', fontSize: '15px', margin: '8px 0' }}
            >
              <strong>Sun in {sunSign}</strong> — Your core identity, what
              drives you
            </Text>
            <Text
              style={{ color: '#93c5fd', fontSize: '15px', margin: '8px 0' }}
            >
              <strong>Moon in {moonSign}</strong> — Your emotional world, how
              you process feelings
            </Text>
            <Text
              style={{ color: '#c4b5fd', fontSize: '15px', margin: '8px 0' }}
            >
              <strong>Rising in {risingSign}</strong> — Your social mask, how
              others see you first
            </Text>
          </Section>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            These three placements interact in ways that are completely unique
            to you. Your full birth chart shows how they connect — and
            there&apos;s so much more beyond the Big 3.
          </Text>
          <CtaButton
            href={`${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=birth_drip&utm_content=day6`}
            label='Explore Your Full Chart'
          />
          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            Tomorrow: What&apos;s ahead — your current transits
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Day 7: Current Transits ────────────────────────────────────────────

function BirthChartDay7Email({ userName, userEmail }: GenericCtaEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>What&apos;s ahead — your current transits</Preview>
      <Body
        style={{
          background: '#0a0a1a',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            What&apos;s Ahead For You
          </Heading>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            You&apos;ve spent the week getting to know your birth chart — your
            cosmic blueprint that never changes. But the planets keep moving,
            and right now they&apos;re creating new patterns with your chart.
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            These are called <strong>transits</strong> — and they reveal the
            themes and opportunities active in your life right now. Your
            personalised daily guidance in Lunary tracks these transits for you
            automatically.
          </Text>
          <CtaButton
            href={`${baseUrl}/dashboard?utm_source=email&utm_medium=lifecycle&utm_campaign=birth_drip&utm_content=day7`}
            label='See Your Transits Today'
          />
          <Text
            style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6' }}
          >
            Your trial gives you full access to personalised transit tracking,
            daily guidance, and birth chart insights. Make the most of it.
          </Text>
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Generic CTA (no birth chart) ───────────────────────────────────────

function CompleteBirthChartCtaEmail({
  userName,
  userEmail,
}: GenericCtaEmailProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>
        Complete your birth chart for personalised cosmic insights
      </Preview>
      <Body
        style={{
          background: '#0a0a1a',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Unlock Your Cosmic Blueprint
          </Heading>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            Hi {userName},
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            We noticed you haven&apos;t completed your birth chart yet. Your
            birth chart is a personalised map of the sky at the exact moment you
            were born — and it reveals things about you that no generic
            horoscope can.
          </Text>
          <Text
            style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7' }}
          >
            All you need is your date, time, and place of birth. It takes 30
            seconds.
          </Text>
          <CtaButton
            href={`${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=birth_drip&utm_content=no_chart`}
            label='Complete Your Birth Chart'
          />
          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Render Functions ───────────────────────────────────────────────────

export async function renderBirthChartDay1(props: BirthChartEmailProps) {
  const html = await render(<BirthChartDay1Email {...props} />);
  return html;
}

export async function renderBirthChartDay4(props: BirthChartEmailProps) {
  const html = await render(<BirthChartDay4Email {...props} />);
  return html;
}

export async function renderBirthChartDay5(props: BirthChartEmailProps) {
  const html = await render(<BirthChartDay5Email {...props} />);
  return html;
}

export async function renderBirthChartDay6(props: Big3EmailProps) {
  const html = await render(<BirthChartDay6Email {...props} />);
  return html;
}

export async function renderBirthChartDay7(props: GenericCtaEmailProps) {
  const html = await render(<BirthChartDay7Email {...props} />);
  return html;
}

export async function renderCompleteBirthChartCta(props: GenericCtaEmailProps) {
  const html = await render(<CompleteBirthChartCtaEmail {...props} />);
  return html;
}
