export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  createHowToSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Moon Rituals: Complete Guide to Lunar Magic - Lunary',
  description:
    'Complete guide to moon rituals for each lunar phase. Learn New Moon intention setting, Waxing Moon building, Full Moon release, and Waning Moon banishing rituals.',
  keywords: [
    'moon rituals',
    'lunar rituals',
    'new moon ritual',
    'full moon ritual',
    'moon magic',
    'moon phase rituals',
  ],
  openGraph: {
    title: 'Moon Rituals: Complete Guide to Lunar Magic - Lunary',
    description:
      'Complete guide to moon rituals for each lunar phase: New Moon, Full Moon, and more.',
    type: 'article',
    url: 'https://lunary.app/grimoire/moon/rituals',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon/rituals',
  },
};

const faqs = [
  {
    question: 'Do I need to perform rituals outside under the moon?',
    answer:
      'No. Moon energy permeates everywhere—you can perform moon rituals indoors. If possible, work near a window or in a space that feels connected to lunar energy. Some practitioners prefer to at least step outside briefly during the ritual to acknowledge the moon.',
  },
  {
    question: 'What if it is cloudy and I cannot see the moon?',
    answer:
      "The moon's energy is present regardless of cloud cover. The astronomical phase is what matters, not whether you can see it. Perform your ritual as planned and trust that the lunar energy is available.",
  },
  {
    question: 'How long should a moon ritual last?',
    answer:
      'Moon rituals can be as short as 5 minutes or as long as an hour. A simple intention-setting can take just a few minutes; a more elaborate ritual with multiple components might take longer. Do what fits your schedule and energy level.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Moon Resources',
    links: [
      {
        label: 'Moon Phases Guide',
        href: '/grimoire/guides/moon-phases-guide',
      },
      { label: 'Current Moon Phase', href: '/moon' },
      { label: 'Full Moon Names', href: '/grimoire/moon/full-moon-names' },
      { label: 'Moon Signs', href: '/grimoire/moon-in' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export default function MoonRitualsPage() {
  const articleSchema = createArticleSchema({
    headline: 'Moon Rituals: Complete Guide to Lunar Magic',
    description: 'Complete guide to moon rituals for each lunar phase.',
    url: 'https://lunary.app/grimoire/moon/rituals',
    keywords: ['moon rituals', 'lunar magic', 'moon phase rituals'],
    section: 'Moon Magic',
  });

  const faqSchema = createFAQPageSchema(faqs);

  const newMoonRitualSchema = createHowToSchema({
    name: 'New Moon Intention Ritual',
    description: 'A simple ritual to set intentions during the New Moon phase.',
    url: 'https://lunary.app/grimoire/moon/rituals#new-moon',
    totalTime: 'PT20M',
    tools: ['candle', 'paper', 'pen'],
    steps: [
      {
        name: 'Create sacred space',
        text: 'Clear and cleanse your ritual area.',
      },
      { name: 'Light a candle', text: 'Light a white or silver candle.' },
      { name: 'Ground yourself', text: 'Take deep breaths and center.' },
      {
        name: 'Write intentions',
        text: 'Write 3-10 intentions for the cycle.',
      },
      { name: 'Speak aloud', text: 'Read your intentions with conviction.' },
      { name: 'Seal and close', text: 'Keep paper on altar or bury it.' },
    ],
  });

  const fullMoonRitualSchema = createHowToSchema({
    name: 'Full Moon Release Ritual',
    description:
      'A ritual to release what no longer serves you during the Full Moon.',
    url: 'https://lunary.app/grimoire/moon/rituals#full-moon',
    totalTime: 'PT25M',
    tools: ['candle', 'paper', 'pen', 'fire-safe container'],
    steps: [
      {
        name: 'Create sacred space',
        text: 'Clear and cleanse your ritual area.',
      },
      {
        name: 'Connect with the moon',
        text: 'Acknowledge the Full Moon energy.',
      },
      {
        name: 'Reflect on what to release',
        text: 'Consider what no longer serves you.',
      },
      { name: 'Write it down', text: 'Write what you are releasing.' },
      { name: 'Burn safely', text: 'Burn the paper in a fire-safe container.' },
      {
        name: 'Express gratitude',
        text: 'Thank the moon and close the ritual.',
      },
    ],
  });

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(newMoonRitualSchema)}
      {renderJsonLd(fullMoonRitualSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon', href: '/grimoire/moon' },
          { label: 'Rituals' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Moon Rituals
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Complete Guide to Lunar Magic
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          The Moon has guided magical practice for millennia. Each phase offers
          distinct energy for different types of work: setting intentions,
          building momentum, manifesting desires, and releasing what no longer
          serves. This guide provides rituals for every phase of the lunar
          cycle.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a
              href='#what-is-moon-ritual'
              className='hover:text-lunary-primary-400'
            >
              1. What Is a Moon Ritual?
            </a>
          </li>
          <li>
            <a href='#preparing' className='hover:text-lunary-primary-400'>
              2. Preparing for Any Moon Ritual
            </a>
          </li>
          <li>
            <a href='#new-moon' className='hover:text-lunary-primary-400'>
              3. New Moon Rituals
            </a>
          </li>
          <li>
            <a href='#waxing' className='hover:text-lunary-primary-400'>
              4. Waxing Moon Rituals
            </a>
          </li>
          <li>
            <a href='#full-moon' className='hover:text-lunary-primary-400'>
              5. Full Moon Rituals
            </a>
          </li>
          <li>
            <a href='#waning' className='hover:text-lunary-primary-400'>
              6. Waning & Dark Moon Rituals
            </a>
          </li>
          <li>
            <a href='#combining' className='hover:text-lunary-primary-400'>
              7. Combining with Crystals, Herbs & Tarot
            </a>
          </li>
          <li>
            <a href='#logging' className='hover:text-lunary-primary-400'>
              8. How to Log in Book of Shadows
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              9. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section id='what-is-moon-ritual' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is a Moon Ritual?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A moon ritual is any intentional practice aligned with the lunar
          cycle. It can be as simple as lighting a candle and speaking an
          intention, or as elaborate as a multi-hour ceremony with tools,
          invocations, and symbolic actions.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The power of moon rituals comes from aligning your energy with natural
          cosmic rhythms. Rather than working against the current, you flow with
          the Moon&apos;s energy—using New Moon for planting seeds, Full Moon
          for harvest and release.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Why Moon Rituals Work
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • The lunar cycle creates a natural rhythm for intention-setting
              and release
            </li>
            <li>
              • Regular practice builds momentum and deepens your connection to
              nature
            </li>
            <li>• Rituals provide structure for reflection and goal-setting</li>
            <li>
              • Working with the Moon connects you to ancient, cross-cultural
              traditions
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section id='preparing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Preparing for Any Moon Ritual
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Regardless of the phase, certain preparation steps enhance any moon
          ritual:
        </p>

        <ol className='space-y-4'>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              1. Cleanse your space
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Use smoke (sage, palo santo), sound (bells, singing bowls), or
              visualization to clear stagnant energy.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              2. Ground and center yourself
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Take deep breaths. Visualize roots growing from your feet into the
              earth. Feel stable and present.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              3. Gather your materials
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Candles, paper, pen, crystals, herbs—whatever you plan to use.
              Having everything ready prevents breaking focus mid-ritual.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              4. Set your intention
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Know what you want from this ritual before you begin. Vague
              intentions produce vague results.
            </p>
          </li>
        </ol>
      </section>

      {/* Section 3: New Moon */}
      <section id='new-moon' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. New Moon Rituals
        </h2>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-3xl'>🌑</span>
            <div>
              <h3 className='text-xl font-medium text-zinc-100'>
                New Moon Energy
              </h3>
              <p className='text-zinc-400 text-sm'>
                Beginnings • Intention • Planting seeds
              </p>
            </div>
          </div>
          <p className='text-zinc-300 mb-4'>
            The New Moon is the start of the lunar cycle—a blank slate. This is
            the ideal time to set intentions for what you want to manifest,
            start new projects, and plant metaphorical seeds for the cycle
            ahead.
          </p>
        </div>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Simple New Moon Intention Ritual
        </h3>
        <ol className='space-y-3 mb-6'>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>1.</span>
            <span className='text-zinc-300'>
              Light a white or silver candle
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>2.</span>
            <span className='text-zinc-300'>
              Take three deep breaths to center
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>3.</span>
            <span className='text-zinc-300'>
              Write 3–10 intentions in present tense (&quot;I am...&quot;,
              &quot;I have...&quot;)
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>4.</span>
            <span className='text-zinc-300'>
              Read each intention aloud with conviction
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>5.</span>
            <span className='text-zinc-300'>
              Keep the paper on your altar until the Full Moon, then review
            </span>
          </li>
        </ol>
      </section>

      {/* Section 4: Waxing */}
      <section id='waxing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Waxing Moon Rituals
        </h2>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-3xl'>🌒</span>
            <div>
              <h3 className='text-xl font-medium text-zinc-100'>
                Waxing Moon Energy
              </h3>
              <p className='text-zinc-400 text-sm'>
                Growth • Attraction • Building momentum
              </p>
            </div>
          </div>
          <p className='text-zinc-300'>
            As the Moon grows from New to Full, its energy supports growth,
            attraction, and building. Use this phase to take action on your
            intentions, attract what you desire, and nurture what you&apos;ve
            started.
          </p>
        </div>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Waxing Moon Ritual Ideas
        </h3>
        <ul className='space-y-2 text-zinc-300'>
          <li>• Perform attraction spells for love, money, or opportunities</li>
          <li>• Take concrete action steps toward your New Moon intentions</li>
          <li>• Charge crystals and magical tools in the growing light</li>
          <li>• Create abundance grids or prosperity altars</li>
          <li>• Work on building habits you set at the New Moon</li>
        </ul>
      </section>

      {/* Section 5: Full Moon */}
      <section id='full-moon' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Full Moon Rituals
        </h2>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-3xl'>🌕</span>
            <div>
              <h3 className='text-xl font-medium text-zinc-100'>
                Full Moon Energy
              </h3>
              <p className='text-zinc-400 text-sm'>
                Illumination • Manifestation • Release
              </p>
            </div>
          </div>
          <p className='text-zinc-300'>
            The Full Moon is the peak of lunar energy. It brings things to
            light—literally and metaphorically. This is the time to celebrate
            what has manifested, charge your tools, and release what no longer
            serves you.
          </p>
        </div>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Full Moon Release Ritual
        </h3>
        <ol className='space-y-3 mb-6'>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>1.</span>
            <span className='text-zinc-300'>
              Create sacred space and ground yourself
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>2.</span>
            <span className='text-zinc-300'>
              Review your New Moon intentions—celebrate progress
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>3.</span>
            <span className='text-zinc-300'>
              On a separate paper, write what you want to release
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>4.</span>
            <span className='text-zinc-300'>
              Safely burn the release paper, visualizing the energy leaving
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='text-lunary-primary-400'>5.</span>
            <span className='text-zinc-300'>
              Place crystals in moonlight to charge overnight
            </span>
          </li>
        </ol>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-5'>
          <h4 className='font-medium text-lunary-primary-300 mb-2'>
            Moon Water
          </h4>
          <p className='text-zinc-400 text-sm'>
            Place a jar of clean water under the Full Moon to charge. Use for
            rituals, watering plants, adding to baths, or drinking (if using
            purified water). Label with the moon sign and date.
          </p>
        </div>
      </section>

      {/* Section 6: Waning */}
      <section id='waning' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Waning & Dark Moon Rituals
        </h2>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-3xl'>🌘</span>
            <div>
              <h3 className='text-xl font-medium text-zinc-100'>
                Waning Moon Energy
              </h3>
              <p className='text-zinc-400 text-sm'>
                Release • Banishing • Rest
              </p>
            </div>
          </div>
          <p className='text-zinc-300'>
            As the Moon shrinks from Full to New, its energy supports letting
            go, banishing negativity, and rest. The Dark Moon (the day or two
            before the New Moon) is especially powerful for deep introspection
            and shadow work.
          </p>
        </div>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Waning Moon Ritual Ideas
        </h3>
        <ul className='space-y-2 text-zinc-300'>
          <li>• Banish negative habits, energies, or situations</li>
          <li>• Deep clean and declutter your home</li>
          <li>• Perform cord-cutting rituals for unhealthy attachments</li>
          <li>• Shadow work journaling and reflection</li>
          <li>• Rest and recharge before the new cycle begins</li>
        </ul>
      </section>

      {/* Section 7: Combining */}
      <section id='combining' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Combining with Crystals, Herbs & Tarot
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Layer your moon rituals with additional tools for enhanced power:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link
            href='/grimoire/crystals'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Crystals</h3>
            <p className='text-zinc-400 text-sm'>
              Moonstone and selenite for lunar energy; clear quartz for
              amplification; black tourmaline for protection during release.
            </p>
          </Link>
          <Link
            href='/grimoire/correspondences/herbs'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Herbs</h3>
            <p className='text-zinc-400 text-sm'>
              Mugwort for dreams and divination; jasmine for Full Moon magic;
              lavender for peace; rosemary for clarity.
            </p>
          </Link>
          <Link
            href='/grimoire/tarot'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Tarot</h3>
            <p className='text-zinc-400 text-sm'>
              Draw cards at the New Moon for cycle guidance; reflect on the Moon
              card (XVIII) during rituals; use tarot for ritual divination.
            </p>
          </Link>
        </div>
      </section>

      {/* Section 8: Logging */}
      <section id='logging' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. How to Log in Book of Shadows
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Recording your moon rituals helps you track patterns, notice what
          works, and build a personal archive of magical practice.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            What to Record
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Date, exact moon phase, and moon sign</li>
            <li>• Your intentions or what you released</li>
            <li>• Tools used (candles, crystals, herbs)</li>
            <li>• How you felt during and after the ritual</li>
            <li>• Any notable observations (candle behavior, dreams, etc.)</li>
            <li>• Results as they manifest in coming weeks</li>
          </ul>
        </div>

        <div className='mt-6'>
          <Button asChild variant='outline'>
            <Link href='/book-of-shadows'>Open Your Book of Shadows</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-blue-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Track the Moon with Lunary
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          See today&apos;s moon phase, upcoming Full Moons, and personalized
          lunar insights based on your birth chart.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/app'>Today&apos;s Moon Phase</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/grimoire/guides/moon-phases-guide'>
              Moon Phases Guide
            </Link>
          </Button>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-moon'
        entityKey='moon-rituals'
        title='Moon Ritual Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
