import { Metadata } from 'next';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Heading } from '@/components/ui/Heading';
import { QuestionFeed } from '@/components/community/QuestionFeed';
import { SignupCTA } from '@/components/community/SignupCTA';

export const metadata: Metadata = {
  title: 'Ask the Circle - Astrology Q&A | Lunary',
  description:
    'Ask astrology, tarot, and cosmic questions. Get answers from the Lunary community and our Astral Guide AI.',
  alternates: {
    canonical: 'https://lunary.app/community/questions',
  },
  openGraph: {
    title: 'Ask the Circle - Astrology Q&A | Lunary',
    description:
      'Ask astrology, tarot, and cosmic questions. Get answers from the Lunary community.',
    url: 'https://lunary.app/community/questions',
  },
};

export default async function QuestionsPage() {
  const headersList = await headers();
  const session = await auth.api
    .getSession({ headers: headersList })
    .catch(() => null);
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 p-4'>
        <div className='max-w-2xl mx-auto space-y-6'>
          <header className='pt-4 pb-2'>
            <Heading variant='h1' as='h1'>
              Ask the Circle
            </Heading>
            <p className='text-sm text-zinc-400'>
              Post questions, get cosmic wisdom from the community
            </p>
          </header>

          {!isAuthenticated && <SignupCTA />}

          <QuestionFeed isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}
