/**
 * Free user reactivation email series.
 *
 * Personal, from Sammii, with real chart data and content hooks only.
 * No discounting, no coupons, no hard sell. The hook is always the sky:
 * what moved, what shifted, what is about to happen in their chart.
 *
 * No em dashes. UK English. Plain-text feel.
 *
 * Sequence:
 *   Day 2        gentle check-in
 *   Day 7        what moved while you were away
 *   Dormant 14d  the thing they probably missed (the Grimoire)
 *   Transit      a major transit just hit their chart (event-triggered)
 */
import { render } from '@react-email/render';
import {
  getSunSignEmailCopy,
  getMoonSignEmailCopy,
} from '@/lib/email/grimoire-email-copy';
import { Cta, Insight, P, PersonalEmail, Signature } from './PersonalEmail';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

// ─── Day 2: gentle check-in ────────────────────────────────────────────────

export interface FreeDay2Props {
  userId: string;
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function Day2EmailComponent({
  userId,
  userName,
  sunSign,
  userEmail,
}: FreeDay2Props) {
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const appUrl = `${BASE_URL}/app?utm_source=email&utm_medium=reengagement&utm_campaign=free_2d`;

  return (
    <PersonalEmail
      preview='Came to check in on your chart'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        Just a quick check-in. I noticed you set things up and then the sky
        carried on without you. That is completely normal, life gets busy.
      </P>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {!sunCopy && (
        <Insight>
          There have already been a few shifts in the cosmic weather since you
          signed up. The kind of thing worth reading against your own chart
          rather than a generic horoscope.
        </Insight>
      )}

      <P>
        Your chart is exactly where you left it, and it has been quietly
        tracking everything in the background. Takes about 30 seconds to catch
        up.
      </P>

      <Cta href={appUrl} label='See what is in your chart' />

      <Signature />
    </PersonalEmail>
  );
}

export async function renderFreeDay2Email(
  props: FreeDay2Props,
): Promise<string> {
  return await render(<Day2EmailComponent {...props} />);
}

// ─── Day 7: what moved while you were away ────────────────────────────────

export interface FreeDay7Props {
  userId: string;
  userName: string;
  sunSign?: string;
  moonSign?: string;
  userEmail?: string;
}

function Day7EmailComponent({
  userId,
  userName,
  sunSign,
  moonSign,
  userEmail,
}: FreeDay7Props) {
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const moonCopy = moonSign ? getMoonSignEmailCopy(moonSign, userId) : null;
  const appUrl = `${BASE_URL}/app?utm_source=email&utm_medium=reengagement&utm_campaign=free_7d`;

  return (
    <PersonalEmail
      preview='Your sky shifted while you were away'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        It has been a week. Here is what happened in your chart while you were
        away.
      </P>

      <Insight>
        The Moon has moved through roughly three signs since you last checked
        in, which means the emotional weather has shifted several times.{' '}
        {sunSign
          ? `For your ${sunSign} Sun, the current energy is worth paying attention to.`
          : 'Your chart has been tracking all of it.'}
      </Insight>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {moonCopy && <Insight>{moonCopy}</Insight>}

      <P>
        Everything is live and updated: your daily card, your current transits,
        your full chart. It remembers everything even when you are not checking
        in.
      </P>

      <Cta href={appUrl} label='Catch up on your chart' />

      <Signature />
    </PersonalEmail>
  );
}

export async function renderFreeDay7Email(
  props: FreeDay7Props,
): Promise<string> {
  return await render(<Day7EmailComponent {...props} />);
}

// ─── Dormant 14 days: the thing they probably missed ─────────────────────

export interface FreeDay14Props {
  userId: string;
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function Day14EmailComponent({
  userId,
  userName,
  sunSign,
  userEmail,
}: FreeDay14Props) {
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const grimoireUrl = `${BASE_URL}/grimoire?utm_source=email&utm_medium=reengagement&utm_campaign=free_14d`;
  const appUrl = `${BASE_URL}/app?utm_source=email&utm_medium=reengagement&utm_campaign=free_14d`;

  return (
    <PersonalEmail
      preview='Something I want to make sure you saw'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        It has been a couple of weeks. I wanted to reach out before too much
        time passes, because there is one part of Lunary most people never find.
      </P>

      <P>
        It is the Grimoire, and it is the part I am most proud of. Fifty
        sections covering your natal placements, the transits hitting your chart
        right now, plus spells, crystals, tarot, and numerology. All of it free.
      </P>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {sunSign && !sunCopy && (
        <Insight>
          Your {sunSign} placements have their own dedicated pages: the transits
          active right now, what they mean for you, and how to work with the
          energy.
        </Insight>
      )}

      {!sunSign && (
        <Insight>
          Your natal placements have their own dedicated pages in the Grimoire.
          It is not generic horoscope content, it is specific to your chart.
        </Insight>
      )}

      <Cta href={grimoireUrl} label='Explore the Grimoire' />

      <P>And your chart is still here whenever you want it.</P>

      <Cta href={appUrl} label='Open your chart' />

      <Signature />
    </PersonalEmail>
  );
}

export async function renderFreeDay14Email(
  props: FreeDay14Props,
): Promise<string> {
  return await render(<Day14EmailComponent {...props} />);
}

// ─── Major transit: event-triggered content hook (no discount) ───────────

export type TransitKind =
  | 'retrograde_station'
  | 'ingress'
  | 'eclipse'
  | 'sabbat'
  | 'equinox'
  | 'solstice'
  | 'aspect'
  | 'moon_phase'
  | 'other';

export interface FreeMajorTransitProps {
  userId: string;
  userName: string;
  userEmail?: string;
  sunSign?: string;
  /** Display name of the event, e.g. "Mars stations retrograde in Leo" */
  transitName: string;
  /** Discriminated kind used to pick the right astronomy wording */
  transitKind: TransitKind;
  /** Planet, when applicable */
  planet?: string;
  /** Sign the event lands in, when applicable */
  sign?: string;
}

/**
 * Builds the lead sentence with astronomically correct wording.
 *
 * Critically: a retrograde STATION is not an INGRESS. A planet stationing
 * retrograde has NOT entered a new sign, it has turned around inside the sign
 * it is already in. So we say "has just stationed retrograde in {sign}",
 * never "entered {sign}".
 */
function buildTransitLead(props: FreeMajorTransitProps): string {
  const { transitKind, planet, sign, transitName } = props;

  if (transitKind === 'retrograde_station' && planet && sign) {
    return `${planet} has just stationed retrograde in ${sign}.`;
  }
  if (transitKind === 'ingress' && planet && sign) {
    return `${planet} has just entered ${sign}.`;
  }
  if (transitKind === 'eclipse') {
    return `There has just been an eclipse${sign ? ` in ${sign}` : ''}.`;
  }
  if (
    (transitKind === 'sabbat' ||
      transitKind === 'equinox' ||
      transitKind === 'solstice' ||
      transitKind === 'moon_phase') &&
    transitName
  ) {
    return `${transitName} has just arrived.`;
  }
  // Generic fallback uses the event name as-is so we never invent wording.
  return `${transitName} has just hit the sky.`;
}

function MajorTransitEmailComponent(props: FreeMajorTransitProps) {
  const { userId, userName, userEmail, sunSign, transitKind, planet, sign } =
    props;
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const lead = buildTransitLead(props);
  const appUrl = `${BASE_URL}/app?utm_source=email&utm_medium=reengagement&utm_campaign=free_major_transit`;

  const meaningLine =
    transitKind === 'retrograde_station' && planet
      ? `A station is the moment ${planet} appears to stop and turn back on itself, and it tends to be felt more sharply than the steady part of a retrograde. It pulls ${planet}-ruled themes back to the surface to be looked at again.`
      : transitKind === 'ingress' && planet
        ? `An ingress is a clean change of room. ${planet} carries its energy into ${sign ?? 'a new sign'}, and the tone of everything it touches in your chart shifts with it.`
        : 'It is the kind of shift that lands differently depending on where it falls in your own chart, which is exactly what Lunary works out for you.';

  return (
    <PersonalEmail
      preview='A major transit just hit your chart'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        I do not email about every shift in the sky, but this one is worth your
        attention. {lead}
      </P>

      <Insight>{meaningLine}</Insight>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {sunSign && !sunCopy && (
        <Insight>
          For your {sunSign} Sun, this lands in a specific part of your chart.
          Lunary maps it against your real placements rather than a one-size
          horoscope.
        </Insight>
      )}

      <P>
        Your chart already has it factored in. Open it to see exactly where this
        is landing for you and what to do with it.
      </P>

      <Cta href={appUrl} label='See it in your chart' />

      <Signature />
    </PersonalEmail>
  );
}

export async function renderFreeMajorTransitEmail(
  props: FreeMajorTransitProps,
): Promise<string> {
  return await render(<MajorTransitEmailComponent {...props} />);
}
