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

export const metadata: Metadata = {
  title: "Jar Spells: Complete Beginner's Guide to Spell Jars - Lunary",
  description:
    'Complete guide to jar spells and witch bottles. Learn how to create spell jars for protection, love, prosperity, and more. Includes safe ingredients, charging methods, and disposal guidelines.',
  keywords: [
    'jar spells',
    'spell jars',
    'witch bottles',
    'honey jar spell',
    'protection jar',
    'spell jar ingredients',
    'how to make spell jar',
  ],
  openGraph: {
    title: "Jar Spells: Complete Beginner's Guide - Lunary",
    description:
      'Complete guide to creating spell jars for protection, love, prosperity, and more.',
    type: 'article',
    url: 'https://lunary.app/grimoire/jar-spells',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/jar-spells',
  },
};

const faqs = [
  {
    question: 'How long do jar spells last?',
    answer:
      'It depends on the intention. Some jars (like protection) are meant to work indefinitely until disposed of. Others (like manifestation for a specific goal) can be opened and disposed of once the goal is achieved. Follow your intuition.',
  },
  {
    question: 'Where should I keep my spell jar?',
    answer:
      'It depends on the purpose. Protection jars often go by the door or buried on property. Prosperity jars might go in your workspace. Love jars in the bedroom. Some practitioners keep them on altars. Hidden or visible—do what feels right.',
  },
  {
    question: "What if my jar spell doesn't work?",
    answer:
      'Consider: Was your intention clear? Were you emotionally aligned? Did you take aligned action afterward? Did subconscious blocks interfere? Sometimes spells manifest differently than expected, or timing is off. Dispose respectfully and try again if guided.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Jar Spell Resources',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Herbs Guide', href: '/grimoire/correspondences/herbs' },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Protection', href: '/grimoire/protection' },
    ],
  },
];

export default function JarSpellsPage() {
  const articleSchema = createArticleSchema({
    headline: "Jar Spells: Complete Beginner's Guide to Spell Jars",
    description:
      'Complete guide to creating spell jars for protection, love, prosperity, and more.',
    url: 'https://lunary.app/grimoire/jar-spells',
    keywords: ['jar spells', 'spell jars', 'witch bottles'],
    section: 'Spellcraft',
  });

  const faqSchema = createFAQPageSchema(faqs);

  const howToSchema = createHowToSchema({
    name: 'How to Create a Basic Spell Jar',
    description: 'Step-by-step instructions for creating your first spell jar.',
    url: 'https://lunary.app/grimoire/jar-spells#how-to',
    totalTime: 'PT30M',
    tools: ['clean jar with lid', 'ingredients', 'candle for sealing'],
    steps: [
      {
        name: 'Gather materials',
        text: 'Collect your jar, ingredients matched to intention, and sealing candle.',
      },
      {
        name: 'Cleanse the jar',
        text: 'Cleanse your jar with smoke, moonlight, or running water.',
      },
      {
        name: 'Set your intention',
        text: 'Hold the jar and clearly state your purpose.',
      },
      {
        name: 'Layer ingredients',
        text: 'Add each ingredient mindfully, stating its purpose.',
      },
      { name: 'Seal the jar', text: 'Close the lid and seal with melted wax.' },
      {
        name: 'Charge and place',
        text: 'Charge under the moon or on your altar; place appropriately.',
      },
    ],
  });

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(howToSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Jar Spells' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Jar Spells
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Beginner&apos;s Guide to Spell Jars
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Jar spells (also called witch bottles or spell jars) are one of the
          most accessible and effective forms of magic. They contain your
          intention in physical form, working continuously on your behalf.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-are' className='hover:text-lunary-primary-400'>
              1. What Are Jar Spells?
            </a>
          </li>
          <li>
            <a href='#structure' className='hover:text-lunary-primary-400'>
              2. Basic Jar Spell Structure
            </a>
          </li>
          <li>
            <a href='#ingredients' className='hover:text-lunary-primary-400'>
              3. Safe Ingredients by Purpose
            </a>
          </li>
          <li>
            <a href='#how-to' className='hover:text-lunary-primary-400'>
              4. How to Create a Spell Jar (Step-by-Step)
            </a>
          </li>
          <li>
            <a href='#charging' className='hover:text-lunary-primary-400'>
              5. Charging & Sealing Methods
            </a>
          </li>
          <li>
            <a href='#examples' className='hover:text-lunary-primary-400'>
              6. Example Jar Spells
            </a>
          </li>
          <li>
            <a href='#disposal' className='hover:text-lunary-primary-400'>
              7. When & How to Dispose
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
      <section id='what-are' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Are Jar Spells?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A jar spell is a physical container holding ingredients that
          correspond to your magical intention. The jar acts as a vessel for
          your spell, holding the energy and working on your behalf over time.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Jar spells have ancient roots—witch bottles for protection date back
          centuries. Today they&apos;re popular because they&apos;re:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• Easy to make with kitchen ingredients</li>
          <li>• Visually beautiful and satisfying</li>
          <li>• Continuously working (not a one-time ritual)</li>
          <li>• Versatile for any intention</li>
          <li>• Discrete and easy to hide if needed</li>
        </ul>
      </section>

      {/* Section 2: Structure */}
      <section id='structure' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Basic Jar Spell Structure
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Every jar spell contains layers of ingredients chosen for their
          magical correspondences:
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Common Components
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>Base:</strong> Salt
              (protection), sugar (sweetening), soil (grounding), rice
              (abundance)
            </li>
            <li>
              <strong className='text-zinc-200'>Herbs:</strong> Dried herbs
              matching your intention
            </li>
            <li>
              <strong className='text-zinc-200'>Crystals:</strong> Small tumbled
              stones or chips
            </li>
            <li>
              <strong className='text-zinc-200'>Personal items:</strong> Hair,
              nails (for personal spells), photos, names written on paper
            </li>
            <li>
              <strong className='text-zinc-200'>Binding agent:</strong> Honey
              (sweetening), oil (anointing), moon water
            </li>
            <li>
              <strong className='text-zinc-200'>Seal:</strong> Wax from a candle
              matching your intention
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Ingredients */}
      <section id='ingredients' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Safe Ingredients by Purpose
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Protection</h3>
            <p className='text-zinc-400 text-sm'>
              Salt, black salt, rosemary, bay leaf, black pepper, iron nails,
              black tourmaline, obsidian, thorns
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Love & Relationships
            </h3>
            <p className='text-zinc-400 text-sm'>
              Rose petals, lavender, honey, cinnamon, vanilla, rose quartz, pink
              candle wax, sugar
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Prosperity & Abundance
            </h3>
            <p className='text-zinc-400 text-sm'>
              Cinnamon, basil, bay leaf, rice, coins, pyrite, green aventurine,
              cloves, allspice
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Self-Love & Healing
            </h3>
            <p className='text-zinc-400 text-sm'>
              Lavender, chamomile, rose quartz, clear quartz, honey, rose
              petals, sea salt
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Clarity & Focus</h3>
            <p className='text-zinc-400 text-sm'>
              Rosemary, peppermint, lemon peel, clear quartz, fluorite, bay
              leaf, coffee beans
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Banishing</h3>
            <p className='text-zinc-400 text-sm'>
              Black salt, cayenne pepper, vinegar, black pepper, obsidian,
              thorns, nails
            </p>
          </div>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/correspondences'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Full correspondences guide →
          </Link>
        </div>
      </section>

      {/* Section 4: How To */}
      <section id='how-to' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. How to Create a Spell Jar (Step-by-Step)
        </h2>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <ol className='space-y-4'>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                1
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>
                  Gather Your Materials
                </h4>
                <p className='text-zinc-400 text-sm'>
                  Choose a clean jar with a lid, ingredients matched to your
                  intention, and a candle for sealing (color matched).
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                2
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>Cleanse the Jar</h4>
                <p className='text-zinc-400 text-sm'>
                  Wash with salt water, pass through smoke, or leave in
                  moonlight overnight to clear any previous energy.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                3
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>
                  Set Your Intention
                </h4>
                <p className='text-zinc-400 text-sm'>
                  Hold the empty jar. State your intention clearly, either aloud
                  or silently. Write it on paper if including.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                4
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>Layer Ingredients</h4>
                <p className='text-zinc-400 text-sm'>
                  Add each ingredient mindfully, stating its purpose as you add
                  it. &quot;I add salt for protection. I add rosemary for
                  clarity.&quot;
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                5
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>Seal the Jar</h4>
                <p className='text-zinc-400 text-sm'>
                  Close the lid. Light your candle and drip wax over the lid to
                  seal. State: &quot;This spell is sealed. So it is.&quot;
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                6
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>Charge and Place</h4>
                <p className='text-zinc-400 text-sm'>
                  Charge under the moon or on your altar. Place in an
                  appropriate location based on purpose.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Section 5: Charging */}
      <section id='charging' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Charging & Sealing Methods
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Moon Charging</h3>
            <p className='text-zinc-400 text-sm'>
              Leave under the Full Moon for amplification, or New Moon for new
              beginnings. Match the phase to your intention.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Sun Charging</h3>
            <p className='text-zinc-400 text-sm'>
              Leave in sunlight for success, vitality, and masculine energy
              intentions. Brief exposure—some ingredients fade.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Shaking</h3>
            <p className='text-zinc-400 text-sm'>
              Some jars benefit from periodic shaking to reactivate the energy.
              Common with honey jars.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Candle Burning</h3>
            <p className='text-zinc-400 text-sm'>
              Burn a candle on top of the sealed jar to recharge periodically.
              Match candle color to intention.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Examples */}
      <section id='examples' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Example Jar Spells
        </h2>

        <div className='space-y-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Simple Protection Jar
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1 mb-3'>
              <li>• Salt (base layer)</li>
              <li>• Rosemary</li>
              <li>• Black pepper</li>
              <li>• Bay leaf with protection sigil</li>
              <li>• Black tourmaline chip</li>
              <li>• Sealed with black candle wax</li>
            </ul>
            <p className='text-zinc-500 text-xs'>
              Place by front door or bury at property boundary.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Self-Love Honey Jar
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1 mb-3'>
              <li>• Honey (filling)</li>
              <li>• Rose petals</li>
              <li>• Lavender</li>
              <li>• Cinnamon stick</li>
              <li>• Rose quartz chip</li>
              <li>• Paper with your name and affirmation</li>
              <li>• Sealed with pink candle wax</li>
            </ul>
            <p className='text-zinc-500 text-xs'>
              Keep on altar or bedroom. Shake weekly.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Prosperity Jar
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1 mb-3'>
              <li>• Rice (base)</li>
              <li>• Cinnamon</li>
              <li>• Basil</li>
              <li>• Bay leaf with money intention</li>
              <li>• Coins</li>
              <li>• Pyrite or green aventurine</li>
              <li>• Sealed with green candle wax</li>
            </ul>
            <p className='text-zinc-500 text-xs'>
              Keep in workspace or by cash register.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Disposal */}
      <section id='disposal' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. When & How to Dispose
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Not all jars are meant to last forever. Know when and how to properly
          dispose of spell jars.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Disposal Guidelines
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>When to dispose:</strong> When
              the spell has manifested, feels complete, or the jar breaks.
            </li>
            <li>
              <strong className='text-zinc-200'>Thank the jar:</strong> Express
              gratitude for its work before opening.
            </li>
            <li>
              <strong className='text-zinc-200'>Organic materials:</strong>{' '}
              Return to earth (bury) or compost.
            </li>
            <li>
              <strong className='text-zinc-200'>Crystals:</strong> Cleanse
              thoroughly and reuse or return to nature.
            </li>
            <li>
              <strong className='text-zinc-200'>Glass jar:</strong> Cleanse and
              repurpose, or recycle.
            </li>
            <li>
              <strong className='text-zinc-200'>Banishing jars:</strong> Dispose
              away from your home; throw in running water or bury at a
              crossroads.
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
        entityKey='jar-spells'
        title='Jar Spell Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
