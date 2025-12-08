import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
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

interface TrialEmailProps {
  userName: string;
  trialDaysRemaining: number;
  userEmail?: string;
}

interface TrialWelcomeProps extends TrialEmailProps {
  planType: 'monthly' | 'yearly';
}

function EmailContainer({
  children,
  variant = 'light',
}: {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
}) {
  const isDark = variant === 'dark';
  return (
    <Container
      style={{
        background: isDark ? '#101020' : '#ffffff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: isDark
          ? '0 20px 45px rgba(106, 90, 205, 0.25)'
          : '0 2px 4px rgba(0,0,0,0.1)',
        border: isDark
          ? '1px solid rgba(147, 112, 219, 0.2)'
          : '1px solid transparent',
        color: isDark ? '#f1f1ff' : '#333',
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
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
      }}
    >
      <Text style={{ margin: 0 }}>
        © {new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for
        your cosmic journey.
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
  );
}

function CTAButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#ffffff',
        padding: '16px 32px',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '16px',
        textAlign: 'center' as const,
      }}
    >
      {children}
    </Link>
  );
}

function UrgencyBadge({
  daysRemaining,
  variant = 'purple',
}: {
  daysRemaining: number;
  variant?: 'purple' | 'green' | 'red';
}) {
  const dayLabel = daysRemaining === 1 ? 'Day' : 'Days';
  const backgrounds = {
    purple: 'linear-gradient(135deg, #8458D8, #7B7BE8)',
    green: 'linear-gradient(135deg, #10b981, #059669)',
    red: 'linear-gradient(135deg, #ef4444, #dc2626)',
  };

  return (
    <Text
      style={{
        display: 'inline-block',
        background: backgrounds[variant],
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '20px',
      }}
    >
      {daysRemaining} {dayLabel} {variant === 'green' ? 'Free Trial' : 'Left'}
    </Text>
  );
}

export function TrialWelcomeEmail({
  userName,
  trialDaysRemaining,
  planType,
  userEmail,
}: TrialWelcomeProps & { userEmail?: string }) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';

  return (
    <Html>
      <Head>
        <title>Welcome to Your Free Trial - Lunary</title>
      </Head>
      <Preview>
        {`Your Astral Guide is ready. You have ${trialDaysRemaining} days to explore Lunary!`}
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
        <EmailContainer>
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '30px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='120'
              style={{ margin: '0 auto 20px', display: 'block' }}
            />
            <UrgencyBadge daysRemaining={trialDaysRemaining} variant='green' />
            <Heading
              as='h1'
              style={{ color: '#6366f1', fontSize: '28px', margin: 0 }}
            >
              Welcome to Lunary!
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#6366f1',
                textAlign: 'center' as const,
                margin: '30px 0',
              }}
            >
              Your Astral Guide is ready. ✨
            </Text>
            <Text>
              Your cosmic journey begins now! You have{' '}
              <strong>{trialDaysRemaining} days</strong> to explore all the
              personalized features Lunary has to offer.
            </Text>

            <Section
              style={{
                background: '#f3f4f6',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#6366f1', fontSize: '16px' }}
              >
                What&apos;s Included:
              </Heading>
              <Text style={{ margin: 0 }}>
                🌟 Personalized birth chart analysis
                <br />
                🔮 Daily horoscopes tailored to your chart
                <br />
                ✨ Personalized tarot readings
                <br />
                🌙 Transit calendar and cosmic insights
                <br />
                📚 Complete digital grimoire
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const }}>
              <CTAButton href={`${baseUrl}/birth-chart`}>
                Explore Your Birth Chart →
              </CTAButton>
            </Section>

            <Text style={{ marginTop: '20px' }}>
              <strong>Pro Tip:</strong> Complete your profile with your birthday
              to unlock all personalized features!
            </Text>
            <Text>
              Questions? Just reply to this email - we&apos;re here to help.
            </Text>
          </Section>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export function TrialReminderEmail({
  userName,
  trialDaysRemaining,
  userEmail,
}: TrialEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';
  const dayLabel = trialDaysRemaining === 1 ? 'day' : 'days';

  return (
    <Html>
      <Head>
        <title>Your Trial Ends Soon - Lunary</title>
      </Head>
      <Preview>
        {`Your free trial ends in ${trialDaysRemaining} ${dayLabel}! Continue your cosmic journey.`}
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
        <EmailContainer>
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '30px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='120'
              style={{ margin: '0 auto 20px', display: 'block' }}
            />
            <UrgencyBadge daysRemaining={trialDaysRemaining} variant='purple' />
            <Heading
              as='h1'
              style={{ color: '#6366f1', fontSize: '28px', margin: 0 }}
            >
              Don&apos;t Miss Out!
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Your free trial ends in{' '}
              <strong>
                {trialDaysRemaining} {dayLabel}
              </strong>
              !
            </Text>
            <Text>Continue your cosmic journey with unlimited access to:</Text>
            <Text style={{ margin: '15px 0' }}>
              🌟 Personalized birth chart insights
              <br />
              🔮 Daily horoscopes and tarot readings
              <br />
              🌙 Transit calendars and cosmic guidance
              <br />
              📚 Complete digital grimoire
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <CTAButton href={`${baseUrl}/pricing`}>
                Continue Your Journey →
              </CTAButton>
            </Section>

            <Text>
              No commitment - cancel anytime. Your subscription will only start
              after your trial ends.
            </Text>
          </Section>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export function TrialDay2Email({
  userName,
  trialDaysRemaining,
  userEmail,
}: TrialEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';

  return (
    <Html>
      <Head>
        <title>Your Birth Chart Reveals... - Lunary</title>
      </Head>
      <Preview>
        Your birth chart is a cosmic blueprint—discover what the stars reveal
        about you.
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
        <EmailContainer>
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
              Your Birth Chart Reveals...
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Your birth chart is a cosmic blueprint—a map of the stars at the
              moment you were born. It reveals hidden patterns, strengths, and
              opportunities that shape your unique path.
            </Text>

            <Section
              style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderLeft: '4px solid #f59e0b',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#92400e', fontSize: '16px' }}
              >
                What Your Chart Shows:
              </Heading>
              <Text style={{ color: '#78350f', margin: 0 }}>
                🌟 Your sun sign&apos;s core essence
                <br />
                🌙 Your moon sign&apos;s emotional nature
                <br />
                ⬆️ Your rising sign&apos;s outward expression
                <br />
                🪐 Planetary influences shaping your destiny
                <br />✨ Aspects revealing your unique gifts
              </Text>
            </Section>

            <Text>
              Every planet, every angle, every aspect tells a story about who
              you are and who you&apos;re becoming.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <CTAButton href={`${baseUrl}/birth-chart`}>
                Discover Your Chart →
              </CTAButton>
            </Section>

            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              Your Astral Guide is ready to chat whenever you need cosmic
              guidance.
            </Text>
          </Section>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export function TrialDay3Email({
  userName,
  trialDaysRemaining,
  userEmail,
}: TrialEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';

  return (
    <Html>
      <Head>
        <title>Your Daily Guidance is Personalised - Lunary</title>
      </Head>
      <Preview>
        Unlike generic horoscopes, your daily guidance is crafted specifically
        for you.
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
        <EmailContainer>
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
              Your Daily Guidance is Personalised
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Unlike generic horoscopes, your daily guidance is crafted
              specifically for <strong>you</strong>—based on your unique birth
              chart, current transits, and cosmic patterns.
            </Text>

            <Section
              style={{
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                borderLeft: '4px solid #6366f1',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#4338ca', fontSize: '16px' }}
              >
                What Makes It Personal:
              </Heading>
              <Text style={{ color: '#3730a3', margin: 0 }}>
                🔮 Horoscopes aligned with your chart
                <br />
                ✨ Tarot readings reflecting your energy
                <br />
                🌙 Moon phase guidance for your sign
                <br />
                🪐 Transit insights affecting your planets
                <br />
                📅 Daily rituals tailored to your path
              </Text>
            </Section>

            <Text>
              Every morning, receive insights that speak directly to your cosmic
              blueprint. No two readings are the same because no two charts are
              identical.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <CTAButton href={`${baseUrl}/horoscope`}>
                Get Your Daily Guidance →
              </CTAButton>
            </Section>

            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              Check in daily to build your cosmic rhythm and track patterns over
              time.
            </Text>
          </Section>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export function TrialDay5Email({ userName, userEmail }: TrialEmailProps) {
  const baseUrl = getBaseUrl();
  const greeting = userName || 'there';

  return (
    <Html>
      <Head>
        <title>Explore the Grimoire &amp; More - Lunary</title>
      </Head>
      <Preview>
        Discover 500+ pages of cosmic wisdom in your digital Grimoire.
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
        <EmailContainer>
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
              Explore the Grimoire &amp; More
            </Heading>
          </Section>

          <Section style={{ margin: '30px 0' }}>
            <Text>Hi {greeting},</Text>
            <Text>
              Have you explored the Grimoire yet? It&apos;s your complete
              digital library of cosmic wisdom—over 500 pages of knowledge at
              your fingertips.
            </Text>

            <Section
              style={{
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                borderLeft: '4px solid #6366f1',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#4338ca', fontSize: '16px' }}
              >
                Inside the Grimoire:
              </Heading>
              <Text style={{ color: '#3730a3', margin: 0 }}>
                📚 500+ pages of cosmic knowledge
                <br />
                💎 Crystal meanings and recommendations
                <br />
                🌿 Herbal correspondences
                <br />
                🌙 Moon rituals and practices
                <br />
                ✨ Tarot card deep dives
                <br />
                🔮 Planetary influences explained
              </Text>
            </Section>

            <Section
              style={{
                background: '#f3f4f6',
                padding: '20px',
                borderRadius: '6px',
                margin: '20px 0',
              }}
            >
              <Heading
                as='h3'
                style={{ marginTop: 0, color: '#6366f1', fontSize: '16px' }}
              >
                More to Explore:
              </Heading>
              <Text style={{ margin: 0 }}>
                🌕 Moon Circles for lunar rituals
                <br />
                📓 Book of Shadows for journaling
                <br />
                🪐 Transit calendar for cosmic timing
                <br />
                💬 Astral Guide for personalised answers
              </Text>
            </Section>

            <Text>
              Take your time exploring—there&apos;s so much to discover.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
              <CTAButton href={`${baseUrl}/grimoire`}>
                Explore the Grimoire →
              </CTAButton>
            </Section>

            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              Questions? Just reply to this email—we love hearing from you.
            </Text>
          </Section>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

export async function generateTrialWelcomeEmailHTML(
  userName: string,
  trialDaysRemaining: number,
  planType: 'monthly' | 'yearly',
  userEmail?: string,
): Promise<string> {
  return await render(
    <TrialWelcomeEmail
      userName={userName}
      trialDaysRemaining={trialDaysRemaining}
      planType={planType}
      userEmail={userEmail}
    />,
  );
}

export function generateTrialWelcomeEmailText(
  userName: string,
  trialDaysRemaining: number,
  planType: 'monthly' | 'yearly',
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Welcome to Lunary! 🌙

Hi ${userName || 'there'},

Your Astral Guide is ready. ✨

Your cosmic journey begins now! You have ${trialDaysRemaining} days to explore all the personalized features Lunary has to offer.

What's Included:
- 🌟 Personalized birth chart analysis
- 🔮 Daily horoscopes tailored to your chart
- ✨ Personalized tarot readings
- 🌙 Transit calendar and cosmic insights
- 📚 Complete digital grimoire

Explore your birth chart: ${baseUrl}/birth-chart

Pro Tip: Complete your profile with your birthday to unlock all personalized features!

Questions? Just reply to this email - we're here to help.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}

export async function generateTrialReminderEmailHTML(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): Promise<string> {
  return await render(
    <TrialReminderEmail
      userName={userName}
      trialDaysRemaining={trialDaysRemaining}
      userEmail={userEmail}
    />,
  );
}

export function generateTrialReminderEmailText(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const dayLabel = trialDaysRemaining === 1 ? 'day' : 'days';
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Your Trial Ends Soon - Lunary ⏰

Hi ${userName || 'there'},

Your free trial ends in ${trialDaysRemaining} ${dayLabel}!

Continue your cosmic journey with unlimited access to:
- 🌟 Personalized birth chart insights
- 🔮 Daily horoscopes and tarot readings
- 🌙 Transit calendars and cosmic guidance
- 📚 Complete digital grimoire

Continue your journey: ${baseUrl}/pricing

No commitment - cancel anytime. Your subscription will only start after your trial ends.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}

export async function generateTrialDay2EmailHTML(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): Promise<string> {
  return await render(
    <TrialDay2Email
      userName={userName}
      trialDaysRemaining={trialDaysRemaining}
      userEmail={userEmail}
    />,
  );
}

export function generateTrialDay2EmailText(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Your Birth Chart Reveals... - Lunary 🌟

Hi ${userName || 'there'},

Your birth chart is a cosmic blueprint—a map of the stars at the moment you were born. It reveals hidden patterns, strengths, and opportunities that shape your unique path.

What Your Chart Shows:
- 🌟 Your sun sign's core essence
- 🌙 Your moon sign's emotional nature
- ⬆️ Your rising sign's outward expression
- 🪐 Planetary influences shaping your destiny
- ✨ Aspects revealing your unique gifts

Every planet, every angle, every aspect tells a story about who you are and who you're becoming.

Discover your chart: ${baseUrl}/birth-chart

Your Astral Guide is ready to chat whenever you need cosmic guidance.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}

export async function generateTrialDay3EmailHTML(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): Promise<string> {
  return await render(
    <TrialDay3Email
      userName={userName}
      trialDaysRemaining={trialDaysRemaining}
      userEmail={userEmail}
    />,
  );
}

export function generateTrialDay3EmailText(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Your Daily Guidance is Personalised - Lunary 🔮

Hi ${userName || 'there'},

Unlike generic horoscopes, your daily guidance is crafted specifically for you—based on your unique birth chart, current transits, and cosmic patterns.

What Makes It Personal:
- 🔮 Horoscopes aligned with your chart
- ✨ Tarot readings reflecting your energy
- 🌙 Moon phase guidance for your sign
- 🪐 Transit insights affecting your planets
- 📅 Daily rituals tailored to your path

Every morning, receive insights that speak directly to your cosmic blueprint. No two readings are the same because no two charts are identical.

Get your daily guidance: ${baseUrl}/horoscope

Check in daily to build your cosmic rhythm and track patterns over time.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}

export async function generateTrialDay5EmailHTML(
  userName: string,
  trialDaysRemaining: number,
  userEmail?: string,
): Promise<string> {
  return await render(
    <TrialDay5Email
      userName={userName}
      trialDaysRemaining={trialDaysRemaining}
      userEmail={userEmail}
    />,
  );
}

export function generateTrialDay5EmailText(
  userName: string,
  _trialDaysRemaining: number,
  userEmail?: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = userEmail
    ? `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${baseUrl}/unsubscribe`;

  return `
Explore the Grimoire & More - Lunary 📚

Hi ${userName || 'there'},

Have you explored the Grimoire yet? It's your complete digital library of cosmic wisdom—over 500 pages of knowledge at your fingertips.

Inside the Grimoire:
- 📚 500+ pages of cosmic knowledge
- 💎 Crystal meanings and recommendations
- 🌿 Herbal correspondences
- 🌙 Moon rituals and practices
- ✨ Tarot card deep dives
- 🔮 Planetary influences explained

More to Explore:
- 🌕 Moon Circles for lunar rituals
- 📓 Book of Shadows for journaling
- 🪐 Transit calendar for cosmic timing
- 💬 Astral Guide for personalised answers

Take your time exploring—there's so much to discover.

Explore the Grimoire: ${baseUrl}/grimoire

Questions? Just reply to this email—we love hearing from you.

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
