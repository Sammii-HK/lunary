'use client';

import Link from 'next/link';
import {
  Sparkles,
  Moon,
  Eye,
  Shield,
  Star,
  Flame,
  Brain,
  Heart,
  BookOpen,
  Wand2,
} from 'lucide-react';

interface PracticeCategory {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  difficulty: string;
  timeRequired: string;
}

const Practices = () => {
  const practiceCategories: PracticeCategory[] = [
    {
      name: 'Spells & Rituals',
      description:
        'Focused magical work combining intention, correspondences, and energy to create specific change. Includes protection, love, prosperity, healing, and manifestation spells.',
      href: '/grimoire/spells',
      icon: <Sparkles className='w-6 h-6' />,
      difficulty: 'Beginner to Advanced',
      timeRequired: '15-60 minutes',
    },
    {
      name: 'Spellcraft Fundamentals',
      description:
        'Essential foundations for effective spellwork: intention-setting, altar setup, timing, and energy work. Master these before casting spells.',
      href: '/grimoire/spells/fundamentals',
      icon: <BookOpen className='w-6 h-6' />,
      difficulty: 'Beginner',
      timeRequired: '20-30 minutes',
    },
    {
      name: 'Meditation & Grounding',
      description:
        'Develop focus, awareness, and energetic stability. Essential foundation for all magical work. Includes techniques for centering and connecting with earth energy.',
      href: '/grimoire/meditation',
      icon: <Brain className='w-6 h-6' />,
      difficulty: 'Beginner',
      timeRequired: '5-30 minutes',
    },
    {
      name: 'Breathwork',
      description:
        'Regulate energy, calm the mind, and enhance focus through controlled breathing techniques. Prepares you for deeper magical work.',
      href: '/grimoire/meditation/breathwork',
      icon: <Heart className='w-6 h-6' />,
      difficulty: 'Beginner',
      timeRequired: '5-20 minutes',
    },
    {
      name: 'Divination',
      description:
        'Gain insight and perspective through tarot, runes, pendulum, scrying, and other divinatory methods. Tools for reflection and guidance.',
      href: '/grimoire/divination',
      icon: <Eye className='w-6 h-6' />,
      difficulty: 'Beginner to Intermediate',
      timeRequired: '10-30 minutes',
    },
    {
      name: 'Shadow Work',
      description:
        'Explore and integrate unconscious aspects of yourself for deep healing and transformation. Advanced inner work practice.',
      href: '/grimoire/shadow-work',
      icon: <Moon className='w-6 h-6' />,
      difficulty: 'Intermediate to Advanced',
      timeRequired: '20-60 minutes',
    },
    {
      name: 'Protection Magic',
      description:
        'Create energetic boundaries and safety through shielding, warding, and protective rituals. Essential for safe magical practice.',
      href: '/grimoire/protection',
      icon: <Shield className='w-6 h-6' />,
      difficulty: 'Beginner to Intermediate',
      timeRequired: '10-30 minutes',
    },
    {
      name: 'Manifestation',
      description:
        'Bring desires into reality through focused intention, visualization, and energy work. Techniques for creating the life you want.',
      href: '/grimoire/manifestation',
      icon: <Star className='w-6 h-6' />,
      difficulty: 'Beginner to Advanced',
      timeRequired: '15-45 minutes',
    },
    {
      name: 'Candle Magic',
      description:
        'Use candles as focal points for intention and energy. Learn color correspondences, anointing, and candle rituals for all purposes.',
      href: '/grimoire/candle-magic',
      icon: <Flame className='w-6 h-6' />,
      difficulty: 'Beginner',
      timeRequired: '15-30 minutes',
    },
    {
      name: 'Moon Rituals',
      description:
        'Align your practice with lunar cycles for enhanced power. New moon intentions, full moon releases, and moon phase correspondences.',
      href: '/grimoire/moon/rituals',
      icon: <Moon className='w-6 h-6' />,
      difficulty: 'Beginner to Intermediate',
      timeRequired: '20-45 minutes',
    },
    {
      name: 'Jar Spells',
      description:
        'Create long-lasting spells in contained vessels. Protection jars, manifestation jars, and ongoing intention work.',
      href: '/grimoire/jar-spells',
      icon: <Wand2 className='w-6 h-6' />,
      difficulty: 'Beginner to Intermediate',
      timeRequired: '20-40 minutes',
    },
  ];

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-4'>
          Explore Witchcraft Practices
        </h2>
        <p className='text-zinc-400 leading-relaxed mb-6'>
          Each practice type serves a unique purpose in your magical journey.
          Click on any practice to learn more and get started.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {practiceCategories.map((practice) => (
            <Link
              key={practice.href}
              href={practice.href}
              className='group rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
                    {practice.icon}
                  </div>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {practice.name}
                  </h3>
                </div>

                <p className='text-sm text-zinc-400 leading-relaxed'>
                  {practice.description}
                </p>

                <div className='flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800/50'>
                  <span className='px-2 py-1 rounded bg-zinc-800/50'>
                    {practice.difficulty}
                  </span>
                  <span>{practice.timeRequired}</span>
                </div>

                <div className='pt-2'>
                  <span className='text-sm text-lunary-primary-400 group-hover:text-lunary-primary-300 font-medium'>
                    Learn More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className='mt-12 pt-8 border-t border-zinc-800/50'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Getting Started
        </h2>
        <div className='bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-6'>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            New to witchcraft practices? Start with foundational skills:
          </p>
          <ul className='space-y-2 text-zinc-300'>
            <li className='flex items-start gap-2'>
              <span className='text-lunary-primary-400 mt-1'>•</span>
              <span>
                <strong>Meditation & Grounding:</strong> Develop focus and
                energetic awareness
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-lunary-primary-400 mt-1'>•</span>
              <span>
                <strong>Spellcraft Fundamentals:</strong> Learn
                intention-setting, timing, and energy work basics
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-lunary-primary-400 mt-1'>•</span>
              <span>
                <strong>Protection Magic:</strong> Create safety for deeper work
              </span>
            </li>
          </ul>
          <div className='mt-6'>
            <Link
              href='/grimoire/beginners'
              className='inline-block px-4 py-2 bg-lunary-primary hover:bg-lunary-primary-400 text-white rounded-lg font-medium transition-colors text-sm'
            >
              Read Beginner's Guide
            </Link>
          </div>
        </div>
      </section>

      <section className='mt-8'>
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Related Topics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <Link
            href='/grimoire/modern-witchcraft'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Modern Witchcraft
          </Link>
          <Link
            href='/grimoire/correspondences'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Magical Correspondences
          </Link>
          <Link
            href='/grimoire/modern-witchcraft/ethics'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Witchcraft Ethics
          </Link>
          <Link
            href='/grimoire/book-of-shadows'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Book of Shadows
          </Link>
          <Link
            href='/grimoire/modern-witchcraft/witch-types'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Types of Witches
          </Link>
          <Link
            href='/grimoire/modern-witchcraft/tools'
            className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all text-sm text-zinc-300 hover:text-lunary-primary-300'
          >
            Witchcraft Tools
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Practices;
