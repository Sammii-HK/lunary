import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
const witchTools = {
  athame: {
    name: 'Athame',
    description:
      'A ritual knife used to direct energy and cast circles. The athame is not used for cutting physical objects—it cuts only energy and is associated with the element of Fire or Air.',
    uses: [
      'Casting circles',
      'Directing energy',
      'Invoking elements',
      'Cutting energetic cords',
      'Ritual work',
    ],
    element: 'Fire/Air',
    correspondences: ['Mars', 'Masculine energy', 'Will', 'Protection'],
    care: [
      "Keep blade sharp but don't cut physical items",
      'Cleanse regularly with smoke or moonlight',
      'Store wrapped in cloth',
      'Consecrate before first use',
    ],
    history:
      "The athame has roots in ceremonial magic and was adopted into Wicca by Gerald Gardner. It represents the witch's will and personal power.",
  },
  wand: {
    name: 'Wand',
    description:
      'A directing tool used to channel and focus magical energy. Wands are typically made from wood and can be decorated with crystals, symbols, or carvings.',
    uses: [
      'Directing energy',
      'Casting circles',
      'Invoking deities',
      'Blessing',
      'Spell work',
    ],
    element: 'Fire/Air',
    correspondences: ['Mercury', 'Direction', 'Focus', 'Creativity'],
    care: [
      'Choose wood that resonates with you',
      'Personalize with meaningful additions',
      'Cleanse with smoke or moonlight',
      'Store in a protected place',
    ],
    history:
      'Wands appear in magical traditions worldwide, from druids to ceremonial magicians. Each wood type carries different properties—oak for strength, willow for intuition, elder for protection.',
  },
  cauldron: {
    name: 'Cauldron',
    description:
      'A vessel for transformation, used for burning, brewing, scrying, and containing magical workings. The cauldron represents the womb of the Goddess and the element of Water.',
    uses: [
      'Burning herbs and papers',
      'Brewing potions',
      'Scrying',
      'Containing fire',
      'Transformation rituals',
    ],
    element: 'Water',
    correspondences: [
      'Moon',
      'Feminine energy',
      'Transformation',
      'The Goddess',
    ],
    care: [
      'Season cast iron cauldrons properly',
      'Never pour cold water into hot cauldron',
      'Clean after each use',
      'Store in dry place',
    ],
    history:
      "The cauldron is one of the most iconic witch tools, appearing in Celtic mythology (Cerridwen's cauldron) and fairy tales. It represents transformation and the mysteries of life, death, and rebirth.",
  },
  chalice: {
    name: 'Chalice',
    description:
      'A ritual cup representing the element of Water and feminine energy. The chalice holds ritual beverages and symbolizes the womb of the Goddess.',
    uses: [
      'Holding ritual drinks',
      'Offerings',
      'Representing Water element',
      'Great Rite symbolism',
      'Moon water collection',
    ],
    element: 'Water',
    correspondences: ['Moon', 'Venus', 'Feminine energy', 'Emotions'],
    care: [
      'Choose a material that speaks to you',
      'Cleanse before and after ritual use',
      'Never use for mundane drinking',
      'Store wrapped or covered',
    ],
    history:
      'The chalice appears in many traditions, from the Holy Grail to Wiccan ritual. It represents the feminine divine, receptivity, and the emotional realm.',
  },
  pentacle: {
    name: 'Pentacle',
    description:
      'A flat disk inscribed with a pentagram (five-pointed star), representing the element of Earth. The pentacle is used for grounding, protection, and consecrating objects.',
    uses: [
      'Altar centerpiece',
      'Grounding energy',
      'Protection',
      'Consecrating objects',
      'Earth magic',
    ],
    element: 'Earth',
    correspondences: ['Earth', 'Physical realm', 'Protection', 'Manifestation'],
    care: [
      'Keep on altar as focal point',
      'Cleanse with salt or earth',
      'Trace pentagram with intention',
      'Recharge under moonlight',
    ],
    history:
      'The pentagram represents the five elements—Earth, Air, Fire, Water, and Spirit. Each point corresponds to an element, with Spirit at the top. It has been used as a protective symbol for millennia.',
  },
};

const toolKeys = Object.keys(witchTools);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const toolData = witchTools[tool as keyof typeof witchTools];

  if (!toolData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${toolData.name}: Uses, Meaning & Care - Lunary`;
  const description = `Learn about the ${toolData.name} in witchcraft. Discover its uses, elemental correspondences, care instructions, and how to incorporate it into your practice.`;

  return {
    title,
    description,
    keywords: [
      toolData.name.toLowerCase(),
      `${toolData.name.toLowerCase()} witchcraft`,
      'witch tools',
      'ritual tools',
      'magical tools',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/modern-witchcraft/tools/${tool}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/modern-witchcraft/tools/${tool}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function WitchToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const toolData = witchTools[tool as keyof typeof witchTools];

  if (!toolData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is a ${toolData.name}?`,
      answer: toolData.description,
    },
    {
      question: `What element is the ${toolData.name} associated with?`,
      answer: `The ${toolData.name} is associated with the ${toolData.element} element. Its correspondences include ${toolData.correspondences.join(', ').toLowerCase()}.`,
    },
    {
      question: `How do I use a ${toolData.name}?`,
      answer: `The ${toolData.name} is used for ${toolData.uses.join(', ').toLowerCase()}.`,
    },
    {
      question: `Do I need a ${toolData.name} to practice witchcraft?`,
      answer: `No, you don't need any specific tools to practice witchcraft. The ${toolData.name} is a traditional tool that many find helpful, but your intention and will are the most important elements of any practice.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${toolData.name} - Lunary`}
        h1={`The ${toolData.name}: Complete Guide`}
        description={`Learn about the ${toolData.name} in witchcraft, its uses, and correspondences.`}
        keywords={[
          toolData.name.toLowerCase(),
          'witch tools',
          'ritual tools',
          'witchcraft',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/modern-witchcraft/tools/${tool}`}
        intro={toolData.description}
        tldr={`The ${toolData.name} represents ${toolData.element} and is used for ${toolData.uses[0].toLowerCase()}.`}
        meaning={`Magical tools help practitioners focus energy, represent elements, and create sacred space. The ${toolData.name} is one of the traditional tools used in witchcraft and ceremonial magic.

${toolData.description}

${toolData.history}

The ${toolData.name} is associated with the ${toolData.element} element and carries correspondences of ${toolData.correspondences.join(', ').toLowerCase()}.

Uses of the ${toolData.name}:
${toolData.uses.map((u) => `- ${u}`).join('\n')}

While traditional tools like the ${toolData.name} are valued in many practices, remember that your intention and will are the true source of magic. Tools simply help focus and direct that energy.`}
        emotionalThemes={toolData.correspondences}
        howToWorkWith={[
          `Choose a ${toolData.name} that resonates with you`,
          'Cleanse and consecrate before first use',
          'Learn traditional uses and meanings',
          'Develop personal relationship with tool',
          'Care for it properly',
        ]}
        rituals={toolData.care}
        tables={[
          {
            title: `${toolData.name} Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Element', toolData.element],
              ['Uses', toolData.uses.join(', ')],
              ['Correspondences', toolData.correspondences.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `How do I feel about working with a ${toolData.name}?`,
          `What qualities do I want in my ${toolData.name}?`,
          `How can I incorporate the ${toolData.name} into my practice?`,
          'What other tools am I drawn to?',
        ]}
        relatedItems={[
          {
            name: 'Witchcraft Tools',
            href: '/grimoire/modern-witchcraft/tools-guide',
            type: 'Guide',
          },
          {
            name: 'Modern Witchcraft',
            href: '/grimoire/modern-witchcraft',
            type: 'Guide',
          },
          {
            name: 'Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          {
            label: toolData.name,
            href: `/grimoire/modern-witchcraft/tools/${tool}`,
          },
        ]}
        internalLinks={[
          { text: 'Witchcraft Tools', href: '/grimoire/witchcraft-tools' },
          { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { text: 'Altar Setup', href: '/grimoire/spells/fundamentals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more witchcraft tools'
        ctaHref='/grimoire/modern-witchcraft/tools-guide'
        faqs={faqs}
      />
    </div>
  );
}
