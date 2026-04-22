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
import type { QuizResult, QuizSection } from '@/lib/quiz/types';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

interface QuizResultEmailProps {
  result: QuizResult;
  userEmail: string;
}

const SIGNAL_CHIP_LABELS: Record<string, string> = {
  domicile: 'Domicile',
  exaltation: 'Exalted',
  detriment: 'Detriment',
  fall: 'Fall',
  angular: 'Angular house',
  succedent: 'Succedent house',
  cadent: 'Cadent house',
};

function ordinal(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = ['th', 'st', 'nd', 'rd'][mod10] ?? 'th';
  return `${n}${mod10 > 3 ? 'th' : suffix}`;
}

function buildSignalChips(signals: QuizResult['meta']['signals']): string[] {
  if (!signals) return [];
  const chips: string[] = [];
  if (signals.dignity && SIGNAL_CHIP_LABELS[signals.dignity]) {
    chips.push(SIGNAL_CHIP_LABELS[signals.dignity]);
  }
  if (typeof signals.houseNumber === 'number' && signals.houseNumber > 0) {
    chips.push(`${ordinal(signals.houseNumber)} house`);
  }
  if (signals.houseNature && SIGNAL_CHIP_LABELS[signals.houseNature]) {
    chips.push(SIGNAL_CHIP_LABELS[signals.houseNature]);
  }
  if (signals.rulerInRising) chips.push('Rules itself');
  if (signals.retrograde) chips.push('Retrograde');
  return chips;
}

function findLivedMeaningSection(
  sections: QuizSection[],
): QuizSection | undefined {
  // The chart-ruler engine emits "What this actually means for you" as the
  // lived-experience section. Match that heading first, then fall back to
  // anything with a similar shape so this helper survives engine tweaks.
  const exact = sections.find(
    (s) => s.heading.toLowerCase() === 'what this actually means for you',
  );
  if (exact) return exact;
  return sections.find((s) => s.heading.toLowerCase().startsWith('what this'));
}

export function QuizResultEmail({ result, userEmail }: QuizResultEmailProps) {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  const archetype = result.archetype;
  const archetypeLabel = archetype?.label ?? 'Your Chart Ruler Profile';
  const tagline = archetype?.tagline ?? result.hero.subhead;
  const rationale = archetype?.rationale ?? result.hero.subhead;
  const livedMeaning = findLivedMeaningSection(result.sections);
  const chips = buildSignalChips(result.meta.signals);

  const chartUrl = `${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=quiz_result&utm_content=chart-ruler`;

  return (
    <Html>
      <Head>
        <title>Your Chart Ruler Profile: {archetypeLabel}</title>
      </Head>
      <Preview>{tagline}</Preview>
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
            <Text
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                margin: '0 0 12px',
              }}
            >
              Your Chart Ruler Profile
            </Text>
            <Heading
              as='h1'
              style={{
                color: '#a78bfa',
                fontSize: '32px',
                lineHeight: '1.2',
                margin: 0,
              }}
            >
              {archetypeLabel}
            </Heading>
            <Text
              style={{
                color: '#d1c4ff',
                fontSize: '16px',
                fontStyle: 'italic' as const,
                margin: '12px 0 0',
              }}
            >
              {tagline}
            </Text>
          </Section>

          <Section style={{ margin: '0 0 28px' }}>
            <Heading
              as='h2'
              style={{
                color: '#f9fafb',
                fontSize: '18px',
                margin: '0 0 12px',
              }}
            >
              Why this configuration matters
            </Heading>
            <Text style={{ color: '#d1c4ff', margin: 0 }}>{rationale}</Text>
          </Section>

          <Section
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(167, 139, 250, 0.35)',
              margin: '0 0 28px',
            }}
          >
            <Text
              style={{
                color: '#a78bfa',
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                margin: '0 0 8px',
                fontWeight: '600',
              }}
            >
              The configuration
            </Text>
            <Text
              style={{
                color: '#f9fafb',
                fontSize: '15px',
                margin: 0,
              }}
            >
              {result.hero.headline}
            </Text>
          </Section>

          {livedMeaning && (
            <Section style={{ margin: '0 0 28px' }}>
              <Heading
                as='h2'
                style={{
                  color: '#f9fafb',
                  fontSize: '18px',
                  margin: '0 0 12px',
                }}
              >
                What this means for you
              </Heading>
              <Text style={{ color: '#d1c4ff', margin: 0 }}>
                {livedMeaning.body}
              </Text>
            </Section>
          )}

          {chips.length > 0 && (
            <Section style={{ margin: '0 0 28px' }}>
              <Heading
                as='h2'
                style={{
                  color: '#f9fafb',
                  fontSize: '18px',
                  margin: '0 0 12px',
                }}
              >
                Your chart ruler at a glance
              </Heading>
              <Section style={{ margin: 0 }}>
                {chips.map((chip) => (
                  <Text
                    key={chip}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(167, 139, 250, 0.15)',
                      color: '#e1d9ff',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      margin: '0 8px 8px 0',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                    }}
                  >
                    {chip}
                  </Text>
                ))}
              </Section>
            </Section>
          )}

          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Link
              href={chartUrl}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                padding: '16px 32px',
                textDecoration: 'none',
                borderRadius: '999px',
                fontWeight: '600',
                fontSize: '16px',
              }}
            >
              See your full chart in Lunary
            </Link>
          </Section>

          <Section
            style={{
              textAlign: 'center' as const,
              marginTop: '32px',
              fontSize: '13px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(147, 112, 219, 0.2)',
              paddingTop: '20px',
            }}
          >
            <Text style={{ margin: '12px 0' }}>
              <Link
                href={unsubscribeUrl}
                style={{ color: '#9ca3af', textDecoration: 'underline' }}
              >
                Unsubscribe
              </Link>
              {' | '}
              <Link
                href={`${baseUrl}/profile`}
                style={{ color: '#9ca3af', textDecoration: 'underline' }}
              >
                Manage Preferences
              </Link>
            </Text>
            <Text style={{ marginTop: '15px' }}>
              © {new Date().getFullYear()} Lunar Computing, Inc. Guided by the
              stars, powered by magic.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function generateQuizResultEmailHTML(
  result: QuizResult,
  userEmail: string,
): Promise<string> {
  return await render(
    <QuizResultEmail result={result} userEmail={userEmail} />,
  );
}

export function generateQuizResultEmailText(
  result: QuizResult,
  userEmail: string,
): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  const archetype = result.archetype;
  const archetypeLabel = archetype?.label ?? 'Your Chart Ruler Profile';
  const tagline = archetype?.tagline ?? result.hero.subhead;
  const rationale = archetype?.rationale ?? result.hero.subhead;
  const livedMeaning = findLivedMeaningSection(result.sections);
  const chips = buildSignalChips(result.meta.signals);
  const chartUrl = `${baseUrl}/birth-chart?utm_source=email&utm_medium=lifecycle&utm_campaign=quiz_result&utm_content=chart-ruler`;

  return `
Your Chart Ruler Profile: ${archetypeLabel}

${tagline}

WHY THIS CONFIGURATION MATTERS
${rationale}

THE CONFIGURATION
${result.hero.headline}

${
  livedMeaning
    ? `WHAT THIS MEANS FOR YOU
${livedMeaning.body}

`
    : ''
}${
    chips.length > 0
      ? `YOUR CHART RULER AT A GLANCE
${chips.map((c) => `- ${c}`).join('\n')}

`
      : ''
  }See your full chart in Lunary:
${chartUrl}

---
Unsubscribe: ${unsubscribeUrl}
Manage Preferences: ${baseUrl}/profile

© ${new Date().getFullYear()} Lunar Computing, Inc. Guided by the stars, powered by magic.
  `.trim();
}
