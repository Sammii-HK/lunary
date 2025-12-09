import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { runesList } from '@/constants/runes';
import { stringToKebabCase } from '../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

const runeKeys = Object.keys(runesList);

export async function generateStaticParams() {
  return runeKeys.map((rune) => ({
    rune: stringToKebabCase(rune),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rune: string }>;
}) {
  const { rune } = await params;
  const runeKey = runeKeys.find(
    (r) => stringToKebabCase(r) === rune.toLowerCase(),
  );

  if (!runeKey) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  const runeData = runesList[runeKey as keyof typeof runesList];

  return createGrimoireMetadata({
    title: `${runeData.name} Rune Meaning: ${runeData.meaning} - Lunary`,
    description: `Discover the complete meaning of ${runeData.name} rune (${runeData.symbol}). Learn about ${runeData.name} meaning, magical properties, and how to use this rune in divination and spellwork.`,
    keywords: [
      `${runeData.name} rune`,
      `${runeData.name} meaning`,
      `rune ${runeData.symbol}`,
      `${runeData.name} magical properties`,
      `${runeData.meaning} rune`,
    ],
    url: `https://lunary.app/grimoire/runes/${rune}`,
    ogImagePath: '/api/og/grimoire/runes',
    ogImageAlt: `${runeData.name} Rune`,
  });
}

export default async function RunePage({
  params,
}: {
  params: Promise<{ rune: string }>;
}) {
  const { rune } = await params;
  const runeKey = runeKeys.find(
    (r) => stringToKebabCase(r) === rune.toLowerCase(),
  );

  if (!runeKey) {
    notFound();
  }

  const runeData = runesList[runeKey as keyof typeof runesList];

  const faqs = [
    {
      question: `What does ${runeData.name} rune mean?`,
      answer: `${runeData.name} (${runeData.symbol}) means "${runeData.meaning}". ${runeData.divinationMeaning}`,
    },
    {
      question: `What does ${runeData.name} mean upright in a reading?`,
      answer: runeData.uprightMeaning,
    },
    {
      question: `What does ${runeData.name} mean reversed?`,
      answer: runeData.reversedMeaning,
    },
    {
      question: `How do I use ${runeData.name} in spellwork?`,
      answer: `${runeData.name} can be used for ${runeData.magicalUses.join(', ').toLowerCase()}. ${runeData.notes}`,
    },
    {
      question: `What is the history of ${runeData.name}?`,
      answer: runeData.history,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${runeData.name} Rune - Lunary`}
        h1={`${runeData.name} Rune: Complete Guide`}
        description={`Discover everything about ${runeData.name} rune. Learn about its meaning, magical properties, and how to use it in divination and spellwork.`}
        keywords={[
          `${runeData.name} rune`,
          `${runeData.name} meaning`,
          `rune ${runeData.symbol}`,
          `${runeData.name} magical`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/runes/${rune}`}
        intro={`${runeData.name} (${runeData.symbol}) is an Elder Futhark rune meaning "${runeData.meaning}". Pronounced "${runeData.pronunciation}", it belongs to ${runeData.aett}'s Aett and is associated with the element of ${runeData.element}${runeData.deity ? ` and the deity ${runeData.deity}` : ''}.`}
        tldr={`${runeData.name} (${runeData.symbol}) means "${runeData.meaning}" and represents ${runeData.keywords.slice(0, 4).join(', ').toLowerCase()}.`}
        meaning={`${runeData.history}

**Upright Meaning:**
${runeData.uprightMeaning}

**Reversed Meaning:**
${runeData.reversedMeaning}

**In Divination:**
${runeData.divinationMeaning}

**Affirmation:** "${runeData.affirmation}"`}
        glyphs={[runeData.symbol]}
        symbolism={`${runeData.name} (${runeData.symbol}) is the ${runeData.aettPosition === 1 ? 'first' : runeData.aettPosition === 2 ? 'second' : runeData.aettPosition === 3 ? 'third' : `${runeData.aettPosition}th`} rune of ${runeData.aett}'s Aett in the Elder Futhark. It is associated with the ${runeData.element} element${runeData.deity ? ` and connected to ${runeData.deity}` : ''}.

**Keywords:** ${runeData.keywords.join(', ')}

**Magical Properties:** ${runeData.magicalProperties}

${runeData.notes}`}
        howToWorkWith={runeData.magicalUses}
        journalPrompts={[
          `How does the energy of ${runeData.keywords[0].toLowerCase()} manifest in my life?`,
          `What is ${runeData.name} trying to teach me right now?`,
          `How can I embody the affirmation: "${runeData.affirmation}"?`,
          `Where do I see ${runeData.meaning.toLowerCase()} themes appearing in my journey?`,
        ]}
        relatedItems={[
          {
            name: 'Runes Guide',
            href: '/grimoire/runes',
            type: 'Guide',
          },
          {
            name: 'Divination',
            href: '/grimoire/divination',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Runes', href: '/grimoire/runes' },
          {
            label: runeData.name,
            href: `/grimoire/runes/${rune}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore All Runes', href: '/grimoire/runes' },
          { text: 'Learn Divination', href: '/grimoire/divination' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
