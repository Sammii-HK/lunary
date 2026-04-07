import { render } from '@react-email/render';
import {
  getSunSignEmailCopy,
  getMoonSignEmailCopy,
  getCurrentWeekLabel,
} from '@/lib/email/grimoire-email-copy';
import {
  WeeklyCard,
  MoonPhaseInfo,
  PlanetHousePlacement,
  SignificantAspect,
  formatAspectSentence,
  formatHouseTeaser,
} from '@/lib/email/astro-email-utils';
import { Cta, Insight, P, PersonalEmail, Signature } from './PersonalEmail';

export interface WeeklyReadingProps {
  userId: string;
  userName: string;
  isPro: boolean;
  sunSign?: string;
  moonSign?: string;
  userEmail?: string;
  weekLabel: string;
  baseUrl?: string;
  moonPhase: MoonPhaseInfo;
  weeklyCard: WeeklyCard;
  // Pro only
  transitAspects?: SignificantAspect[];
  // Free only
  planetHouses?: PlanetHousePlacement[];
}

function WeeklyPersonalReadingEmailComponent({
  userId,
  userName,
  isPro,
  sunSign,
  moonSign,
  userEmail,
  weekLabel,
  baseUrl = 'https://lunary.app',
  moonPhase,
  weeklyCard,
  transitAspects = [],
  planetHouses = [],
}: WeeklyReadingProps) {
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const moonCopy =
    isPro && moonSign ? getMoonSignEmailCopy(moonSign, userId) : null;
  const appUrl = `${baseUrl}/app?utm_source=email&utm_medium=weekly&utm_campaign=weekly_reading`;
  const upgradeUrl = `${baseUrl}/pricing?utm_source=email&utm_medium=weekly&utm_campaign=weekly_reading_upsell`;

  if (isPro) {
    return (
      <PersonalEmail
        preview={`Your chart for the week of ${weekLabel}`}
        userEmail={userEmail}
      >
        <P>Hi {firstName},</P>

        <P>Here is what is active in your chart for the week of {weekLabel}.</P>

        <P>
          The Moon is currently in {moonPhase.name}. Your card this week:{' '}
          <strong>{weeklyCard.name}</strong> —{' '}
          {weeklyCard.keywords.slice(0, 3).join(', ')}.
        </P>

        {sunCopy && <Insight>{sunCopy}</Insight>}
        {moonCopy && <Insight>{moonCopy}</Insight>}

        {transitAspects.length > 0 && (
          <>
            <P>What is active in your chart right now:</P>
            {transitAspects.map((a, i) => (
              <Insight key={i}>{formatAspectSentence(a)}</Insight>
            ))}
          </>
        )}

        <Cta href={appUrl} label='Open your chart' />

        <Signature />
      </PersonalEmail>
    );
  }

  // ── Free user version ──────────────────────────────────────────────────
  // Real personalised data, interpretation paywalled
  const teaserPlanets = planetHouses.slice(0, 3);

  return (
    <PersonalEmail
      preview={`Your chart for the week of ${weekLabel}`}
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>Here is a quick look at what is happening in your chart this week.</P>

      <P>
        The Moon is in {moonPhase.name}. The card of the week:{' '}
        <strong>{weeklyCard.name}</strong> —{' '}
        {weeklyCard.keywords.slice(0, 3).join(', ')}.
      </P>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {teaserPlanets.length > 0 && (
        <>
          <P>
            I also looked at the planetary positions against your birth chart.
            Here is what is active this week:
          </P>
          {teaserPlanets.map((p, i) => (
            <Insight key={i}>{formatHouseTeaser(p)}</Insight>
          ))}
          <P>
            Lunary+ includes the full reading for each of these — what the
            energy means specifically for your chart, and what to do with it
            this week.
          </P>
          <Cta href={upgradeUrl} label='Get your full reading' />
        </>
      )}

      {teaserPlanets.length === 0 && (
        <Cta href={appUrl} label='Open your chart' />
      )}

      <Signature />
    </PersonalEmail>
  );
}

export async function renderWeeklyPersonalReading(
  props: WeeklyReadingProps,
): Promise<string> {
  return render(<WeeklyPersonalReadingEmailComponent {...props} />);
}

export function weeklyReadingSubject(firstName?: string): string {
  return firstName
    ? `Your chart this week, ${firstName}`
    : 'Your chart this week';
}

export { getCurrentWeekLabel };
