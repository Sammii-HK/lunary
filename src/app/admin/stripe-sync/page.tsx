import { StripeSyncButton } from './StripeSyncButton';

export const metadata = {
  title: 'Stripe Sync — Admin',
};

export default function StripeSyncPage() {
  return (
    <div className='min-h-screen bg-surface-base text-content-primary'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-3xl'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-semibold'>Stripe sync</h1>
          <p className='text-sm text-content-muted mt-2'>
            Full Stripe-first reconciliation. Pages every active Stripe
            subscription and upserts any missing or stale DB rows. Use this
            after webhook outages or to catch users the weekly cron missed.
          </p>
        </div>

        <StripeSyncButton />
      </div>
    </div>
  );
}
