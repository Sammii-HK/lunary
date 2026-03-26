export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Spellcasting Fundamentals: How Magic Works - Lunary',
  description:
    'Learn the foundational principles of spellcraft: intention setting, ethics, timing with moon phases and planetary days, common tools, and when not to cast. Essential guide for beginners.',
  keywords: [
    'spellcraft fundamentals',
    'how to cast spells',
    'magic basics',
    'witchcraft basics',
    'spell timing',
    'magical ethics',
    'intention setting magic',
  ],
  openGraph: {
    title: 'Spellcasting Fundamentals: How Magic Works - Lunary',
    description:
      'Learn the foundational principles of spellcraft: intention, ethics, timing, and tools.',
    type: 'article',
    url: 'https://lunary.app/grimoire/spells/fundamentals',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/spells/fundamentals',
  },
};

const faqs = [
  {
    question: 'Do spells really work?',
    answer:
      'Spells work by focusing intention and energy toward a goal. They work best when combined with practical action, clear intention, and genuine need. Results depend on many factors including your focus, the spell construction, and alignment with natural energies. Magic supports change—it does not replace effort.',
  },
  {
    question: 'What do I need to cast my first spell?',
    answer:
      'At minimum, you need clear intention and focused attention. Many beginners start with simple candle spells or written intentions. You do not need expensive tools or elaborate setups—your focused will is the most important element.',
  },
  {
    question: 'Is it safe to cast spells as a beginner?',
    answer:
      'Yes, if you follow ethical guidelines. Stick to spells focused on yourself (self-love, protection, clarity). Avoid any spells that attempt to control others or promise guaranteed outcomes. Read through any spell completely before starting.',
  },
  {
    question: 'What if my spell does not work?',
    answer:
      'Many factors can influence results: unclear intention, resistance to change, poor timing, or simply needing more time. Reflect on your intention, consider practical actions you can take, and try again with adjustments. Magic is a skill that develops with practice.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Related Practices',
    links: [
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Meditation', href: '/grimoire/meditation' },
    ],
  },
  {
    title: 'Spell Types',
    links: [
      { label: 'All Spells', href: '/grimoire/spells' },
      { label: 'Protection & Warding', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Jar Spells', href: '/grimoire/jar-spells' },
    ],
  },
  {
    title: 'Ethics & Safety',
    links: [
      {
        label: 'Witchcraft Ethics',
        href: '/grimoire/modern-witchcraft/ethics',
      },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Beginners Guide', href: '/grimoire/beginners' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    ],
  },
];

export default function SpellcraftFundamentalsPage() {
  const articleSchema = createArticleSchema({
    headline: 'Spellcasting Fundamentals: How Magic Works',
    description:
      'Learn the foundational principles of spellcraft: intention, ethics, timing, and tools.',
    url: 'https://lunary.app/grimoire/spells/fundamentals',
    keywords: ['spellcraft', 'magic basics', 'witchcraft', 'spell casting'],
    section: 'Spells & Rituals',
  });

  const faqSchema = createFAQPageSchema(faqs);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Spells', url: '/grimoire/spells' },
    { name: 'Fundamentals', url: '/grimoire/spells/fundamentals' },
  ]);

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(breadcrumbSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Spells', href: '/grimoire/spells' },
          { label: 'Fundamentals' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Spellcasting Fundamentals
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            How Magic Works
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Before casting your first spell, understand the foundational
          principles that make magic effective, ethical, and aligned with your
          intentions. This guide covers everything you need to know to begin
          your spellcraft practice safely.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is-spell' className='hover:text-lunary-primary-400'>
              1. What Is a Spell, Practically?
            </a>
          </li>
          <li>
            <a href='#intention' className='hover:text-lunary-primary-400'>
              2. Intention, Focus, and Correspondence
            </a>
          </li>
          <li>
            <a href='#ethics' className='hover:text-lunary-primary-400'>
              3. Ethics of Spellwork
            </a>
          </li>
          <li>
            <a href='#building-spell' className='hover:text-lunary-primary-400'>
              4. Building a Simple Spell
            </a>
          </li>
          <li>
            <a href='#timing' className='hover:text-lunary-primary-400'>
              5. Timing: Moon, Days, Planets
            </a>
          </li>
          <li>
            <a href='#tools' className='hover:text-lunary-primary-400'>
              6. Common Tools
            </a>
          </li>
          <li>
            <a href='#recording' className='hover:text-lunary-primary-400'>
              7. Recording Results
            </a>
          </li>
          <li>
            <a
              href='#when-not-to-cast'
              className='hover:text-lunary-primary-400'
            >
              8. When Not to Cast
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              9. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1: What Is a Spell */}
      <section id='what-is-spell' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is a Spell, Practically?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A spell is a focused ritual that combines intention, symbolism, and
          directed energy to create change. At its simplest, a spell is a
          structured way of telling the universe (or your subconscious, or the
          cosmic forces you work with) what you want to manifest, release, or
          transform.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Spells work through a combination of psychological focus and symbolic
          action. When you light a candle, speak words of power, or arrange
          crystals with intention, you are engaging multiple senses and layers
          of consciousness in service of your goal.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Core Elements of Any Spell
          </h3>
          <ul className='space-y-3 text-zinc-300'>
            <li>
              <strong className='text-lunary-primary-300'>Intention:</strong>{' '}
              What you want to manifest, release, or change
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Focus:</strong> Your
              concentrated attention and emotional engagement
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Correspondences:
              </strong>{' '}
              Symbolic tools aligned with your goal (colors, herbs, timing)
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Action:</strong> The
              physical or verbal acts that anchor your intention
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Release:</strong>{' '}
              Letting go of attachment to outcome, trusting the process
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: Intention, Focus, Correspondence */}
      <section id='intention' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Intention, Focus, and Correspondence
        </h2>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Setting Clear Intention
        </h3>
        <p className='text-zinc-300 leading-relaxed mb-4'>
          Your intention is the foundation of all magic. A vague intention
          produces vague results. Be specific about what you want, frame it
          positively (what you want, not what you are avoiding), and express it
          as if it is already happening.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='p-5 rounded-xl border border-lunary-error/30 bg-lunary-error/5'>
            <h4 className='font-medium text-lunary-error mb-2'>
              Weak Intentions
            </h4>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• &quot;I don&apos;t want to be broke&quot;</li>
              <li>• &quot;I hope things get better&quot;</li>
              <li>• &quot;Maybe I&apos;ll find love someday&quot;</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-lunary-success/30 bg-lunary-success/5'>
            <h4 className='font-medium text-lunary-success mb-2'>
              Clear Intentions
            </h4>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• &quot;I am financially secure and abundant&quot;</li>
              <li>• &quot;My situation improves with each day&quot;</li>
              <li>• &quot;I attract loving, healthy relationships&quot;</li>
            </ul>
          </div>
        </div>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Using Correspondences
        </h3>
        <p className='text-zinc-300 leading-relaxed mb-4'>
          Correspondences are the symbolic associations that connect physical
          objects, colors, times, and other elements to specific intentions.
          They are not strictly necessary—your focused intention is the most
          powerful element—but they help focus your mind and add layers of
          symbolic meaning.
        </p>
        <p className='text-zinc-400 text-sm'>
          Example: For a love spell, you might use pink or red candles (love
          colors), rose quartz (heart crystal), Friday (Venus day), and rose
          petals (love herb). Each element reinforces the intention.
        </p>
      </section>

      {/* Section 3: Ethics */}
      <section id='ethics' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Ethics of Spellwork
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Ethics are not optional in responsible magical practice. How you use
          your will and energy matters—both for your own wellbeing and for the
          people around you.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-4'>
            Ethical Guidelines for Spellwork
          </h3>
          <ul className='space-y-3 text-zinc-300'>
            <li>
              <strong>
                Never attempt to control another person&apos;s will.
              </strong>{' '}
              Love spells that target a specific person, curses, and
              manipulation magic violate consent and often backfire.
            </li>
            <li>
              <strong>
                Do not use magic as a substitute for professional help.
              </strong>{' '}
              A healing spell does not replace medical treatment. A prosperity
              spell does not replace financial planning.
            </li>
            <li>
              <strong>Be honest about your motivations.</strong> If your spell
              comes from spite, jealousy, or a desire to harm, reconsider. Work
              on your own healing first.
            </li>
            <li>
              <strong>Take responsibility for outcomes.</strong> Magic is
              co-creation with the universe. You are responsible for what you
              set in motion.
            </li>
            <li>
              <strong>Respect other traditions.</strong> If you borrow from a
              closed practice or culture, educate yourself about appropriate
              engagement.
            </li>
          </ul>
        </div>

        <Link
          href='/grimoire/modern-witchcraft/ethics'
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          Read more about witchcraft ethics →
        </Link>
      </section>

      {/* Section 4: Building a Simple Spell */}
      <section id='building-spell' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Building a Simple Spell (Step by Step)
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Here is a simple framework you can use for any spell. Adapt it to your
          own practice and preferences.
        </p>

        <ol className='space-y-4'>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              Step 1: Clarify Your Intention
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Write down exactly what you want. Be specific. Read it aloud. Does
              it feel true? Adjust until it resonates.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              Step 2: Gather Your Materials
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Based on your intention, choose correspondences: a candle color, a
              crystal, herbs, or simply paper and pen. Keep it simple.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              Step 3: Create Sacred Space
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Cleanse your space (smoke, sound, visualization). Ground yourself
              with deep breaths. Set the mood with lighting or music if helpful.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              Step 4: Perform the Working
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Light your candle, speak your intention aloud, visualize the
              outcome, perform any symbolic actions. Stay focused throughout.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              Step 5: Release and Close
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Thank any forces you called upon. Extinguish candles safely. Let
              go of attachment to outcome. Trust that your working is done.
            </p>
          </li>
        </ol>
      </section>

      {/* Section 5: Timing */}
      <section id='timing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Timing: Moon, Days, Planets
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Timing can amplify your spellwork by aligning it with natural cycles.
          This is not required—urgent needs can override ideal timing—but it
          adds power when you can plan ahead.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Moon Phases
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                <strong className='text-zinc-200'>New Moon:</strong> New
                beginnings, setting intentions
              </li>
              <li>
                <strong className='text-zinc-200'>Waxing Moon:</strong> Growth,
                attraction, building
              </li>
              <li>
                <strong className='text-zinc-200'>Full Moon:</strong>{' '}
                Manifestation, charging, release
              </li>
              <li>
                <strong className='text-zinc-200'>Waning Moon:</strong>{' '}
                Banishing, letting go, endings
              </li>
            </ul>
            <Link
              href='/grimoire/guides/moon-phases-guide'
              className='text-lunary-primary-400 text-sm hover:underline mt-3 inline-block'
            >
              Full moon phases guide →
            </Link>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Days of the Week
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                <strong className='text-zinc-200'>Sunday (Sun):</strong>{' '}
                Success, vitality
              </li>
              <li>
                <strong className='text-zinc-200'>Monday (Moon):</strong>{' '}
                Intuition, emotions
              </li>
              <li>
                <strong className='text-zinc-200'>Tuesday (Mars):</strong>{' '}
                Courage, protection
              </li>
              <li>
                <strong className='text-zinc-200'>Wednesday (Mercury):</strong>{' '}
                Communication
              </li>
              <li>
                <strong className='text-zinc-200'>Thursday (Jupiter):</strong>{' '}
                Abundance, luck
              </li>
              <li>
                <strong className='text-zinc-200'>Friday (Venus):</strong> Love,
                beauty
              </li>
              <li>
                <strong className='text-zinc-200'>Saturday (Saturn):</strong>{' '}
                Banishing, discipline
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6: Tools */}
      <section id='tools' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Common Tools
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          You do not need expensive or elaborate tools. Many powerful spells
          require nothing but your intention and voice. However, tools can help
          focus your mind and add symbolic weight to your workings.
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          <Link
            href='/grimoire/candle-magic'
            className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <span className='text-zinc-100 font-medium'>Candles</span>
            <p className='text-xs text-zinc-500 mt-1'>Fire element, focus</p>
          </Link>
          <Link
            href='/grimoire/crystals'
            className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <span className='text-zinc-100 font-medium'>Crystals</span>
            <p className='text-xs text-zinc-500 mt-1'>Amplify, store energy</p>
          </Link>
          <Link
            href='/grimoire/correspondences/herbs'
            className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <span className='text-zinc-100 font-medium'>Herbs</span>
            <p className='text-xs text-zinc-500 mt-1'>Specific properties</p>
          </Link>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='text-zinc-100 font-medium'>Paper & Pen</span>
            <p className='text-xs text-zinc-500 mt-1'>Write intentions</p>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='text-zinc-100 font-medium'>Salt</span>
            <p className='text-xs text-zinc-500 mt-1'>
              Purification, protection
            </p>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='text-zinc-100 font-medium'>Water</span>
            <p className='text-xs text-zinc-500 mt-1'>Cleansing, moon water</p>
          </div>
        </div>
      </section>

      {/* Section 7: Recording Results */}
      <section id='recording' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Recording Results in Your Book of Shadows
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Keeping a magical journal—traditionally called a Book of Shadows—helps
          you track what works, notice patterns, and refine your practice over
          time. After each spell, record the details while they are fresh.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            What to Record
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Date, time, and moon phase</li>
            <li>• Your exact intention (word for word)</li>
            <li>• Tools and correspondences used</li>
            <li>• How you felt during the spell</li>
            <li>• Any unusual observations (candle behavior, dreams, etc.)</li>
            <li>• Results as they manifest over coming days/weeks</li>
          </ul>
        </div>

        <div className='mt-6'>
          <Button asChild variant='outline'>
            <Link href='/book-of-shadows'>Open Your Book of Shadows</Link>
          </Button>
        </div>
      </section>

      {/* Section 8: When Not to Cast */}
      <section id='when-not-to-cast' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. When Not to Cast
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Knowing when to pause is as important as knowing how to cast. Magic
          done from the wrong state of mind or for the wrong reasons often
          backfires or produces unintended consequences.
        </p>

        <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-error-300 mb-3'>
            Pause Before Casting If...
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>
              • You are extremely emotional (angry, desperate, panicked)—ground
              first
            </li>
            <li>
              • Your intention involves controlling another person&apos;s will
            </li>
            <li>• You are using magic to avoid necessary practical action</li>
            <li>
              • You feel obligated rather than genuinely called to do the
              working
            </li>
            <li>• You have not thought through potential consequences</li>
            <li>
              • You are under the influence of alcohol or substances that impair
              judgment
            </li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          When in doubt, wait. Sleep on it. If the urge to cast remains after
          reflection, proceed with clarity.
        </p>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          9. Frequently Asked Questions
        </h2>

        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                {faq.question}
              </h3>
              <p className='text-zinc-300 leading-relaxed'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Ready to Explore Spells?
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Browse our curated collection of spells for protection, love,
          prosperity, healing, and more. Each includes detailed instructions and
          correspondences.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/grimoire/spells'>Browse Spell Library</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/grimoire/candle-magic'>Learn Candle Magic</Link>
          </Button>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='spells-fundamentals'
        title='Continue Your Practice'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
