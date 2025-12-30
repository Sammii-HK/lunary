const PHASES = [
  'new moon',
  'waxing crescent',
  'first quarter',
  'waxing gibbous',
  'full moon',
  'waning gibbous',
  'last quarter',
  'waning crescent',
];

const capitalizeWords = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

export const extractMoonPhaseName = (value?: string): string | null => {
  if (!value) return null;
  const lower = value.toLowerCase();
  const match = PHASES.find((phase) => lower.includes(phase));
  return match ? capitalizeWords(match) : null;
};

export const cleanMoonPhaseText = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
};
