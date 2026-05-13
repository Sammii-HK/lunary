import { Metadata } from 'next';
import { NavParamLink } from '@/components/NavParamLink';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  getAllRisingSigns,
  getPublicRisingSignSlug,
} from '@/lib/rising-signs/getRisingSign';
import { elementAstro, zodiacSymbol } from '@/constants/symbols';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

export const revalidate = 2592000;

export const metadata: Metadata = {
  title:
    'Rising Signs (Ascendant) Guide: All 12 Rising Signs Explained - Lunary',
  description:
    'Discover what your rising sign (ascendant) means. Learn how each of the 12 rising signs shapes first impressions, appearance, and outer personality.',
  keywords: [
    'rising signs',
    'ascendant',
    'rising sign meaning',
    'ascendant signs',
    'what is my rising sign',
    'rising sign calculator',
    'ascendant astrology',
  ],
  openGraph: {
    title: 'Rising Signs Guide: All 12 Ascendants Explained',
    description:
      'Complete guide to all 12 rising signs. Learn how your ascendant shapes first impressions and appearance.',
    type: 'article',
    url: 'https://lunary.app/grimoire/rising',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/rising',
  },
};

const elementColors: Record<string, string> = {
  Fire: 'border-red-700 bg-red-950/30',
  Earth: 'border-green-700 bg-green-950/30',
  Air: 'border-sky-700 bg-sky-950/30',
  Water: 'border-blue-700 bg-blue-950/30',
};

const elementGlyphs: Record<'Fire' | 'Earth' | 'Air' | 'Water', string> = {
  Fire: elementAstro.fire,
  Earth: elementAstro.earth,
  Air: elementAstro.air,
  Water: elementAstro.water,
};

export default function RisingSignsPage() {
  const risingSigns = getAllRisingSigns();

  const byElement = risingSigns.reduce(
    (acc, rising) => {
      if (!acc[rising.element]) acc[rising.element] = [];
      acc[rising.element].push(rising);
      return acc;
    },
    {} as Record<string, typeof risingSigns>,
  );

  return (
    <SEOContentTemplate
      title='Rising Signs (Ascendant) Guide: All 12 Rising Signs Explained'
      h1='Rising Signs (Ascendant) Guide'
      description='Your rising sign sets the chart horizon. It shapes first impressions, embodiment, instinctive approach, and the sign that governs the rest of the house sequence.'
      keywords={[
        'rising signs',
        'ascendant',
        'rising sign meaning',
        'ascendant signs',
        'rising sign calculator',
      ]}
      canonicalUrl='https://lunary.app/grimoire/rising'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Rising Signs' },
      ]}
      whatIs={{
        question: 'What is a rising sign?',
        answer:
          'Your rising sign, or Ascendant, is the zodiac sign rising on the eastern horizon at the moment of birth. It describes outer style and first instinct, but more importantly it sets the first house and the structural orientation of the chart.',
      }}
      tldr='The Ascendant is not cosmetic fluff. It sets the chart frame. Read the rising sign, then its ruler, then the first house, then the ruler’s aspects.'
      intro='Your rising sign, or ascendant, is the zodiac sign that was rising on the eastern horizon at the moment of your birth. It shapes your first impressions, physical appearance, and how others perceive you.'
      meaning={`The useful way to read an Ascendant is not just “what vibe do I give off?” Your rising sign sets the first house and the whole house sequence of the chart. That means the sign itself matters, but so does the ruler of that sign, the house that ruler lands in, and the aspects it makes. Lunary treats the Ascendant as the structural key to the chart, not a cosmetic extra.\n\nIf you want to read a rising sign properly, use this order: identify the Ascendant sign, find its ruler, locate that ruler by house and sign, then check the ruler's strongest aspects. That tells you how the outer style, first instinct, and chart direction actually work in practice.`}
      howToWorkWith={[
        'Start with the Ascendant sign as the chart entry point.',
        'Find the ruler of that sign and see where it lands.',
        'Read the first house for embodiment and immediate orientation.',
        'Use decans only after the sign, ruler, and first house are clear.',
      ]}
      tableOfContents={[
        { label: 'What a rising sign is', href: '#what-is' },
        { label: 'How to read the Ascendant', href: '#meaning' },
        { label: 'Rising signs by element', href: '#rising-elements' },
        {
          label: 'How Lunary reads rising signs',
          href: '#lunary-rising-method',
        },
        { label: 'FAQ', href: '#faq' },
      ]}
      faqs={[
        {
          question: 'How is a rising sign different from a Sun sign?',
          answer:
            'Your Sun sign describes core identity and vitality. Your rising sign describes your chart orientation, your instinctive outer style, and the sign that sets the house structure.',
        },
        {
          question: 'Do I need my birth time to know my rising sign?',
          answer:
            'Yes. The Ascendant changes roughly every two hours, so an accurate birth time matters much more here than it does for a Sun sign.',
        },
      ]}
      internalLinks={[
        { text: '1st House', href: '/grimoire/houses/1st-house' },
        {
          text: 'Birth Chart Guide',
          href: '/grimoire/guides/birth-chart-complete-guide',
        },
        {
          text: 'Rulerships and Dignities',
          href: '/grimoire/astrology/rulerships-and-dignities',
        },
      ]}
      sources={[
        {
          name: 'Lunary Ascendant interpretation framework',
          url: 'https://lunary.app/about/methodology',
        },
        {
          name: 'Astronomy Engine chart-angle calculations',
          url: 'https://github.com/cosinekitty/astronomy',
        },
        { name: 'Traditional Ascendant and chart-ruler doctrine' },
      ]}
      ctaText='Calculate your rising sign'
      ctaHref='/birth-chart'
      childrenPosition='before-faqs'
      cosmicConnections={
        <CosmicConnections
          entityType='hub-placements'
          entityKey='placements'
          title='Ascendant Connections'
        />
      }
    >
      <section id='rising-elements' className='space-y-10'>
        {(['Fire', 'Earth', 'Air', 'Water'] as const).map((element) => (
          <section key={element} className='space-y-4'>
            <h2 className='text-2xl font-medium text-content-primary'>
              <span className='font-astro mr-2 text-lunary-primary-400 leading-none'>
                {elementGlyphs[element]}
              </span>
              {element} Rising Signs
            </h2>
            <p className='text-content-muted'>
              {element === 'Fire' &&
                'Bold, energetic, and action-oriented first impressions.'}
              {element === 'Earth' &&
                'Grounded, reliable, and practical outer presence.'}
              {element === 'Air' &&
                'Intellectual, communicative, and socially engaging.'}
              {element === 'Water' &&
                'Intuitive, emotional, and deeply perceptive.'}
            </p>
            <div className='grid md:grid-cols-2 gap-4'>
              {byElement[element]?.map((rising) => {
                const signSlug = getPublicRisingSignSlug(rising.slug);
                const glyph =
                  zodiacSymbol[signSlug as keyof typeof zodiacSymbol];

                return (
                  <NavParamLink
                    key={rising.slug}
                    href={`/grimoire/rising/${signSlug}`}
                    className={`p-5 rounded-lg border ${elementColors[element]} hover:border-lunary-primary-600 transition-all`}
                  >
                    <div className='flex items-center justify-between gap-3 mb-2'>
                      <span className='flex items-center gap-3 text-lg font-medium text-content-primary'>
                        {glyph && (
                          <span className='font-astro text-2xl text-lunary-primary-400 leading-none'>
                            {glyph}
                          </span>
                        )}
                        {rising.sign} Rising
                      </span>
                      <span className='text-xs text-content-muted'>
                        Ruled by {rising.ruler}
                      </span>
                    </div>
                    <p className='text-sm text-content-muted mb-3'>
                      {rising.firstImpression.slice(0, 120)}...
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {rising.coreTraits.slice(0, 2).map((trait) => (
                        <span
                          key={trait}
                          className='text-xs px-2 py-1 rounded bg-surface-card text-content-muted'
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </NavParamLink>
                );
              })}
            </div>
          </section>
        ))}
      </section>

      <section
        id='lunary-rising-method'
        className='p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/40'
      >
        <h2 className='text-2xl font-medium text-content-primary'>
          How Lunary Reads Rising Signs
        </h2>
        <div className='mt-4 space-y-4 text-content-secondary'>
          <p>
            Lunary combines astronomical chart-angle calculation with
            traditional Ascendant doctrine. The sign on the Ascendant describes
            the entry point into life. The chart ruler shows how that sign
            actually behaves. The first house describes the body and immediate
            orientation to the world. Decans then refine the tone further when
            you need more precision.
          </p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Ascendant sign: outer style, approach, first reaction</li>
            <li>Chart ruler: the operating system behind the Ascendant</li>
            <li>First house: embodiment, instinct, and visibility</li>
            <li>Decans: nuance inside the sign once the basics are clear</li>
          </ul>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
