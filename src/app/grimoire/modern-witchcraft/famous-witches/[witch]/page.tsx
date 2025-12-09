import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { stringToKebabCase } from '../../../../../../utils/string';

const witchTypes = {
  'green-witch': {
    name: 'Green Witch',
    description:
      'Works closely with nature, plants, and earth energy. Focuses on herbalism, gardening, and natural magic. Deep connection to the seasons and natural cycles.',
    practices: [
      'Herbalism and plant magic',
      'Gardening with intention',
      'Working with earth energy',
      'Seasonal celebrations',
      'Natural remedies and healing',
    ],
  },
  'kitchen-witch': {
    name: 'Kitchen Witch',
    description:
      'Practices magic through cooking, baking, and home care. Infuses daily activities with intention. Magic happens in the kitchen and home.',
    practices: [
      'Cooking with intention',
      'Baking magical treats',
      'Home protection and cleansing',
      'Infusing food with energy',
      'Creating sacred space at home',
    ],
  },
  'hedge-witch': {
    name: 'Hedge Witch',
    description:
      'Works between worlds, practices astral travel, and communicates with spirits. Often solitary, focuses on liminal spaces and boundaries between realms.',
    practices: [
      'Astral travel and journeying',
      'Spirit communication',
      'Working with liminal spaces',
      'Divination and scrying',
      'Boundary work and protection',
    ],
  },
  'sea-witch': {
    name: 'Sea Witch',
    description:
      'Connected to water, ocean, and tides. Works with sea salt, shells, and water magic. Draws power from lunar cycles and ocean energy.',
    practices: [
      'Water magic and rituals',
      'Working with tides and lunar cycles',
      'Sea salt magic',
      'Shell and ocean item work',
      'Lunar and water-based spellwork',
    ],
  },
  'cosmic-witch': {
    name: 'Cosmic Witch',
    description:
      'Focuses on astrology, planetary magic, and cosmic energies. Works with planetary correspondences, astrological timing, and celestial forces.',
    practices: [
      'Astrological timing for spells',
      'Planetary magic and correspondences',
      'Working with cosmic energies',
      'Star and constellation work',
      'Astronomical observation and magic',
    ],
  },
  'eclectic-witch': {
    name: 'Eclectic Witch',
    description:
      'Draws from multiple traditions and practices. Creates a personalized path combining elements from various sources. Highly individual and adaptable.',
    practices: [
      'Combining multiple traditions',
      'Creating personalized practices',
      'Adapting methods to fit your needs',
      'Learning from various sources',
      'Building your own unique path',
    ],
  },
};

type WitchKey = keyof typeof witchTypes;

export async function generateStaticParams() {
  return Object.keys(witchTypes).map((key) => ({
    witch: key,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ witch: string }>;
}): Promise<Metadata> {
  const { witch } = await params;
  const witchData = witchTypes[witch as WitchKey];

  if (!witchData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${witchData.name} Path: Complete Guide - Lunary`;
  const description = `${witchData.description} Learn about ${witchData.name} practices, philosophy, and how to walk this witchcraft path.`;

  return {
    title,
    description,
    keywords: [
      `${witchData.name}`,
      `${witchData.name} path`,
      `${witchData.name} practices`,
      'witchcraft paths',
      'types of witches',
      stringToKebabCase(witchData.name),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/modern-witchcraft/famous-witches/${witch}`,
    },
  };
}

export default async function WitchPage({
  params,
}: {
  params: Promise<{ witch: string }>;
}) {
  const { witch } = await params;
  const witchData = witchTypes[witch as WitchKey];

  if (!witchData) {
    notFound();
  }

  const meaning = `The ${witchData.name} path is one of many approaches to modern witchcraft. ${witchData.description}

This path emphasizes ${witchData.practices[0]?.toLowerCase() || 'specific practices'} and offers practitioners a way to connect with magic that aligns with their natural inclinations and interests. What makes this path unique is its focus on ${witchData.practices.slice(0, 2).join(' and ').toLowerCase()}.

Walking the ${witchData.name} path means integrating these practices into your daily life, not just performing rituals occasionally. It's about developing a deep connection with your chosen focus area and living your practice authentically.`;

  const howToWorkWith = [
    `Research and learn about ${witchData.name.toLowerCase()} practices`,
    `Start with basic practices: ${witchData.practices[0]?.toLowerCase() || 'begin with fundamentals'}`,
    'Build a regular practice schedule',
    'Connect with others walking similar paths',
    'Trust your intuition and adapt practices to fit your needs',
    'Keep a journal of your experiences and insights',
    'Incorporate practices into your daily life',
    'Celebrate your growth and acknowledge small wins',
  ];

  const faqs = [
    {
      question: `Do I need to follow the ${witchData.name} path exclusively?`,
      answer:
        'Not at all! Many practitioners combine elements from multiple paths. You might be primarily one type of witch but also incorporate practices from other traditions. Your path is yours to define.',
    },
    {
      question: `How do I know if the ${witchData.name} path is right for me?`,
      answer: `If you feel drawn to ${witchData.practices[0]?.toLowerCase() || 'these practices'} and find yourself naturally gravitating toward this type of work, it's likely a good fit. Trust your intuition—if it feels right, explore it further.`,
    },
    {
      question: `What tools do I need for the ${witchData.name} path?`,
      answer: `Start with what you have. Many ${witchData.name.toLowerCase()} practices can be done with minimal or no tools. As you develop your practice, you'll naturally discover what tools enhance your work.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${witchData.name} Path: Complete Guide - Lunary`}
      h1={`${witchData.name} Path`}
      description={`${witchData.description} Learn about ${witchData.name} practices, philosophy, and how to walk this witchcraft path.`}
      keywords={[
        `${witchData.name}`,
        `${witchData.name} path`,
        `${witchData.name} practices`,
        'witchcraft paths',
        'types of witches',
        stringToKebabCase(witchData.name),
      ]}
      canonicalUrl={`https://lunary.app/grimoire/modern-witchcraft/famous-witches/${witch}`}
      intro={`The ${witchData.name} path is one of many approaches to modern witchcraft. This comprehensive guide covers everything you need to know about this path, including its practices, philosophy, and how to get started.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      emotionalThemes={witchData.practices}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
        {
          label: 'Famous Witches',
          href: '/grimoire/modern-witchcraft/famous-witches',
        },
        {
          label: witchData.name,
          href: `/grimoire/modern-witchcraft/famous-witches/${witch}`,
        },
      ]}
      internalLinks={[
        { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
        { text: 'Spellcraft Practices', href: '/grimoire/practices' },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ]}
    />
  );
}
