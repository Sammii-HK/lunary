export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Energetic Protection: Complete Guide to Magical Boundaries - Lunary',
  description:
    'Complete guide to energetic protection and magical boundaries. Learn shielding techniques, cleansing methods, protective crystals and herbs, and how to maintain healthy energetic hygiene.',
  keywords: [
    'energetic protection',
    'magical protection',
    'shielding',
    'warding',
    'protection spells',
    'energetic boundaries',
    'psychic protection',
  ],
  openGraph: {
    title: 'Energetic Protection - Lunary',
    description:
      'Complete guide to energetic protection and magical boundaries.',
    type: 'article',
    url: 'https://lunary.app/grimoire/protection',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/protection',
  },
};

const faqs = [
  {
    question: 'How do I know if I need energetic protection?',
    answer:
      'If you feel drained after certain people, pick up emotions easily, or notice your mood shifts dramatically in different spaces, protection can help you stay grounded.',
  },
  {
    question: 'Can I protect my home as well as myself?',
    answer:
      'Absolutely. Home warding combines cleansing, protective objects, and intention to set boundaries around the space, keeping out unwanted energy.',
  },
  {
    question: 'Is protection magic about fear?',
    answer:
      'No. Healthy protection is energetic hygiene—like washing your hands or locking a door. Fear-based defense weakens energy, while mindful protection strengthens it.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Protection Resources',
    links: [
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Meditation & Grounding', href: '/grimoire/meditation' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

const tableOfContents = [
  { label: "Why Protection Isn't Fear-Based", href: '#why-protection' },
  { label: 'Internal vs. External Boundaries', href: '#internal-external' },
  { label: 'Shielding Techniques', href: '#shielding' },
  { label: 'Cleansing Space & Aura', href: '#cleansing' },
  { label: 'Protective Crystals & Herbs', href: '#crystals-herbs' },
  { label: 'Home Warding', href: '#home-warding' },
  { label: 'Protection for Empaths', href: '#empaths' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What is protection at Lunary?',
  answer:
    'Protection is intentional boundary work that keeps your energy secure without fear. It includes shielding, cleansing, and thoughtful use of correspondences.',
};

const intro =
  "Protection magic is energetic hygiene. You're not warding from monsters—you're maintaining healthy borders so the people, emotions, and environments that drain you stay outside your sphere.";

const howToWorkWith = [
  'Shield first: visualize a luminous barrier around you with an intention that invites light and repels harm.',
  'Cleanse often: move smoke, sound, water, or salt through your home and auric field before major work.',
  'Use correspondences: layer crystals, herbs, candles, and words to reinforce your shield.',
  'Home warding: walk thresholds, state a protective intention, and place talismans where they feel strongest.',
];

const relatedItems = [
  { name: 'Crystals Guide', href: '/grimoire/crystals', type: 'Stones' },
  {
    name: 'Herb Correspondences',
    href: '/grimoire/correspondences/herbs',
    type: 'Plants',
  },
  {
    name: 'Shielding Spells',
    href: '/grimoire/spells/fundamentals',
    type: 'Spellcraft',
  },
  {
    name: 'Moon Rituals',
    href: '/grimoire/moon/rituals',
    type: 'Lunar timing',
  },
];

export default function ProtectionPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Energetic Protection'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/protection'
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
          entityKey='protection'
          title='Protection Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='why-protection' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. Why Protection Isn&apos;t Fear-Based
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Protection serves your wellbeing—not paranoia. It&apos;s energetic
          hygiene, like washing hands or locking doors: a simple routine keeps
          negativity from sticking around.
        </p>
        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Healthy Protection Looks Like:
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Knowing your energy from other people&apos;s</li>
            <li>• Emotional boundaries in relationships</li>
            <li>• Regular cleansing (without obsession)</li>
            <li>• Grounding before and after magic</li>
            <li>• Trusting intuition about people and places</li>
          </ul>
        </div>
        <p className='text-zinc-400 text-sm mt-4'>
          The goal is to stay confident and clear—not anxious about unseen
          threats.
        </p>
      </section>

      <section id='internal-external' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Internal vs. External Boundaries
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Internal boundaries protect your aura and emotions; external ones
          guard your space and objects.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Internal Boundaries
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Shielding, grounding, emotional clarity, and energy hygiene.
            </p>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Shield your aura</li>
              <li>• Center before ritual</li>
              <li>• Know what feelings are yours</li>
              <li>• Maintain emotional boundaries</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              External Boundaries
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Ward homes, clean spaces, and place protective charms.
            </p>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Warding thresholds</li>
              <li>• Space cleansing</li>
              <li>• Protective talismans</li>
              <li>• Physical boundaries for rest</li>
            </ul>
          </div>
        </div>
      </section>

      <section id='shielding' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Shielding Techniques
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Shielding builds a visual barrier around you that invites light and
          deflects harm.
        </p>
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Basic Shield Visualization
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Breathe deeply</li>
            <li>2. Visualize light at your core</li>
            <li>3. Expand that light outward</li>
            <li>4. Shape it into a sphere or egg</li>
            <li>5. Intend it to protect while letting love in</li>
            <li>6. Know it remains until you release it</li>
          </ol>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h4 className='font-medium text-zinc-100 mb-2'>Mirror Shield</h4>
            <p className='text-zinc-400 text-sm'>
              Reflect negativity back without harm.
            </p>
          </div>
          <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h4 className='font-medium text-zinc-100 mb-2'>
              Absorptive Shield
            </h4>
            <p className='text-zinc-400 text-sm'>
              Absorb and transmute energy, helpful for empaths.
            </p>
          </div>
        </div>
      </section>

      <section id='cleansing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Cleansing Your Space & Aura
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Cleansing removes stagnancy so protective work can stick.
        </p>
        <div className='space-y-4'>
          {[
            {
              title: 'Smoke Cleansing',
              desc: 'Move ethically sourced herbs through each room while opening windows.',
            },
            {
              title: 'Sound Cleansing',
              desc: 'Use bells, singing bowls, or clapping to breakup stale energy.',
            },
            {
              title: 'Salt Cleansing',
              desc: 'Sprinkle salt in corners and thresholds, vacuum after 24 hours.',
            },
            {
              title: 'Water Cleansing',
              desc: 'Visualize running water washing away negativity (moon water for floors).',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
            >
              <h3 className='font-medium text-zinc-100 mb-2'>{item.title}</h3>
              <p className='text-zinc-400 text-sm'>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='crystals-herbs' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Protective Crystals & Herbs
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-3'>
              Protective Crystals
            </h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                • <strong>Black Tourmaline</strong> – Grounding, absorbs
                negativity
              </li>
              <li>
                • <strong>Obsidian</strong> – Truth-revealing, shields strongly
              </li>
              <li>
                • <strong>Smoky Quartz</strong> – Transmutes negative energy
              </li>
              <li>
                • <strong>Amethyst</strong> – Spiritual protection, intuition
              </li>
              <li>
                • <strong>Tiger&apos;s Eye</strong> – Confidence, grounding
              </li>
            </ul>
            <div className='mt-3'>
              <Link
                href='/grimoire/crystals'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Full crystal guide →
              </Link>
            </div>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-3'>Protective Herbs</h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>
                • <strong>Rosemary</strong> – Purification and clarity
              </li>
              <li>
                • <strong>Basil</strong> – Banishing negativity
              </li>
              <li>
                • <strong>Bay Leaves</strong> – Wishes and psychic boundaries
              </li>
              <li>
                • <strong>Salt</strong> – Universal purifier
              </li>
              <li>
                • <strong>Lavender</strong> – Calming protection
              </li>
            </ul>
            <div className='mt-3'>
              <Link
                href='/grimoire/correspondences/herbs'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Full herb guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id='home-warding' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Home Warding
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Warding sets a barrier around your home so uninvited energy stays
          outside.
        </p>
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Simple Home Ward
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Cleanse your home</li>
            <li>2. Walk the perimeter clockwise</li>
            <li>3. See protective light forming</li>
            <li>4. Set intention at each threshold</li>
            <li>5. Place crystals or herbs at entry points</li>
            <li>6. Announce: “This home is protected.”</li>
            <li>7. Reinforce monthly or when needed</li>
          </ol>
        </div>
      </section>

      <section id='empaths' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Protection for Empaths
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Empaths absorb emotions, so grounding and quick cleansing preserve
          their energy.
        </p>
        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Empath Protection Tips
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Before crowds: visualize your shield fully formed</li>
            <li>• During overwhelm: touch something grounding</li>
            <li>
              • After exposure: shower and wash away what isn&apos;t yours
            </li>
            <li>• Daily: ask “Is this emotion mine?” and release the rest</li>
            <li>• Carry black tourmaline or smoky quartz in your pocket</li>
          </ul>
        </div>
      </section>

      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. Frequently Asked Questions
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
    </SEOContentTemplate>
  );
}
