import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const witchTypes = {
  'green-witch': {
    name: 'Green Witch',
    description:
      'A witch who works primarily with plants, herbs, and nature. Green witches find their magic in gardens, forests, and the natural world.',
    focuses: [
      'Herbalism',
      'Plant magic',
      'Nature connection',
      'Healing',
      'Earth magic',
    ],
    practices: [
      'Growing herbs and magical plants',
      'Creating herbal remedies and potions',
      'Working with plant spirits',
      'Forest bathing and nature rituals',
      'Ecological awareness',
    ],
    tools: [
      'Mortar and pestle',
      'Herb drying racks',
      'Garden tools',
      'Plant identification guides',
      'Pressed flower books',
    ],
    element: 'Earth',
    strengths: [
      'Healing abilities',
      'Plant knowledge',
      'Connection to seasons',
      'Environmental awareness',
    ],
  },
  'kitchen-witch': {
    name: 'Kitchen Witch',
    description:
      'A witch who finds magic in cooking, baking, and the hearth. Kitchen witches infuse their food and home with magical intention.',
    focuses: [
      'Cooking magic',
      'Hearth magic',
      'Home blessing',
      'Practical magic',
      'Nurturing',
    ],
    practices: [
      'Infusing food with intention',
      'Kitchen spell work',
      'Home protection and blessing',
      'Creating magical recipes',
      'Celebrating with food',
    ],
    tools: [
      'Wooden spoons',
      'Cast iron cookware',
      'Herb and spice collection',
      'Handmade dishware',
      'Recipe grimoire',
    ],
    element: 'Fire/Earth',
    strengths: [
      'Nurturing magic',
      'Practical spirituality',
      'Community building',
      'Comfort and warmth',
    ],
  },
  'hedge-witch': {
    name: 'Hedge Witch',
    description:
      'A solitary witch who walks between worlds, practicing folk magic, herbalism, and spirit communication. The "hedge" represents the boundary between worlds.',
    focuses: [
      'Spirit work',
      'Astral travel',
      'Folk magic',
      'Divination',
      'Healing',
    ],
    practices: [
      'Crossing between worlds',
      'Spirit communication',
      'Dream work',
      'Traditional folk remedies',
      'Solitary practice',
    ],
    tools: [
      'Flying ointments',
      'Spirit vessels',
      'Divination tools',
      'Herbal medicines',
      'Ancestral items',
    ],
    element: 'Spirit/Air',
    strengths: [
      'Spirit communication',
      'Psychic abilities',
      'Healing wisdom',
      'Independence',
    ],
  },
  'sea-witch': {
    name: 'Sea Witch',
    description:
      'A witch who draws power from the ocean, rivers, and water. Sea witches work with tides, water spirits, and marine correspondences.',
    focuses: [
      'Water magic',
      'Moon work',
      'Emotional healing',
      'Weather magic',
      'Sea spirits',
    ],
    practices: [
      'Tide magic',
      'Collecting sea treasures',
      'Storm and weather work',
      'Emotional cleansing',
      'Water scrying',
    ],
    tools: [
      'Shells and sea glass',
      'Driftwood',
      'Salt water',
      'Ocean-themed altar',
      'Moon water',
    ],
    element: 'Water',
    strengths: [
      'Emotional intuition',
      'Adaptability',
      'Cleansing abilities',
      'Moon connection',
    ],
  },
  'cosmic-witch': {
    name: 'Cosmic Witch',
    description:
      'A witch who works with celestial energies, astrology, and the cosmos. Cosmic witches draw power from stars, planets, and celestial events.',
    focuses: [
      'Astrology',
      'Planetary magic',
      'Star work',
      'Celestial timing',
      'Cosmic consciousness',
    ],
    practices: [
      'Astrological timing',
      'Planetary rituals',
      'Star gazing',
      'Eclipse magic',
      'Celestial correspondences',
    ],
    tools: [
      'Star charts',
      'Telescope or star app',
      'Planetary symbols',
      'Meteorites',
      'Celestial-themed altar',
    ],
    element: 'Spirit/Fire',
    strengths: [
      'Timing magic',
      'Big-picture awareness',
      'Planetary attunement',
      'Cosmic perspective',
    ],
  },
  'eclectic-witch': {
    name: 'Eclectic Witch',
    description:
      'A witch who draws from multiple traditions and creates their own unique practice. Eclectic witches follow their intuition and blend various approaches.',
    focuses: [
      'Personal path',
      'Multiple traditions',
      'Intuitive practice',
      'Experimentation',
      'Individual expression',
    ],
    practices: [
      'Blending traditions',
      'Following intuition',
      'Personal ritual creation',
      'Continuous learning',
      'Adapting practices',
    ],
    tools: [
      'Varied and personal',
      'Items from multiple traditions',
      'Personal creations',
      'Intuitive selections',
      'Evolving toolkit',
    ],
    element: 'All elements',
    strengths: [
      'Flexibility',
      'Creativity',
      'Personal authenticity',
      'Broad knowledge',
    ],
  },
};

const typeKeys = Object.keys(witchTypes);

export async function generateStaticParams() {
  return typeKeys.map((type) => ({
    type: type,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const typeData = witchTypes[type as keyof typeof witchTypes];

  if (!typeData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${typeData.name}: Path, Practices & Tools - Lunary`;
  const description = `Discover the ${typeData.name} path. Learn about ${typeData.name.toLowerCase()} practices, tools, and how to know if this witchcraft path is right for you.`;

  return {
    title,
    description,
    keywords: [
      typeData.name.toLowerCase(),
      `${typeData.name.toLowerCase()} witchcraft`,
      'witch types',
      'witchcraft paths',
      'modern witchcraft',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`,
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

export default async function WitchTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const typeData = witchTypes[type as keyof typeof witchTypes];

  if (!typeData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is a ${typeData.name}?`,
      answer: typeData.description,
    },
    {
      question: `What does a ${typeData.name} practice?`,
      answer: `${typeData.name} practitioners focus on ${typeData.focuses.join(', ').toLowerCase()}. Common practices include ${typeData.practices.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What tools does a ${typeData.name} use?`,
      answer: `${typeData.name} tools typically include ${typeData.tools.join(', ').toLowerCase()}.`,
    },
    {
      question: `How do I know if I'm a ${typeData.name}?`,
      answer: `You might be a ${typeData.name} if you're drawn to ${typeData.focuses[0].toLowerCase()} and feel connected to the ${typeData.element} element. Trust your intuition and explore what resonates.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${typeData.name} - Lunary`}
        h1={`${typeData.name}: Complete Guide`}
        description={`Discover the ${typeData.name} path, practices, and tools.`}
        keywords={[
          typeData.name.toLowerCase(),
          'witchcraft',
          'witch types',
          'modern witchcraft',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`}
        intro={typeData.description}
        tldr={`The ${typeData.name} focuses on ${typeData.focuses.slice(0, 2).join(' and ').toLowerCase()}. Element: ${typeData.element}.`}
        meaning={`In modern witchcraft, practitioners often identify with specific paths or types that resonate with their interests, abilities, and spiritual calling. The ${typeData.name} is one such path.

${typeData.description}

${typeData.name} practitioners are drawn to ${typeData.focuses.join(', ').toLowerCase()}. Their magic is centered around these themes, creating a focused and meaningful practice.

Common ${typeData.name} practices include:
${typeData.practices.map((p) => `- ${p}`).join('\n')}

The ${typeData.element} element strongly influences ${typeData.name} work. Understanding and working with this elemental energy deepens the practice and strengthens magical results.

Strengths of the ${typeData.name} path:
${typeData.strengths.map((s) => `- ${s}`).join('\n')}

Remember that witch types are not exclusive—many practitioners blend multiple paths or evolve their practice over time. The ${typeData.name} path is simply one lens through which to explore and develop your craft.`}
        emotionalThemes={typeData.focuses}
        howToWorkWith={[
          `Explore ${typeData.focuses[0].toLowerCase()} practices`,
          `Gather ${typeData.name.toLowerCase()} tools`,
          `Study ${typeData.element} element correspondences`,
          'Connect with like-minded practitioners',
          'Trust your intuitive path',
        ]}
        tables={[
          {
            title: `${typeData.name} Overview`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Focuses', typeData.focuses.join(', ')],
              ['Element', typeData.element],
              ['Tools', typeData.tools.join(', ')],
              ['Strengths', typeData.strengths.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `What draws me to the ${typeData.name} path?`,
          `How can I incorporate ${typeData.focuses[0].toLowerCase()} into my practice?`,
          `What ${typeData.name.toLowerCase()} tools do I want to work with?`,
          'How does this path align with my spiritual goals?',
        ]}
        relatedItems={[
          {
            name: 'Modern Witchcraft',
            href: '/grimoire/modern-witchcraft',
            type: 'Guide',
          },
          {
            name: 'Witchcraft Tools',
            href: '/grimoire/modern-witchcraft/tools-guide',
            type: 'Guide',
          },
          {
            name: 'Spellcraft',
            href: '/grimoire/spells/fundamentals',
            type: 'Practice',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          {
            label: typeData.name,
            href: `/grimoire/modern-witchcraft/witch-types/${type}`,
          },
        ]}
        internalLinks={[
          {
            text: 'Modern Witchcraft Guide',
            href: '/grimoire/modern-witchcraft',
          },
          {
            text: 'Witchcraft Tools',
            href: '/grimoire/modern-witchcraft/tools-guide',
          },
          {
            text: 'Spellcraft Fundamentals',
            href: '/grimoire/spells/fundamentals',
          },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore your witchcraft path'
        ctaHref='/grimoire/modern-witchcraft'
        faqs={faqs}
      />
    </div>
  );
}
