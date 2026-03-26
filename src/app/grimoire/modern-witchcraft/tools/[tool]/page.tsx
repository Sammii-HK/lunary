import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createHowToSchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
const witchTools = {
  athame: {
    name: 'Athame',
    description:
      'A ritual knife used to direct energy and cast circles. The athame is not used for cutting physical objects—it cuts only energy and is associated with the element of Fire or Air depending on tradition.',
    uses: [
      'Casting and closing ritual circles',
      'Directing and channeling energy',
      'Invoking elemental quarters',
      'Cutting energetic cords and attachments',
      'Drawing sigils in the air',
      'The Great Rite (symbolic union)',
      'Charging and consecrating objects',
      'Banishing unwanted energies',
    ],
    element: 'Fire/Air',
    correspondences: [
      'Mars',
      'Masculine energy',
      'Will',
      'Protection',
      'Authority',
      'Command',
    ],
    care: [
      'Keep blade sharp symbolically but never cut physical items',
      'Cleanse regularly with smoke, moonlight, or salt',
      'Store wrapped in black or red cloth',
      'Consecrate before first use with the five elements',
      'Handle only by yourself to maintain personal energy',
      'Oil blade occasionally to prevent rust if steel',
    ],
    history:
      "The athame's origins trace to medieval grimoires like the Key of Solomon (14th-15th century), where ritual knives with specific inscriptions were prescribed for ceremonial magic. Gerald Gardner popularized the athame in modern Wicca during the 1940s-50s, drawing from ceremonial magic traditions. The word 'athame' may derive from the Arabic 'al-dhammé' (bloodletter) or Latin 'artavus' (small knife). In traditional Wicca, the athame is one of the primary working tools, representing the practitioner's will and the directed power of magic.",
    fireVsAir:
      "Different traditions assign the athame to different elements. In Gardnerian Wicca and Golden Dawn traditions, the athame is associated with Fire due to its forging in flames and its active, projective nature. Other traditions, including some ceremonial magic systems, associate it with Air due to its cutting, intellectual quality and its use in directing thought and intention. Neither is 'wrong'—choose the correspondence that resonates with your practice and tradition.",
    choosingGuide: {
      bladeLength: '5-7 inches is traditional, but personal preference matters',
      handleMaterial:
        'Black handles are traditional in Wicca; wood, bone, or antler in other traditions',
      bladeMaterial:
        'Steel is traditional; obsidian or flint for a more primal connection',
      double_edged: 'Traditional athames are double-edged, symbolizing balance',
    },
    advancedUses: [
      'Drawing pentagrams and invoking/banishing energy',
      'Creating a cone of power by raising the athame',
      'Symbolic cord cutting in release rituals',
      'Charging talismans and amulets by pointing energy',
      'Opening portals in hedge-crossing work',
    ],
    consecrationSteps: [
      {
        name: 'Cleanse the blade',
        text: 'Pass the athame through incense smoke (Air) and say: "By Air I cleanse you of all impurities."',
      },
      {
        name: 'Bless with Fire',
        text: 'Pass the blade quickly through a candle flame and say: "By Fire I consecrate you to my will."',
      },
      {
        name: 'Anoint with Water',
        text: 'Sprinkle blessed water on the blade and say: "By Water I purify you for sacred work."',
      },
      {
        name: 'Ground with Earth',
        text: 'Touch the blade to salt or earth and say: "By Earth I ground and stabilize your power."',
      },
      {
        name: 'Invoke Spirit',
        text: 'Hold the athame to your heart and say: "By Spirit I bind you to my purpose. You are now my magical tool."',
      },
    ],
    faqs: [
      {
        question: 'Do I need an athame to practice witchcraft?',
        answer:
          'No, an athame is a traditional tool but not required. Your finger, a wand, or even pure intention can direct energy. Many witches practice effectively without an athame. The tool serves to focus your will, but your will is the true source of magic.',
      },
      {
        question: 'What is the difference between an athame and a bolline?',
        answer:
          'The athame is for directing energy and never cuts physical objects. The bolline (usually white-handled) is the practical cutting knife used for harvesting herbs, cutting cords, carving candles, and other physical tasks. Some practitioners use only one knife for both purposes.',
      },
      {
        question: 'Is the athame Fire or Air element?',
        answer:
          'Both assignments are valid depending on your tradition. Gardnerian Wicca and Golden Dawn associate it with Fire (forged in flames, projective). Other systems link it to Air (cuts like thought, intellectual). Choose what resonates with your practice—there is no single correct answer.',
      },
      {
        question: 'Should my athame be sharp?',
        answer:
          'Traditionally yes, though it never cuts physical objects. The sharp edge symbolizes the keen nature of directed will and the ability to "cut" through obstacles, energies, and boundaries. A dull blade can work but lacks the symbolic potency.',
      },
      {
        question: 'How do I cleanse a used or second-hand athame?',
        answer:
          'First, cleanse it physically. Then pass it through all four elements: smoke (Air), flame (Fire), water, and salt/earth. Leave it under moonlight for a full cycle if possible. Finally, perform a full consecration ritual to attune it to your energy. Some practitioners bury it in earth for a moon cycle to fully reset its energy.',
      },
    ],
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

// Type for extended tool data (athame has extra fields)
type ExtendedToolData = (typeof witchTools)['athame'];
type BaseToolData = (typeof witchTools)['wand'];

function isExtendedTool(
  data: ExtendedToolData | BaseToolData,
): data is ExtendedToolData {
  return 'consecrationSteps' in data;
}

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

  // Enhanced meta for athame
  const title =
    tool === 'athame'
      ? 'Athame: Ritual Knife Meaning, Uses & How to Consecrate [Complete Guide]'
      : `${toolData.name}: Uses, Meaning & Care - Lunary`;
  const description =
    tool === 'athame'
      ? 'Learn about the athame ritual knife: meaning, uses, Fire vs Air element debate, how to choose one, and step-by-step consecration ritual. Complete witchcraft tool guide.'
      : `Learn about the ${toolData.name} in witchcraft. Discover its uses, elemental correspondences, care instructions, and how to incorporate it into your practice.`;

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

  // Base FAQs for all tools
  let faqs = [
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

  // Use extended FAQs for athame
  if (isExtendedTool(toolData) && toolData.faqs) {
    faqs = toolData.faqs;
  }

  // Build extended meaning content for athame
  let meaningContent = `Magical tools help practitioners focus energy, represent elements, and create sacred space. The ${toolData.name} is one of the traditional tools used in witchcraft and ceremonial magic.

${toolData.description}

## History & Origins

${toolData.history}`;

  // Add athame-specific extended content
  if (isExtendedTool(toolData)) {
    meaningContent += `

## The Fire vs Air Debate

${toolData.fireVsAir}

## Choosing Your Athame

When selecting an athame, consider these traditional guidelines:

- **Blade Length:** ${toolData.choosingGuide.bladeLength}
- **Handle Material:** ${toolData.choosingGuide.handleMaterial}
- **Blade Material:** ${toolData.choosingGuide.bladeMaterial}
- **Double-Edged:** ${toolData.choosingGuide.double_edged}

## Uses of the ${toolData.name}

${toolData.uses.map((u) => `- ${u}`).join('\n')}

## Advanced Uses

Once you've developed a relationship with your athame:

${toolData.advancedUses.map((u) => `- ${u}`).join('\n')}

## How to Consecrate Your Athame

Before using your athame in ritual for the first time, it should be consecrated using the five elements:

${toolData.consecrationSteps.map((step, i) => `${i + 1}. **${step.name}:** ${step.text}`).join('\n\n')}

After this ritual, your athame is attuned to your energy and ready for magical work.`;
  } else {
    meaningContent += `

The ${toolData.name} is associated with the ${toolData.element} element and carries correspondences of ${toolData.correspondences.join(', ').toLowerCase()}.

## Uses of the ${toolData.name}

${toolData.uses.map((u) => `- ${u}`).join('\n')}`;
  }

  meaningContent += `

While traditional tools like the ${toolData.name} are valued in many practices, remember that your intention and will are the true source of magic. Tools simply help focus and direct that energy.`;

  // Create HowTo schema for athame consecration
  const howToSchema = isExtendedTool(toolData)
    ? createHowToSchema({
        name: 'How to Consecrate an Athame',
        description:
          'A step-by-step guide to consecrating your athame using the five elements before first ritual use.',
        url: `https://lunary.app/grimoire/modern-witchcraft/tools/${tool}`,
        totalTime: 'PT15M',
        tools: [
          'Athame',
          'Candle',
          'Incense',
          'Bowl of water',
          'Salt or earth',
        ],
        steps: toolData.consecrationSteps,
      })
    : null;

  // Build tables
  const tables = [
    {
      title: `${toolData.name} Correspondences`,
      headers: ['Aspect', 'Details'],
      rows: [
        ['Element', toolData.element],
        ['Uses', toolData.uses.slice(0, 4).join(', ')],
        ['Correspondences', toolData.correspondences.join(', ')],
      ],
    },
  ];

  // Add choosing guide table for athame
  if (isExtendedTool(toolData)) {
    tables.push({
      title: 'Choosing Your Athame',
      headers: ['Aspect', 'Recommendation'],
      rows: [
        ['Blade Length', toolData.choosingGuide.bladeLength],
        ['Handle', toolData.choosingGuide.handleMaterial],
        ['Blade Material', toolData.choosingGuide.bladeMaterial],
        ['Double-Edged', toolData.choosingGuide.double_edged],
      ],
    });
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {howToSchema && renderJsonLd(howToSchema)}
      <SEOContentTemplate
        title={`${toolData.name} - Lunary`}
        h1={
          tool === 'athame'
            ? 'Athame: Complete Guide to the Ritual Knife'
            : `The ${toolData.name}: Complete Guide`
        }
        description={`Learn about the ${toolData.name} in witchcraft, its uses, and correspondences.`}
        keywords={
          tool === 'athame'
            ? [
                'athame',
                'athame witchcraft',
                'ritual knife',
                'athame meaning',
                'athame fire or air',
                'how to consecrate athame',
                'athame vs bolline',
                'witch tools',
              ]
            : [
                toolData.name.toLowerCase(),
                'witch tools',
                'ritual tools',
                'witchcraft',
              ]
        }
        canonicalUrl={`https://lunary.app/grimoire/modern-witchcraft/tools/${tool}`}
        intro={toolData.description}
        tldr={
          tool === 'athame'
            ? 'The athame is a ritual knife for directing energy, not cutting physical objects. Associated with Fire or Air (tradition varies). Consecrate before first use with the five elements. Never needs to be sharp in practice—only symbolically.'
            : `The ${toolData.name} represents ${toolData.element} and is used for ${toolData.uses[0].toLowerCase()}.`
        }
        meaning={meaningContent}
        emotionalThemes={toolData.correspondences}
        howToWorkWith={
          isExtendedTool(toolData)
            ? [
                'Choose an athame that calls to you—material matters less than connection',
                'Consecrate it using the five-element ritual before first use',
                'Store wrapped in black or red cloth away from others',
                'Handle only by yourself to maintain personal energy',
                'Use for directing energy, never for cutting physical objects',
                'Practice casting circles and invoking quarters',
              ]
            : [
                `Choose a ${toolData.name} that resonates with you`,
                'Cleanse and consecrate before first use',
                'Learn traditional uses and meanings',
                'Develop personal relationship with tool',
                'Care for it properly',
              ]
        }
        rituals={toolData.care}
        tables={tables}
        journalPrompts={
          tool === 'athame'
            ? [
                'What draws me to work with an athame?',
                'Do I feel the athame as Fire or Air? Why?',
                'How do I want to direct my will and energy?',
                'What does the athame teach me about boundaries?',
                'How can I develop a deeper relationship with this tool?',
              ]
            : [
                `How do I feel about working with a ${toolData.name}?`,
                `What qualities do I want in my ${toolData.name}?`,
                `How can I incorporate the ${toolData.name} into my practice?`,
                'What other tools am I drawn to?',
              ]
        }
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
          ...(tool === 'athame'
            ? [
                {
                  name: 'Wand',
                  href: '/grimoire/modern-witchcraft/tools/wand',
                  type: 'Tool',
                },
                {
                  name: 'Chalice',
                  href: '/grimoire/modern-witchcraft/tools/chalice',
                  type: 'Tool',
                },
              ]
            : []),
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { label: 'Tools', href: '/grimoire/modern-witchcraft/tools' },
          {
            label: toolData.name,
            href: `/grimoire/modern-witchcraft/tools/${tool}`,
          },
        ]}
        internalLinks={[
          {
            text: 'All Witch Tools',
            href: '/grimoire/modern-witchcraft/tools',
          },
          { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { text: 'Correspondences', href: '/grimoire/correspondences' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more witchcraft tools'
        ctaHref='/grimoire/modern-witchcraft/tools-guide'
        faqs={faqs}
      />
    </div>
  );
}
