'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Layers,
  Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CTA_COPY } from '@/lib/cta-copy';
import { moonPhaseIconMap } from '@/lib/constants/moon';
import ctaExamples from '@/lib/cta-examples.json';

export function ControlVariant() {
  return (
    <div className='max-w-5xl mx-auto space-y-12 md:space-y-20'>
      {/* Feature 1: Daily Cosmic Dashboard */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='space-y-3'>
          <LayoutDashboard
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Daily Cosmic Dashboard
          </h3>
          <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
            Your morning briefing: moon phase, recommended spells, crystal
            guidance, planetary positions, and daily tarot
          </p>
          <p className='text-xs text-zinc-500'>
            Your birth chart is created and saved to your account. Chart-based
            interpretation included with Lunary+.
          </p>
        </div>
        <div className='space-y-2'>
          <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-1'>
              <Image
                src={moonPhaseIconMap[ctaExamples.marketing.moonPhase.phase]}
                alt={ctaExamples.marketing.moonPhase.phase}
                width={20}
                height={20}
              />
              <span className='text-sm font-medium text-zinc-200'>
                {ctaExamples.marketing.moonPhase.phase}
              </span>
            </div>
            <p className='text-xs text-zinc-400'>
              in {ctaExamples.marketing.moonPhase.sign}
            </p>
            <p className='text-xs text-zinc-600 mt-1'>
              {ctaExamples.marketing.moonPhase.daysUntilNext} days until{' '}
              {ctaExamples.marketing.moonPhase.nextPhase}
            </p>
          </div>
          <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-1'>
              <Layers className='w-4 h-4 text-lunary-accent-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Daily Card
              </span>
              <span className='text-xs bg-lunary-primary-900/20 text-lunary-primary-300 px-1.5 py-0.5 rounded'>
                Personal
              </span>
            </div>
            <p className='text-sm text-lunary-primary-300'>
              {ctaExamples.marketing.tarotCard.name}
            </p>
            <p className='text-xs text-zinc-400'>
              {ctaExamples.marketing.tarotCard.keywords}
            </p>
          </div>
          <div className='py-3 px-4 border border-zinc-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-1'>
              <Gem className='w-4 h-4 text-lunary-accent-200' />
              <span className='text-sm font-medium text-zinc-200'>
                {ctaExamples.marketing.crystal.name}
              </span>
              <span className='text-xs bg-lunary-primary-900/20 text-lunary-primary-300 px-1.5 py-0.5 rounded'>
                For you
              </span>
            </div>
            <p className='text-xs text-zinc-400'>
              {ctaExamples.marketing.crystal.meaning}
            </p>
          </div>
        </div>
      </div>

      {/* Feature 2: Astral Guide Chat */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='order-2 md:order-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <div className='space-y-3'>
            <div className='flex justify-end'>
              <div className='max-w-[80%]'>
                <div className='rounded-2xl bg-lunary-primary-900 border border-lunary-primary-700 px-3.5 py-2.5 text-white text-sm leading-relaxed'>
                  Why am I feeling so restless today?
                </div>
              </div>
            </div>
            <div className='flex justify-start'>
              <div className='max-w-[85%]'>
                <div className='rounded-2xl bg-zinc-800/80 border border-zinc-700/40 px-3.5 py-2.5 text-zinc-100 text-sm leading-relaxed'>
                  With Mars currently transiting your 3rd house and the Moon in
                  Gemini, your mind is seeking stimulation. This is a good day
                  for movement and short conversations.
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
            Astral Guide Chat
          </h3>
          <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
            Ask questions and get context-aware answers grounded in your chart
            and the current sky
          </p>
          <p className='text-xs text-zinc-500'>
            Optional chat grounded in your chart. Your chart itself is always
            astronomy-based.
          </p>
        </div>
      </div>

      {/* Feature 3: Living Book of Shadows */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='space-y-3'>
          <BookOpen
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Living Book of Shadows
          </h3>
          <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
            Record your insights and moods in one place. Lunary highlights the
            threads between your entries, transits and tarot pulls over time
          </p>
        </div>
        <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <div className='space-y-2.5'>
            <div className='p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
              <p className='text-xs text-zinc-400 mb-0.5'>Nov 28</p>
              <p className='text-sm text-zinc-300'>
                Feeling introspective. The Star appeared again.
              </p>
            </div>
            <div className='p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/30'>
              <p className='text-xs text-zinc-400 mb-0.5'>Nov 25</p>
              <p className='text-sm text-zinc-300'>
                New Moon intention: trust the process.
              </p>
            </div>
            <div className='text-xs text-lunary-primary-400/80 pl-1'>
              Pattern: Hope themes recurring during Sagittarius season
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: Tarot and Transit Patterns */}
      <div className='grid md:grid-cols-2 gap-6 md:gap-10 items-center'>
        <div className='order-2 md:order-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-zinc-400'>Recurring themes</span>
              <span className='text-xs text-zinc-400'>Last 30 days</span>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 rounded-full bg-lunary-primary-400'></div>
                <span className='text-sm text-zinc-300'>Transformation</span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                  <div className='w-3/4 h-full bg-lunary-primary-500/60 rounded-full'></div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 rounded-full bg-lunary-primary-400'></div>
                <span className='text-sm text-zinc-300'>New beginnings</span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                  <div className='w-1/2 h-full bg-lunary-primary-500/60 rounded-full'></div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 rounded-full bg-lunary-primary-400'></div>
                <span className='text-sm text-zinc-300'>Inner wisdom</span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                  <div className='w-2/5 h-full bg-lunary-primary-500/60 rounded-full'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='order-1 md:order-2 space-y-3'>
          <Layers
            className='w-7 h-7 text-lunary-primary-400'
            strokeWidth={1.5}
          />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Tarot & Pattern Tracking
          </h3>
          <p className='text-sm md:text-base text-zinc-300 leading-relaxed'>
            Daily cards, weekly guidance, spread library, and pattern
            recognition across time
          </p>
        </div>
      </div>

      {/* Hint at More Features */}
      <div className='mt-12 md:mt-16 text-center space-y-6'>
        <p className='text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto'>
          Your complete cosmic toolkit includes birth chart calculator, transit
          calendar, ritual library, wheel of the year, and more
        </p>
        <Button variant='lunary' asChild>
          <Link href='/features'>{CTA_COPY.navigation.exploreFeatures}</Link>
        </Button>
      </div>
    </div>
  );
}
