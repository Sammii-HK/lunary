import { Suspense } from 'react';
import SignupChartClient from './SignupChartClient';

export const metadata = {
  title: 'Create Your Free Account | Lunary',
  description:
    'Sign up for Lunary to unlock your personal birth chart, daily horoscope, tarot readings, and more.',
};

export default function SignupChartPage() {
  return (
    <Suspense>
      <SignupChartClient />
    </Suspense>
  );
}
