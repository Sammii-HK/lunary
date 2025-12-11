export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
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
      "Signs include feeling drained after being around certain people, picking up on others' emotions easily, feeling anxious in crowds, or noticing your mood shifts dramatically based on your environment. Empaths and sensitive people often benefit most from protection practices.",
  },
  {
    question: 'Can I protect my home as well as myself?',
    answer:
      'Absolutely. Home warding involves cleansing your space and setting protective boundaries around your living area. This can include placing protective crystals at entry points, salt lines at doorways, protective herbs, or simply setting a clear intention for your space.',
  },
  {
    question: 'Is protection magic about fear?',
    answer:
      "No. Healthy protection is about maintaining boundaries and energetic hygiene—like washing your hands or locking your door. It's proactive self-care, not paranoia. Fear-based protection actually weakens your energy.",
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

export default function ProtectionPage() {
  const articleSchema = createArticleSchema({
    headline: 'Energetic Protection: Complete Guide to Magical Boundaries',
    description:
      'Complete guide to energetic protection and magical boundaries.',
    url: 'https://lunary.app/grimoire/protection',
    keywords: ['protection', 'shielding', 'warding', 'energetic boundaries'],
    section: 'Protection',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Protection' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Energetic Protection
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Boundaries for Witches & Sensitive Souls
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Protection magic is not about fear—it&apos;s about healthy boundaries.
          Just as you lock your door at night or wash your hands, energetic
          protection maintains your personal space and prevents unwanted
          influences from affecting your wellbeing.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#why-protection' className='hover:text-lunary-primary-400'>
              1. Why Protection Isn&apos;t Fear-Based
            </a>
          </li>
          <li>
            <a
              href='#internal-external'
              className='hover:text-lunary-primary-400'
            >
              2. Internal vs. External Boundaries
            </a>
          </li>
          <li>
            <a href='#shielding' className='hover:text-lunary-primary-400'>
              3. Shielding Techniques
            </a>
          </li>
          <li>
            <a href='#cleansing' className='hover:text-lunary-primary-400'>
              4. Cleansing Your Space & Aura
            </a>
          </li>
          <li>
            <a href='#crystals-herbs' className='hover:text-lunary-primary-400'>
              5. Protective Crystals & Herbs
            </a>
          </li>
          <li>
            <a href='#home-warding' className='hover:text-lunary-primary-400'>
              6. Home Warding
            </a>
          </li>
          <li>
            <a href='#empaths' className='hover:text-lunary-primary-400'>
              7. Protection for Empaths
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              8. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section id='why-protection' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. Why Protection Isn&apos;t Fear-Based
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Many people shy away from protection magic because it sounds paranoid.
          But protection is simply energetic hygiene. You don&apos;t obsess over
          germs, but you still wash your hands. Energetic protection works the
          same way.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Healthy Protection Looks Like:
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Knowing your energy from others&apos;</li>
            <li>• Maintaining clear boundaries in relationships</li>
            <li>• Cleansing your space regularly (not obsessively)</li>
            <li>• Grounding before and after magical work</li>
            <li>• Trusting your intuition about people and places</li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          The goal is to feel safe, grounded, and confident—not anxious or
          paranoid about unseen threats.
        </p>
      </section>

      {/* Section 2 */}
      <section id='internal-external' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Internal vs. External Boundaries
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          True protection works on two levels: internal (your personal energy
          field) and external (your physical space).
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Internal Boundaries
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Your aura, energy field, and personal space.
            </p>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Shielding your energy</li>
              <li>• Grounding and centering</li>
              <li>• Emotional boundaries with people</li>
              <li>• Knowing what emotions are yours</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              External Boundaries
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Your home, workspace, and physical environment.
            </p>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Home warding</li>
              <li>• Space cleansing</li>
              <li>• Protective objects and talismans</li>
              <li>• Threshold magic</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Shielding */}
      <section id='shielding' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Shielding Techniques
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Shielding is the practice of visualizing a protective barrier around
          yourself. It&apos;s the most basic and essential protection technique.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Basic Shield Visualization
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Close your eyes and take three deep breaths</li>
            <li>2. Visualize a light at your core (solar plexus)</li>
            <li>3. See that light expand outward in all directions</li>
            <li>4. It forms a sphere or egg shape around your body</li>
            <li>
              5. Set the intention: &quot;This shield protects me while allowing
              love in&quot;
            </li>
            <li>6. Know that it is in place and will remain</li>
          </ol>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h4 className='font-medium text-zinc-100 mb-2'>Mirror Shield</h4>
            <p className='text-zinc-400 text-sm'>
              Visualize your shield as mirrored, reflecting negativity back to
              its source without harm.
            </p>
          </div>
          <div className='p-4 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h4 className='font-medium text-zinc-100 mb-2'>
              Absorptive Shield
            </h4>
            <p className='text-zinc-400 text-sm'>
              Shield that absorbs and transmutes negative energy into neutral or
              positive. Good for empaths.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Cleansing */}
      <section id='cleansing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Cleansing Your Space & Aura
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Cleansing clears stagnant or negative energy, making room for fresh,
          positive energy. Regular cleansing prevents buildup and maintains a
          clear environment.
        </p>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Smoke Cleansing</h3>
            <p className='text-zinc-400 text-sm'>
              Use ethically sourced herbs like rosemary, mugwort, or lavender.
              Open windows, move through each room with intention.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Sound Cleansing</h3>
            <p className='text-zinc-400 text-sm'>
              Bells, singing bowls, clapping, or even loud music can break up
              stagnant energy. Move through the space making sound.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Salt Cleansing</h3>
            <p className='text-zinc-400 text-sm'>
              Sprinkle salt in corners, along windowsills, and at doorways.
              Vacuum or sweep up after 24 hours. Salt absorbs negativity.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Water Cleansing</h3>
            <p className='text-zinc-400 text-sm'>
              Visualize running water washing away negativity while showering.
              Use moon water to mop floors or spritz rooms.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Crystals & Herbs */}
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
                <strong className='text-zinc-200'>Black Tourmaline:</strong>{' '}
                Grounding, absorbs negativity
              </li>
              <li>
                <strong className='text-zinc-200'>Obsidian:</strong> Powerful
                protection, reveals truth
              </li>
              <li>
                <strong className='text-zinc-200'>Smoky Quartz:</strong>{' '}
                Transmutes negative energy
              </li>
              <li>
                <strong className='text-zinc-200'>Amethyst:</strong> Spiritual
                protection, intuition
              </li>
              <li>
                <strong className='text-zinc-200'>Tiger&apos;s Eye:</strong>{' '}
                Protective, grounding, confidence
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
                <strong className='text-zinc-200'>Rosemary:</strong>{' '}
                Purification, protection, clarity
              </li>
              <li>
                <strong className='text-zinc-200'>Basil:</strong> Protective,
                banishes negativity
              </li>
              <li>
                <strong className='text-zinc-200'>Bay Leaves:</strong>{' '}
                Protection, wishes, psychic work
              </li>
              <li>
                <strong className='text-zinc-200'>Salt:</strong> Universal
                purifier and protector
              </li>
              <li>
                <strong className='text-zinc-200'>Lavender:</strong> Peace,
                calming protection
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

      {/* Section 6: Home Warding */}
      <section id='home-warding' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Home Warding
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Warding creates a protective boundary around your home. Unlike
          cleansing (which clears energy), warding sets a boundary that prevents
          unwanted energy from entering.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Simple Home Ward
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Cleanse your home first (smoke, sound, or salt)</li>
            <li>2. Walk the perimeter of your home clockwise</li>
            <li>3. Visualize a protective light forming at the boundaries</li>
            <li>4. At each doorway and window, set your intention</li>
            <li>5. Place a protective crystal or herb at main entry points</li>
            <li>
              6. State: &quot;This home is protected. Only those who wish me
              well may enter.&quot;
            </li>
            <li>7. Reinforce monthly or as needed</li>
          </ol>
        </div>
      </section>

      {/* Section 7: Empaths */}
      <section id='empaths' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Protection for Empaths
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Empaths absorb others&apos; emotions easily, which can be overwhelming
          without proper boundaries. If you feel drained after social
          situations, protection is essential.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Empath Protection Tips
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>
              • <strong>Before crowds:</strong> Visualize your shield firmly in
              place
            </li>
            <li>
              • <strong>During overwhelm:</strong> Touch something grounding
              (stone, floor, tree)
            </li>
            <li>
              • <strong>After exposure:</strong> Shower and visualize washing
              away what isn&apos;t yours
            </li>
            <li>
              • <strong>Daily practice:</strong> Ask &quot;Is this emotion
              mine?&quot;—if not, release it
            </li>
            <li>
              • <strong>Carry crystals:</strong> Black tourmaline or smoky
              quartz in your pocket
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
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

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='protection'
        title='Protection Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
