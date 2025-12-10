import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CHINESE_ANIMALS,
  CHINESE_ZODIAC_DATA,
  ChineseAnimal,
} from '@/constants/seo/chinese-zodiac';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

export async function generateStaticParams() {
  return CHINESE_ANIMALS.map((animal) => ({ animal }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ animal: string }>;
}) {
  const { animal } = await params;
  const data = CHINESE_ZODIAC_DATA[animal as ChineseAnimal];

  if (!data) {
    return { title: 'Chinese Zodiac Not Found | Lunary' };
  }

  return createGrimoireMetadata({
    title: `${data.displayName} Chinese Zodiac: Personality, Compatibility & Years | Lunary`,
    description: `Year of the ${data.displayName} ${data.emoji} - Chinese zodiac personality traits, compatibility, lucky numbers, and which years are ${data.displayName} years. Complete guide to the ${data.displayName} in Chinese astrology.`,
    keywords: [
      `year of the ${data.animal}`,
      `${data.animal} chinese zodiac`,
      `chinese zodiac ${data.animal}`,
      `${data.animal} personality`,
      `${data.animal} compatibility`,
      `${data.animal} years`,
      'chinese astrology',
      'chinese horoscope',
    ],
    url: `https://lunary.app/grimoire/chinese-zodiac/${animal}`,
    ogImagePath: `/api/og/cosmic?title=${encodeURIComponent(`${data.emoji} Year of the ${data.displayName}`)}`,
    ogImageAlt: `${data.displayName} Chinese Zodiac`,
  });
}

export default async function ChineseZodiacAnimalPage({
  params,
}: {
  params: Promise<{ animal: string }>;
}) {
  const { animal } = await params;
  const data = CHINESE_ZODIAC_DATA[animal as ChineseAnimal];

  if (!data) {
    notFound();
  }

  const animalIndex = CHINESE_ANIMALS.indexOf(animal as ChineseAnimal);
  const prevAnimal =
    animalIndex > 0 ? CHINESE_ANIMALS[animalIndex - 1] : CHINESE_ANIMALS[11];
  const nextAnimal =
    animalIndex < 11 ? CHINESE_ANIMALS[animalIndex + 1] : CHINESE_ANIMALS[0];

  // Entity schema for Knowledge Graph
  const chineseZodiacSchema = createCosmicEntitySchema({
    name: `${data.displayName} Chinese Zodiac`,
    description: `The ${data.displayName} is the ${animalIndex + 1}${animalIndex === 0 ? 'st' : animalIndex === 1 ? 'nd' : animalIndex === 2 ? 'rd' : 'th'} animal in the Chinese zodiac. Years: ${data.years.slice(0, 4).join(', ')}. Traits: ${data.traits.slice(0, 4).join(', ')}.`,
    url: `/grimoire/chinese-zodiac/${animal}`,
    additionalType: 'https://en.wikipedia.org/wiki/Chinese_zodiac',
    keywords: [
      `${data.displayName.toLowerCase()} chinese zodiac`,
      `year of the ${data.displayName.toLowerCase()}`,
      'chinese zodiac',
      'chinese astrology',
      ...data.traits.slice(0, 3),
    ],
  });

  return (
    <>
      {renderJsonLd(chineseZodiacSchema)}
      <SEOContentTemplate
        title={`Year of the ${data.displayName}`}
        h1={`${data.emoji} ${data.displayName} Chinese Zodiac`}
        description={`The ${data.displayName} is the ${animalIndex + 1}${animalIndex === 0 ? 'st' : animalIndex === 1 ? 'nd' : animalIndex === 2 ? 'rd' : 'th'} animal in the Chinese zodiac cycle. People born in ${data.displayName} years are known for being ${data.traits.slice(0, 3).join(', ')}.`}
        keywords={[
          `${data.animal} chinese zodiac`,
          `year of the ${data.animal}`,
          'chinese astrology',
          data.displayName,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/chinese-zodiac/${animal}`}
        datePublished='2025-01-01'
        dateModified='2025-12-06'
        articleSection='Chinese Zodiac'
        whatIs={{
          question: `What is the Year of the ${data.displayName} in Chinese zodiac?`,
          answer: `The ${data.displayName} is a ${data.yinYang} ${data.element} sign in Chinese astrology. People born in ${data.displayName} years (${data.years.slice(-5).join(', ')}) are characterized by being ${data.traits.slice(0, 4).join(', ')}. The ${data.displayName} is most compatible with ${data.compatibleWith.map((a) => CHINESE_ZODIAC_DATA[a].displayName).join(' and ')}.`,
        }}
        tldr={`${data.displayName} Years: ${data.years.slice(-4).join(', ')}. Element: ${data.element}. Compatible with: ${data.compatibleWith.map((a) => CHINESE_ZODIAC_DATA[a].displayName).join(', ')}. Key traits: ${data.traits.slice(0, 3).join(', ')}.`}
        meaning={`
## ${data.displayName} Personality Traits

People born in the Year of the ${data.displayName} are known for their ${data.traits.join(', ')} nature. As a ${data.yinYang} ${data.element} sign, ${data.displayName} individuals possess unique qualities that set them apart.

### Strengths

${data.displayName} people excel in ${data.strengths.join(', ')}. These qualities make them valuable friends, partners, and colleagues.

### Areas for Growth

Like all signs, the ${data.displayName} has areas to work on: ${data.weaknesses.join(', ')}. Awareness of these tendencies helps ${data.displayName} individuals grow.

### Career Paths

${data.displayName} people often thrive in careers such as ${data.careerPaths.join(', ')}. Their natural talents align well with these professions.

### Famous ${data.displayName} People

Notable people born in ${data.displayName} years include ${data.famousPeople.join(', ')}.
      `}
        rituals={[
          `Wear ${data.luckyColors.join(' or ')} for good fortune`,
          `Display ${data.luckyFlowers.join(' or ')} in your home`,
          `Celebrate Chinese New Year with ${data.displayName} imagery`,
        ]}
        emotionalThemes={data.traits.map(
          (t) => t.charAt(0).toUpperCase() + t.slice(1),
        )}
        signsMostAffected={[data.displayName]}
        tables={[
          {
            title: `${data.displayName} Quick Reference`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Animal', `${data.displayName} ${data.emoji}`],
              ['Element', data.element],
              ['Yin/Yang', data.yinYang],
              ['Recent Years', data.years.slice(-5).join(', ')],
              ['Lucky Numbers', data.luckyNumbers.join(', ')],
              ['Lucky Colors', data.luckyColors.join(', ')],
              ['Lucky Flowers', data.luckyFlowers.join(', ')],
            ],
          },
          {
            title: 'Compatibility',
            headers: ['Type', 'Signs'],
            rows: [
              [
                'Best Matches',
                data.compatibleWith
                  .map((a) => CHINESE_ZODIAC_DATA[a].displayName)
                  .join(', '),
              ],
              [
                'Challenging',
                data.incompatibleWith
                  .map((a) => CHINESE_ZODIAC_DATA[a].displayName)
                  .join(', '),
              ],
            ],
          },
        ]}
        relatedItems={[
          ...data.compatibleWith.slice(0, 2).map((a) => ({
            name: `${CHINESE_ZODIAC_DATA[a].displayName} Chinese Zodiac`,
            href: `/grimoire/chinese-zodiac/${a}`,
            type: 'Chinese Zodiac' as const,
          })),
          {
            name: 'Chinese Zodiac Overview',
            href: '/grimoire/chinese-zodiac',
            type: 'Guide',
          },
        ]}
        ctaText='Discover your complete Chinese astrology profile'
        ctaHref='/birth-chart'
        sources={[
          { name: 'Traditional Chinese Astrology' },
          { name: 'Chinese zodiac calendar calculations' },
        ]}
      >
        <div className='mt-8 flex justify-between text-sm'>
          <Link
            href={`/grimoire/chinese-zodiac/${prevAnimal}`}
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            ← {CHINESE_ZODIAC_DATA[prevAnimal].emoji}{' '}
            {CHINESE_ZODIAC_DATA[prevAnimal].displayName}
          </Link>
          <Link
            href={`/grimoire/chinese-zodiac/${nextAnimal}`}
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            {CHINESE_ZODIAC_DATA[nextAnimal].displayName}{' '}
            {CHINESE_ZODIAC_DATA[nextAnimal].emoji} →
          </Link>
        </div>

        <div className='mt-6 flex flex-wrap gap-2 justify-center'>
          {CHINESE_ANIMALS.map((a) => (
            <Link
              key={a}
              href={`/grimoire/chinese-zodiac/${a}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                a === animal
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {CHINESE_ZODIAC_DATA[a].emoji}{' '}
              {CHINESE_ZODIAC_DATA[a].displayName}
            </Link>
          ))}
        </div>
      </SEOContentTemplate>
    </>
  );
}
