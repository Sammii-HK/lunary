import { Metadata } from 'next';

const year = new Date().getFullYear() + 1;

export const metadata: Metadata = {
  title: `${year} Astrology Forecast: Your Personal Year Ahead - Lunary`,
  description: `Your personalized ${year} astrology forecast. Major transits, retrogrades, eclipses & key aspects based on your birth chart. Plan your year with cosmic guidance.`,
  keywords: [
    `${year} astrology forecast`,
    `${year} horoscope`,
    'yearly astrology prediction',
    'personal astrology forecast',
    'astrology year ahead',
  ],
  alternates: {
    canonical: 'https://lunary.app/forecast',
  },
};

export default function ForecastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
