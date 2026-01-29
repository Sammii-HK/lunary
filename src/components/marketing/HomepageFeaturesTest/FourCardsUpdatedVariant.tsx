'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageCircle,
  Layers,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moonPhaseIconMap } from '@/lib/constants/moon';
import { ctaExamples } from '@/lib/cta-examples';

export function FourCardsUpdatedVariant() {
  return (
    <div className='max-w-5xl mx-auto space-y-12 md:space-y-20'>
      {/* Card 1: Daily Cosmic Dashboard */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='space-y-3'>
          <LayoutDashboard
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Daily Cosmic Dashboard
          </h3>
          <p className='text-sm md:text-base text-zinc-400 mb-3'>
            Your morning cosmic briefing
          </p>
          <div className='space-y-2'>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Moon phase with meaning & correspondences
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                3 recommended spells aligned to today
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Crystal recommendation for current energy
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Sky Now: real-time planetary positions
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Daily tarot card seeded from your chart
              </p>
            </div>
          </div>
          <Button variant='outline' asChild className='mt-4'>
            <Link href='/auth?signup=true'>See your dashboard →</Link>
          </Button>
        </div>
        <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <Image
            src={moonPhaseIconMap[ctaExamples.marketing.moonPhase.phase]}
            alt='Dashboard preview'
            width={20}
            height={20}
            className='mb-4'
          />
          <p className='text-sm text-zinc-400 mb-2'>
            Moon phase, spells, crystal, planetary positions
          </p>
          <p className='text-xs text-zinc-500'>
            Screenshot showing actual dashboard interface
          </p>
        </div>
      </div>

      {/* Card 2: Personal Horoscope */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='order-2 md:order-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <p className='text-sm text-zinc-400 mb-2'>
            Transit list with interpretations
          </p>
          <div className='space-y-2 mt-4'>
            <div className='text-xs text-zinc-500 bg-zinc-800/50 p-2 rounded'>
              Mars → 3rd House: Mental activity heightened
            </div>
            <div className='text-xs text-zinc-500 bg-zinc-800/50 p-2 rounded'>
              Moon in Gemini: Communication flows
            </div>
          </div>
        </div>
        <div className='order-1 md:order-2 space-y-3'>
          <Sparkles
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Personal Horoscope
          </h3>
          <p className='text-sm md:text-base text-zinc-400 mb-3'>
            Not your sun sign horoscope
          </p>
          <div className='space-y-2'>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Today's transits affecting YOUR birth chart
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Which houses are activated
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>Weekly energy overview</p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>30-day transit calendar</p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Universal vs personal day numbers
              </p>
            </div>
          </div>
          <Button variant='outline' asChild className='mt-4'>
            <Link href='/auth?signup=true'>See today's transits →</Link>
          </Button>
        </div>
      </div>

      {/* Card 3: Tarot Readings */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='space-y-3'>
          <Layers
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Tarot Readings
          </h3>
          <p className='text-sm md:text-base text-zinc-400 mb-3'>
            Beyond single-card pulls
          </p>
          <div className='space-y-2'>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Daily card seeded from your Sun/Moon/Ascendant
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Weekly card for deeper themes
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                10+ guided spread templates
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Pattern tracking across time
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Chart-connected interpretations
              </p>
            </div>
          </div>
          <Button variant='outline' asChild className='mt-4'>
            <Link href='/auth?signup=true'>Draw your card →</Link>
          </Button>
        </div>
        <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <p className='text-sm text-zinc-400 mb-2'>
            Daily card + spread library
          </p>
          <div className='mt-4'>
            <p className='text-sm text-lunary-primary-300'>
              {ctaExamples.marketing.tarotCard.name}
            </p>
            <p className='text-xs text-zinc-500 mt-1'>
              {ctaExamples.marketing.tarotCard.keywords}
            </p>
          </div>
        </div>
      </div>

      {/* Card 4: Astral Guide & Tools */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='order-2 md:order-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <div className='space-y-3'>
            <div className='flex justify-end'>
              <div className='max-w-[80%]'>
                <div className='rounded-2xl bg-lunary-primary-900 border border-lunary-primary-700 px-3.5 py-2.5 text-white text-xs'>
                  What does my birth chart say?
                </div>
              </div>
            </div>
            <div className='flex justify-start'>
              <div className='max-w-[85%]'>
                <div className='rounded-2xl bg-zinc-800/80 border border-zinc-700/40 px-3.5 py-2.5 text-zinc-100 text-xs'>
                  Let me analyze your chart...
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='order-1 md:order-2 space-y-3'>
          <MessageCircle
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Astral Guide & Tools
          </h3>
          <p className='text-sm md:text-base text-zinc-400 mb-3'>
            Your cosmic companion
          </p>
          <div className='space-y-2'>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                AI chat grounded in your chart
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Living book of shadows (journal)
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>Birth chart calculator</p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>
                Wheel of the year tracking
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <CheckCircle className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
              <p className='text-sm text-zinc-300'>Ritual & spell library</p>
            </div>
          </div>
          <Button variant='outline' asChild className='mt-4'>
            <Link href='/auth?signup=true'>Start exploring →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
