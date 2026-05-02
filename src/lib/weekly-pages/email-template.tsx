/**
 * React Email template for the Weekly Pages digest.
 *
 * Mirrors the on-app WeeklyPageView layout in clean, responsive HTML using
 * the existing email-component primitives (EmailLayout / EmailHeader /
 * ContentSection / CTAButton). No new dependencies.
 */

import * as React from 'react';
import {
  Heading as EmailHeading,
  Hr,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

import {
  EmailLayout,
  EmailHeader,
  ContentSection,
  CTAButton,
  EmailFooter,
} from '@/lib/email-components';
import type { WeeklyPage } from '@/lib/weekly-pages/build';

const DARK_TEXT = '#e1d9ff';
const MUTED_TEXT = '#94a3b8';
const ACCENT = '#C77DFF';
const PRIMARY = '#A78BFA';

const TONE_COLOR: Record<string, string> = {
  flow: '#34D399',
  friction: '#F472B6',
  pivot: '#A78BFA',
};

function shortDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
  });
}

function rangeLabel(weekStart: string, weekEnd: string): string {
  const s = new Date(`${weekStart}T12:00:00Z`);
  const e = new Date(`${weekEnd}T12:00:00Z`);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  const startStr = s.toLocaleDateString('en-US', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  });
  const endStr = e.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  return `${startStr} – ${endStr}`;
}

export interface WeeklyPageEmailProps {
  page: WeeklyPage;
  appUrl: string;
  userName?: string;
  userEmail?: string;
}

export function WeeklyPageEmail({
  page,
  appUrl,
  userName,
  userEmail,
}: WeeklyPageEmailProps) {
  const greetingName = userName?.trim().split(' ')[0] || '';
  const greeting = greetingName ? `Hi ${greetingName},` : 'Hi there,';
  const range = rangeLabel(page.weekStart, page.weekEnd);

  const previewText =
    `${page.headline} — ${page.moonJourney.dominantPhase.name}`.slice(0, 140);

  return (
    <EmailLayout
      title='Lunary - Your Week Ahead'
      preview={previewText}
      variant='dark'
    >
      <EmailHeader
        title='Your Week Ahead'
        subtitle={range}
        baseUrl={appUrl}
        variant='dark'
      />

      <Text
        style={{
          color: DARK_TEXT,
          fontSize: '16px',
          margin: '0 0 8px 0',
        }}
      >
        {greeting}
      </Text>
      <Text
        style={{
          color: DARK_TEXT,
          fontSize: '20px',
          lineHeight: 1.35,
          margin: '0 0 24px 0',
        }}
      >
        {page.headline}
      </Text>

      <ContentSection title='Moon Journey' variant='dark'>
        <span style={{ display: 'block', color: DARK_TEXT, fontSize: '15px' }}>
          {page.moonJourney.dominantPhase.name} in{' '}
          {page.moonJourney.dominantPhase.sign} (
          {page.moonJourney.dominantPhase.illumination}% illumination,{' '}
          {page.moonJourney.dominantPhase.trend}).
        </span>
      </ContentSection>

      {page.topTransits.length > 0 && (
        <Section style={{ margin: '24px 0' }}>
          <EmailHeading
            as='h2'
            style={{
              color: ACCENT,
              fontSize: '20px',
              margin: '0 0 12px 0',
            }}
          >
            Top three transits
          </EmailHeading>
          {page.topTransits.map((t) => (
            <Section
              key={`${t.transitPlanet}-${t.aspect}-${t.natalPlanet}`}
              style={{
                margin: '12px 0',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                borderLeft: `3px solid ${TONE_COLOR[t.tone] ?? PRIMARY}`,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {t.transitPlanet} {t.aspect.toLowerCase()} natal {t.natalPlanet}
              </Text>
              <Text
                style={{
                  color: MUTED_TEXT,
                  fontSize: '12px',
                  margin: '2px 0 8px 0',
                  letterSpacing: '0.05em',
                }}
              >
                {shortDay(t.peakDate)} · {t.score} / 100 ·{' '}
                {t.exactness.toFixed(2)}° orb
              </Text>
              <Text style={{ color: DARK_TEXT, fontSize: '14px', margin: 0 }}>
                {t.blurb}
              </Text>
            </Section>
          ))}
        </Section>
      )}

      <Section style={{ margin: '24px 0' }}>
        <EmailHeading
          as='h2'
          style={{ color: ACCENT, fontSize: '20px', margin: '0 0 12px 0' }}
        >
          The week, day by day
        </EmailHeading>
        {page.notableDays.map((d) => (
          <Row
            key={d.date}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Column style={{ width: '120px', verticalAlign: 'top' }}>
              <Text
                style={{
                  color: PRIMARY,
                  fontSize: '13px',
                  margin: 0,
                  letterSpacing: '0.05em',
                }}
              >
                {shortDay(d.date)}
              </Text>
            </Column>
            <Column>
              <Text
                style={{
                  color: DARK_TEXT,
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {d.oneLiner}
              </Text>
              <Text
                style={{
                  color: MUTED_TEXT,
                  fontSize: '11px',
                  margin: '2px 0 0 0',
                }}
              >
                {d.score > 0 ? `${d.score} / 100` : 'quiet'}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <ContentSection title={page.ritual.title} variant='dark'>
        <span style={{ display: 'block', color: DARK_TEXT, fontSize: '15px' }}>
          {page.ritual.body}
        </span>
      </ContentSection>

      <Section style={{ margin: '24px 0' }}>
        <EmailHeading
          as='h2'
          style={{ color: ACCENT, fontSize: '20px', margin: '0 0 12px 0' }}
        >
          The week in a paragraph
        </EmailHeading>
        <Text
          style={{
            color: DARK_TEXT,
            fontSize: '15px',
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          {page.summary}
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0 16px 0' }}>
        <CTAButton href={`${appUrl}/app/week-ahead`} variant='primary'>
          Open the full Week Ahead
        </CTAButton>
      </Section>

      <Hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />

      <EmailFooter baseUrl={appUrl} userEmail={userEmail} variant='dark' />
    </EmailLayout>
  );
}

export async function generateWeeklyPageEmailHTML(
  props: WeeklyPageEmailProps,
): Promise<string> {
  return render(<WeeklyPageEmail {...props} />);
}

export async function generateWeeklyPageEmailText(
  props: WeeklyPageEmailProps,
): Promise<string> {
  const { page } = props;
  const lines: string[] = [];
  lines.push(`Your Week Ahead — ${rangeLabel(page.weekStart, page.weekEnd)}`);
  lines.push('');
  lines.push(page.headline);
  lines.push('');
  lines.push(
    `Moon: ${page.moonJourney.dominantPhase.name} in ${page.moonJourney.dominantPhase.sign} (${page.moonJourney.dominantPhase.illumination}% ${page.moonJourney.dominantPhase.trend})`,
  );
  lines.push('');
  if (page.topTransits.length > 0) {
    lines.push('Top transits:');
    for (const t of page.topTransits) {
      lines.push(
        `- ${t.transitPlanet} ${t.aspect.toLowerCase()} natal ${t.natalPlanet} (${shortDay(
          t.peakDate,
        )}, ${t.score}/100): ${t.blurb}`,
      );
    }
    lines.push('');
  }
  lines.push('Day by day:');
  for (const d of page.notableDays) {
    lines.push(`- ${shortDay(d.date)} — ${d.oneLiner}`);
  }
  lines.push('');
  lines.push(`${page.ritual.title}: ${page.ritual.body}`);
  lines.push('');
  lines.push(page.summary);
  lines.push('');
  lines.push(`Open the full page: ${props.appUrl}/app/week-ahead`);
  return lines.join('\n');
}
