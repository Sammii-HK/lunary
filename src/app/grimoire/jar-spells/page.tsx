export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { createHowToSchema, renderJsonLd } from '@/lib/schema';

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
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

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

const tableOfContents = [
  { label: 'What Are Jar Spells?', href: '#what-are' },
  { label: 'Structure', href: '#structure' },
  { label: 'Ingredients', href: '#ingredients' },
  { label: 'How To', href: '#how-to' },
  { label: 'Charging', href: '#charging' },
  { label: 'Examples', href: '#examples' },
  { label: 'Disposal', href: '#disposal' },
  { label: 'FAQ', href: '#faq' },
];

const sections = (
  <>
    <section id='what-are' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        1. What Are Jar Spells?
      </h2>
      <p className='text-zinc-300 leading-relaxed mb-6'>
        A jar spell is a physical container holding ingredients that correspond
        to your magical intention. The jar acts as a vessel for your spell,
        holding the energy and working on your behalf over time.
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

    <section id='structure' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        2. Basic Jar Spell Structure
      </h2>
      <p className='text-zinc-300 leading-relaxed mb-6'>
        Every jar spell contains layers of ingredients chosen for their magical
        correspondences:
      </p>
      <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
        <h3 className='text-lg font-medium text-zinc-100 mb-3'>
          Common Components
        </h3>
        <ul className='space-y-2 text-zinc-400 text-sm'>
          <li>
            <strong className='text-zinc-200'>Base:</strong> Salt (protection),
            sugar (sweetening), soil (grounding), rice (abundance)
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
            Love &amp; Relationships
          </h3>
          <p className='text-zinc-400 text-sm'>
            Rose petals, lavender, honey, cinnamon, vanilla, rose quartz, pink
            candle wax, sugar
          </p>
        </div>
        <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h3 className='font-medium text-zinc-100 mb-2'>
            Prosperity &amp; Abundance
          </h3>
          <p className='text-zinc-400 text-sm'>
            Cinnamon, basil, bay leaf, rice, coins, pyrite, green aventurine,
            cloves, allspice
          </p>
        </div>
        <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h3 className='font-medium text-zinc-100 mb-2'>
            Self-Love &amp; Healing
          </h3>
          <p className='text-zinc-400 text-sm'>
            Lavender, chamomile, rose quartz, clear quartz, honey, rose petals,
            sea salt
          </p>
        </div>
        <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h3 className='font-medium text-zinc-100 mb-2'>
            Clarity &amp; Focus
          </h3>
          <p className='text-zinc-400 text-sm'>
            Rosemary, peppermint, lemon peel, clear quartz, fluorite, bay leaf,
            coffee beans
          </p>
        </div>
        <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h3 className='font-medium text-zinc-100 mb-2'>Banishing</h3>
          <p className='text-zinc-400 text-sm'>
            Black salt, cayenne pepper, vinegar, black pepper, obsidian, thorns,
            nails
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

    <section id='how-to' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        4. How to Create a Spell Jar (Step-by-Step)
      </h2>
      <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
        <ol className='space-y-4'>
          {[
            {
              number: 1,
              title: 'Gather Your Materials',
              text: 'Choose a clean jar with a lid, ingredients matched to your intention, and a candle for sealing (color matched).',
            },
            {
              number: 2,
              title: 'Cleanse the Jar',
              text: 'Wash with salt water, pass through smoke, or leave in moonlight overnight to clear any previous energy.',
            },
            {
              number: 3,
              title: 'Set Your Intention',
              text: 'Hold the empty jar. State your intention clearly, either aloud or silently. Write it on paper if including.',
            },
            {
              number: 4,
              title: 'Layer Ingredients',
              text: 'Add each ingredient mindfully, stating its purpose as you add it. “I add salt for protection. I add rosemary for clarity.”',
            },
            {
              number: 5,
              title: 'Seal the Jar',
              text: 'Close the lid. Light your candle and drip wax over the lid to seal. State your intention clearly as you do.',
            },
            {
              number: 6,
              title: 'Charge and Place',
              text: 'Charge under the moon or on your altar. Place in an appropriate location based on purpose.',
            },
          ].map((step) => (
            <li key={step.number} className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-lunary-primary-600 rounded-full flex items-center justify-center text-white font-medium'>
                {step.number}
              </span>
              <div>
                <h4 className='font-medium text-zinc-100'>{step.title}</h4>
                <p className='text-zinc-400 text-sm'>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section id='charging' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        5. Charging &amp; Sealing Methods
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          {
            title: 'Moon Charging',
            text: 'Leave under the Full Moon for amplification, or New Moon for new beginnings. Match the phase to your intention.',
          },
          {
            title: 'Sun Charging',
            text: 'Leave in sunlight for success, vitality, and masculine energy intentions. Brief exposure—some ingredients fade.',
          },
          {
            title: 'Shaking',
            text: 'Some jars benefit from periodic shaking to reactivate the energy. Common with honey jars.',
          },
          {
            title: 'Candle Burning',
            text: 'Burn a candle on top of the sealed jar to recharge periodically. Match candle color to intention.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>{card.title}</h3>
            <p className='text-zinc-400 text-sm'>{card.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section id='examples' className='mb-16 space-y-6'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        6. Example Jar Spells
      </h2>
      {[
        {
          title: 'Simple Protection Jar',
          items: [
            'Salt (base layer)',
            'Rosemary',
            'Black pepper',
            'Bay leaf with protection sigil',
            'Black tourmaline chip',
            'Sealed with black candle wax',
          ],
          note: 'Place by front door or bury at property boundary.',
        },
        {
          title: 'Self-Love Honey Jar',
          items: [
            'Honey (filling)',
            'Rose petals',
            'Lavender',
            'Cinnamon stick',
            'Rose quartz chip',
            'Paper with your name and affirmation',
            'Sealed with pink candle wax',
          ],
          note: 'Keep on altar or bedroom. Shake weekly.',
        },
        {
          title: 'Prosperity Jar',
          items: [
            'Rice (base)',
            'Cinnamon',
            'Basil',
            'Bay leaf with money intention',
            'Coins',
            'Pyrite or green aventurine',
            'Sealed with green candle wax',
          ],
          note: 'Keep in workspace or by cash register.',
        },
      ].map((example) => (
        <div
          key={example.title}
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            {example.title}
          </h3>
          <ul className='text-zinc-400 text-sm space-y-1 mb-3'>
            {example.items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <p className='text-zinc-500 text-xs'>{example.note}</p>
        </div>
      ))}
    </section>

    <section id='disposal' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        7. When &amp; How to Dispose
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
            <strong className='text-zinc-200'>When to dispose:</strong> When the
            spell has manifested, feels complete, or the jar breaks.
          </li>
          <li>
            <strong className='text-zinc-200'>Thank the jar:</strong> Express
            gratitude for its work before opening.
          </li>
          <li>
            <strong className='text-zinc-200'>Organic materials:</strong> Return
            to earth (bury) or compost.
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
            away from your home; throw in running water or bury at a crossroads.
          </li>
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

    <CosmicConnections
      entityType='hub-glossary'
      entityKey='jar-spells'
      title='Jar Spell Connections'
      sections={cosmicConnectionsSections}
    />
  </>
);

export default function JarSpellsPage() {
  const heroContent = (
    <p className='text-xl text-zinc-400 leading-relaxed'>
      Jar spells (also called witch bottles or spell jars) are one of the most
      accessible forms of magic. They capture your intention in a vessel that
      works for you around the clock.
    </p>
  );

  return (
    <>
      {renderJsonLd(howToSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Jar Spells'
        description='Learn to craft jar spells for protection, love, prosperity, healing, and more with clear ingredients, structure, and charging practices.'
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/jar-spells'
        }
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What is a jar spell?',
          answer:
            'A jar spell stores ingredients aligned to intention, letting energy accumulate in a container that works for you over time.',
        }}
        intro='Follow this beginner-friendly guide to build jar spells with layered ingredients, magical correspondences, and intentional charging.'
        heroContent={heroContent}
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='jar-spells'
            title='Jar Spell Connections'
            sections={cosmicConnectionsSections}
          />
        }
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
