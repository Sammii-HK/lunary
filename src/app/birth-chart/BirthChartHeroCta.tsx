'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackCtaImpression, trackEvent } from '@/lib/analytics';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';

type BirthChartHeroCtaProps = {
  variant: 'A' | 'B';
};

const PAGE_PATH = '/birth-chart';

export function BirthChartHeroCta({ variant }: BirthChartHeroCtaProps) {
  const impressionTracked = useRef(false);
  const abMeta = getABTestMetadataFromVariant('exec_conversion_v1', variant);

  useEffect(() => {
    if (impressionTracked.current) return;
    impressionTracked.current = true;

    trackCtaImpression({
      hub: 'birth_chart',
      ctaId: 'birth_chart_signup_cta',
      location: 'birth_chart_hero',
      label: 'Calculate Your Birth Chart',
      href: '/auth',
      pagePath: PAGE_PATH,
      abTest: 'exec_conversion_v1',
      abVariant: variant,
    });
  }, [abMeta, variant]);

  const handleSignupClick = () => {
    void trackEvent('cta_clicked', {
      pagePath: PAGE_PATH,
      cta_id: 'birth_chart_signup_cta',
      cta_location: 'birth_chart_hero',
      cta_label: 'Calculate Your Birth Chart',
      cta_href: '/auth',
      metadata: {
        surface: 'birth_chart_hero',
        cta_variant: variant,
        ...(abMeta || {}),
      },
    });
  };

  if (variant === 'B') {
    return (
      <div className='mx-auto max-w-2xl rounded-2xl border border-lunary-primary-700/50 bg-layer-base/70 p-5 sm:p-6 shadow-[0_20px_60px_rgba(124,92,255,0.12)]'>
        <div className='flex items-center justify-center gap-2 mb-3'>
          <Sparkles className='w-4 h-4 text-lunary-accent' />
          <span className='text-xs font-semibold uppercase tracking-[0.18em] text-lunary-accent'>
            Free birth chart in under a minute
          </span>
        </div>
        <p className='text-sm sm:text-base text-content-muted max-w-xl mx-auto'>
          Start with a free chart, then explore planetary aspects, dignities,
          and personalized interpretations powered by real astronomical data.
        </p>
        <div className='mt-5 flex flex-col sm:flex-row gap-3 justify-center'>
          <Button asChild size='lg' variant='lunary-solid' className='gap-2'>
            <Link href='/auth' onClick={handleSignupClick}>
              Calculate Your Birth Chart
              <ArrowRight className='w-4 h-4' />
            </Link>
          </Button>
          <Button asChild size='lg' variant='outline' className='gap-2'>
            <Link href='/birth-chart/example'>
              <BookOpen className='w-4 h-4' />
              Learn to Read Charts
            </Link>
          </Button>
        </div>
        <p className='mt-4 text-xs text-content-muted'>
          No credit card required · Fast signup · Mobile friendly
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col sm:flex-row gap-3 justify-center pt-2'>
      <Link href='/auth'>
        <Button className='gap-2' onClick={handleSignupClick}>
          Calculate Your Birth Chart
          <ArrowRight className='w-4 h-4' />
        </Button>
      </Link>
      <Link href='/birth-chart/example'>
        <Button variant='outline' className='gap-2'>
          <BookOpen className='w-4 h-4' />
          Learn to Read Charts
        </Button>
      </Link>
    </div>
  );
}
