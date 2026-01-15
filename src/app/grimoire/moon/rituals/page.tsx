import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createHowToSchema,
  renderJsonLd,
} from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { Button } from '@/components/ui/button';
import { MoonPhaseIcon } from '@/components/MoonPhaseIcon';
import { MonthlyMoonPhaseKey } from '../../../../../utils/moon/monthlyPhases';
export const revalidate = 86400;

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

  const tableOfContents = [
    { label: 'What Is a Moon Ritual?', href: '#what-is-moon-ritual' },
    { label: 'Preparing for Rituals', href: '#preparing' },
    { label: 'New Moon Rituals', href: '#new-moon' },
    { label: 'Waxing Moon Rituals', href: '#waxing' },
    { label: 'Full Moon Rituals', href: '#full-moon' },
    { label: 'Waning & Dark Moon Rituals', href: '#waning' },
    { label: 'Combining with Crystals, Herbs & Tarot', href: '#combining' },
    { label: 'Logging in Your Book of Shadows', href: '#logging' },
    { label: 'FAQ', href: '#faq' },
  ];

  const heroContent = (
    <p className='text-lg text-zinc-400 leading-relaxed'>
      The Moon has guided magical practice for millennia. Each phase offers
      distinct energy: New Moon for planting seeds, Waxing Moon for building,
      Full Moon for release, and Waning Moon for banishing. This guide provides
      rituals for every lunar moment.
    </p>
  );

  return (
    <>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(newMoonRitualSchema)}
      {renderJsonLd(fullMoonRitualSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Moon Rituals'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/moon/rituals'
        }
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        faqs={faqs}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon', href: '/grimoire/moon' },
          { label: 'Rituals' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-moon'
            entityKey='moon-rituals'
            title='Moon Connections'
            sections={cosmicConnectionsSections}
          />
        }
      >
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
            The power of moon rituals comes from aligning your energy with
            natural cosmic rhythms. Rather than working against the current, you
            flow with the Moon&apos;s energy—using New Moon for planting seeds,
            Full Moon for harvest and release.
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
                • Regular practice builds momentum and deepens your connection
                to nature
              </li>
              <li>
                • Rituals provide structure for reflection and goal-setting
              </li>
              <li>
                • Working with the Moon connects you to ancient, cross-cultural
                traditions
              </li>
            </ul>
          </div>
        </section>

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
                Take deep breaths. Visualize roots growing from your feet into
                the earth. Feel stable and present.
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

        <section id='new-moon' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            3. New Moon Rituals
          </h2>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-12 h-12 rounded-2xl bg-zinc-950/60 flex items-center justify-center'>
                <MoonPhaseIcon
                  phase={'newMoon' as MonthlyMoonPhaseKey}
                  size={40}
                />
              </div>
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
              The New Moon is the start of the lunar cycle—a blank slate. This
              is the ideal time to set intentions for what you want to manifest,
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
                Write 3–10 intentions in present tense ("I am...", "I have...")
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

        <section id='waxing' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            4. Waxing Moon Rituals
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            The Waxing Moon builds momentum. Use it for growth, knowledge, skill
            development, or anything you want to grow stronger.
          </p>
          <ul className='space-y-3'>
            <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
              <span className='text-zinc-400 text-sm'>
                Perform repeated actions weekly to signal growth.
              </span>
            </li>
            <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
              <span className='text-zinc-400 text-sm'>
                Combine with candles or crystals that support ambition (Citrine,
                Sunstone).
              </span>
            </li>
          </ul>
        </section>

        <section id='full-moon' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            5. Full Moon Rituals
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            Full Moon energy peaks—perfect for release, celebration, and
            gratitude.
          </p>
          <ol className='space-y-3 mb-6'>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>1.</span>
              <span className='text-zinc-300'>
                Reflect on what you want to release
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>2.</span>
              <span className='text-zinc-300'>Write it on paper</span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>3.</span>
              <span className='text-zinc-300'>
                Burn safely in a fire-proof dish
              </span>
            </li>
          </ol>
        </section>

        <section id='waning' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            6. Waning & Dark Moon Rituals
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            Use waning energy for banishing, clearing, and introspection.
          </p>
          <p className='text-zinc-300'>
            Meditate, journal, or release anything draining—this is the
            winding-down phase before the next cycle.
          </p>
        </section>

        <section id='combining' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            7. Combining with Crystals, Herbs & Tarot
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Crystals</h3>
              <p className='text-zinc-400 text-sm'>
                Moonstone, Selenite, and Labradorite amplify lunar work.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Herbs</h3>
              <p className='text-zinc-400 text-sm'>
                Mugwort, lavender, and rosemary support clarity and protection.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Tarot</h3>
              <p className='text-zinc-400 text-sm'>
                Pull cards for reflection, guidance, or journaling prompts.
              </p>
            </div>
          </div>
        </section>

        <section id='logging' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            8. How to Log in Your Book of Shadows
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            Track dates, intentions, tools used, sensations, and outcomes. Note
            planetary or astrological influences you observed.
          </p>
          <p className='text-zinc-400 text-sm'>
            Logging builds a record that reveals cycles, successes, and
            adjustments for future rituals.
          </p>
        </section>

        <section className='mb-12' id='faq'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>9. FAQ</h2>
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

        <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
          <h2 className='text-2xl font-light text-zinc-100 mb-4'>
            Ready to Perform Your Moon Ritual?
          </h2>
          <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
            Choose the phase that matches your intention, gather your ritual
            tools, and let the lunar energy guide you.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild variant='lunary-solid' size='lg'>
              <Link href='/moon'>Check Current Moon</Link>
            </Button>
            <Button asChild variant='outline' size='lg'>
              <Link href='/grimoire/moon/phases'>Moon Phase Calendar</Link>
            </Button>
          </div>
        </section>

        <CosmicConnections
          entityType='hub-moon'
          entityKey='moon'
          title='Moon Connections'
          sections={cosmicConnectionsSections}
        />
      </SEOContentTemplate>
    </>
  );
}
