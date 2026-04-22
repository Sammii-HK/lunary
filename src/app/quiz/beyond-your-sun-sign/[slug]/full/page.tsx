import type { Metadata } from 'next';
import { FullQuizResultView } from '@/components/quiz/FullQuizResultView';

export const metadata: Metadata = {
  title: 'Your Full Chart Ruler Profile | Lunary',
  description:
    'Your full Chart Ruler reading, unlocked. Strengths, growth edges, career expression, and the transits activating your placements right now.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FullQuizResultPage() {
  return (
    <main className='min-h-screen'>
      <FullQuizResultView />
    </main>
  );
}
