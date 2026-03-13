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

// ---------------------------------------------------------------------------
// Email 1: Year in review (30 days before renewal)
// ---------------------------------------------------------------------------

interface Renewal30dProps {
  userName: string;
  renewalDate: string;
  userEmail?: string;
}

function Renewal30dEmail({
  userName,
  renewalDate,
  userEmail,
}: Renewal30dProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Your year with Lunary+, in review</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Year With Lunary+
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            Your Lunary+ subscription renews on <strong>{renewalDate}</strong>.
            Before it does, we wanted to take a moment to look back at
            everything you have had access to this year.
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
              Your year included:
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Personalised daily transits delivered every morning
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Full access to the Astral Guide for on-demand cosmic insight
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Your complete birth chart with detailed interpretations
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              All premium tarot spreads, unlocked and ready whenever you needed
              them
            </Text>
          </Section>

          <Text style={textStyle}>
            Thank you for being part of the Lunary community. It genuinely means
            a lot to have you here.
          </Text>

          <CtaButton
            href={`${baseUrl}/dashboard`}
            label='Visit Your Dashboard'
          />

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Email 2: What is new + what is planned (7 days before renewal)
// ---------------------------------------------------------------------------

interface Renewal7dProps {
  userName: string;
  renewalDate: string;
  userEmail?: string;
}

function Renewal7dEmail({ userName, renewalDate, userEmail }: Renewal7dProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>Your renewal is coming up on {renewalDate}</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Your Renewal is Coming Up
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            Just a heads-up: your Lunary+ subscription renews on{' '}
            <strong>{renewalDate}</strong>. We wanted to share what we have been
            working on and where things are heading.
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
              Here is what we have been working on:
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Improved transit tracking accuracy across all placements
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Expanded grimoire content with new guides and references
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Better personalisation so your daily insights feel more relevant
            </Text>
          </Section>

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
              And what is coming next:
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Synastry comparison tools for exploring chart compatibility
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Deeper AI-powered insights tailored to your chart
            </Text>
            <Text
              style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}
            >
              Community features to connect with fellow practitioners
            </Text>
          </Section>

          <Text style={textStyle}>
            If you would like to review or adjust your subscription before it
            renews, you can do that from your settings at any time.
          </Text>

          <CtaButton
            href={`${baseUrl}/settings/subscription`}
            label='Manage Subscription'
          />

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Email 3: Renewal confirmation (1 day before)
// ---------------------------------------------------------------------------

interface Renewal1dProps {
  userName: string;
  renewalDate: string;
  planType?: string;
  userEmail?: string;
}

function Renewal1dEmail({
  userName,
  renewalDate,
  planType,
  userEmail,
}: Renewal1dProps) {
  const baseUrl = getBaseUrl();
  const planLabel = planType || 'annual';

  return (
    <Html>
      <Head />
      <Preview>Your Lunary+ renewal is tomorrow</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Renewal Tomorrow
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            Quick note: your <strong>{planLabel}</strong> plan renews tomorrow (
            <strong>{renewalDate}</strong>).
          </Text>
          <Text style={textStyle}>
            No action is needed if you would like to continue with Lunary+.
            Everything will carry on as normal.
          </Text>
          <Text style={textStyle}>
            If you would like to make changes or cancel, you can do so from your
            subscription settings before the renewal date.
          </Text>
          <Text style={textStyle}>
            Thank you for supporting indie software. It makes all the
            difference.
          </Text>

          <CtaButton
            href={`${baseUrl}/settings/subscription`}
            label='Manage Subscription'
          />

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Render exports
// ---------------------------------------------------------------------------

export async function renderRenewal30d(
  props: Renewal30dProps,
): Promise<string> {
  return await render(<Renewal30dEmail {...props} />);
}

export async function renderRenewal7d(props: Renewal7dProps): Promise<string> {
  return await render(<Renewal7dEmail {...props} />);
}

export async function renderRenewal1d(props: Renewal1dProps): Promise<string> {
  return await render(<Renewal1dEmail {...props} />);
}
