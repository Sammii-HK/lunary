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

const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

export interface MoonCircleEmailProps {
  moonCircleId: number;
  moonPhase: string;
  dateLabel: string;
  dateSlug?: string;
  title?: string;
  summary?: string;
  appUrl?: string;
  userEmail?: string;
}

export function MoonCircleEmail({
  moonCircleId,
  moonPhase,
  dateLabel,
  dateSlug,
  title,
  summary,
  appUrl = getAppUrl(),
  userEmail,
}: MoonCircleEmailProps) {
  const slug = dateSlug || moonCircleId;
  const shareLink = `${appUrl}/moon-circles/${slug}?share=true`;
  const unsubscribeUrl = userEmail
    ? `${appUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${appUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>{title || 'Moon Circle Update'} - Lunary</title>
      </Head>
      <Preview>
        {moonPhase}: {title || 'Moon Circle Update'}
      </Preview>
      <Body
        style={{
          fontFamily:
            "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          backgroundColor: '#07070e',
          padding: '20px',
          margin: '0',
        }}
      >
        <Container
          style={{
            backgroundColor: '#07070e',
            color: '#f8f4ff',
            padding: '32px',
            borderRadius: '24px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <Text
            style={{
              letterSpacing: '0.4em',
              textTransform: 'uppercase' as const,
              color: '#c4b5fd',
              fontSize: '11px',
              margin: '0 0 12px',
            }}
          >
            {moonPhase}
          </Text>
          <Heading
            as='h1'
            style={{ fontSize: '28px', margin: '0 0 12px', color: '#f8f4ff' }}
          >
            {title || 'Moon Circle Update'}
          </Heading>
          <Text
            style={{ color: '#a78bfa', margin: '0 0 24px', fontSize: '14px' }}
          >
            {dateLabel}
          </Text>

          {summary && (
            <Text
              style={{
                margin: '0 0 24px',
                lineHeight: '1.6',
                color: '#e0d7ff',
              }}
            >
              {summary}
            </Text>
          )}

          <Section
            style={{
              margin: '30px 0',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.25)',
            }}
          >
            <Heading
              as='h3'
              style={{
                margin: '0 0 8px',
                color: '#ffffff',
                fontSize: '18px',
              }}
            >
              Share Your Insight
            </Heading>
            <Text
              style={{
                margin: '0 0 16px',
                color: '#d8cffe',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              Did this Moon Circle resonate with you? Share your insight
              anonymously with the community.
            </Text>
            <Link
              href={shareLink}
              style={{
                display: 'inline-block',
                background: '#8b5cf6',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Share Your Insight →
            </Link>
          </Section>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <Text style={{ color: '#9ca3af', fontSize: '11px', margin: '0' }}>
              <Link
                href={unsubscribeUrl}
                style={{ color: '#9ca3af', textDecoration: 'underline' }}
              >
                Unsubscribe
              </Link>
              {' | '}
              <Link
                href={`${appUrl}/profile`}
                style={{ color: '#9ca3af', textDecoration: 'underline' }}
              >
                Manage Preferences
              </Link>
            </Text>
            <Text
              style={{
                color: '#6b7280',
                fontSize: '10px',
                marginTop: '10px',
              }}
            >
              © {new Date().getFullYear()} Lunar Computing, Inc. Guided by the
              stars, powered by magic.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateMoonCircleEmailHTML({
  moonCircleId,
  moonPhase,
  dateLabel,
  dateSlug,
  title,
  summary,
  appUrl = getAppUrl(),
  userEmail,
}: MoonCircleEmailProps): Promise<string> {
  return await render(
    <MoonCircleEmail
      moonCircleId={moonCircleId}
      moonPhase={moonPhase}
      dateLabel={dateLabel}
      dateSlug={dateSlug}
      title={title}
      summary={summary}
      appUrl={appUrl}
      userEmail={userEmail}
    />,
  );
}

export function generateMoonCircleEmailText({
  moonCircleId,
  moonPhase,
  dateLabel,
  dateSlug,
  title,
  summary,
  appUrl = getAppUrl(),
  userEmail,
}: MoonCircleEmailProps): string {
  const slug = dateSlug || moonCircleId;
  const shareLink = `${appUrl}/moon-circles/${slug}?share=true`;
  const unsubscribeUrl = userEmail
    ? `${appUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${appUrl}/unsubscribe`;

  return `
${title || 'Moon Circle Update'} – ${moonPhase}
${dateLabel}

${summary || ''}

Share your insight with the circle:
${shareLink}

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${appUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Guided by the stars, powered by magic.
  `.trim();
}
