'use client';

import Link from 'next/link';
import { Sunrise, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThreeSectionsVariant() {
  return (
    <div className='max-w-4xl mx-auto space-y-12 md:space-y-16'>
      <div className='text-center space-y-4'>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
          Your Cosmic Practice
        </h2>
        <p className='text-sm md:text-base text-zinc-400 max-w-2xl mx-auto'>
          Everything you need for daily guidance, deep exploration, and
          continuous learning
        </p>
      </div>

      {/* Daily Practice */}
      <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 md:p-8 space-y-4'>
        <div className='flex items-center gap-3'>
          <Sunrise className='w-6 h-6 text-lunary-primary-400' />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Daily Practice
          </h3>
        </div>
        <div className='flex flex-wrap gap-2 text-sm text-zinc-300'>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Dashboard
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Horoscope
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Tarot
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Crystals
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Spells
          </span>
        </div>
        <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
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
      </div>

      {/* Deep Exploration */}
      <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 md:p-8 space-y-4'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-lunary-primary-400' />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Deep Exploration
          </h3>
        </div>
        <div className='flex flex-wrap gap-2 text-sm text-zinc-300'>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Tarot Spreads
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            AI Chat
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Pattern Tracking
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Journal
          </span>
        </div>
        <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
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
      </div>

      {/* Always Learning */}
      <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 md:p-8 space-y-4'>
        <div className='flex items-center gap-3'>
          <BookOpen className='w-6 h-6 text-lunary-primary-400' />
          <h3 className='text-xl md:text-2xl font-light text-zinc-100'>
            Always Learning
          </h3>
        </div>
        <div className='flex flex-wrap gap-2 text-sm text-zinc-300'>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Grimoire
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Wheel of Year
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Transit Calendar
          </span>
          <span className='px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/30'>
            Birth Chart
          </span>
        </div>
        <p className='text-sm md:text-base text-zinc-400 leading-relaxed'>
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
      </div>

      {/* Overall CTA */}
      <div className='text-center pt-8'>
        <Button variant='lunary' size='lg' asChild>
          <Link href='/auth?signup=true'>Start your practice free</Link>
        </Button>
      </div>
    </div>
  );
}
