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

// ─── Email 1: Still Exploring? (24hr) ──────────────────────────────────

interface BrowseAbandonProps {
  userName: string;
  userEmail?: string;
}

interface BrowseAbandonSocialProps extends BrowseAbandonProps {
  signupCount?: number;
}

function BrowseAbandonEmail1({ userName, userEmail }: BrowseAbandonProps) {
  const baseUrl = getBaseUrl();

  const cellStyle = {
    padding: '10px 16px',
    fontSize: '14px',
    borderBottom: '1px solid rgba(147, 112, 219, 0.12)',
  };

  return (
    <Html>
      <Head />
      <Preview>Still thinking about Lunary+?</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            Still exploring?
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            We noticed you were checking out Lunary+ and wanted to make sure you
            had all the details. Here is a quick side-by-side of what you get
            with each plan:
          </Text>

          {/* Plan comparison table */}
          <Section
            style={{
              margin: '24px 0',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(147, 112, 219, 0.2)',
            }}
          >
            {/* Header row */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(147, 112, 219, 0.08)',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      ...cellStyle,
                      color: '#d4d4e8',
                      fontWeight: 'bold',
                      textAlign: 'left' as const,
                      width: '50%',
                    }}
                  >
                    Feature
                  </th>
                  <th
                    style={{
                      ...cellStyle,
                      color: '#d4d4e8',
                      fontWeight: 'bold',
                      textAlign: 'center' as const,
                      width: '25%',
                    }}
                  >
                    Free
                  </th>
                  <th
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      fontWeight: 'bold',
                      textAlign: 'center' as const,
                      width: '25%',
                    }}
                  >
                    Lunary+
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Generic dashboard
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#d4d4e8',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Basic birth chart
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#d4d4e8',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Full grimoire access
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#d4d4e8',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Personalised daily transits
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#6b7280',
                      textAlign: 'center' as const,
                    }}
                  >
                    &mdash;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Astral Guide chat
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#6b7280',
                      textAlign: 'center' as const,
                    }}
                  >
                    &mdash;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Moon phase dashboard
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#6b7280',
                      textAlign: 'center' as const,
                    }}
                  >
                    &mdash;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td style={{ ...cellStyle, color: '#d4d4e8' }}>
                    Synastry comparisons
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#6b7280',
                      textAlign: 'center' as const,
                    }}
                  >
                    &mdash;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#d4d4e8',
                      borderBottom: 'none',
                    }}
                  >
                    Tarot with cosmic context
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#6b7280',
                      textAlign: 'center' as const,
                      borderBottom: 'none',
                    }}
                  >
                    &mdash;
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: '#c4b5fd',
                      textAlign: 'center' as const,
                      borderBottom: 'none',
                    }}
                  >
                    &#10003;
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={textStyle}>
            The free plan gives you a solid foundation. Lunary+ takes it further
            with insights tailored specifically to your chart, your transits,
            and your questions.
          </Text>

          <CtaButton
            href={`${baseUrl}/pricing?utm_source=email&utm_medium=lifecycle&utm_campaign=browse_abandon&utm_content=24hr`}
            label='Compare Plans'
          />

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Email 2: Social Proof (72hr) ──────────────────────────────────────

function BrowseAbandonEmail2({
  userName,
  signupCount,
  userEmail,
}: BrowseAbandonSocialProps) {
  const baseUrl = getBaseUrl();
  const count = signupCount ? signupCount.toLocaleString() : 'hundreds of';

  return (
    <Html>
      <Head />
      <Preview>You are not alone in your curiosity</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            You are not alone in your curiosity
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            A few days ago you were exploring what Lunary+ has to offer. Since
            then, more people have taken the leap.
          </Text>
          <Text
            style={{
              color: '#c4b5fd',
              fontSize: '20px',
              fontWeight: 'bold',
              textAlign: 'center' as const,
              margin: '28px 0',
            }}
          >
            Join {count} people who chose to go deeper with their chart
          </Text>

          <Section
            style={{
              padding: '20px',
              background: 'rgba(147, 112, 219, 0.08)',
              borderRadius: '8px',
              borderLeft: '3px solid #9370db',
              margin: '24px 0',
            }}
          >
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '15px',
                fontStyle: 'italic',
                lineHeight: '1.8',
                margin: 0,
              }}
            >
              &quot;I used to read my horoscope and move on. With Lunary+, I
              actually understand why certain weeks feel heavy and others feel
              electric. The personalised transits changed everything for
              me.&quot;
            </Text>
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '13px',
                margin: '8px 0 0 0',
              }}
            >
              — Lunary+ member
            </Text>
          </Section>

          <Text style={textStyle}>
            When your guidance is built around your actual birth chart, it stops
            being generic and starts being useful. That is the difference people
            notice.
          </Text>

          <CtaButton
            href={`${baseUrl}/pricing?utm_source=email&utm_medium=lifecycle&utm_campaign=browse_abandon&utm_content=72hr`}
            label='See What They Discovered'
          />

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Email 3: 10% Off Nudge (7 days) ──────────────────────────────────

function BrowseAbandonEmail3({ userName, userEmail }: BrowseAbandonProps) {
  const baseUrl = getBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>A small thank you for your interest</Preview>
      <Body style={bodyStyle}>
        <EmailContainer>
          <Heading
            style={{
              color: '#c4b5fd',
              fontSize: '24px',
              textAlign: 'center' as const,
            }}
          >
            A small thank you
          </Heading>
          <Text style={textStyle}>Hi {userName},</Text>
          <Text style={textStyle}>
            You showed interest in Lunary+ last week, and we appreciate that. As
            a thank you, here is 10% off your first month or year:
          </Text>

          <Section
            style={{
              textAlign: 'center' as const,
              margin: '28px 0',
              padding: '24px',
              background: 'rgba(147, 112, 219, 0.1)',
              borderRadius: '8px',
              border: '1px dashed rgba(196, 181, 253, 0.4)',
            }}
          >
            <Text
              style={{
                color: '#c4b5fd',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                letterSpacing: '2px',
              }}
            >
              CURIOUS10
            </Text>
            <Text
              style={{
                color: '#d4d4e8',
                fontSize: '14px',
                margin: 0,
              }}
            >
              10% off — expires in 48 hours
            </Text>
          </Section>

          <Text
            style={{
              color: '#c4b5fd',
              fontSize: '15px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            Here is what you will unlock:
          </Text>
          <Text style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}>
            1. Personalised daily transits that track your exact chart
          </Text>
          <Text style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}>
            2. Astral Guide chat for questions about your placements
          </Text>
          <Text style={{ color: '#d4d4e8', fontSize: '15px', margin: '4px 0' }}>
            3. Synastry comparisons to explore your connections
          </Text>

          <CtaButton
            href={`${baseUrl}/pricing?coupon=CURIOUS10&utm_source=email&utm_medium=lifecycle&utm_campaign=browse_abandon&utm_content=7day`}
            label='Claim Your 10% Off'
          />

          <Text
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              textAlign: 'center' as const,
            }}
          >
            This offer expires 48 hours from now. After that, standard pricing
            applies.
          </Text>

          <EmailFooter userEmail={userEmail} baseUrl={baseUrl} />
        </EmailContainer>
      </Body>
    </Html>
  );
}

// ─── Render Functions ──────────────────────────────────────────────────

export async function renderBrowseAbandonEmail1(props: BrowseAbandonProps) {
  return await render(<BrowseAbandonEmail1 {...props} />);
}

export async function renderBrowseAbandonEmail2(
  props: BrowseAbandonSocialProps,
) {
  return await render(<BrowseAbandonEmail2 {...props} />);
}

export async function renderBrowseAbandonEmail3(props: BrowseAbandonProps) {
  return await render(<BrowseAbandonEmail3 {...props} />);
}
