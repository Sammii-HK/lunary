import { HoroscopeReading } from './personalizedHoroscope';

type DailyFocusCard = {
  focusLabel: string;
  narrative: string;
  action: string;
};

const titleCase = (s: string) =>
  s
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const buildDailyFocusCard = (
  reading: Pick<
    HoroscopeReading,
    'dailyFocus' | 'dailyGuidance' | 'dailyAction'
  >,
): DailyFocusCard => {
  const focusLabel = titleCase(reading.dailyFocus || 'focus');

  return {
    focusLabel,
    narrative: reading.dailyGuidance,
    action: reading.dailyAction,
  };
};
