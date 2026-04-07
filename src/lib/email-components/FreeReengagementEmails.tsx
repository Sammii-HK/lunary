/**
 * Free user re-engagement email series.
 * Personal, from Sammii, with real chart data.
 * No em dashes. UK English. Plain-text feel.
 */
import { render } from '@react-email/render';
import {
  getSunSignEmailCopy,
  getMoonSignEmailCopy,
} from '@/lib/email/grimoire-email-copy';
import { Cta, Insight, P, PersonalEmail, Signature } from './PersonalEmail';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

// ─── Day 3: gentle check-in ────────────────────────────────────────────────

export interface FreeDay3Props {
  userId: string;
  userName: string;
  sunSign?: string;
  userEmail?: string;
}

function Day3EmailComponent({
  userId,
  userName,
  sunSign,
  userEmail,
}: FreeDay3Props) {
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const appUrl = `${BASE_URL}/app?utm_source=email&utm_medium=reengagement&utm_campaign=free_3d`;

  return (
    <PersonalEmail
      preview='Came to check in on your chart today'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        Just a quick check-in. I noticed you have not been back in a few days.
      </P>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {!sunCopy && (
        <Insight>
          There have been a few shifts in the cosmic weather this week. The kind
          of thing worth checking against your chart specifically.
        </Insight>
      )}

      <P>
        Your chart is exactly where you left it. Takes 30 seconds to catch up.
      </P>

      <Cta href={appUrl} label='See what is in your chart' />

      <Signature />
    </PersonalEmail>
  );
}

export async function renderFreeDay3Email(
  props: FreeDay3Props,
): Promise<string> {
  return await render(<Day3EmailComponent {...props} />);
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
      preview='Here is what moved in your chart this week'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        It has been a week. Here is what happened in your chart while you were
        away.
      </P>

      <Insight>
        The Moon has moved through roughly three signs since you last checked
        in, which means the emotional weather has shifted a few times.{' '}
        {sunSign
          ? `For your ${sunSign} Sun, the current energy is worth paying attention to.`
          : 'Your chart has been tracking it all.'}
      </Insight>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {moonCopy && <Insight>{moonCopy}</Insight>}

      <P>
        Everything is live and updated: your daily card, your transits, your
        chart. It remembers everything even when you are not checking in.
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

// ─── Day 14: something they probably missed ──────────────────────────────

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
        It has been two weeks. I wanted to reach out before too much time
        passes.
      </P>

      <P>
        Most people who sign up never find the Grimoire. It is the part of
        Lunary I am most proud of: 50 sections covering natal placements,
        transits, spells, crystals, tarot, numerology, and more. All free.
      </P>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {sunSign && !sunCopy && (
        <Insight>
          Your {sunSign} placements have their own dedicated pages: the transits
          active right now, what they mean, and how to work with the energy.
        </Insight>
      )}

      {!sunSign && (
        <Insight>
          Your natal placements have their own dedicated pages in the Grimoire.
          It is not generic horoscope content: it is specific to your chart.
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

// ─── Day 30: win-back with coupon ─────────────────────────────────────────

export interface WinBackProps {
  userName: string;
  userEmail?: string;
  couponCode?: string;
  sunSign?: string;
}

function WinBackEmailComponent({
  userName,
  userEmail,
  couponCode = 'MOONRISE20',
  sunSign,
}: WinBackProps) {
  const firstName = userName?.split(' ')[0] || 'there';
  const pricingUrl = `${BASE_URL}/pricing?coupon=${couponCode}&utm_source=email&utm_medium=reengagement&utm_campaign=winback_30d`;

  return (
    <PersonalEmail
      preview='Still here if you want to come back'
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        It has been a while. I am not going to keep emailing you after this, but
        I wanted to reach out one more time.
      </P>

      {sunSign ? (
        <Insight>
          A lot has moved through your {sunSign} chart in the past month.
          Retrogrades, sign changes, aspects that are specific to your
          placements. The kind of thing that is easy to miss when you are not
          checking in.
        </Insight>
      ) : (
        <Insight>
          A lot has moved through your chart in the past month: retrogrades,
          sign changes, aspects specific to your placements. The kind of thing
          that is easy to miss when you are not checking in.
        </Insight>
      )}

      <P>
        If you have been curious about what Pro unlocks: personal transit
        readings tied to your exact placements, Astral Chat, your full chart
        tracked in real time. I want to make it easy to try it.
      </P>

      <Insight>
        Use code {couponCode} at checkout for 20% off, forever. Not a trial. A
        permanent reduction on your subscription as long as you stay.
      </Insight>

      <Cta href={pricingUrl} label='Get 20% off Pro' />

      <P>Either way, I hope things are going well.</P>

      <Signature />
    </PersonalEmail>
  );
}

export async function renderWinBackEmail(props: WinBackProps): Promise<string> {
  return await render(<WinBackEmailComponent {...props} />);
}
