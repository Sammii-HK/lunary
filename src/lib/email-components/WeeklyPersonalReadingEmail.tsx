import { render } from '@react-email/render';
import {
  getSunSignEmailCopy,
  getMoonSignEmailCopy,
} from '@/lib/email/grimoire-email-copy';
import { Cta, Insight, P, PersonalEmail, Signature } from './PersonalEmail';

export interface WeeklyReadingProps {
  userId: string;
  userName: string;
  sunSign?: string;
  moonSign?: string;
  userEmail?: string;
  weekLabel: string;
  baseUrl?: string;
}

function WeeklyPersonalReadingEmailComponent({
  userId,
  userName,
  sunSign,
  moonSign,
  userEmail,
  weekLabel,
  baseUrl = 'https://lunary.app',
}: WeeklyReadingProps) {
  const firstName = userName?.split(' ')[0] || 'there';
  const sunCopy = sunSign ? getSunSignEmailCopy(sunSign, userId) : null;
  const moonCopy = moonSign ? getMoonSignEmailCopy(moonSign, userId) : null;
  const appUrl = `${baseUrl}/app?utm_source=email&utm_medium=weekly&utm_campaign=weekly_reading`;

  return (
    <PersonalEmail
      preview={`Your chart for the week of ${weekLabel}`}
      userEmail={userEmail}
    >
      <P>Hi {firstName},</P>

      <P>
        I looked at your chart for the week of {weekLabel} and wanted to drop
        you a quick note.
      </P>

      {sunCopy && <Insight>{sunCopy}</Insight>}

      {moonCopy && <Insight>{moonCopy}</Insight>}

      {!sunCopy && !moonCopy && (
        <P>
          The planets have been active this week. Open your chart to see what is
          moving for you specifically.
        </P>
      )}

      <P>
        Everything is live in the app: your transits, your daily card, all of it
        updated for this week.
      </P>

      <Cta href={appUrl} label='Open your chart' />

      <Signature />
    </PersonalEmail>
  );
}

export async function renderWeeklyPersonalReading(
  props: WeeklyReadingProps,
): Promise<string> {
  return await render(<WeeklyPersonalReadingEmailComponent {...props} />);
}

export function weeklyReadingSubject(firstName?: string): string {
  if (firstName) {
    return `Your chart this week, ${firstName}`;
  }
  return 'Your chart this week';
}
