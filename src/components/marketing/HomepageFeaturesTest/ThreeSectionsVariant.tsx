'use client';

import Link from 'next/link';
import { Sunrise, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/marketing/Reveal';

export function ThreeSectionsVariant() {
  return (
    <div className='max-w-4xl mx-auto space-y-12 md:space-y-16'>
      <Reveal className='text-center space-y-4'>
        <h2 className='text-2xl md:text-3xl font-light text-content-primary'>
          Your Cosmic Practice
        </h2>
        <p className='text-sm md:text-base text-content-muted max-w-2xl mx-auto'>
          Everything you need for daily guidance, deep exploration, and
          continuous learning
        </p>
      </Reveal>

      {/* Daily Practice */}
      <Reveal className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/30 p-6 md:p-8 space-y-4 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'>
        <div className='flex items-center gap-3'>
          <Sunrise className='w-6 h-6 text-lunary-primary-400' />
          <h3 className='text-xl md:text-2xl font-light text-content-primary'>
            Daily Practice
          </h3>
        </div>
        <div className='flex flex-wrap gap-2 text-sm text-content-secondary'>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Dashboard
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Horoscope
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Tarot
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Crystals
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Spells
          </span>
        </div>
        <p className='text-sm md:text-base text-content-muted leading-relaxed'>
          Start each day knowing what your cosmic weather looks like. Moon
          phases, planetary positions, personalized guidance, and daily
          tarot—all aligned to your birth chart.
        </p>
        <Button variant='ghost' asChild className='group'>
          <Link
            href='/features#daily'
            className='inline-flex items-center gap-2'
          >
            Explore daily features
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </Link>
        </Button>
      </Reveal>

      {/* Deep Exploration */}
      <Reveal className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/30 p-6 md:p-8 space-y-4 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-lunary-primary-400' />
          <h3 className='text-xl md:text-2xl font-light text-content-primary'>
            Deep Exploration
          </h3>
        </div>
        <div className='flex flex-wrap gap-2 text-sm text-content-secondary'>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Tarot Spreads
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            AI Chat
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Pattern Tracking
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Journal
          </span>
        </div>
        <p className='text-sm md:text-base text-content-muted leading-relaxed'>
          When you need more than daily guidance, dive deeper. Ask questions
          with AI chat, pull custom spreads, track patterns over time, and
          journal your cosmic journey.
        </p>
        <Button variant='ghost' asChild className='group'>
          <Link
            href='/features#exploration'
            className='inline-flex items-center gap-2'
          >
            Explore deep features
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </Link>
        </Button>
      </Reveal>

      {/* Always Learning */}
      <Reveal className='rounded-2xl border border-stroke-subtle/60 bg-surface-elevated/30 p-6 md:p-8 space-y-4 transition-transform duration-300 motion-safe:hover:-translate-y-0.5'>
        <div className='flex items-center gap-3'>
          <BookOpen className='w-6 h-6 text-lunary-primary-400' />
          <h3 className='text-xl md:text-2xl font-light text-content-primary'>
            Always Learning
          </h3>
        </div>
        <div className='flex flex-wrap gap-2 text-sm text-content-secondary'>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Grimoire
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Wheel of Year
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Transit Calendar
          </span>
          <span className='px-3 py-1 rounded-full bg-surface-card/50 border border-stroke-default/30'>
            Birth Chart
          </span>
        </div>
        <p className='text-sm md:text-base text-content-muted leading-relaxed'>
          2,000+ free articles on astrology, tarot, and symbolism. Learn at your
          own pace with our comprehensive educational library and reference
          tools.
        </p>
        <Button variant='ghost' asChild className='group'>
          <Link
            href='/features#learning'
            className='inline-flex items-center gap-2'
          >
            Explore learning resources
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </Link>
        </Button>
      </Reveal>

      {/* Overall CTA */}
      <Reveal className='text-center pt-8'>
        <Button variant='lunary' size='lg' asChild>
          <Link href='/auth?signup=true'>Start your free trial</Link>
        </Button>
      </Reveal>
    </div>
  );
}
