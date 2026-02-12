import { Heading } from '@/components/ui/Heading';
import { ReferralDashboard } from '@/components/referrals/ReferralDashboard';

export const metadata = {
  title: 'Referrals | Lunary',
  description: 'Invite friends to Lunary and earn cosmic rewards',
};

export default function ReferralsPage() {
  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 p-4'>
        <div className='max-w-lg mx-auto space-y-6'>
          <header className='pt-4 pb-2'>
            <Heading variant='h1' as='h1'>
              Referrals
            </Heading>
            <p className='text-sm text-zinc-400'>
              Invite friends and earn cosmic rewards
            </p>
          </header>

          <ReferralDashboard />
        </div>
      </div>
    </div>
  );
}
