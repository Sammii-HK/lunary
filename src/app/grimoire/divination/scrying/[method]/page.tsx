import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
const scryingMethods = {
  'crystal-ball': {
    name: 'Crystal Ball Scrying',
    description:
      'The classic and most iconic form of scrying, using a clear or smoky crystal sphere to receive visions, messages, and prophetic insights from beyond the veil.',
    tools: [
      'Crystal ball (clear quartz, obsidian, amethyst, or glass)',
      'Dark velvet or silk cloth for the base',
      'Candles for soft, ambient lighting',
      'Optional: incense for atmosphere',
      'Scrying journal and pen',
    ],
    technique:
      'Place your crystal ball on a dark cloth in a dimly lit room. Sit comfortably with the ball at eye level. Gaze softly into the crystal without focusing your eyes—let your vision relax and blur slightly. Allow your mind to quiet and become receptive. Images, colors, mists, or impressions will begin to form naturally within the sphere. Do not strain or force visions; simply observe what arises.',
    history:
      'Crystal gazing dates back thousands of years to ancient civilizations including the Druids, Romans, Greeks, and Egyptians. The practice gained particular fame during the Renaissance when Dr. John Dee, advisor to Queen Elizabeth I, used his "shew stone" (a smoky quartz crystal) to communicate with angels. Medieval seers and cunning folk used crystal balls extensively. The tradition continues today as one of the most respected forms of scrying.',
    tips: [
      'Use dim, flickering candlelight rather than electric light',
      'Relax your eyes completely—avoid staring or straining',
      'Allow at least 15-30 minutes for a session',
      'Keep a scrying journal to record all visions immediately',
      'Cleanse your crystal regularly with moonlight or smoke',
      'Ask a specific question before beginning',
    ],
    symbolism:
      'The crystal ball represents the infinite depths of consciousness and the universe. Its spherical shape symbolizes wholeness, cycles, and the all-seeing eye. Clear quartz amplifies psychic abilities, while obsidian connects to shadow realms and hidden truths.',
    bestFor: [
      'General divination and guidance',
      'Seeing future possibilities',
      'Receiving messages from guides',
      'Developing psychic vision',
      'Meditation and trance work',
    ],
    commonExperiences: [
      'Clouds or mists forming in the crystal',
      'Colors swirling and shifting',
      'Faces, landscapes, or symbols appearing',
      'Sense of depth or falling into the sphere',
      'Sudden knowing or impressions',
    ],
    preparation: [
      'Cleanse your crystal ball before each session',
      'Set sacred space with incense or salt',
      'Ground and center yourself through breathing',
      'State your intention or question clearly',
      'Enter a light meditative state',
    ],
    affirmation:
      'I gaze into the crystal depths, and the universe reveals its secrets to my inner eye.',
  },
  'black-mirror': {
    name: 'Black Mirror Scrying',
    description:
      'A powerful and intense form of scrying using a dark, reflective surface to peer into other realms, contact spirits, and receive profound visions from the void.',
    tools: [
      'Black mirror (obsidian, black glass, or dark-backed glass)',
      'Candles placed behind you (never reflecting in mirror)',
      'Completely dark room',
      'Optional: mugwort incense for visions',
      'Protective circle or salt boundary',
    ],
    technique:
      'Position your black mirror so it reflects nothing—complete darkness should fill its surface. Light candles behind you so no flame appears in the mirror. Gaze into the absolute blackness, allowing your eyes to relax and your mind to enter trance. The void will begin to shift and move. Faces, scenes, symbols, or entities may emerge from the darkness. This method induces deeper trance states than other scrying forms.',
    history:
      'Black mirror scrying (catoptromancy) has ancient roots in Mesoamerica where Aztec priests used obsidian mirrors to communicate with the god Tezcatlipoca ("Smoking Mirror"). European magicians adopted the practice, with Dr. John Dee also using obsidian mirrors alongside his crystal. Medieval witches favored black mirrors for spirit communication. The practice connects to the concept of the "dark glass" through which we see dimly.',
    tips: [
      'Ensure absolutely no reflections appear in the mirror',
      'Work in complete darkness except for candles behind you',
      'Use this method for deeper trance states',
      'Excellent for spirit contact and necromancy',
      'Always use protection when working with the void',
      'Ground thoroughly after sessions',
    ],
    symbolism:
      'The black mirror represents the void, the subconscious, and the realm of spirits. Its darkness symbolizes the unknown, death, and transformation. Looking into blackness confronts us with shadow and reveals hidden truths.',
    bestFor: [
      'Spirit communication and contact',
      'Deep trance and altered states',
      'Shadow work and confronting fears',
      'Receiving messages from the deceased',
      'Accessing hidden knowledge',
      'Advanced magical workings',
    ],
    commonExperiences: [
      'The darkness seeming to swirl or move',
      'Faces appearing and shifting',
      'Sense of presence or being watched',
      'Scenes from other times or places',
      'Communication with entities or spirits',
    ],
    preparation: [
      'Cast a protective circle before beginning',
      'Cleanse and consecrate your mirror',
      'Enter the work with clear intention',
      'Have grounding tools nearby (food, earth)',
      'Know how to close the session properly',
    ],
    warnings: [
      'Black mirror work is intense—build up gradually',
      'Always use magical protection',
      'Ground thoroughly afterward',
      'Not recommended for beginners',
      'Close the session formally when finished',
    ],
    affirmation:
      'I gaze into the sacred darkness, protected and open, receiving wisdom from the void.',
  },
  'water-scrying': {
    name: 'Water Scrying',
    description:
      'One of the oldest and most accessible forms of scrying, using still water in a dark bowl or natural body to receive visions, guidance, and prophetic insights connected to lunar and emotional energies.',
    tools: [
      'Dark bowl or cauldron filled with water',
      'Black ink or dark dye (optional for depth)',
      'Moonlight (ideal) or candlelight',
      'Silver coin or moonstone (optional)',
      'Natural spring water if possible',
    ],
    technique:
      "Fill a dark-colored bowl with water and place it where moonlight or soft candlelight can reach it. Allow any ripples to completely settle until the surface is mirror-still. Gaze at the water's surface with soft, unfocused eyes. Watch for images, colors, movements, or symbols to appear on or beneath the surface. The water acts as a portal to other realms and your subconscious.",
    history:
      'Water scrying (hydromancy) appears in nearly every ancient culture on Earth. The famous prophet Nostradamus used a bowl of water on a brass tripod to receive his visions. Celtic seers gazed into sacred wells and pools to see the future. Ancient Greeks practiced lecanomancy (bowl scrying). The connection between water and prophecy appears in countless myths, from the Well of Urd in Norse mythology to the sacred springs of Delphi.',
    tips: [
      'Full moon nights are most powerful for water scrying',
      'Add a drop of black ink for deeper visions',
      'Natural water sources (springs, wells) are especially potent',
      'Let the water become completely still before beginning',
      'The darker the bowl, the better the visions',
      "Work during the moon's waxing or full phase",
    ],
    symbolism:
      'Water represents the subconscious mind, emotions, intuition, and the realm of dreams. It connects to the Moon, feminine energy, and the flow of time. Gazing into water is like gazing into the depths of consciousness itself.',
    bestFor: [
      'Emotional questions and relationship guidance',
      'Dream interpretation and enhancement',
      'Moon magic and lunar workings',
      'Gentle, accessible divination',
      'Connecting with water spirits and elementals',
      'Questions about cycles and flow',
    ],
    moonPhases: {
      newMoon: 'Best for new beginnings and hidden matters',
      waxingMoon: 'Best for growth and developing situations',
      fullMoon: 'Most powerful for clear visions',
      waningMoon: 'Best for banishing and endings',
    },
    commonExperiences: [
      'The water surface seeming to ripple or move',
      'Colors swirling in the depths',
      'Faces or scenes appearing on the surface',
      'Sense of the water becoming a portal',
      'Emotional impressions and feelings',
    ],
    preparation: [
      'Collect or charge water under moonlight',
      'Cleanse your bowl with salt water',
      'Create calm, quiet space',
      'Enter receptive, meditative state',
      'Invoke water elementals or lunar deities (optional)',
    ],
    affirmation:
      'I gaze into sacred waters, and the Moon illuminates the hidden currents of truth.',
  },
  'fire-scrying': {
    name: 'Fire Scrying',
    description:
      'An ancient and primal form of divination using the dancing flames of candles, fireplaces, or bonfires to receive visions, messages, and prophetic insights connected to transformation and passion.',
    tools: [
      'Candle, fireplace, or bonfire',
      'Dark room or outdoor night setting',
      'Fire-safe space and container',
      'Optional: herbs to add to flames (for bonfire)',
      'Water or sand nearby for safety',
    ],
    technique:
      'Light your fire source in a safe space. Dim all other lights. Sit comfortably at a safe distance and gaze softly at the flames without staring. Let your eyes relax and your mind become receptive. Watch the dance of the fire—its colors, movements, shapes, and the way it flickers. Allow visions, symbols, or impressions to arise naturally from the flames.',
    history:
      "Fire gazing (pyromancy) is one of humanity's oldest forms of divination, practiced since our ancestors first gathered around flames. Ancient Greeks observed the behavior of sacrificial fires for omens. Roman Vestals tended the sacred flame and received visions. Shamanic cultures worldwide practice fire scrying during ceremonies. The hearth fire was considered sacred in countless traditions, a portal between worlds where ancestors and spirits could communicate.",
    tips: [
      'A single candle is perfect for beginners',
      'Bonfires provide deeper, more intense visions',
      'Note the colors of the flames—each has meaning',
      'Watch how the fire moves and responds to you',
      'Fire scrying is excellent for transformation questions',
      'Add herbs like mugwort or bay for enhanced visions',
    ],
    symbolism:
      'Fire represents transformation, passion, will, and the divine spark. It destroys and purifies, making way for new growth. Fire connects to the Sun, masculine energy, and the element of spirit. Gazing into flames connects us to our ancestors and the primal human experience.',
    bestFor: [
      'Questions about transformation and change',
      'Passionate and creative matters',
      'Connecting with ancestors',
      'Sabbat celebrations and seasonal rituals',
      'Releasing and letting go',
      'Receiving inspiration and clarity',
    ],
    flameColors: {
      orange: 'Normal, balanced energy',
      blue: 'Spirit presence, high spiritual energy',
      yellow: 'Communication, messages coming through',
      red: 'Passion, strong energy, warnings',
      green: 'Healing, prosperity, nature spirits',
      white: 'Divine presence, purity, protection',
    },
    flameBehaviors: {
      dancing: 'Spirits are present and active',
      still: 'Calm energy, peaceful answers',
      crackling: 'Opposition or obstacles ahead',
      sudden_high: 'Yes answer, strong energy',
      sudden_low: 'No answer, blocked energy',
      extinction: 'End of matter, complete the working',
    },
    commonExperiences: [
      'Faces appearing in the flames',
      'Scenes or symbols forming in the fire',
      'The fire seeming to respond to questions',
      'Colors shifting with meaning',
      'Sense of ancestral presence',
    ],
    preparation: [
      'Ensure complete fire safety',
      'Create sacred space around the fire',
      'State your intention or question',
      'Enter calm, receptive state',
      'Thank the fire spirit when finished',
    ],
    affirmation:
      'I gaze into the sacred flame, and transformation reveals the path forward.',
  },
};

const methodKeys = Object.keys(scryingMethods);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ method: string }>;
}): Promise<Metadata> {
  const { method } = await params;
  const methodData = scryingMethods[method as keyof typeof scryingMethods];

  if (!methodData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${methodData.name}: Complete Guide & Techniques - Lunary`;
  const description = `Learn ${methodData.name} techniques for divination and receiving visions. Discover tools, methods, and tips for successful ${methodData.name.toLowerCase()}.`;

  return {
    title,
    description,
    keywords: [
      methodData.name.toLowerCase(),
      'scrying',
      'divination',
      'visions',
      method.replace('-', ' '),
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/divination/scrying/${method}`,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/divination/scrying/${method}`,
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

export default async function ScryingMethodPage({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method } = await params;
  const methodData = scryingMethods[method as keyof typeof scryingMethods];

  if (!methodData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is ${methodData.name}?`,
      answer: methodData.description,
    },
    {
      question: `What tools do I need for ${methodData.name}?`,
      answer: `For ${methodData.name}, you'll need: ${methodData.tools.join(', ')}.`,
    },
    {
      question: `How do I practice ${methodData.name}?`,
      answer: methodData.technique,
    },
    {
      question: `What is the history of ${methodData.name}?`,
      answer: methodData.history,
    },
    {
      question: `What is ${methodData.name} best for?`,
      answer: `${methodData.name} is best for: ${methodData.bestFor.slice(0, 3).join(', ')}.`,
    },
    {
      question: `What might I experience during ${methodData.name}?`,
      answer: `Common experiences include: ${methodData.commonExperiences.slice(0, 3).join('; ')}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${methodData.name} - Lunary`}
        h1={`${methodData.name}: Complete Guide`}
        description={`Learn ${methodData.name} techniques for divination and receiving visions.`}
        keywords={[
          methodData.name.toLowerCase(),
          'scrying',
          'divination',
          'visions',
          method.replace('-', ' '),
          'how to scry',
        ]}
        canonicalUrl={`https://lunary.app/grimoire/divination/scrying/${method}`}
        intro={methodData.description}
        tldr={`${methodData.name} is a powerful divination technique. ${methodData.symbolism.split('.')[0]}.`}
        meaning={`Scrying is the ancient art of gazing into a reflective or receptive surface to receive visions, messages, and insights from beyond ordinary perception. ${methodData.name} is one of the most respected and time-honored forms of this practice.

${methodData.description}

**The Symbolism of ${methodData.name}**

${methodData.symbolism}

**Historical Background**

${methodData.history}

**The Technique**

${methodData.technique}

**What You Might Experience**

Practitioners of ${methodData.name} commonly report: ${methodData.commonExperiences.join('; ')}.

Scrying requires patience and regular practice. Your first sessions may yield little, but with consistent effort, your ability to receive clear visions will develop. The key is entering a relaxed, receptive state where your conscious mind quiets and your inner sight awakens.

**Preparation Steps**

${methodData.preparation.map((p) => `• ${p}`).join('\n')}

**Tools Needed**

${methodData.tools.map((t) => `• ${t}`).join('\n')}`}
        emotionalThemes={[
          'Vision',
          'Insight',
          'Mystery',
          'Revelation',
          'Prophecy',
        ]}
        howToWorkWith={methodData.preparation}
        rituals={methodData.tips}
        tables={[
          {
            title: `${methodData.name} Requirements`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Tools', methodData.tools.slice(0, 3).join(', ')],
              ['Best For', methodData.bestFor.slice(0, 2).join(', ')],
              ['Lighting', 'Dim, ambient'],
              ['Duration', '15-30 minutes'],
            ],
          },
          {
            title: 'What This Method Is Best For',
            headers: ['Purpose', 'Description'],
            rows: methodData.bestFor.map((b) => [b, '✓ Recommended']),
          },
        ]}
        journalPrompts={[
          'What visions did I receive during my scrying session?',
          'What colors, shapes, or symbols appeared?',
          'How do my visions relate to my questions or intentions?',
          'What emotions arose during the practice?',
          'How can I deepen my scrying practice?',
        ]}
        relatedItems={[
          {
            name: 'Scrying Guide',
            href: '/grimoire/divination/scrying',
            type: 'Guide',
          },
          { name: 'Divination', href: '/grimoire/divination', type: 'Guide' },
          {
            name: 'Meditation',
            href: '/grimoire/meditation',
            type: 'Practice',
          },
          { name: 'Crystals', href: '/grimoire/crystals', type: 'Guide' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Divination', href: '/grimoire/divination' },
          { label: 'Scrying', href: '/grimoire/divination/scrying' },
          {
            label: methodData.name,
            href: `/grimoire/divination/scrying/${method}`,
          },
        ]}
        internalLinks={[
          { text: 'All Scrying Methods', href: '/grimoire/divination/scrying' },
          { text: 'Divination Guide', href: '/grimoire/divination' },
          { text: 'Meditation Techniques', href: '/grimoire/meditation' },
          { text: 'Crystal Guide', href: '/grimoire/crystals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Explore more divination methods'
        ctaHref='/grimoire/divination'
        faqs={faqs}
      />
    </div>
  );
}
