import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, Moon, Stars, BookOpen } from 'lucide-react';
import {
  createFAQPageSchema,
  createArticleSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { Button } from '@/components/ui/button';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title:
    "Beginner's Guide to Astrology, Tarot & Modern Witchcraft | Lunary Grimoire",
  description:
    'Your complete introduction to astrology, tarot, and modern witchcraft. Learn the fundamentals of birth charts, tarot reading, moon magic, and safe spiritual practice.',
  keywords: [
    'astrology for beginners',
    'learn astrology',
    'tarot for beginners',
    'witchcraft for beginners',
    'how to read birth chart',
    'learn tarot',
    'modern witchcraft guide',
    'spiritual practice beginners',
  ],
  openGraph: {
    title: "Beginner's Guide to Astrology, Tarot & Modern Witchcraft | Lunary",
    description:
      'Your complete introduction to astrology, tarot, and modern witchcraft fundamentals.',
    url: 'https://lunary.app/grimoire/beginners',
  },
  alternates: { canonical: 'https://lunary.app/grimoire/beginners' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqs = [
  {
    question: 'Is astrology real?',
    answer:
      'Astrology is a symbolic system used for self-reflection and understanding patterns in life. While not a predictive science, millions find it a valuable tool for self-awareness and navigating life transitions.',
  },
  {
    question: 'What sign am I?',
    answer:
      'Your "sign" typically refers to your Sun sign—determined by your birth date. However, you have a Moon sign, Rising sign, and placements in all 12 signs. Your full picture requires a birth chart.',
  },
  {
    question: 'Do I need to be religious to practice witchcraft?',
    answer:
      'No. Modern witchcraft is a practice, not a religion. Many practitioners are secular, while others incorporate spiritual beliefs. Your path is personal and can be adapted to your worldview.',
  },
  {
    question: 'Is tarot fortune-telling?',
    answer:
      'Tarot is better understood as a reflective tool than fortune-telling. The cards mirror your current situation and offer perspectives—they do not predict a fixed future. You always have free will.',
  },
  {
    question: 'How do I know if a practice is safe?',
    answer:
      'Safe practice prioritizes consent, self-care, and honest reflection. Avoid anything that promises guaranteed outcomes, encourages manipulation of others, or feels coercive. Trust your intuition.',
  },
];

const zodiacSigns = [
  { emoji: '♈', name: 'Aries', dates: 'Mar 21 - Apr 19', trait: 'Bold' },
  { emoji: '♉', name: 'Taurus', dates: 'Apr 20 - May 20', trait: 'Grounded' },
  { emoji: '♊', name: 'Gemini', dates: 'May 21 - Jun 20', trait: 'Curious' },
  { emoji: '♋', name: 'Cancer', dates: 'Jun 21 - Jul 22', trait: 'Nurturing' },
  { emoji: '♌', name: 'Leo', dates: 'Jul 23 - Aug 22', trait: 'Creative' },
  { emoji: '♍', name: 'Virgo', dates: 'Aug 23 - Sep 22', trait: 'Analytical' },
  { emoji: '♎', name: 'Libra', dates: 'Sep 23 - Oct 22', trait: 'Harmonious' },
  {
    emoji: '♏',
    name: 'Scorpio',
    dates: 'Oct 23 - Nov 21',
    trait: 'Transformative',
  },
  {
    emoji: '♐',
    name: 'Sagittarius',
    dates: 'Nov 22 - Dec 21',
    trait: 'Adventurous',
  },
  {
    emoji: '♑',
    name: 'Capricorn',
    dates: 'Dec 22 - Jan 19',
    trait: 'Ambitious',
  },
  {
    emoji: '♒',
    name: 'Aquarius',
    dates: 'Jan 20 - Feb 18',
    trait: 'Innovative',
  },
  { emoji: '♓', name: 'Pisces', dates: 'Feb 19 - Mar 20', trait: 'Empathic' },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Start Your Journey',
    links: [
      { label: 'Birth Chart Calculator', href: '/birth-chart' },
      { label: 'Daily Tarot', href: '/tarot' },
      { label: 'Moon Phase Today', href: '/moon' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
  {
    title: 'Complete Guides',
    links: [
      {
        label: 'Birth Chart Guide',
        href: '/grimoire/guides/birth-chart-complete-guide',
      },
      { label: 'Tarot Guide', href: '/grimoire/guides/tarot-complete-guide' },
      {
        label: 'Moon Phases Guide',
        href: '/grimoire/guides/moon-phases-guide',
      },
      {
        label: 'Crystal Guide',
        href: '/grimoire/guides/crystal-healing-guide',
      },
    ],
  },
  {
    title: 'Explore the Grimoire',
    links: [
      { label: 'All Zodiac Signs', href: '/grimoire/zodiac' },
      { label: 'Tarot Cards', href: '/grimoire/tarot' },
      { label: 'Spells & Rituals', href: '/grimoire/spells' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    ],
  },
  {
    title: 'Practical Magic',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Protection & Warding', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
    ],
  },
];

export default function BeginnersGuidePage() {
  const faqSchema = createFAQPageSchema(faqs);
  const articleSchema = createArticleSchema({
    headline: "Beginner's Guide to Astrology, Tarot & Modern Witchcraft",
    description:
      'Your complete introduction to astrology, tarot, and modern witchcraft fundamentals.',
    url: 'https://lunary.app/grimoire/beginners',
    keywords: [
      'astrology beginners',
      'tarot beginners',
      'witchcraft beginners',
    ],
    section: 'Beginner Guides',
  });
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Grimoire', url: '/grimoire' },
    { name: "Beginner's Guide", url: '/grimoire/beginners' },
  ]);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(faqSchema)}
      {renderJsonLd(articleSchema)}
      {renderJsonLd(breadcrumbSchema)}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Beginners Guide' },
          ]}
        />

        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-light mb-4'>
            Beginner&apos;s Guide to Astrology, Tarot & Modern Witchcraft
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            Welcome to the Lunary Grimoire. This guide introduces the core
            pillars of astrological and magical practice—giving you the
            foundation to explore with confidence and curiosity.
          </p>
        </header>

        <nav className='mb-12 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h2 className='text-lg font-medium mb-4'>Table of Contents</h2>
          <ol className='space-y-2 text-zinc-400'>
            <li>
              <a
                href='#what-is-grimoire'
                className='hover:text-lunary-primary-300'
              >
                1. What This Grimoire Is (and Is Not)
              </a>
            </li>
            <li>
              <a href='#how-to-use' className='hover:text-lunary-primary-300'>
                2. How to Use Lunary if You&apos;re Brand New
              </a>
            </li>
            <li>
              <a
                href='#astrology-basics'
                className='hover:text-lunary-primary-300'
              >
                3. Astrology Basics
              </a>
            </li>
            <li>
              <a href='#moon-cycles' className='hover:text-lunary-primary-300'>
                4. Moon Cycles & Lunar Living
              </a>
            </li>
            <li>
              <a href='#tarot' className='hover:text-lunary-primary-300'>
                5. Tarot as a Mirror
              </a>
            </li>
            <li>
              <a href='#witchcraft' className='hover:text-lunary-primary-300'>
                6. Modern Witchcraft & Spellcraft
              </a>
            </li>
            <li>
              <a
                href='#safe-practice'
                className='hover:text-lunary-primary-300'
              >
                7. Safe, Ethical Practice
              </a>
            </li>
            <li>
              <a href='#first-steps' className='hover:text-lunary-primary-300'>
                8. Suggested First Steps
              </a>
            </li>
            <li>
              <a href='#faq' className='hover:text-lunary-primary-300'>
                9. FAQ for Beginners
              </a>
            </li>
          </ol>
        </nav>

        {/* Section 1: What This Grimoire Is */}
        <section id='what-is-grimoire' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6 flex items-center gap-3'>
            <BookOpen className='w-8 h-8 text-lunary-primary-400' />
            1. What This Grimoire Is (and Is Not)
          </h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            A grimoire is traditionally a personal book of magical knowledge,
            spells, and spiritual insights. The Lunary Grimoire is a modern,
            digital version—a curated library of astrological wisdom, tarot
            meanings, crystal properties, spellcraft, and contemplative
            practices.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div className='p-6 rounded-xl border border-lunary-success/30 bg-lunary-success/5'>
              <h3 className='text-lg font-medium text-lunary-success mb-3'>
                What This Grimoire Is
              </h3>
              <ul className='space-y-2 text-zinc-300 text-sm'>
                <li>• A reference library for self-reflection and learning</li>
                <li>• Grounded in astronomical accuracy and symbolic wisdom</li>
                <li>• Tools for self-awareness, not fortune-telling</li>
                <li>• Inclusive of many paths and traditions</li>
                <li>
                  • Always free to explore (with premium features available)
                </li>
              </ul>
            </div>
            <div className='p-6 rounded-xl border border-lunary-error/30 bg-lunary-error/5'>
              <h3 className='text-lg font-medium text-lunary-error mb-3'>
                What This Grimoire Is Not
              </h3>
              <ul className='space-y-2 text-zinc-300 text-sm'>
                <li>• Not a replacement for therapy or medical advice</li>
                <li>• Not a prediction service for locked-in futures</li>
                <li>• Not a single tradition claiming to be the only way</li>
                <li>• Not a place for manipulation magic or harmful intent</li>
                <li>• Not dogmatic—you are encouraged to think critically</li>
              </ul>
            </div>
          </div>

          <p className='text-zinc-400 text-sm'>
            Think of this grimoire as a companion for your journey, not a
            rulebook. Take what resonates, leave what doesn&apos;t, and always
            trust your own experience.
          </p>
        </section>

        {/* Section 2: How to Use Lunary */}
        <section id='how-to-use' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6 flex items-center gap-3'>
            <Sparkles className='w-8 h-8 text-lunary-primary-400' />
            2. How to Use Lunary if You&apos;re Brand New
          </h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            Lunary is designed to meet you wherever you are. Here&apos;s a
            simple path for absolute beginners:
          </p>

          <div className='space-y-4'>
            <Link
              href='/birth-chart'
              className='block p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Step 1: Calculate Your Birth Chart
              </h3>
              <p className='text-zinc-400 text-sm'>
                Enter your birth date, time, and location to generate your
                unique cosmic blueprint. This is the foundation of personalized
                astrology.
              </p>
            </Link>

            <Link
              href='/grimoire/zodiac'
              className='block p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Step 2: Learn Your Sun, Moon & Rising
              </h3>
              <p className='text-zinc-400 text-sm'>
                Your &quot;Big Three&quot; are the most important placements.
                Start by reading about these three signs to understand your core
                self.
              </p>
            </Link>

            <Link
              href='/tarot'
              className='block p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Step 3: Draw a Daily Tarot Card
              </h3>
              <p className='text-zinc-400 text-sm'>
                Tarot is a wonderful reflection tool. Start with single-card
                draws to build familiarity with the deck.
              </p>
            </Link>

            <Link
              href='/book-of-shadows'
              className='block p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                Step 4: Start Your Book of Shadows
              </h3>
              <p className='text-zinc-400 text-sm'>
                Your personal journal for reflections, dreams, insights, and
                intentions. This is where your practice becomes truly yours.
              </p>
            </Link>
          </div>
        </section>

        {/* Section 3: Astrology Basics */}
        <section id='astrology-basics' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6 flex items-center gap-3'>
            <Stars className='w-8 h-8 text-lunary-primary-400' />
            3. Astrology Basics
          </h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            Astrology is the study of celestial patterns as mirrors for human
            experience. At its core are four building blocks: signs, planets,
            houses, and aspects.
          </p>

          <h3 className='text-xl font-medium text-zinc-100 mb-4'>
            The 12 Zodiac Signs
          </h3>
          <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6'>
            {zodiacSigns.map((sign) => (
              <Link
                key={sign.name}
                href={`/grimoire/zodiac/${sign.name.toLowerCase()}`}
                className='p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors text-center'
              >
                <div className='text-lg mb-1'>{sign.emoji}</div>
                <div className='text-sm font-medium text-zinc-200'>
                  {sign.name}
                </div>
                <div className='text-xs text-zinc-500'>{sign.trait}</div>
              </Link>
            ))}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <h4 className='font-medium text-zinc-100 mb-2'>Planets</h4>
              <p className='text-zinc-400 text-sm mb-2'>
                Each planet represents a type of energy: Sun (identity), Moon
                (emotions), Mercury (communication), Venus (love), Mars
                (action), etc.
              </p>
              <Link
                href='/grimoire/astronomy/planets'
                className='text-lunary-primary-400 text-sm hover:underline'
              >
                Explore planets →
              </Link>
            </div>
            <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <h4 className='font-medium text-zinc-100 mb-2'>Houses</h4>
              <p className='text-zinc-400 text-sm mb-2'>
                The 12 houses represent life areas: self, money, communication,
                home, creativity, health, relationships, transformation, travel,
                career, community, spirituality.
              </p>
              <Link
                href='/grimoire/houses/overview'
                className='text-lunary-primary-400 text-sm hover:underline'
              >
                Explore houses →
              </Link>
            </div>
          </div>

          <Link
            href='/grimoire/guides/birth-chart-complete-guide'
            className='inline-flex items-center gap-2 text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Read the complete Birth Chart guide
            <ArrowRight className='w-4 h-4' />
          </Link>
        </section>

        {/* Section 4: Moon Cycles */}
        <section id='moon-cycles' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6 flex items-center gap-3'>
            <Moon className='w-8 h-8 text-lunary-primary-400' />
            4. Moon Cycles & Lunar Living
          </h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            The Moon cycles through eight phases roughly every 29.5 days. Many
            practitioners align their intentions, rituals, and self-care with
            these natural rhythms.
          </p>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
            <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center'>
              <div className='text-2xl mb-2'>🌑</div>
              <div className='font-medium text-zinc-100'>New Moon</div>
              <div className='text-xs text-zinc-400'>Set intentions</div>
            </div>
            <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center'>
              <div className='text-2xl mb-2'>🌓</div>
              <div className='font-medium text-zinc-100'>Waxing</div>
              <div className='text-xs text-zinc-400'>Build & grow</div>
            </div>
            <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center'>
              <div className='text-2xl mb-2'>🌕</div>
              <div className='font-medium text-zinc-100'>Full Moon</div>
              <div className='text-xs text-zinc-400'>Illuminate & release</div>
            </div>
            <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center'>
              <div className='text-2xl mb-2'>🌗</div>
              <div className='font-medium text-zinc-100'>Waning</div>
              <div className='text-xs text-zinc-400'>Let go & rest</div>
            </div>
          </div>

          <Link
            href='/grimoire/guides/moon-phases-guide'
            className='inline-flex items-center gap-2 text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Read the complete Moon Phases guide
            <ArrowRight className='w-4 h-4' />
          </Link>
        </section>

        {/* Section 5: Tarot */}
        <section id='tarot' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6'>5. Tarot as a Mirror</h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            Tarot is a 78-card system that reflects your inner landscape. Rather
            than predicting a fixed future, tarot illuminates your current
            situation, offering perspectives and questions for reflection.
          </p>

          <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 mb-6'>
            <h3 className='font-medium text-zinc-100 mb-3'>
              The Deck Structure
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium text-lunary-primary-300 mb-2'>
                  Major Arcana (22 cards)
                </h4>
                <p className='text-zinc-400 text-sm'>
                  Major life themes and soul lessons. The Fool&apos;s journey
                  from innocence through experience to wisdom.
                </p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-lunary-primary-300 mb-2'>
                  Minor Arcana (56 cards)
                </h4>
                <p className='text-zinc-400 text-sm'>
                  Daily life situations across four suits: Wands (passion), Cups
                  (emotions), Swords (mind), Pentacles (material world).
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/tarot'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
            >
              Browse all 78 cards →
            </Link>
            <Link
              href='/grimoire/guides/tarot-complete-guide'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
            >
              Read the complete Tarot guide →
            </Link>
          </div>
        </section>

        {/* Section 6: Witchcraft */}
        <section id='witchcraft' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6'>
            6. Modern Witchcraft & Spellcraft
          </h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            Modern witchcraft is a practice centered on intention, energy, and
            symbolic action. It draws from folk traditions, psychology, and
            nature-based spirituality. There is no single &quot;right way&quot;
            to practice—many paths exist.
          </p>

          <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 mb-6'>
            <h3 className='font-medium text-zinc-100 mb-3'>Core Practices</h3>
            <ul className='grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-300 text-sm'>
              <li>
                <strong>Intention setting:</strong> Clarifying what you want to
                call in or release
              </li>
              <li>
                <strong>Ritual:</strong> Symbolic actions that focus energy and
                mark transitions
              </li>
              <li>
                <strong>Correspondences:</strong> Using colors, herbs, crystals
                aligned with your goal
              </li>
              <li>
                <strong>Journaling:</strong> Recording dreams, insights, and
                patterns
              </li>
              <li>
                <strong>Moon work:</strong> Aligning practice with lunar phases
              </li>
              <li>
                <strong>Divination:</strong> Tarot, pendulum, or other
                reflective tools
              </li>
            </ul>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/modern-witchcraft'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
            >
              Explore Modern Witchcraft →
            </Link>
            <Link
              href='/grimoire/spells/fundamentals'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
            >
              Spellcraft Fundamentals →
            </Link>
          </div>
        </section>

        {/* Section 7: Safe Practice */}
        <section id='safe-practice' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6'>
            7. Safe, Ethical Practice
          </h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            Ethics matter in spiritual practice. Lunary emphasizes safety,
            consent, and self-responsibility in all its content.
          </p>

          <div className='p-6 rounded-xl border border-lunary-primary-700 bg-lunary-primary-900/10 mb-6'>
            <h3 className='font-medium text-lunary-primary-300 mb-3'>
              Principles of Safe Practice
            </h3>
            <ul className='space-y-2 text-zinc-300 text-sm'>
              <li>
                <strong>No manipulation magic:</strong> Never attempt to control
                another person&apos;s will, emotions, or choices.
              </li>
              <li>
                <strong>No guaranteed outcomes:</strong> Magic and divination
                support reflection and intention—they do not override reality or
                free will.
              </li>
              <li>
                <strong>Self-care first:</strong> Spiritual practice should
                support your wellbeing, not replace professional care for mental
                or physical health.
              </li>
              <li>
                <strong>Respect boundaries:</strong> Your practice is personal.
                Do not impose beliefs on others or share their readings without
                consent.
              </li>
              <li>
                <strong>Stay grounded:</strong> Balance spiritual exploration
                with practical life. Escapism is not growth.
              </li>
            </ul>
          </div>

          <Link
            href='/grimoire/modern-witchcraft/ethics'
            className='inline-flex items-center gap-2 text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Read more about witchcraft ethics
            <ArrowRight className='w-4 h-4' />
          </Link>
        </section>

        {/* Section 8: First Steps */}
        <section id='first-steps' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6'>8. Suggested First Steps</h2>

          <p className='text-zinc-300 leading-relaxed mb-6'>
            Feeling overwhelmed? Start here. These five links will give you a
            solid foundation:
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 mb-1'>
                1. Birth Chart Guide
              </h3>
              <p className='text-zinc-400 text-sm'>
                Understand your cosmic blueprint
              </p>
            </Link>
            <Link
              href='/grimoire/guides/moon-phases-guide'
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 mb-1'>
                2. Moon Phases Guide
              </h3>
              <p className='text-zinc-400 text-sm'>Align with lunar rhythms</p>
            </Link>
            <Link
              href='/grimoire/tarot'
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 mb-1'>
                3. Tarot Card Meanings
              </h3>
              <p className='text-zinc-400 text-sm'>Learn the 78 cards</p>
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/ethics'
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 mb-1'>
                4. Witchcraft Ethics
              </h3>
              <p className='text-zinc-400 text-sm'>Practice with integrity</p>
            </Link>
            <Link
              href='/book-of-shadows'
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors md:col-span-2'
            >
              <h3 className='font-medium text-zinc-100 mb-1'>
                5. Start Your Book of Shadows
              </h3>
              <p className='text-zinc-400 text-sm'>
                Your personal journal for reflections, dreams, and magical notes
              </p>
            </Link>
          </div>
        </section>

        {/* Section 9: FAQ */}
        <section id='faq' className='mb-16 scroll-mt-24'>
          <h2 className='text-3xl font-light mb-6'>9. FAQ for Beginners</h2>

          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'
              >
                <h3 className='text-lg font-medium mb-2 text-zinc-100'>
                  {faq.question}
                </h3>
                <p className='text-zinc-400'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className='p-8 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20 text-center mb-12'>
          <h2 className='text-2xl font-light text-zinc-100 mb-4'>
            Ready to Begin Your Journey?
          </h2>
          <p className='text-zinc-300 mb-6 max-w-xl mx-auto'>
            The best way to learn is by doing. Calculate your birth chart, draw
            a tarot card, and start exploring the grimoire at your own pace.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild variant='lunary-solid' size='lg'>
              <Link href='/birth-chart'>Calculate Your Birth Chart</Link>
            </Button>
            <Button asChild variant='outline' size='lg'>
              <Link href='/grimoire'>Explore the Grimoire</Link>
            </Button>
          </div>
        </section>

        <CosmicConnections
          entityType='hub-glossary'
          entityKey='beginners-guide'
          title='Where to Go Next'
          sections={cosmicConnectionsSections}
        />
      </div>
    </div>
  );
}
