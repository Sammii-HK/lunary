export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Modern Witchcraft: Paths, Practice & Community - Lunary',
  description:
    'Comprehensive guide to modern witchcraft at Lunary. Explore different witch paths, core practices, building a sustainable practice, and finding community.',
  keywords: [
    'modern witchcraft',
    'witchcraft guide',
    'types of witches',
    'witchcraft practice',
    'how to become a witch',
    'witchcraft for beginners',
  ],
  openGraph: {
    title: 'Modern Witchcraft: Paths, Practice & Community - Lunary',
    description:
      'Comprehensive guide to modern witchcraft: paths, practices, and community.',
    type: 'article',
    url: 'https://lunary.app/grimoire/modern-witchcraft',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft',
  },
};

const faqs = [
  {
    question: 'Do I need to join a coven to be a witch?',
    answer:
      'No. Many practitioners are solitary witches who practice alone. Covens offer community and mentorship, but they are optional. Choose what fits your life and needs.',
  },
  {
    question: 'Is witchcraft a religion?',
    answer:
      'Witchcraft can be a religion (like Wicca), a spiritual path, or a skill set. Some witches are religious, others are spiritual, and some are secular. Witchcraft is flexible enough to adapt to your beliefs.',
  },
  {
    question: 'What tools do I need to start?',
    answer:
      'You can begin with a journal (Book of Shadows), candles, and focused intention. Traditional tools like athame, wand, or bowl can come later. Many spells work with household objects.',
  },
  {
    question: 'How do I know which path fits me?',
    answer:
      'Notice which elements or activities call to you—plants, cuisine, ocean, astrology, or eclectic blends. Let curiosity guide you rather than forcing a single label.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Explore Witch Paths',
    links: [
      {
        label: 'Types of Witches',
        href: '/grimoire/modern-witchcraft/witch-types',
      },
      { label: 'Tools Guide', href: '/grimoire/modern-witchcraft/tools-guide' },
      {
        label: 'Witchcraft Ethics',
        href: '/grimoire/modern-witchcraft/ethics',
      },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
  {
    title: 'Practices',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
    ],
  },
  {
    title: 'Inner Work & Protection',
    links: [
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
      { label: 'Protection Magic', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Meditation & Grounding', href: '/grimoire/meditation' },
    ],
  },
];

const tableOfContents = [
  { label: 'What Modern Witchcraft Means', href: '#what-is-witchcraft' },
  { label: 'Common Witch Paths', href: '#paths' },
  { label: 'Core Practices', href: '#core-practices' },
  { label: 'Building a Sustainable Practice', href: '#sustainable' },
  { label: 'Community, Solitary Practice & Safety', href: '#community' },
  { label: 'Where to Go Next', href: '#where-next' },
  { label: 'FAQs', href: '#faq' },
];

const whatIs = {
  question: 'What does modern witchcraft look like at Lunary?',
  answer:
    'Modern witchcraft is a responsibility-driven practice that honors natural cycles, symbolic correspondences, and personal integrity. It includes spellcraft, divination, ritual, herbalism, and journaling tailored to your life.',
};

const intro =
  'Modern witchcraft at Lunary is not about rigid rules but about intention, respect for cycles, and consistent practice. It leans into ethical spellcraft, correspondences, and self-led exploration.';

const howToWorkWith = [
  'Choose rituals that match your lifestyle—kitchen witches work through domestic acts, cosmic witches through astrology, and hedge witches through liminal journeys.',
  'Balance magic with grounding habits: meditate, journal, and track what works in your Book of Shadows.',
  'Adopt a harm-reduction mindset—prioritize consent, free will, and simplicity over drama.',
];

const relatedItems = [
  {
    name: 'Types of Witches',
    href: '/grimoire/modern-witchcraft/witch-types',
    type: 'Paths & archetypes',
  },
  {
    name: 'Spellcraft Fundamentals',
    href: '/grimoire/spells/fundamentals',
    type: 'Core spellwork',
  },
  {
    name: 'Book of Shadows',
    href: '/book-of-shadows',
    type: 'Journal & reflection',
  },
  {
    name: 'Witchcraft Ethics',
    href: '/grimoire/modern-witchcraft/ethics',
    type: 'Principles',
  },
];

export default function ModernWitchcraftPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Modern Witchcraft'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/modern-witchcraft'
      }
      tableOfContents={tableOfContents}
      whatIs={whatIs}
      intro={intro}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      relatedItems={relatedItems}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='modern-witchcraft'
          title='Modern Witchcraft Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='what-is-witchcraft' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Modern Witchcraft Means at Lunary
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          At Lunary, modern witchcraft is a practice that honors natural cycles
          and empowers you to create positive change without rigid dogma. It
          blends spellcraft, divination, moon work, herbalism, and
          self-discovery in ways that suit your life.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Principles at Lunary
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>
                Personal responsibility:
              </strong>{' '}
              You are the authority over your practice.
            </li>
            <li>
              <strong className='text-zinc-200'>Harm reduction:</strong> Avoid
              manipulation or spells that control others.
            </li>
            <li>
              <strong className='text-zinc-200'>Inclusivity:</strong> Multiple
              paths are welcome; there is no one “right” tradition.
            </li>
            <li>
              <strong className='text-zinc-200'>Grounded practice:</strong>{' '}
              Magic supports action—it does not replace practical effort.
            </li>
            <li>
              <strong className='text-zinc-200'>Continuous learning:</strong>{' '}
              Stay curious, humble, and open to growth.
            </li>
          </ul>
        </div>
      </section>

      <section id='paths' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Common Witch Paths
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Paths describe where a witch channels their focus. Most practitioners
          blend several to create a personalized path.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          {[
            {
              label: 'Green Witch',
              emoji: '🌿',
              description: 'Works with plants, herbs, and earth energy.',
            },
            {
              label: 'Kitchen Witch',
              emoji: '🍳',
              description: 'Practices magic through cooking and homemaking.',
            },
            {
              label: 'Hedge Witch',
              emoji: '🌙',
              description:
                'Works between worlds, often exploring spirit connections.',
            },
            {
              label: 'Cosmic Witch',
              emoji: '✨',
              description: 'Uses astrology and planetary timing.',
            },
            {
              label: 'Sea Witch',
              emoji: '🌊',
              description: 'Taps into ocean magic, tides, and water energy.',
            },
            {
              label: 'Eclectic Witch',
              emoji: '🔮',
              description:
                'Mixes multiple traditions into a personalized blend.',
            },
          ].map((path) => (
            <div
              key={path.label}
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
            >
              <h3 className='font-medium text-zinc-100 mb-2'>
                <span className='mr-2'>{path.emoji}</span>
                {path.label}
              </h3>
              <p className='text-zinc-400 text-sm'>{path.description}</p>
            </div>
          ))}
        </div>

        <Link
          href='/grimoire/modern-witchcraft/witch-types'
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          Explore all witch types →
        </Link>
      </section>

      <section id='core-practices' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Core Practices
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          These practices anchor most modern witchcraft paths:
        </p>

        <div className='space-y-4'>
          {[
            {
              title: 'Spellwork',
              description:
                'Focused rituals that blend intention, symbolism, and action.',
              href: '/grimoire/spells/fundamentals',
            },
            {
              title: 'Meditation & Grounding',
              description:
                'Centering rituals that clear the mind and connect you to earth energy.',
              href: '/grimoire/meditation',
            },
            {
              title: 'Divination',
              description:
                'Tarot, runes, pendulum, and scrying offer symbolic reflection.',
              href: '/grimoire/divination',
            },
            {
              title: 'Correspondences',
              description:
                'Learn how colors, herbs, crystals, planets, and days relate to magic.',
              href: '/grimoire/correspondences',
            },
            {
              title: 'Seasonal Celebration',
              description:
                'Honor Sabbats and Esbats from the Wheel of the Year.',
              href: '/grimoire/wheel-of-the-year',
            },
          ].map((practice) => (
            <Link
              key={practice.title}
              href={practice.href}
              className='block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-lunary-primary-600'
            >
              <h3 className='font-medium text-zinc-100 mb-2'>
                {practice.title}
              </h3>
              <p className='text-zinc-400 text-sm'>{practice.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id='sustainable' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Building a Sustainable Practice
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Sustainable practice is about consistency, reflection, and rest.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <ul className='space-y-4 text-zinc-300'>
            <li>
              <strong className='text-lunary-primary-300'>Start small:</strong>{' '}
              A daily five-minute ritual beats a complicated one you ditch.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Build habits:</strong>{' '}
              Consistency outlasts intensity.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Match your life:
              </strong>{' '}
              Adapt culinary, moon, or nature-based work to your schedule.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Track and reflect:
              </strong>{' '}
              Keep a Book of Shadows to notice growth.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>Honor rest:</strong>{' '}
              Dark moon phases are natural downtime, not failure.
            </li>
          </ul>
        </div>
      </section>

      <section id='community' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Community, Solitary Practice & Safety
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Practice can be solitary, group-based, or somewhere in between.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Solitary Practice
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Freedom to design your own path</li>
              <li>• Practice when it suits you</li>
              <li>• Less group politics</li>
              <li>• Can feel isolating—stay accountable.</li>
            </ul>
          </div>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
            <h3 className='font-medium text-zinc-100 mb-2'>Group Practice</h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Community and mentorship</li>
              <li>• Shared rituals and celebrations</li>
              <li>• Learning from experienced witches</li>
              <li>• Seek ethical, respectful groups.</li>
            </ul>
          </div>
        </div>

        <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-error-300 mb-3'>
            Watch for red flags
          </h3>
          <ul className='text-zinc-400 text-sm space-y-1'>
            <li>• Leaders demanding unquestioning obedience</li>
            <li>• Pressure to share personal or financial information</li>
            <li>• Sexual coercion framed as “spiritual initiation”</li>
            <li>• Isolation from friends and family</li>
            <li>• Claims of exclusive truth or the only “real” path</li>
          </ul>
          <p className='text-zinc-400 text-sm mt-3'>
            A healthy group welcomes questions and consent.
          </p>
        </div>
      </section>

      <section id='where-next' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Where to Go Next
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Ready to dive deeper? Follow the paths that resonate with you:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[
            {
              title: 'Learn Spellcraft',
              description: 'Foundational principles of casting spells',
              href: '/grimoire/spells/fundamentals',
            },
            {
              title: 'Find Your Path',
              description: 'Explore the different witch types',
              href: '/grimoire/modern-witchcraft/witch-types',
            },
            {
              title: 'Start Your Journal',
              description: 'Begin crafting your Book of Shadows',
              href: '/book-of-shadows',
            },
            {
              title: 'Study Ethics',
              description: 'Understand the principles of ethical practice',
              href: '/grimoire/modern-witchcraft/ethics',
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-lunary-primary-600'
            >
              <h3 className='font-medium text-zinc-100 mb-1'>{card.title}</h3>
              <p className='text-zinc-400 text-sm'>{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Frequently Asked Questions
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

      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-violet-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Begin Your Practice
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Every experienced witch started somewhere. Begin where you are, use
          what you have, and let your practice grow in a way that feels
          sustainable.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/grimoire/beginners'>Beginners Guide</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/book-of-shadows'>Start Your Journal</Link>
          </Button>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
