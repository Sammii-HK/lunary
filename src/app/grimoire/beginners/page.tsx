export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, BookOpen } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { Button } from '@/components/ui/button';

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
      'Astrology is a symbolic system used for self-reflection and recognizing life patterns. It does not dictate fixed outcomes but offers a language for meaning-making.',
  },
  {
    question: 'What sign am I?',
    answer:
      'Sun signs are the most common “sign,” but your full chart includes Moon, Rising, and planetary placements. Calculate your birth chart to see the whole story.',
  },
  {
    question: 'Do I need religion to practice witchcraft?',
    answer:
      'Modern witchcraft is a practice, not a religion. Many practitioners blend it with their spiritual beliefs or keep it secular. The key is consent, ethics, and personal resonance.',
  },
  {
    question: 'Is tarot fortune-telling?',
    answer:
      'Tarot reflects your current situation and offers perspectives. It invites reflection and choice rather than predicting an unchangeable future.',
  },
  {
    question: 'How do I know if a practice is safe?',
    answer:
      'Safe practice respects consent, sets boundaries, and avoids manipulation. Listen to your intuition, work slowly, and keep learning before escalating the intensity.',
  },
  {
    question: 'What should I learn first?',
    answer:
      'Start with the basics: your Sun, Moon, and Rising signs; one tarot spread; and one simple ritual. Build from there.',
  },
];

const zodiacSigns = [
  { emoji: '♈', name: 'Aries', dates: 'Mar 21 – Apr 19', trait: 'Bold' },
  { emoji: '♉', name: 'Taurus', dates: 'Apr 20 – May 20', trait: 'Grounded' },
  { emoji: '♊', name: 'Gemini', dates: 'May 21 – Jun 20', trait: 'Curious' },
  { emoji: '♋', name: 'Cancer', dates: 'Jun 21 – Jul 22', trait: 'Nurturing' },
  { emoji: '♌', name: 'Leo', dates: 'Jul 23 – Aug 22', trait: 'Creative' },
  { emoji: '♍', name: 'Virgo', dates: 'Aug 23 – Sep 22', trait: 'Analytical' },
  { emoji: '♎', name: 'Libra', dates: 'Sep 23 – Oct 22', trait: 'Harmonious' },
  {
    emoji: '♏',
    name: 'Scorpio',
    dates: 'Oct 23 – Nov 21',
    trait: 'Transformative',
  },
  {
    emoji: '♐',
    name: 'Sagittarius',
    dates: 'Nov 22 – Dec 21',
    trait: 'Adventurous',
  },
  {
    emoji: '♑',
    name: 'Capricorn',
    dates: 'Dec 22 – Jan 19',
    trait: 'Ambitious',
  },
  {
    emoji: '♒',
    name: 'Aquarius',
    dates: 'Jan 20 – Feb 18',
    trait: 'Innovative',
  },
  { emoji: '♓', name: 'Pisces', dates: 'Feb 19 – Mar 20', trait: 'Empathic' },
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

const tableOfContents = [
  { label: 'Why Begin Here?', href: '#why-begin' },
  { label: 'Astrology Foundations', href: '#astrology' },
  { label: 'Tarot & Divination', href: '#tarot' },
  { label: 'Modern Witchcraft Practices', href: '#witchcraft' },
  { label: 'Tools & Resources', href: '#tools' },
  { label: 'FAQ', href: '#faq' },
];

export default function BeginnersGuidePage() {
  return (
    <SEOContentTemplate
      title="Beginner's Guide to Astrology, Tarot & Modern Witchcraft"
      h1="Beginner's Guide to the Grimoire"
      description='Explore astrology, tarot, and modern witchcraft with step-by-step foundations and recommended next steps.'
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/beginners'
      }
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: "Beginner's Guide", href: '/grimoire/beginners' },
      ]}
      intro='This guide introduces astrology, tarot, and witchcraft essentials. Move slowly, journal what you discover, and let curiosity lead you.'
      tldr='Start with the Sun, Moon, and Rising signs, learn a few tarot spreads, and build a simple ritual routine. Consistency matters more than intensity.'
      meaning='Astrology maps the sky to your inner landscape, tarot illustrates unfolding stories, and modern witchcraft offers practical rituals for daily life. Together they form a holistic beginner path.

If you feel overwhelmed, choose one track per week—astrology, tarot, or ritual. Small, steady learning creates more confidence than trying everything at once.

The goal is not perfection. It is a relationship with your practice that feels supportive, honest, and grounded in your real life.'
      tableOfContents={tableOfContents}
      howToWorkWith={[
        'Track the zodiac and planetary rhythms to build timing awareness',
        'Learn a handful of tarot spreads and journal what each card sparks',
        'Set ethical boundaries and consent before offering any readings',
        'Create a simple ritual routine and adapt it as your practice deepens',
      ]}
      rituals={[
        'Light a candle and write one intention for the week.',
        'Pull a single tarot card each morning and note the theme.',
        'Cleanse your space with breath, sound, or a simple smoke ritual.',
        'End the week with a short gratitude list.',
      ]}
      journalPrompts={[
        'What practice feels most natural to me right now?',
        'Which symbol or card keeps showing up, and why?',
        'What boundary helps me feel safe in spiritual work?',
        'How do I want my practice to support my daily life?',
      ]}
      tables={[
        {
          title: 'Beginner Path at a Glance',
          headers: ['Focus', 'Start With', 'Next Step'],
          rows: [
            ['Astrology', 'Sun, Moon, Rising', 'Read a full birth chart'],
            ['Tarot', 'Major Arcana', 'Three‑card spreads'],
            ['Ritual', 'Simple candle work', 'Weekly routine'],
          ],
        },
      ]}
      faqs={faqs}
      relatedItems={[
        {
          name: 'Tarot Cards',
          href: '/grimoire/tarot',
          type: 'Full deck guide',
        },
        { name: 'Moon Guide', href: '/grimoire/moon', type: 'Lunar timing' },
        {
          name: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
          type: 'Core rituals',
        },
      ]}
      internalLinks={[
        { text: 'Birth Chart', href: '/grimoire/birth-chart' },
        { text: 'Tarot Spreads', href: '/grimoire/tarot/spreads' },
        { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-beginners'
          entityKey='beginners'
          title='Beginner Cosmic Connections'
          sections={cosmicConnectionsSections}
        />
      }
      ctaText='Start your beginner ritual kit'
      ctaHref='/book-of-shadows'
    >
      <section id='why-begin' className='space-y-4 mb-12'>
        <h2 className='text-3xl font-light text-zinc-100'>Why Begin Here?</h2>
        <p className='text-zinc-300 leading-relaxed'>
          The Grimoire collects trustworthy entries so you can learn
          step-by-step. Start with curiosity, ask honest questions, and move at
          a pace that feels comfortable.
        </p>
        <p className='text-zinc-300 leading-relaxed'>
          You do not need expensive tools to begin. A notebook, a candle, and a
          few minutes of attention are enough to build a meaningful practice.
        </p>
        <div className='grid gap-4 sm:grid-cols-2'>
          {[
            {
              label: 'Self-Discovery',
              body: 'Astrology reveals your energetic blueprint.',
            },
            {
              label: 'Reflection',
              body: 'Tarot mirrors your mindset and choices.',
            },
            {
              label: 'Practice',
              body: 'Witchcraft turns intention into ritual.',
            },
            {
              label: 'Community',
              body: 'Journal, share, and iterate with others.',
            },
          ].map((item) => (
            <article
              key={item.label}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-xl font-semibold text-zinc-100'>
                {item.label}
              </h3>
              <p className='text-zinc-400 text-sm'>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id='astrology' className='space-y-6 mb-12'>
        <h2 className='text-3xl font-light text-zinc-100'>
          Astrology Foundations
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Start with the Sun, Moon, and Rising signs. Your Sun shows core
          identity, Moon reflects emotion, and Rising colors how you present
          yourself. Explore the birth chart for full context.
        </p>
        <div className='grid gap-3 md:grid-cols-2'>
          {zodiacSigns.map((sign) => (
            <article
              key={sign.name}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
            >
              <div className='text-2xl'>{sign.emoji}</div>
              <h3 className='text-lg font-semibold text-zinc-100'>
                {sign.name}
              </h3>
              <p className='text-xs uppercase tracking-wide text-zinc-400'>
                {sign.dates}
              </p>
              <p className='text-sm text-zinc-300'>Trait: {sign.trait}</p>
            </article>
          ))}
        </div>
        <div className='pt-4 border-t border-zinc-800'>
          <Link
            href='/grimoire/birth-chart'
            className='inline-flex items-center gap-2 text-sm text-lunary-primary-300'
          >
            <BookOpen size={16} /> Dive deeper into birth chart study
          </Link>
        </div>
      </section>

      <section id='tarot' className='space-y-4 mb-12'>
        <h2 className='text-3xl font-light text-zinc-100'>
          Tarot & Divination
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Tarot is a language of imagery. Begin with the Major Arcana for big
          lessons, then learn three-card spreads for daily check-ins. Practice
          journaling after each draw.
        </p>
        <Link
          href='/grimoire/tarot/spreads'
          className='inline-flex items-center gap-2 text-lunary-primary-300 hover:text-lunary-primary-400'
        >
          <Sparkles size={16} /> Explore beginner-friendly spreads
        </Link>
      </section>

      <section id='witchcraft' className='space-y-4 mb-12'>
        <h2 className='text-3xl font-light text-zinc-100'>
          Modern Witchcraft Practices
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          Modern witchcraft combines ritual, self-care, and ethics. Keep a
          simple altar, cleanse your space, and practice gratitude. Focus on
          safety, consent, and mindful intention.
        </p>
        <div className='grid gap-4 md:grid-cols-2'>
          {[
            'Spellcraft Fundamentals',
            'Protection',
            'Manifestation',
            'Shadow Work',
          ].map((topic) => (
            <div
              key={topic}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'
            >
              <h3 className='text-lg font-semibold text-zinc-100'>{topic}</h3>
              <p className='text-zinc-400 text-sm'>
                Use the Grimoire entry to guide your next ritual.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id='tools' className='space-y-4 mb-12'>
        <h2 className='text-3xl font-light text-zinc-100'>Tools & Resources</h2>
        <p className='text-zinc-300 leading-relaxed'>
          Start with what you already have. Consistent practice matters more
          than collecting tools. Add new items only when they support a ritual
          you already use.
        </p>
        <div className='grid gap-4 md:grid-cols-2'>
          <Button variant='outline' className='w-full justify-center' asChild>
            <Link href='/book-of-shadows'>Start a Book of Shadows</Link>
          </Button>
          <Button variant='outline' className='w-full justify-center' asChild>
            <Link href='/grimoire/spells/fundamentals'>
              Try a beginner spell
            </Link>
          </Button>
        </div>
      </section>

      <section id='faq' className='space-y-4'>
        <h2 className='text-3xl font-light text-zinc-100'>FAQ</h2>
        <div className='space-y-4'>
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                {faq.question}
              </h3>
              <p className='text-zinc-400 text-sm'>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
