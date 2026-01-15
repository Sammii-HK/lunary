import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { runesList } from '@/constants/runes';
import { stringToKebabCase } from '../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

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
    title: `${runeData.name} Rune (${runeData.symbol}): Meaning & Uses - Lunary`,
    description: `${runeData.name} rune meaning: ${runeData.meaning.toLowerCase()}. Symbol: ${runeData.symbol}. Learn ${runeData.name} magical properties, divination interpretations & how to use in spellwork.`,
    keywords: [
      `${runeData.name} rune`,
      `${runeData.name} meaning`,
      `rune ${runeData.symbol}`,
      `${runeData.name} magical properties`,
      `${runeData.meaning.toLowerCase()} rune`,
    ],
    url: `/grimoire/runes/${rune}`,
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

  // Entity schema for Knowledge Graph
  const runeSchema = createCosmicEntitySchema({
    name: `${runeData.name} Rune`,
    description: `${runeData.name} (${runeData.symbol}) is a rune meaning "${runeData.meaning}". ${runeData.notes}`,
    url: `/grimoire/runes/${rune}`,
    additionalType: 'https://en.wikipedia.org/wiki/Rune',
    keywords: [
      runeData.name,
      runeData.symbol,
      runeData.meaning,
      'rune',
      'elder futhark',
      ...runeData.magicalUses,
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(runeSchema)}
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

**Affirmation:** "${runeData.affirmation}"

**Practical Focus:** ${runeData.meaning} often shows up as a choice point. If this rune appears repeatedly, treat it as a reminder to focus on one concrete action that matches its energy rather than waiting for a sign to act.

**Reading Tips:**
Consider the question and the surrounding runes. ${runeData.name} can point to timing, inner attitude, or an external shift depending on the spread. Look for a single, grounded takeaway instead of multiple competing interpretations.

**Daily Practice:**
Pull one rune each morning and write one sentence about how its theme might appear that day. This builds familiarity and makes readings clearer over time.

**Casting Tip:**
When this rune appears with others, look for supporting themes or tension points. Two runes often create a small story: a challenge and a response.

**Integration:**
After a reading, pick one action that honors the rune’s message. Practical follow-through is the fastest way to learn the rune’s deeper layers.

If you work with reversals, read them as tension, delay, or internalization rather than pure negativity. The rune still points toward growth.`}
        tables={[
          {
            title: `${runeData.name} Quick Reference`,
            headers: ['Aspect', 'Detail'],
            rows: [
              ['Aett', runeData.aett],
              ['Element', runeData.element],
              ['Keywords', runeData.keywords.join(', ')],
              ['Magical Uses', runeData.magicalUses.join(', ')],
            ],
          },
          {
            title: 'Upright vs Reversed',
            headers: ['Upright', 'Reversed'],
            rows: [[runeData.uprightMeaning, runeData.reversedMeaning]],
          },
          {
            title: 'Practice Cues',
            headers: ['Cue', 'Focus'],
            rows: [
              ['Morning pull', 'Notice the main theme'],
              ['Evening review', 'Track how it showed up'],
            ],
          },
        ]}
        glyphs={[runeData.symbol]}
        symbolism={`${runeData.name} (${runeData.symbol}) is the ${runeData.aettPosition === 1 ? 'first' : runeData.aettPosition === 2 ? 'second' : runeData.aettPosition === 3 ? 'third' : `${runeData.aettPosition}th`} rune of ${runeData.aett}'s Aett in the Elder Futhark. It is associated with the ${runeData.element} element${runeData.deity ? ` and connected to ${runeData.deity}` : ''}.

**Keywords:** ${runeData.keywords.join(', ')}

**Magical Properties:** ${runeData.magicalProperties}

${runeData.notes}

Use this rune as a single focus point rather than mixing too many symbols at once. One rune, one intention keeps the signal clean.

If you want a simple practice, draw the rune on paper and place it somewhere visible for a day. Notice when the theme appears in your choices, conversations, or mood.`}
        howToWorkWith={runeData.magicalUses}
        rituals={[
          `Carve or draw ${runeData.symbol} on paper and place it under a candle for one evening.`,
          'Repeat the affirmation aloud for seven days and note any shifts.',
          'Meditate on the rune for five minutes, focusing on one keyword.',
          'Use the rune as a journal heading and write a short reflection.',
        ]}
        journalPrompts={[
          `How does the energy of ${runeData.keywords[0].toLowerCase()} manifest in my life?`,
          `What is ${runeData.name} trying to teach me right now?`,
          `How can I embody the affirmation: "${runeData.affirmation}"?`,
          `Where do I see ${runeData.meaning.toLowerCase()} themes appearing in my journey?`,
          'What one action would align me with this rune today?',
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
        cosmicConnections={
          <CosmicConnections
            entityType='tarot'
            entityKey={rune}
            title={`${runeData.name} Connections`}
            sections={[
              {
                title: 'Related Pages',
                links: [
                  { label: 'All Runes', href: '/grimoire/runes' },
                  { label: 'Divination', href: '/grimoire/divination' },
                  { label: 'Tarot Guide', href: '/grimoire/tarot' },
                  { label: 'Spells', href: '/grimoire/spells' },
                ],
              },
            ]}
          />
        }
      />
    </div>
  );
}
