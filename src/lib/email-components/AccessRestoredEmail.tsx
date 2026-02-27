import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

interface AccessRestoredEmailProps {
  userName?: string;
  baseUrl?: string;
}

export function AccessRestoredEmail({
  userName,
  baseUrl = 'https://lunary.app',
}: AccessRestoredEmailProps) {
  const greeting = userName ? `Hi ${userName}` : 'Hi there';

  return (
    <Html>
      <Head>
        <title>Your Lunary access has been restored</title>
      </Head>
      <Preview>Your lifetime access to Lunary is back. Welcome home.</Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: '1.6',
          color: '#f1f1ff',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#0b0b12',
        }}
      >
        <Container
          style={{
            background: '#101020',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(106, 90, 205, 0.25)',
            border: '1px solid rgba(147, 112, 219, 0.2)',
            color: '#f1f1ff',
          }}
        >
          <Section
            style={{ textAlign: 'center' as const, marginBottom: '32px' }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              alt='Lunary'
              width='80'
              height='80'
              style={{ margin: '0 auto 16px', display: 'block' }}
            />
            <Heading
              as='h1'
              style={{ color: '#c77dff', fontSize: '26px', margin: 0 }}
            >
              Your access has been restored
            </Heading>
          </Section>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 16px' }}
          >
            {greeting},
          </Text>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 16px' }}
          >
            I wanted to reach out personally about something that's been
            bothering me. When I moved Lunary to a new Stripe account a while
            back, a number of early supporter accounts got lost in the
            transition. Your STARSALIGN lifetime access was one of them, and
            that's entirely my fault.
          </Text>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 16px' }}
          >
            I'm sorry it took this long to catch and fix. You backed Lunary when
            it was just getting started, and you deserved better.
          </Text>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 24px' }}
          >
            Your account is now fully restored with lifetime Lunary access. No
            action needed on your end, and nothing will ever expire.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Link
              href={`${baseUrl}/dashboard`}
              style={{
                display: 'inline-block',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
              }}
            >
              Open Lunary
            </Link>
          </Section>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 16px' }}
          >
            A lot has changed since you first signed up: birth chart synastry,
            real-time transit tracking, a full tarot and grimoire section,
            journaling with streak tracking, and daily personalised cosmic
            insights. Come have a look around.
          </Text>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 8px' }}
          >
            As always, I'm building in the open and would love to hear what
            you'd like to see next.
          </Text>

          <Text
            style={{ color: '#d4d4f0', fontSize: '16px', margin: '0 0 8px' }}
          >
            Sammii
          </Text>
          <Text
            style={{ color: '#8888aa', fontSize: '14px', margin: '0 0 32px' }}
          >
            Founder, Lunary
          </Text>

          <Section
            style={{
              borderTop: '1px solid rgba(147, 112, 219, 0.15)',
              paddingTop: '24px',
              textAlign: 'center' as const,
            }}
          >
            <Text
              style={{ color: '#5a5a7a', fontSize: '12px', margin: '0 0 4px' }}
            >
              <Link
                href={`${baseUrl}`}
                style={{ color: '#7c3aed', textDecoration: 'none' }}
              >
                lunary.app
              </Link>
            </Text>
            <Text style={{ color: '#5a5a7a', fontSize: '12px', margin: 0 }}>
              You're receiving this because you were an early Lunary supporter.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateAccessRestoredEmailHTML(
  props: AccessRestoredEmailProps,
): Promise<string> {
  return render(<AccessRestoredEmail {...props} />);
}

export async function generateAccessRestoredEmailText(
  props: AccessRestoredEmailProps,
): Promise<string> {
  const greeting = props.userName ? `Hi ${props.userName}` : 'Hi there';
  const baseUrl = props.baseUrl || 'https://lunary.app';
  return [
    `${greeting},`,
    '',
    "I wanted to reach out personally about something that's been bothering me. When I moved Lunary to a new Stripe account a while back, a number of early supporter accounts got lost in the transition. Your STARSALIGN lifetime access was one of them, and that's entirely my fault.",
    '',
    "I'm sorry it took this long to catch and fix. You backed Lunary when it was just getting started, and you deserved better.",
    '',
    'Your account is now fully restored with lifetime Lunary access. No action needed on your end, and nothing will ever expire.',
    '',
    `Open Lunary: ${baseUrl}/dashboard`,
    '',
    'A lot has changed since you first signed up: birth chart synastry, real-time transit tracking, a full tarot and grimoire section, journaling with streak tracking, and daily personalised cosmic insights. Come have a look around.',
    '',
    "As always, I'm building in the open and would love to hear what you'd like to see next.",
    '',
    'Sammii',
    'Founder, Lunary',
  ].join('\n');
}
