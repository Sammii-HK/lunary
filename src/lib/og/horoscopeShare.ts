export const DEFAULT_SHARE_ORIGIN = 'https://lunary.app';

export const getShareOrigin = () =>
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : DEFAULT_SHARE_ORIGIN;

export type NumerologyShareNumber = {
  label: string;
  value: number | string;
  meaning?: string;
  extra?: string;
};

export interface HoroscopeNumerologyShareOptions {
  shareOrigin?: string;
  highlightTitle?: string;
  highlight?: string;
  highlightSubtitle?: string;
  date?: string;
  name?: string;
  variant?: string;
  numbers?: NumerologyShareNumber[];
}

export const buildHoroscopeNumerologyShareUrl = ({
  shareOrigin,
  highlightTitle,
  highlight,
  highlightSubtitle,
  date,
  name,
  variant,
  numbers,
}: HoroscopeNumerologyShareOptions) => {
  const origin = shareOrigin ?? DEFAULT_SHARE_ORIGIN;
  const url = new URL('/api/og/horoscope-numerology', origin);
  if (highlightTitle) {
    url.searchParams.set('highlightTitle', highlightTitle);
  }
  if (highlight) {
    url.searchParams.set('highlight', highlight);
  }
  if (highlightSubtitle) {
    url.searchParams.set('highlightSubtitle', highlightSubtitle);
  }
  if (date) {
    url.searchParams.set('date', date);
  }
  if (name) {
    url.searchParams.set('name', name);
  }
  if (variant) {
    url.searchParams.set('variant', variant);
  }
  if (numbers && numbers.length > 0) {
    url.searchParams.set('numbers', JSON.stringify(numbers));
  }
  return url.toString();
};
