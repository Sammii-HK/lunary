import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import { render } from '@react-email/render';
import { CTAButton } from './CTAButton';

export type WeeklyReport = {
  weekStart: Date;
  weekEnd: Date;
  keyTransits: Array<{
    date: string;
    transit: string;
    description: string;
  }>;
  moonPhases: Array<{
    date: string;
    phase: string;
    emoji: string;
  }>;
  tarotPatterns: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
  };
  summary: string;
};

interface WeeklyReportEmailProps {
  report: WeeklyReport;
  appUrl: string;
  userName?: string;
  userEmail?: string;
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0',
      }}
    >
      <Heading
        as='h2'
        style={{ color: '#fff', marginTop: 0, fontSize: '20px' }}
      >
        {title}
      </Heading>
      {children}
    </Section>
  );
}

export function WeeklyReportEmail({
  report,
  appUrl,
  userName,
  userEmail,
}: WeeklyReportEmailProps) {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const dominantTheme =
    report.tarotPatterns.dominantThemes.length > 0
      ? report.tarotPatterns.dominantThemes[0].toLowerCase()
      : 'dynamic';
  const firstMoonPhase =
    report.moonPhases.length > 0
      ? report.moonPhases[0].phase
      : 'various phases';
  const themeDescription =
    report.tarotPatterns.dominantThemes.length > 0
      ? `around ${report.tarotPatterns.dominantThemes.slice(0, 2).join(' and ')}`
      : 'of transformation';

  const unsubscribeUrl = userEmail
    ? `${appUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${appUrl}/unsubscribe`;

  return (
    <Html>
      <Head>
        <title>Your Weekly Cosmic Report - Lunary</title>
      </Head>
      <Preview>{report.summary.slice(0, 150)}...</Preview>
      <Body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          lineHeight: '1.6',
          color: '#333',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#0f172a',
        }}
      >
        <Container
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)',
            borderRadius: '12px',
            padding: '30px',
            color: '#fff',
          }}
        >
          <Heading as='h1' style={{ color: '#fff', marginTop: 0 }}>
            🌙 Your Weekly Cosmic Report
          </Heading>
          <Text style={{ color: '#cbd5e1', fontSize: '16px' }}>{greeting}</Text>

          <ReportSection title='Week Summary'>
            <Text style={{ color: '#cbd5e1', margin: 0 }}>
              {report.summary}
            </Text>
          </ReportSection>

          {report.moonPhases.length > 0 && (
            <ReportSection title='Moon Phases This Week'>
              {report.moonPhases.map((phase, index) => (
                <Section
                  key={index}
                  style={{
                    margin: '10px 0',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                  }}
                >
                  <Text style={{ margin: 0 }}>
                    <span style={{ fontSize: '24px' }}>{phase.emoji}</span>
                    <strong style={{ color: '#fff', marginLeft: '10px' }}>
                      {phase.phase}
                    </strong>
                    <span
                      style={{
                        color: '#94a3b8',
                        marginLeft: '10px',
                        fontSize: '14px',
                      }}
                    >
                      {phase.date}
                    </span>
                  </Text>
                </Section>
              ))}
            </ReportSection>
          )}

          {report.keyTransits.length > 0 && (
            <ReportSection title='Key Transits'>
              {report.keyTransits.map((transit, index) => (
                <Section
                  key={index}
                  style={{
                    margin: '10px 0',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                  }}
                >
                  <Text style={{ margin: 0 }}>
                    <strong style={{ color: '#fff' }}>{transit.transit}</strong>
                  </Text>
                  <Text
                    style={{
                      color: '#94a3b8',
                      margin: '5px 0 0 0',
                      fontSize: '14px',
                    }}
                  >
                    {transit.description} - {transit.date}
                  </Text>
                </Section>
              ))}
            </ReportSection>
          )}

          {report.tarotPatterns.dominantThemes.length > 0 && (
            <ReportSection title='🔮 Tarot Patterns This Week'>
              <Text style={{ color: '#cbd5e1', marginBottom: '10px' }}>
                Dominant themes:{' '}
                <strong style={{ color: '#fff' }}>
                  {report.tarotPatterns.dominantThemes.join(', ')}
                </strong>
              </Text>
              {report.tarotPatterns.frequentCards &&
                report.tarotPatterns.frequentCards.length > 0 && (
                  <Section style={{ marginTop: '15px' }}>
                    <Text
                      style={{
                        color: '#94a3b8',
                        fontSize: '14px',
                        marginBottom: '8px',
                      }}
                    >
                      Most frequent cards:
                    </Text>
                    <Row>
                      {report.tarotPatterns.frequentCards
                        .slice(0, 5)
                        .map((card, index) => (
                          <Column key={index} style={{ padding: '4px' }}>
                            <Text
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                color: '#cbd5e1',
                                margin: 0,
                                display: 'inline-block',
                              }}
                            >
                              {card.name} ({card.count}x)
                            </Text>
                          </Column>
                        ))}
                    </Row>
                  </Section>
                )}
            </ReportSection>
          )}

          <ReportSection title='📊 Week Overview'>
            <Row style={{ marginTop: '15px' }}>
              <Column style={{ width: '50%', paddingRight: '8px' }}>
                <Section
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '6px',
                    textAlign: 'center' as const,
                  }}
                >
                  <Text
                    style={{ fontSize: '24px', marginBottom: '5px', margin: 0 }}
                  >
                    {report.moonPhases.length}
                  </Text>
                  <Text
                    style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}
                  >
                    Moon Phases
                  </Text>
                </Section>
              </Column>
              <Column style={{ width: '50%', paddingLeft: '8px' }}>
                <Section
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '6px',
                    textAlign: 'center' as const,
                  }}
                >
                  <Text
                    style={{ fontSize: '24px', marginBottom: '5px', margin: 0 }}
                  >
                    {report.keyTransits.length}
                  </Text>
                  <Text
                    style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}
                  >
                    Key Transits
                  </Text>
                </Section>
              </Column>
            </Row>
          </ReportSection>

          <ReportSection title='💫 Cosmic Insights'>
            <Text style={{ color: '#cbd5e1', lineHeight: '1.8', margin: 0 }}>
              This week&apos;s cosmic energy has been {dominantTheme}, with{' '}
              {report.keyTransits.length} significant planetary transits shaping
              your path. The moon&apos;s journey through {firstMoonPhase} has
              influenced the emotional landscape, while your tarot patterns
              reveal deeper themes {themeDescription}.
            </Text>
            <Text
              style={{
                color: '#cbd5e1',
                marginTop: '15px',
                lineHeight: '1.8',
              }}
            >
              <strong style={{ color: '#fff' }}>Looking ahead:</strong> Use
              these insights to align with the cosmic flow. Pay attention to the
              patterns that emerged this week—they&apos;re guiding you toward
              your highest path.
            </Text>
          </ReportSection>

          <Section style={{ textAlign: 'center' as const, margin: '30px 0' }}>
            <CTAButton href={`${appUrl}/cosmic-state`}>
              View Your Full Cosmic State →
            </CTAButton>
          </Section>

          <Hr
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              margin: '30px 0',
            }}
          />

          <Section style={{ textAlign: 'center' as const }}>
            <Text style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
              Want personalized insights?{' '}
              <Link
                href={`${appUrl}/book-of-shadows`}
                style={{ color: '#8b5cf6' }}
              >
                Ask Lunary AI
              </Link>
            </Text>
            <Text
              style={{ color: '#64748b', fontSize: '11px', marginTop: '15px' }}
            >
              <Link
                href={unsubscribeUrl}
                style={{ color: '#64748b', textDecoration: 'underline' }}
              >
                Unsubscribe
              </Link>
              {' | '}
              <Link
                href={`${appUrl}/profile`}
                style={{ color: '#64748b', textDecoration: 'underline' }}
              >
                Manage Preferences
              </Link>
            </Text>
            <Text
              style={{ color: '#475569', fontSize: '10px', marginTop: '10px' }}
            >
              © {new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙
              for your cosmic journey.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateWeeklyReportEmailHTML(
  report: WeeklyReport,
  appUrl: string,
  userName?: string,
  userEmail?: string,
): Promise<string> {
  return await render(
    <WeeklyReportEmail
      report={report}
      appUrl={appUrl}
      userName={userName}
      userEmail={userEmail}
    />,
  );
}

export function generateWeeklyReportEmailText(
  report: WeeklyReport,
  appUrl: string,
  userName?: string,
  userEmail?: string,
): string {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const dominantTheme =
    report.tarotPatterns.dominantThemes.length > 0
      ? report.tarotPatterns.dominantThemes[0].toLowerCase()
      : 'dynamic';
  const firstMoonPhase =
    report.moonPhases.length > 0
      ? report.moonPhases[0].phase
      : 'various phases';
  const themeDescription =
    report.tarotPatterns.dominantThemes.length > 0
      ? `around ${report.tarotPatterns.dominantThemes.slice(0, 2).join(' and ')}`
      : 'of transformation';

  const unsubscribeUrl = userEmail
    ? `${appUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`
    : `${appUrl}/unsubscribe`;

  return `
${greeting}

🌙 Your Weekly Cosmic Report

${report.summary}

📊 Week Overview:
- ${report.moonPhases.length} Moon Phases
- ${report.keyTransits.length} Key Transits

Moon Phases This Week:
${report.moonPhases.map((p) => `${p.emoji} ${p.phase} - ${p.date}`).join('\n')}

Key Transits:
${report.keyTransits.map((t) => `${t.transit} - ${t.date}\n  ${t.description}`).join('\n')}

${report.tarotPatterns.dominantThemes.length > 0 ? `\n🔮 Tarot Patterns:\nDominant themes: ${report.tarotPatterns.dominantThemes.join(', ')}\n` : ''}
${
  report.tarotPatterns.frequentCards &&
  report.tarotPatterns.frequentCards.length > 0
    ? `Most frequent cards: ${report.tarotPatterns.frequentCards
        .slice(0, 5)
        .map((c) => `${c.name} (${c.count}x)`)
        .join(', ')}\n`
    : ''
}

💫 Cosmic Insights:
This week's cosmic energy has been ${dominantTheme}, with ${report.keyTransits.length} significant planetary transits shaping your path. The moon's journey through ${firstMoonPhase} has influenced the emotional landscape, while your tarot patterns reveal deeper themes ${themeDescription}.

Looking ahead: Use these insights to align with the cosmic flow. Pay attention to the patterns that emerged this week—they're guiding you toward your highest path.

View your full cosmic state: ${appUrl}/cosmic-state
Ask Lunary AI: ${appUrl}/book-of-shadows

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${appUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Made with 🌙 for your cosmic journey.
  `.trim();
}
