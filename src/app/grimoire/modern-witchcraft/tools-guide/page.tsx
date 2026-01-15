import { Metadata } from 'next';
import Link from 'next/link';
import { createArticleSchema, renderJsonLd } from '@/lib/schema';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Tools of the Craft: Complete Witchcraft Tools Guide - Lunary',
  description:
    'Guide to witchcraft tools: athame, wand, chalice, pentacle, cauldron, candles, crystals, herbs, and digital tools. Learn what each tool represents and how to use them.',
  keywords: [
    'witchcraft tools',
    'athame',
    'wand',
    'chalice',
    'pentacle',
    'cauldron',
    'witchcraft supplies',
    'ritual tools',
  ],
  openGraph: {
    title: 'Tools of the Craft - Lunary',
    description:
      'Complete guide to witchcraft tools and how to use them in your practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/modern-witchcraft/tools-guide',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft/tools-guide',
  },
};

const faqs = [
  {
    question: 'Do I need all these tools to practice witchcraft?',
    answer:
      'No. You can start with just your intention, a journal, and perhaps a candle. Many powerful practitioners work with minimal tools. Add items gradually as they call to you and as your budget allows.',
  },
  {
    question: 'Can I make my own tools?',
    answer:
      'Absolutely. Handmade tools carry your personal energy and can be more powerful than purchased ones. Carve a wand from a fallen branch, shape a pentacle from clay, or repurpose household items.',
  },
  {
    question: 'Do tools need to be expensive?',
    answer:
      'Not at all. A kitchen knife can serve as an athame, a wine glass as a chalice, a stick as a wand. Your intention and connection to the tool matter far more than its price.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Using Your Tools',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
    ],
  },
  {
    title: 'Tool-Related Resources',
    links: [
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export default function WitchcraftToolsPage() {
  const articleSchema = createArticleSchema({
    headline: 'Tools of the Craft: Complete Witchcraft Tools Guide',
    description:
      'Complete guide to witchcraft tools and how to use them in your practice.',
    url: 'https://lunary.app/grimoire/modern-witchcraft/tools-guide',
    keywords: ['witchcraft tools', 'ritual tools', 'magical tools'],
    section: 'Witchcraft',
  });

  const tableOfContents = [
    {
      label: 'Working With Tools Intuitively vs. Dogmatically',
      href: '#intuitive-vs-dogmatic',
    },
    { label: 'Altars & Sacred Space', href: '#altars' },
    { label: 'Candles & Fire Tools', href: '#fire-tools' },
    { label: 'Herbs & Kitchen Witchery', href: '#herbs' },
    { label: 'Crystals & Mineral Allies', href: '#crystals' },
    { label: 'Journals & Book of Shadows', href: '#journals' },
    { label: 'Digital Tools (Lunary)', href: '#digital' },
    { label: 'FAQ', href: '#faq' },
  ];

  const heroContent = (
    <p className='text-lg text-zinc-400 leading-relaxed'>
      Tools are extensions of your will and intention. They help focus energy,
      create sacred space, and add symbolic weight to your practice—but they are
      never required. Your intention is always the most powerful tool.
    </p>
  );

  return (
    <>
      {renderJsonLd(articleSchema)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Tools of the Craft'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/modern-witchcraft/tools-guide'
        }
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            title='Crystal Connections'
            entityType='crystal'
            entityKey='crystal-guide'
            sections={cosmicConnectionsSections}
          />
        }
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { label: 'Tools Guide' },
        ]}
      >
        <section id='intuitive-vs-dogmatic' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            1. Working With Tools Intuitively vs. Dogmatically
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            There are two approaches to magical tools: following tradition
            exactly as taught, or developing your own intuitive relationships
            with tools. Most practitioners find a balance between both.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Traditional Approach
              </h3>
              <p className='text-zinc-400 text-sm'>
                Honor lineage and correspondences. Use the tool associated with
                the ritual's intent, direction, or element.
              </p>
            </div>
            <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Intuitive Approach
              </h3>
              <p className='text-zinc-400 text-sm'>
                Allow your intuition to guide you. If a crystal, kitchen spoon,
                or plant feels right, work with it—even if it deviates from
                tradition.
              </p>
            </div>
          </div>
        </section>

        <section id='altars' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            2. Altars & Sacred Space
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Your altar is the heart of your practice. It can be as simple as a
            cloth on a windowsill or as elaborate as a dedicated corner.
          </p>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Elements to Include
              </h3>
              <ul className='text-sm text-zinc-400 space-y-2'>
                <li>☾ Water or a chalice</li>
                <li>✦ Fire or a candle</li>
                <li>🗡️ Air tool like a wand or athame</li>
                <li>⛏️ Earth item such as crystals or herbs</li>
              </ul>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Maintaining Sacred Space
              </h3>
              <p className='text-zinc-400 text-sm'>
                Cleanse regularly with smoke, sound, or intention. Re-arrange
                seasonally to align with sabbats or personal shifts.
              </p>
            </div>
          </div>
        </section>

        <section id='fire-tools' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            3. Candles & Fire Tools
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Candles are powerful focus points. Choose color based on intention,
            dress them with oil, and burn with purpose.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Dressing Candles
              </h3>
              <p className='text-sm text-zinc-400'>
                Anoint candles with corresponding oils and herbs before
                lighting. Snooze last wish when flame is steady or use candle
                magic combos.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Fire Safety</h3>
              <p className='text-sm text-zinc-400'>
                Keep a fire-safe surface, never leave candles unattended, and
                have a grounding element nearby.
              </p>
            </div>
          </div>
        </section>

        <section id='herbs' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            4. Herbs & Kitchen Witchery
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Herbs carry correspondences and scents that support intention. Use
            simple kitchen herbs for spell jars or tea magick.
          </p>
          <div className='space-y-4'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Working with Spices
              </h3>
              <p className='text-sm text-zinc-400'>
                Cinnamon for abundance, basil for protection, rosemary for
                remembrance. Burn them, infuse oils, or add to spell jars.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Herbs for Tea & Bath
              </h3>
              <p className='text-sm text-zinc-400'>
                Steep chamomile for calming energy, lavender for sleep, or
                nettle for strength. Charge intention while meditating with the
                herbs.
              </p>
            </div>
          </div>
        </section>

        <section id='crystals' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            5. Crystals & Mineral Allies
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Crystals amplify intention and can anchor energy to your altar,
            body, or spell work.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Clear Quartz</h3>
              <p className='text-sm text-zinc-400'>
                Amplifies other stones and your intention. Keep near you for
                clarity.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Black Tourmaline
              </h3>
              <p className='text-sm text-zinc-400'>
                Protection stone—place near entryways or wear during heavy
                energetic spells.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Moonstone</h3>
              <p className='text-sm text-zinc-400'>
                Intuition, new beginnings, and lunar magick.
              </p>
            </div>
          </div>
        </section>

        <section id='journals' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            6. Journals & Book of Shadows
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Document your spells, dreams, and reflections. Writing enhances
            clarity and helps track progress.
          </p>
          <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
            <p className='text-sm text-zinc-400'>
              Include dates, intentions, ingredients, observations, and results.
              Revisit entries to refine rituals and honor growth.
            </p>
          </div>
        </section>

        <section id='digital' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>
            7. Digital Tools (Lunary)
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Lunary offers digital horoscopes, personalized charts, and insight
            notifications to complement your physical tools.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>
                Personalized Charts
              </h3>
              <p className='text-sm text-zinc-400'>
                Integrate birth data to keep rituals aligned with current
                transits and lunar phases.
              </p>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
              <h3 className='font-medium text-zinc-100 mb-2'>Notifications</h3>
              <p className='text-sm text-zinc-400'>
                Use push alerts to remember sabbats, retrogrades, and
                personalized reflections.
              </p>
            </div>
          </div>
        </section>

        <section id='faq' className='mb-16'>
          <h2 className='text-3xl font-light text-zinc-100 mb-6'>8. FAQ</h2>
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

        <section className='bg-gradient-to-r from-lunary-primary-900/30 to-cyan-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
          <h2 className='text-2xl font-light text-zinc-100 mb-4'>
            Ready to Start Your Crystal Journey?
          </h2>
          <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
            Explore our complete crystal library to find the perfect stones for
            your needs. Discover crystals matched to your zodiac sign and life
            intentions.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/grimoire/crystals'
              className='px-8 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
            >
              Browse Crystal Library
            </Link>
            <Link
              href='/pricing'
              className='px-8 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
            >
              Get Personalized Crystals
            </Link>
          </div>
        </section>

        <CosmicConnections
          entityType='crystal'
          entityKey='crystal-guide'
          title='Crystal Connections'
          sections={cosmicConnectionsSections}
        />
      </SEOContentTemplate>
    </>
  );
}
