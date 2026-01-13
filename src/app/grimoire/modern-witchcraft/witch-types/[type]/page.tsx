import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import type { FAQItem } from '@/components/grimoire/SEOContentTemplate';

const witchTypes = {
  'green-witch': {
    name: 'Green Witch',
    seo: {
      title: 'Green Witch Meaning: Traits, Practices, Tools | Lunary',
      description:
        'Green witch meaning centres on plant magic, herbalism, and nature-led spellcraft. Learn green witch traits, practices, tools, and how to begin safely.',
      h1: 'Green witch meaning',
      intro:
        'Green witch meaning describes a practitioner whose craft is rooted in plants, seasons, and the living intelligence of nature. It is a practical path that blends herbal knowledge, earth-based rituals, and gentle daily devotion to growth, healing, and belonging.',
      tldr: 'Green witches focus on herbs, plants, and seasonal cycles. You might be one if you feel most grounded when working with gardens, wild places, remedies, and earth-centred rituals.',
      keywords: [
        'green witch',
        'green witch meaning',
        'green witchcraft',
        'plant magic',
        'herbalism',
        'nature witch',
        'witch types',
      ],
    },
    focuses: [
      'Herbalism',
      'Plant magic',
      'Nature connection',
      'Healing',
      'Earth magic',
    ],
    practices: [
      'Growing herbs and magical plants',
      'Creating herbal remedies and infusions',
      'Working with plant spirits and folklore',
      'Seasonal rituals and land offerings',
      'Nature journalling and observational practice',
    ],
    tools: [
      'Mortar and pestle',
      'Herb drying rack or hangers',
      'Plant identification guide',
      'Glass jars for blends and teas',
      'A small garden kit or windowsill pots',
    ],
    element: 'Earth',
    strengths: [
      'Healing ability',
      'Patience and consistency',
      'Seasonal awareness',
      'Grounded intuition',
    ],
    traits: [
      'You feel calmer outdoors than indoors',
      'You collect herbs, leaves, petals, seeds, and little found gifts',
      'You prefer rituals you can do daily, quietly, and practically',
      'You learn through observation: weather, soil, seasons, cycles',
    ],
    beginnerSteps: [
      'Start a tiny herb space (windowsill is perfect)',
      'Learn five common herbs and their safe uses',
      'Create one simple ritual: watering plants with intention',
      'Track moon phases and seasonal shifts in a journal',
    ],
    misconceptions: [
      'You do not need a garden to be a green witch',
      'This path is not about perfect knowledge, it is about relationship and respect',
    ],
    safetyNote:
      'If you ingest herbs or use essential oils, research safety, interactions, and pregnancy guidance, and keep dosages conservative.',
    starterRitual: {
      title: 'Starter ritual: a simple herb blessing',
      steps: [
        'Choose one herb you already have (tea, spice jar, or a plant).',
        'Hold it and name what you want to grow (calm, confidence, health).',
        'Say: “May this herb carry my intention into my days.”',
        'Use it once this week with gratitude.',
      ],
    },
  },

  'kitchen-witch': {
    name: 'Kitchen Witch',
    seo: {
      title: 'Kitchen Witch Meaning: Traits, Practices, Tools | Lunary',
      description:
        'Kitchen witch meaning centres on hearth magic, cooking with intention, and home blessing. Learn kitchen witch traits, practices, tools, and how to start.',
      h1: 'Kitchen witch meaning',
      intro:
        'Kitchen witch meaning describes a practitioner who turns everyday nourishment into spellwork. This path is cosy but powerful: protection, comfort, and intention woven into meals, routines, and the feeling of home.',
      tldr: 'Kitchen witches practise hearth magic through cooking, baking, and home rituals. You might be one if your most natural spellwork happens while stirring, seasoning, cleaning, and caring.',
      keywords: [
        'kitchen witch',
        'kitchen witch meaning',
        'kitchen witchcraft',
        'hearth magic',
        'home blessing',
        'cooking magic',
        'witch types',
      ],
    },
    focuses: [
      'Cooking magic',
      'Hearth magic',
      'Home blessing',
      'Practical magic',
      'Nurturing',
    ],
    practices: [
      'Infusing food with intention',
      'Kitchen spellwork and simmer pots',
      'Home protection and cleansing routines',
      'Seasonal feasts and ritual meals',
      'Creating a recipe grimoire',
    ],
    tools: [
      'Wooden spoon',
      'Cast iron or favourite pan',
      'Herb and spice collection',
      'Salt, honey, cinnamon, rosemary staples',
      'A recipe notebook or digital grimoire',
    ],
    element: 'Fire and Earth',
    strengths: [
      'Practical spirituality',
      'Comfort and warmth',
      'Protection through routine',
      'Community building',
    ],
    traits: [
      'You feel most centred when feeding yourself or others',
      'You love traditions, recipes, and seasonal foods',
      'You do ritual without calling it ritual',
      'Your magic works best when it is useful and repeatable',
    ],
    beginnerSteps: [
      'Pick one intention meal per week',
      'Make a simple simmer pot (citrus, cinnamon, herbs)',
      'Bless your home with salt at thresholds',
      'Write down what worked and how it felt',
    ],
    misconceptions: [
      'Kitchen witchcraft is not less serious because it is domestic',
      'You do not need to cook elaborate meals for your magic to count',
    ],
    safetyNote:
      'Be careful with open flames, oils, and smoke. Ventilate well and keep rituals simple if you have pets.',
    starterRitual: {
      title: 'Starter ritual: an intention tea or toast',
      steps: [
        'Make tea or toast, something simple.',
        'As you prepare it, name the quality you want to invite in.',
        'Stir or spread clockwise and say: “May this nourish what I am becoming.”',
        'Eat or drink slowly, present, no scrolling.',
      ],
    },
  },

  'hedge-witch': {
    name: 'Hedge Witch',
    seo: {
      title: 'Hedge Witch Meaning: Traits, Practices, Tools | Lunary',
      description:
        'Hedge witch meaning centres on folk magic, liminal rituals, and spirit-led practice. Learn hedge witch traits, tools, practices, and how to begin safely.',
      h1: 'Hedge witch meaning',
      intro:
        'Hedge witch meaning describes a solitary practitioner who works at the threshold between the ordinary and the unseen: dreams, intuition, trance, folklore, and spirit communication.',
      tldr: 'Hedge witches practise liminal, spirit-adjacent craft through dreams, divination, folk magic, and trance. You might be one if you feel pulled towards thresholds, symbolism, and deep inner knowing.',
      keywords: [
        'hedge witch',
        'hedge witch meaning',
        'hedge witchcraft',
        'folk magic',
        'dream work',
        'spirit work',
        'witch types',
      ],
    },
    focuses: [
      'Spirit work',
      'Dream work',
      'Folk magic',
      'Divination',
      'Healing',
    ],
    practices: [
      'Dream journalling and interpretation',
      'Trance work and guided journeying',
      'Traditional folk remedies (with safety)',
      'Protective charms and wards',
      'Solitary ritual and ancestral connection',
    ],
    tools: [
      'Dream journal',
      'Divination tool (tarot, pendulum, runes)',
      'Protective herbs (rosemary, mugwort, bay)',
      'A small ancestral space or photo',
      'A bell or chime for clearing',
    ],
    element: 'Spirit and Air',
    strengths: [
      'Psychic sensitivity',
      'Symbolic thinking',
      'Independence',
      'Deep healing insight',
    ],
    traits: [
      'Your dreams feel loud, symbolic, and meaningful',
      'You are drawn to folklore, liminal places, dusk, forests, crossroads',
      'You prefer solitude and quiet for spiritual work',
      'You need strong boundaries to stay regulated',
    ],
    beginnerSteps: [
      'Start a dream journal for 14 days',
      'Learn basic energetic protection (simple, consistent)',
      'Choose one divination method and practise weekly',
      'Create a small threshold ritual for entering and leaving trance',
    ],
    misconceptions: [
      'Hedge witchcraft does not require risky practices or substances',
      'Being solitary does not mean being isolated or unsupported',
    ],
    safetyNote:
      'Prioritise grounding and protection. If you feel overwhelmed, pause spirit work and focus on rest, routine, and body-based calm.',
    starterRitual: {
      title: 'Starter ritual: a dream threshold',
      steps: [
        'Before sleep, dim lights and put your phone away.',
        'Place a notebook beside your bed.',
        'Say: “Only what serves my wellbeing may enter my dreams.”',
        'On waking, write even one sentence. Consistency is the spell.',
      ],
    },
  },

  'sea-witch': {
    name: 'Sea Witch',
    seo: {
      title: 'Sea Witch Meaning: Traits, Practices, Tools | Lunary',
      description:
        'Sea witch meaning centres on water magic, tides, moon phases, and emotional cleansing. Learn sea witch traits, practices, tools, and how to begin.',
      h1: 'Sea witch meaning',
      intro:
        'Sea witch meaning describes a practitioner who draws power from water: oceans, rivers, rain, mist, and the tidal pull of the moon. This path is intuitive and cleansing, built for feeling deeply and transforming gently.',
      tldr: 'Sea witches work with tides, lunar cycles, and water-based cleansing. You might be one if you feel restored by water, led by intuition, and called to emotional healing work.',
      keywords: [
        'sea witch',
        'sea witch meaning',
        'sea witchcraft',
        'water magic',
        'moon magic',
        'tide magic',
        'witch types',
      ],
    },
    focuses: [
      'Water magic',
      'Moon work',
      'Emotional healing',
      'Cleansing',
      'Sea spirits',
    ],
    practices: [
      'Moon water and ritual baths',
      'Tide timing and release rituals',
      'Water scrying and intuitive journalling',
      'Salt cleansing and protection',
      'Offerings of gratitude to waterways',
    ],
    tools: [
      'Sea salt',
      'A bowl of water for scrying',
      'Shells, sea glass, or river stones',
      'A moon phase tracker',
      'A small cloth for altar wrapping',
    ],
    element: 'Water',
    strengths: [
      'Emotional intelligence',
      'Adaptability',
      'Cleansing power',
      'Strong intuition',
    ],
    traits: [
      'You process life through feeling first, logic second',
      'You are soothed by baths, rain sounds, oceans, rivers',
      'You are good at releasing and beginning again',
      'You notice lunar shifts in mood and energy',
    ],
    beginnerSteps: [
      'Track the moon phase for one cycle',
      'Do one weekly release ritual with water',
      'Learn a simple salt protection practice',
      'Create a calm, consistent cleansing routine',
    ],
    misconceptions: [
      'You do not need to live near the sea to be a sea witch',
      'This path is not about drama, it is about flow and regulation',
    ],
    safetyNote:
      'Be respectful with natural bodies of water. Avoid leaving offerings that harm wildlife or ecosystems.',
    starterRitual: {
      title: 'Starter ritual: a gentle release bowl',
      steps: [
        'Fill a bowl with water and add a pinch of salt.',
        'Name what you are releasing (stress, fear, a habit).',
        'Stir anti-clockwise three times and breathe slowly.',
        'Pour it down the sink and wash your hands with intention.',
      ],
    },
  },

  'cosmic-witch': {
    name: 'Cosmic Witch',
    seo: {
      title: 'Cosmic Witch Meaning: Traits, Practices, Tools | Lunary',
      description:
        'Cosmic witch meaning centres on celestial energy, astrology, and planetary timing. Learn cosmic witch traits, practices, tools, and how to start working with the sky.',
      h1: 'Cosmic witch meaning',
      intro:
        'Cosmic witch meaning describes a practitioner who works with the sky as a living clock. It blends astrology, planetary symbolism, and celestial timing to choose the right moment, amplify intention, and understand personal cycles through the movement of the heavens.',
      tldr: 'Cosmic witches work with astrology, planetary rituals, and celestial timing. You might be one if you feel pulled towards star lore, transits, eclipses, and the bigger story behind everyday life.',
      keywords: [
        'cosmic witch',
        'cosmic witch meaning',
        'cosmic witchcraft',
        'celestial witch',
        'star witch',
        'planetary magic',
        'witch types',
      ],
    },
    focuses: [
      'Astrology',
      'Planetary magic',
      'Star work',
      'Celestial timing',
      'Cosmic consciousness',
    ],
    practices: [
      'Astrological timing for rituals',
      'Planetary correspondences and talismans',
      'Star gazing and sky journalling',
      'Eclipse and retrograde reflection',
      'Seasonal turning points and solstice rites',
    ],
    tools: [
      'Birth chart or star chart',
      'Planetary symbols and correspondences list',
      'A moon phase and transit tracker',
      'Candles or colours linked to planets',
      'A journal for timing experiments',
    ],
    element: 'Spirit and Fire',
    strengths: [
      'Timing awareness',
      'Big-picture perspective',
      'Pattern recognition',
      'Imaginative clarity',
    ],
    traits: [
      'You notice patterns across time and want meaning in cycles',
      'You feel energised by eclipses, new moons, full moons, retrogrades',
      'You like systems: correspondences, charts, timing, rituals',
      'You use the sky as guidance, not as a rulebook',
    ],
    beginnerSteps: [
      'Learn your Sun, Moon, and Rising signs',
      'Track the moon phases for one month',
      'Choose one planet to study for a week',
      'Test timing: repeat the same ritual on two different moon phases and compare',
    ],
    misconceptions: [
      'Cosmic witchcraft is not about fear-based astrology',
      'You can work with the sky without being technical',
    ],
    safetyNote:
      'Astrology is a tool for reflection and timing, not a substitute for professional advice or personal agency.',
    starterRitual: {
      title: 'Starter ritual: a new moon intention check-in',
      steps: [
        'On the new moon, write one intention in plain language.',
        'Write one action you can take within 48 hours.',
        'Say: “I move with the sky, and I still choose my life.”',
        'Take the action, even if it is small.',
      ],
    },
  },

  'eclectic-witch': {
    name: 'Eclectic Witch',
    seo: {
      title: 'Eclectic Witch Meaning: Traits, Practices, Tools | Lunary',
      description:
        'Eclectic witch meaning centres on building a personal practice from multiple traditions. Learn eclectic witch traits, practices, tools, and how to stay grounded.',
      h1: 'Eclectic witch meaning',
      intro:
        'Eclectic witch meaning describes a practitioner who follows curiosity and builds a personal craft from many influences. This path values experimentation, discernment, and authenticity, blending what works while respecting origins and staying grounded.',
      tldr: 'Eclectic witches combine traditions and tools into a practice that fits their life. You might be one if you love learning, adapting, and creating your own rituals without needing one rigid label.',
      keywords: [
        'eclectic witch',
        'eclectic witch meaning',
        'eclectic witchcraft',
        'modern witchcraft',
        'witchcraft practice',
        'witch types',
      ],
    },
    focuses: [
      'Personal path',
      'Multiple traditions',
      'Intuitive practice',
      'Experimentation',
      'Individual expression',
    ],
    practices: [
      'Blending traditions with respect and research',
      'Building personal rituals and routines',
      'Learning from books, mentors, and lived experience',
      'Trying different divination methods',
      'Creating a flexible grimoire system',
    ],
    tools: [
      'A grimoire system (notes, cards, or app)',
      'A small rotating altar space',
      'One divination tool',
      'Candles, salt, and cleansing tools',
      'Anything that feels personal and meaningful',
    ],
    element: 'All elements',
    strengths: [
      'Flexibility',
      'Creativity',
      'Discernment over time',
      'Broad knowledge',
    ],
    traits: [
      'You collect tools and ideas and test what actually works',
      'You do not fit neatly into one tradition',
      'You are happiest when your practice evolves',
      'You value meaning and results over aesthetics alone',
    ],
    beginnerSteps: [
      'Choose one core weekly ritual for consistency',
      'Pick one tradition to study deeply before mixing',
      'Keep a what I tried, what happened log',
      'Build a small protection and grounding routine',
    ],
    misconceptions: [
      'Eclectic does not mean careless or random',
      'You can be eclectic while still being respectful, researched, and consistent',
    ],
    safetyNote:
      'When learning from closed practices or cultures not your own, prioritise respect and reputable sources. When unsure, do not borrow.',
    starterRitual: {
      title: 'Starter ritual: your three-pillar practice',
      steps: [
        'Pick three pillars: protection, clarity, and nourishment.',
        'Choose one simple practice for each (salt, journalling, tea).',
        'Do them for seven days in a row.',
        'Keep what works. Release what does not.',
      ],
    },
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
  const title = typeData.seo.title;
  const description = typeData.seo.description;

  return {
    title,
    description,
    keywords: typeData.seo.keywords,
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

  const pageTitle = typeData.seo.title;
  const pageH1 = typeData.seo.h1;
  const pageDescription = typeData.seo.description;
  const pageIntro = typeData.seo.intro;
  const pageTldr = typeData.seo.tldr;
  const pageKeywords = typeData.seo.keywords;

  const pageFaqList: FAQItem[] = [
    {
      question: `What is a ${typeData.name.toLowerCase()}?`,
      answer: typeData.seo.intro,
    },
    {
      question: `What are common ${typeData.name.toLowerCase()} traits?`,
      answer: `Common traits include: ${typeData.traits.join(', ').toLowerCase()}.`,
    },
    {
      question: `How do you start as a ${typeData.name.toLowerCase()}?`,
      answer: `Start with these beginner steps: ${typeData.beginnerSteps.join(', ').toLowerCase()}.`,
    },
    {
      question: `What tools does a ${typeData.name.toLowerCase()} use?`,
      answer: `Typical tools include: ${typeData.tools.join(', ').toLowerCase()}.`,
    },
    {
      question: 'Is this witch type beginner friendly?',
      answer:
        'Yes. You do not need to be “advanced” to begin. Start small, repeat what works, and let your practice grow through consistency rather than intensity.',
    },
  ];
  const pageInternalLinks = [
    {
      text: 'Witch Types Hub',
      href: '/grimoire/modern-witchcraft/witch-types',
    },
    { text: 'Modern Witchcraft Guide', href: '/grimoire/modern-witchcraft' },
    {
      text: 'Witchcraft Tools',
      href: '/grimoire/modern-witchcraft/tools-guide',
    },
    { text: 'Spellcraft Fundamentals', href: '/grimoire/spells/fundamentals' },
    { text: 'Grimoire Home', href: '/grimoire' },
  ];
  const internalLinksTitle = 'Explore more in the Grimoire';

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={pageTitle}
        h1={pageH1}
        description={pageDescription}
        keywords={pageKeywords}
        canonicalUrl={`https://lunary.app/grimoire/modern-witchcraft/witch-types/${type}`}
        intro={pageIntro}
        tldr={pageTldr}
        meaning={`In modern witchcraft, “witch types” are simply ways to describe what your practice naturally centres on. They are not ranks, rules, or exclusive boxes. Many people blend paths, or shift over time.

${typeData.seo.intro}

## What a ${typeData.name} focuses on
${typeData.focuses.map((f) => `- ${f}`).join('\n')}

## Common ${typeData.name.toLowerCase()} traits
${typeData.traits.map((t) => `- ${t}`).join('\n')}

## Typical practices
${typeData.practices.map((p) => `- ${p}`).join('\n')}

## Tools you might love
${typeData.tools.map((t) => `- ${t}`).join('\n')}

## Strengths of this path
${typeData.strengths.map((s) => `- ${s}`).join('\n')}

## Beginner steps
${typeData.beginnerSteps.map((s) => `- ${s}`).join('\n')}

## Starter ritual
**${typeData.starterRitual.title}**
${typeData.starterRitual.steps.map((s) => `- ${s}`).join('\n')}

## Common misconceptions
${typeData.misconceptions.map((m) => `- ${m}`).join('\n')}

## Safety note
${typeData.safetyNote}

If you feel drawn to this path, start small and repeat what feels good. In witchcraft, consistency is often more powerful than intensity.`}
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
        internalLinks={pageInternalLinks}
        internalLinksTitle={internalLinksTitle}
        ctaText='Explore your witchcraft path'
        ctaHref='/grimoire/modern-witchcraft'
        faqs={pageFaqList}
      />
    </div>
  );
}
