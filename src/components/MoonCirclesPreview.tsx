'use client';

import { ReactNode } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';
import { Lock } from 'lucide-react';

interface MoonCirclesPreviewProps {
  children: ReactNode;
  circles: Array<{
    id: number;
    moon_phase: string;
    event_date: string | null;
    title: string | null;
    theme: string | null;
    description: string | null;
    focus_points: string[];
    insight_count: number;
  }>;
}

export function MoonCirclesPreview({
  children,
  circles,
}: MoonCirclesPreviewProps) {
  const subscription = useSubscription();
  const hasAccess = subscription.hasAccess('moon_circles');

  if (hasAccess) {
    return <>{children}</>;
  }

  const previewCircles = circles.slice(0, 2);
  const remainingCount = circles.length - previewCircles.length;

  return (
    <div className='space-y-10'>
      {previewCircles.map((circle) => (
        <section
          key={circle.id}
          className='rounded-3xl border border-lunary-primary-700 bg-black/40 p-6 shadow-lg shadow-lunary-primary-900 backdrop-blur relative overflow-hidden'
        >
          <div className='relative'>
            <div className='opacity-50 pointer-events-none'>
              <div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
                <div className='space-y-5'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <span className='inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-lunary-primary-900 text-lunary-accent-100'>
                      {circle.moon_phase}
                    </span>
                    <span className='rounded-full border border-lunary-primary-700 px-3 py-1 text-xs text-lunary-accent-100/80'>
                      {circle.event_date
                        ? new Intl.DateTimeFormat('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(new Date(circle.event_date))
                        : ''}
                    </span>
                    <span className='rounded-full border border-lunary-primary-700 px-3 py-1 text-xs text-lunary-accent-100/80'>
                      {circle.insight_count} insight
                      {circle.insight_count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className='space-y-2'>
                    <h2 className='text-2xl font-semibold text-white'>
                      {circle.theme || circle.title || 'Moon Circle'}
                    </h2>
                    {circle.description && (
                      <p className='text-sm text-lunary-accent-100/80 line-clamp-2'>
                        {circle.description}
                      </p>
                    )}
                  </div>
                  {circle.focus_points.length > 0 && (
                    <div className='space-y-2'>
                      <p className='text-xs uppercase tracking-[0.2em] text-lunary-accent-200/70'>
                        Focus
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {circle.focus_points.slice(0, 2).map((focus) => (
                          <span
                            key={focus}
                            className='rounded-full border border-lunary-primary-700 px-3 py-1 text-xs text-lunary-accent-100/80'
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg'>
              <div className='text-center p-6 max-w-md'>
                <Lock className='w-12 h-12 text-lunary-accent mx-auto mb-4' />
                <h3 className='text-lg font-medium text-white mb-2'>
                  Unlock Moon Circles
                </h3>
                <p className='text-sm text-gray-400 mb-4'>
                  Join New and Full Moon rituals with guided scripts, altar
                  setups, and community prompts
                </p>
                <UpgradePrompt
                  variant='inline'
                  featureName='moon_circles'
                  title='Unlock Moon Circles'
                  description='Join New and Full Moon rituals with guided scripts, altar setups, and community prompts'
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {remainingCount > 0 && (
        <div className='rounded-3xl border border-dashed border-lunary-primary-600 bg-lunary-primary-950 p-10 text-center'>
          <Lock className='w-8 h-8 text-lunary-accent mx-auto mb-4' />
          <h3 className='text-lg font-medium text-white mb-2'>
            {remainingCount} more Moon Circle
            {remainingCount === 1 ? '' : 's'} available
          </h3>
          <p className='text-sm text-gray-400 mb-6'>
            Upgrade to Lunary+ to access all Moon Circles and join the community
          </p>
          <UpgradePrompt
            variant='inline'
            featureName='moon_circles'
            title='Unlock All Moon Circles'
            description='Join New and Full Moon rituals with guided scripts, altar setups, and community prompts'
          />
        </div>
      )}

      <div className='rounded-3xl border border-lunary-primary-700 bg-black/40 p-8 text-center'>
        <h3 className='text-xl font-semibold text-white mb-3'>
          Join the Moon Circle Community
        </h3>
        <p className='text-sm text-lunary-accent-100/80 mb-6 max-w-2xl mx-auto'>
          Each new and full moon gathering invites reflection, ritual, and
          community. Browse past circles, read what others experienced, and
          anonymously share your own insight after each ceremony.
        </p>
        <UpgradePrompt
          variant='card'
          featureName='moon_circles'
          title='Unlock Moon Circles'
          description='Join New and Full Moon rituals with guided scripts, altar setups, and community prompts'
        />
      </div>
    </div>
  );
}
