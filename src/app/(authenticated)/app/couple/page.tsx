import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Heading } from '@/components/ui/Heading';
import { CouplePairingSetup } from '@/components/couples/CouplePairingSetup';
import { CoupleForecastCard } from '@/components/couples/CoupleForecastCard';
import { CompositeChartCard } from '@/components/couples/CompositeChartCard';

export const dynamic = 'force-dynamic';

// TODO(nav): once Couples Mode v1 ships, add a nav entry pointing here from
// `src/components/Navbar.tsx` (and the in-app SmartSearch quick actions in
// `src/components/search/SmartSearch.tsx` — see the existing
// `command:group-sky` entry as a template). Sits naturally next to Group Sky
// under "/app/group-sky" since both are multi-person sky views. Use the Heart
// icon to differentiate it from Group Sky's UsersRound.

export const metadata = {
  title: 'Couples Mode | Lunary',
  description:
    'Pair with your partner for a daily compatibility forecast and shared 14-day cosmic calendar.',
};

export default async function CouplePage() {
  const headersList = await headers();
  const session = await auth.api
    .getSession({ headers: headersList })
    .catch(() => null);

  if (!session?.user?.id) {
    redirect('/login?next=/app/couple');
  }

  const userId = session.user.id;

  // Look for any active pairing — paired or pending — that this user is part of.
  const pairing = await prisma.couple_pairings.findFirst({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: [{ pairedAt: 'desc' }, { createdAt: 'desc' }],
  });

  const isPaired = Boolean(pairing?.pairedAt);

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-6 pb-20'>
      <div className='mb-6'>
        <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-content-muted mb-2'>
          <Heart className='w-3.5 h-3.5 text-lunary-rose' />
          Couples Mode
        </div>
        <Heading as='h1' variant='h1'>
          Your shared sky
        </Heading>
        <p className='text-sm text-content-muted mt-2'>
          {isPaired
            ? "Today's compatibility forecast and the next 14 days for the two of you."
            : 'Pair with your partner using a 6-digit code to unlock a daily compatibility forecast and a shared cosmic calendar.'}
        </p>
      </div>

      {isPaired ? (
        <div className='space-y-6'>
          <CoupleForecastCard />
          <CompositeChartCard />
        </div>
      ) : (
        <CouplePairingSetup existingCode={pairing?.pairingCode ?? undefined} />
      )}
    </div>
  );
}
