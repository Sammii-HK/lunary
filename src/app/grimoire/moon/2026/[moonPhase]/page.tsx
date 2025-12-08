import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

interface MoonData {
  type: 'full' | 'new';
  month: string;
  date: string;
  sign: string;
  name?: string;
  altNames?: string[];
  element: string;
  meaning: string;
  rituals: string[];
  intentions: string[];
  crystals: string[];
  herbs: string[];
}

const moonData2026: Record<string, MoonData> = {
  'full-moon-january': {
    type: 'full',
    month: 'January',
    date: 'January 13, 2026',
    sign: 'Cancer',
    name: 'Wolf Moon',
    altNames: ['Old Moon', 'Ice Moon', 'Moon After Yule'],
    element: 'Water',
    meaning:
      'The Wolf Moon in Cancer brings deep emotional awareness and a call to nurture yourself and loved ones. This is a powerful time for family healing, honoring your roots, and releasing emotional patterns that no longer serve you.',
    rituals: [
      'Create a home blessing ritual',
      'Write letters to ancestors',
      'Practice gratitude for your family and home',
      'Release old emotional wounds through journaling',
    ],
    intentions: [
      'Emotional healing and release',
      'Strengthening family bonds',
      'Creating a nurturing home environment',
      'Self-care and emotional self-compassion',
    ],
    crystals: ['Moonstone', 'Pearl', 'Selenite', 'Rose Quartz'],
    herbs: ['Chamomile', 'Jasmine', 'Lemon Balm', 'White Willow'],
  },
  'new-moon-january': {
    type: 'new',
    month: 'January',
    date: 'January 29, 2026',
    sign: 'Aquarius',
    element: 'Air',
    meaning:
      'The New Moon in Aquarius sparks innovation, community connection, and forward-thinking intentions. Set goals that benefit not just yourself but your wider community. Embrace your unique perspective.',
    rituals: [
      'Vision board for the year ahead',
      'Group intention setting with friends',
      'Technology detox followed by mindful reconnection',
      'Write down your most unconventional dreams',
    ],
    intentions: [
      'Embracing your authentic self',
      'Building meaningful community',
      'Innovation and creative breakthroughs',
      'Humanitarian goals and giving back',
    ],
    crystals: ['Amethyst', 'Labradorite', 'Aquamarine', 'Clear Quartz'],
    herbs: ['Lavender', 'Star Anise', 'Frankincense', 'Violet'],
  },
  'full-moon-february': {
    type: 'full',
    month: 'February',
    date: 'February 12, 2026',
    sign: 'Leo',
    name: 'Snow Moon',
    altNames: ['Storm Moon', 'Hunger Moon', 'Quickening Moon'],
    element: 'Fire',
    meaning:
      'The Snow Moon in Leo illuminates your creative power and inner radiance. This is a time to celebrate your achievements, release self-doubt, and step into your full magnificence.',
    rituals: [
      'Creative expression ritual (art, dance, music)',
      'Self-love affirmation practice',
      'Celebrate personal wins from the past month',
      'Release fears around being seen',
    ],
    intentions: [
      'Confidence and self-expression',
      'Creative projects completion',
      'Heart-centered leadership',
      'Joy and playfulness',
    ],
    crystals: ['Citrine', 'Sunstone', 'Carnelian', 'Tigers Eye'],
    herbs: ['Sunflower', 'Marigold', 'Cinnamon', 'Orange Peel'],
  },
  'new-moon-february': {
    type: 'new',
    month: 'February',
    date: 'February 27, 2026',
    sign: 'Pisces',
    element: 'Water',
    meaning:
      'The New Moon in Pisces opens portals to imagination, spirituality, and intuitive knowing. This is one of the most mystical new moons of the year—perfect for spiritual practices and creative dreaming.',
    rituals: [
      'Meditation and visualization',
      'Dream journaling practice',
      'Water ritual (bath, ocean, rain)',
      'Artistic expression without judgment',
    ],
    intentions: [
      'Deepening spiritual connection',
      'Creative and artistic projects',
      'Compassion for self and others',
      'Trusting intuition and inner guidance',
    ],
    crystals: ['Amethyst', 'Aquamarine', 'Moonstone', 'Lepidolite'],
    herbs: ['Mugwort', 'Jasmine', 'Seaweed', 'Water Lily'],
  },
  'full-moon-march': {
    type: 'full',
    month: 'March',
    date: 'March 14, 2026',
    sign: 'Virgo',
    name: 'Worm Moon',
    altNames: ['Sap Moon', 'Crow Moon', 'Lenten Moon', 'Chaste Moon'],
    element: 'Earth',
    meaning:
      'The Worm Moon in Virgo brings focus to health, daily routines, and practical matters. Release perfectionism and honor the small steps you take each day toward your larger goals.',
    rituals: [
      'Spring cleaning and decluttering',
      'Health and wellness inventory',
      'Release perfectionist tendencies',
      'Gratitude for daily blessings',
    ],
    intentions: [
      'Improved daily routines',
      'Physical and mental health',
      'Service to others',
      'Attention to details that matter',
    ],
    crystals: ['Green Aventurine', 'Moss Agate', 'Amazonite', 'Peridot'],
    herbs: ['Lavender', 'Rosemary', 'Fennel', 'Dill'],
  },
  'new-moon-march': {
    type: 'new',
    month: 'March',
    date: 'March 29, 2026',
    sign: 'Aries',
    element: 'Fire',
    meaning:
      'The New Moon in Aries marks the astrological new year—a powerful time for bold new beginnings. Channel the pioneering energy of Aries to start fresh projects and assert your desires.',
    rituals: [
      'Astrological new year intention setting',
      'Candle magic for new beginnings',
      'Physical activity to ignite energy',
      'Courage ritual for facing fears',
    ],
    intentions: [
      'Bold new beginnings',
      'Personal courage and assertiveness',
      'Independence and self-reliance',
      'Taking the first step on big goals',
    ],
    crystals: ['Carnelian', 'Red Jasper', 'Bloodstone', 'Garnet'],
    herbs: ['Ginger', 'Black Pepper', 'Nettle', 'Thistle'],
  },
  'full-moon-april': {
    type: 'full',
    month: 'April',
    date: 'April 12, 2026',
    sign: 'Libra',
    name: 'Pink Moon',
    altNames: ['Sprouting Grass Moon', 'Fish Moon', 'Egg Moon', 'Paschal Moon'],
    element: 'Air',
    meaning:
      'The Pink Moon in Libra illuminates relationships, balance, and harmony. Release relationship patterns that create imbalance and celebrate the beauty of partnership and cooperation.',
    rituals: [
      'Relationship assessment and gratitude',
      'Beauty and self-care ritual',
      'Balance work-life harmony',
      'Forgiveness practice for relationship healing',
    ],
    intentions: [
      'Harmonious relationships',
      'Work-life balance',
      'Artistic expression and beauty',
      'Fair and diplomatic communication',
    ],
    crystals: ['Rose Quartz', 'Pink Tourmaline', 'Rhodonite', 'Jade'],
    herbs: ['Rose', 'Geranium', 'Thyme', 'Yarrow'],
  },
  'new-moon-april': {
    type: 'new',
    month: 'April',
    date: 'April 27, 2026',
    sign: 'Taurus',
    element: 'Earth',
    meaning:
      'The New Moon in Taurus grounds your intentions in practical reality. Focus on material security, sensual pleasures, and building lasting foundations for your dreams.',
    rituals: [
      'Financial intention setting',
      'Sensory self-care (massage, aromatherapy)',
      'Garden planting or earth connection',
      'Abundance altar creation',
    ],
    intentions: [
      'Financial stability and growth',
      'Physical comfort and pleasure',
      'Patience and steady progress',
      'Connection to nature and earth',
    ],
    crystals: ['Emerald', 'Green Jade', 'Rose Quartz', 'Malachite'],
    herbs: ['Patchouli', 'Vanilla', 'Rose', 'Apple Blossom'],
  },
  'full-moon-may': {
    type: 'full',
    month: 'May',
    date: 'May 12, 2026',
    sign: 'Scorpio',
    name: 'Flower Moon',
    altNames: ['Corn Planting Moon', 'Milk Moon', 'Hare Moon', 'Budding Moon'],
    element: 'Water',
    meaning:
      'The Flower Moon in Scorpio brings intense emotional depth and transformation. This is a powerful time for shadow work, releasing what you have outgrown, and embracing profound change.',
    rituals: [
      'Shadow work journaling',
      'Energy cord cutting ceremony',
      'Ancestral healing practice',
      'Phoenix rising visualization',
    ],
    intentions: [
      'Deep emotional healing',
      'Transformation and rebirth',
      'Releasing control and surrendering',
      'Embracing your power',
    ],
    crystals: ['Obsidian', 'Malachite', 'Labradorite', 'Black Tourmaline'],
    herbs: ['Wormwood', 'Myrrh', 'Basil', 'Nettle'],
  },
  'new-moon-may': {
    type: 'new',
    month: 'May',
    date: 'May 26, 2026',
    sign: 'Gemini',
    element: 'Air',
    meaning:
      'The New Moon in Gemini activates communication, learning, and curiosity. Set intentions around new skills, important conversations, and connecting with your local community.',
    rituals: [
      'Journal writing and idea brainstorming',
      'Learn something new',
      'Reach out to siblings or neighbors',
      'Affirmations for clear communication',
    ],
    intentions: [
      'Clear and effective communication',
      'Learning new skills',
      'Social connections and networking',
      'Adaptability and flexibility',
    ],
    crystals: ['Citrine', 'Blue Lace Agate', 'Howlite', 'Tiger Eye'],
    herbs: ['Lavender', 'Peppermint', 'Parsley', 'Dill'],
  },
  'full-moon-june': {
    type: 'full',
    month: 'June',
    date: 'June 11, 2026',
    sign: 'Sagittarius',
    name: 'Strawberry Moon',
    altNames: ['Rose Moon', 'Hot Moon', 'Mead Moon', 'Honey Moon'],
    element: 'Fire',
    meaning:
      'The Strawberry Moon in Sagittarius expands your horizons and illuminates your path of adventure. Release limiting beliefs about what is possible and celebrate your journey of growth.',
    rituals: [
      'Vision questing or nature adventure',
      'Release limiting beliefs about possibilities',
      'Gratitude for life lessons learned',
      'Fire ceremony for expansion',
    ],
    intentions: [
      'Adventure and exploration',
      'Higher learning and wisdom',
      'Optimism and faith in the future',
      'Freedom and independence',
    ],
    crystals: ['Turquoise', 'Lapis Lazuli', 'Sodalite', 'Amethyst'],
    herbs: ['Sage', 'Cedar', 'Dandelion', 'Honeysuckle'],
  },
  'new-moon-june': {
    type: 'new',
    month: 'June',
    date: 'June 25, 2026',
    sign: 'Cancer',
    element: 'Water',
    meaning:
      'The New Moon in Cancer opens your heart to emotional new beginnings. Set intentions around home, family, and creating emotional security for yourself.',
    rituals: [
      'Home blessing and cleansing',
      'Family intention setting',
      'Self-nurturing bath ritual',
      'Create a cozy sanctuary space',
    ],
    intentions: [
      'Emotional security and safety',
      'Family harmony',
      'Creating a nurturing home',
      'Self-care and self-compassion',
    ],
    crystals: ['Moonstone', 'Pearl', 'Selenite', 'Opal'],
    herbs: ['Chamomile', 'Jasmine', 'Lotus', 'White Rose'],
  },
  'full-moon-july': {
    type: 'full',
    month: 'July',
    date: 'July 10, 2026',
    sign: 'Capricorn',
    name: 'Buck Moon',
    altNames: ['Thunder Moon', 'Hay Moon', 'Wort Moon', 'Mead Moon'],
    element: 'Earth',
    meaning:
      'The Buck Moon in Capricorn illuminates your ambitions and career path. Release outdated goals, celebrate your achievements, and realign with your true definition of success.',
    rituals: [
      'Career and goal assessment',
      'Release outdated ambitions',
      'Honor your achievements',
      'Mountain or earth grounding practice',
    ],
    intentions: [
      'Career advancement and success',
      'Long-term goal completion',
      'Discipline and structure',
      'Authentic definition of success',
    ],
    crystals: ['Garnet', 'Onyx', 'Smoky Quartz', 'Jet'],
    herbs: ['Comfrey', 'Thyme', 'Horsetail', 'Ivy'],
  },
  'new-moon-july': {
    type: 'new',
    month: 'July',
    date: 'July 24, 2026',
    sign: 'Leo',
    element: 'Fire',
    meaning:
      'The New Moon in Leo ignites your creative fire and calls you to shine. Set bold intentions around self-expression, creativity, and stepping into the spotlight.',
    rituals: [
      'Creative project launch',
      'Self-love affirmation practice',
      'Heart chakra activation',
      'Dance or movement celebration',
    ],
    intentions: [
      'Creative self-expression',
      'Confidence and visibility',
      'Heart-centered leadership',
      'Joy and playfulness',
    ],
    crystals: ['Sunstone', 'Citrine', 'Carnelian', 'Golden Tiger Eye'],
    herbs: ['Sunflower', 'Marigold', 'St. Johns Wort', 'Cinnamon'],
  },
  'full-moon-august': {
    type: 'full',
    month: 'August',
    date: 'August 9, 2026',
    sign: 'Aquarius',
    name: 'Sturgeon Moon',
    altNames: ['Green Corn Moon', 'Grain Moon', 'Red Moon', 'Barley Moon'],
    element: 'Air',
    meaning:
      'The Sturgeon Moon in Aquarius illuminates your unique contribution to the collective. Release conformity and celebrate what makes you different. Honor your community connections.',
    rituals: [
      'Community service or giving back',
      'Release need for approval',
      'Celebrate your uniqueness',
      'Group ritual with friends',
    ],
    intentions: [
      'Authentic self-expression',
      'Community and friendship',
      'Innovation and forward thinking',
      'Humanitarian causes',
    ],
    crystals: ['Amethyst', 'Labradorite', 'Blue Fluorite', 'Angelite'],
    herbs: ['Lavender', 'Violet', 'Star Anise', 'Eucalyptus'],
  },
  'new-moon-august': {
    type: 'new',
    month: 'August',
    date: 'August 23, 2026',
    sign: 'Virgo',
    element: 'Earth',
    meaning:
      'The New Moon in Virgo brings focus to health, habits, and service. Set practical intentions around daily routines, wellness, and how you can be of service to others.',
    rituals: [
      'Health and wellness goal setting',
      'Daily routine optimization',
      'Decluttering and organizing',
      'Acts of service for others',
    ],
    intentions: [
      'Healthy habits and routines',
      'Physical wellbeing',
      'Service and helping others',
      'Practical problem-solving',
    ],
    crystals: ['Green Aventurine', 'Amazonite', 'Moss Agate', 'Peridot'],
    herbs: ['Lavender', 'Rosemary', 'Fennel', 'Peppermint'],
  },
  'full-moon-september': {
    type: 'full',
    month: 'September',
    date: 'September 7, 2026',
    sign: 'Pisces',
    name: 'Harvest Moon',
    altNames: ['Corn Moon', 'Barley Moon', 'Fruit Moon', 'Wine Moon'],
    element: 'Water',
    meaning:
      'The Harvest Moon in Pisces brings spiritual culmination and emotional release. This is a deeply intuitive full moon—honor your dreams, release illusions, and trust your inner knowing.',
    rituals: [
      'Dream work and interpretation',
      'Spiritual bath or water ritual',
      'Release illusions and escapism',
      'Artistic expression and creativity',
    ],
    intentions: [
      'Spiritual connection',
      'Compassion and forgiveness',
      'Creative completion',
      'Trusting intuition',
    ],
    crystals: ['Amethyst', 'Aquamarine', 'Moonstone', 'Sugilite'],
    herbs: ['Mugwort', 'Jasmine', 'Water Lily', 'Lotus'],
  },
  'new-moon-september': {
    type: 'new',
    month: 'September',
    date: 'September 21, 2026',
    sign: 'Libra',
    element: 'Air',
    meaning:
      'The New Moon in Libra around the Fall Equinox creates perfect conditions for balance and relationship intentions. Focus on harmony, partnership, and creating beauty in your life.',
    rituals: [
      'Fall Equinox balance ritual',
      'Relationship intention setting',
      'Beauty and aesthetic refresh',
      'Forgiveness and harmony practice',
    ],
    intentions: [
      'Balanced relationships',
      'Harmony in all areas of life',
      'Beauty and aesthetics',
      'Fair and loving communication',
    ],
    crystals: ['Rose Quartz', 'Opal', 'Jade', 'Rhodonite'],
    herbs: ['Rose', 'Apple', 'Hibiscus', 'Vanilla'],
  },
  'full-moon-october': {
    type: 'full',
    month: 'October',
    date: 'October 7, 2026',
    sign: 'Aries',
    name: 'Hunter Moon',
    altNames: [
      'Blood Moon',
      'Sanguine Moon',
      'Falling Leaves Moon',
      'Travel Moon',
    ],
    element: 'Fire',
    meaning:
      'The Hunter Moon in Aries ignites your warrior spirit and calls for courageous action. Release anger, fear of conflict, and anything holding you back from asserting yourself.',
    rituals: [
      'Courage and strength ritual',
      'Physical activity or competition',
      'Release anger safely',
      'Assert boundaries clearly',
    ],
    intentions: [
      'Courage and bravery',
      'Taking action on goals',
      'Healthy assertiveness',
      'Independence and self-reliance',
    ],
    crystals: ['Carnelian', 'Red Jasper', 'Bloodstone', 'Ruby'],
    herbs: ['Ginger', 'Black Pepper', 'Dragons Blood', 'Nettle'],
  },
  'new-moon-october': {
    type: 'new',
    month: 'October',
    date: 'October 21, 2026',
    sign: 'Scorpio',
    element: 'Water',
    meaning:
      'The New Moon in Scorpio opens portals to deep transformation and rebirth. Set intentions for profound change, psychological healing, and stepping into your power.',
    rituals: [
      'Shadow work practice',
      'Samhain/Ancestor connection',
      'Transformation intention setting',
      'Death and rebirth visualization',
    ],
    intentions: [
      'Deep transformation',
      'Emotional healing',
      'Embracing personal power',
      'Ancestral connection',
    ],
    crystals: ['Obsidian', 'Malachite', 'Black Tourmaline', 'Labradorite'],
    herbs: ['Wormwood', 'Myrrh', 'Mugwort', 'Pomegranate'],
  },
  'full-moon-november': {
    type: 'full',
    month: 'November',
    date: 'November 5, 2026',
    sign: 'Taurus',
    name: 'Beaver Moon',
    altNames: ['Frost Moon', 'Frosty Moon', 'Snow Moon', 'Mourning Moon'],
    element: 'Earth',
    meaning:
      'The Beaver Moon in Taurus brings focus to material security and sensual pleasures. Release attachment to possessions and celebrate the abundance already present in your life.',
    rituals: [
      'Gratitude for abundance',
      'Release material attachment',
      'Sensory pleasure ritual',
      'Earth grounding practice',
    ],
    intentions: [
      'Financial abundance',
      'Physical comfort',
      'Appreciation for beauty',
      'Steady progress on goals',
    ],
    crystals: ['Emerald', 'Rose Quartz', 'Green Jade', 'Malachite'],
    herbs: ['Patchouli', 'Vanilla', 'Rose', 'Mint'],
  },
  'new-moon-november': {
    type: 'new',
    month: 'November',
    date: 'November 20, 2026',
    sign: 'Sagittarius',
    element: 'Fire',
    meaning:
      'The New Moon in Sagittarius expands your horizons and ignites your sense of adventure. Set intentions for travel, learning, and expanding your worldview.',
    rituals: [
      'Travel or adventure planning',
      'Learning something new',
      'Philosophical journaling',
      'Fire ceremony for expansion',
    ],
    intentions: [
      'Adventure and exploration',
      'Higher learning and growth',
      'Optimism and faith',
      'Freedom and expansion',
    ],
    crystals: ['Turquoise', 'Lapis Lazuli', 'Topaz', 'Amethyst'],
    herbs: ['Sage', 'Cedar', 'Juniper', 'Star Anise'],
  },
  'full-moon-december': {
    type: 'full',
    month: 'December',
    date: 'December 4, 2026',
    sign: 'Gemini',
    name: 'Cold Moon',
    altNames: [
      'Oak Moon',
      'Long Night Moon',
      'Moon Before Yule',
      'Winter Moon',
    ],
    element: 'Air',
    meaning:
      'The Cold Moon in Gemini illuminates communication and mental patterns. Release overthinking, information overload, and scattered energy. Celebrate the connections you have made.',
    rituals: [
      'Release mental clutter and overthinking',
      'Gratitude for communication and connection',
      'Journal reflection on the year',
      'Gather and share stories with loved ones',
    ],
    intentions: [
      'Clear communication',
      'Mental peace and focus',
      'Connection with siblings and neighbors',
      'Learning and curiosity',
    ],
    crystals: ['Blue Lace Agate', 'Howlite', 'Citrine', 'Clear Quartz'],
    herbs: ['Lavender', 'Peppermint', 'Eucalyptus', 'Lemon Balm'],
  },
  'new-moon-december': {
    type: 'new',
    month: 'December',
    date: 'December 19, 2026',
    sign: 'Capricorn',
    element: 'Earth',
    meaning:
      'The New Moon in Capricorn near the Winter Solstice sets the stage for long-term goal setting. Plant seeds for the year ahead with discipline, ambition, and practical planning.',
    rituals: [
      'Winter Solstice intention setting',
      'Long-term goal planning',
      'Career and life review',
      'Building foundations for next year',
    ],
    intentions: [
      'Long-term success and goals',
      'Career advancement',
      'Discipline and structure',
      'Legacy building',
    ],
    crystals: ['Garnet', 'Onyx', 'Smoky Quartz', 'Black Tourmaline'],
    herbs: ['Comfrey', 'Pine', 'Thyme', 'Ivy'],
  },
};

export async function generateStaticParams() {
  return Object.keys(moonData2026).map((moonPhase) => ({
    moonPhase,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moonPhase: string }>;
}): Promise<Metadata> {
  const { moonPhase } = await params;
  const data = moonData2026[moonPhase];

  if (!data) {
    return { title: 'Moon Phase Not Found | Lunary' };
  }

  const title =
    data.type === 'full'
      ? `${data.name} ${data.date}: Full Moon in ${data.sign} | Lunary`
      : `New Moon in ${data.sign} ${data.date}: Meaning & Rituals | Lunary`;

  const description =
    data.type === 'full'
      ? `${data.name}${data.altNames ? ` (${data.altNames[0]})` : ''} - Full Moon in ${data.sign} on ${data.date}. Meaning, rituals, intentions, and crystals for this powerful lunar phase.`
      : `New Moon in ${data.sign} on ${data.date}. Complete guide with meaning, rituals, intentions, crystals, and herbs.`;

  return {
    title,
    description,
    keywords: [
      data.type === 'full'
        ? `full moon ${data.month.toLowerCase()} 2026`
        : `new moon ${data.month.toLowerCase()} 2026`,
      data.type === 'full' ? data.name?.toLowerCase() : null,
      ...(data.altNames?.map((n) => n.toLowerCase()) || []),
      `${data.sign.toLowerCase()} moon`,
      'moon rituals',
      'lunar magic',
      '2026 moon calendar',
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(data.type === 'full' ? data.name || '' : `New Moon in ${data.sign}`)}`,
      ],
    },
  };
}

export default async function MoonPhase2026Page({
  params,
}: {
  params: Promise<{ moonPhase: string }>;
}) {
  const { moonPhase } = await params;
  const data = moonData2026[moonPhase];

  if (!data) {
    notFound();
  }

  const title =
    data.type === 'full'
      ? `${data.name}: Full Moon in ${data.sign}`
      : `New Moon in ${data.sign}`;

  return (
    <SEOContentTemplate
      title={title}
      h1={`${title} - ${data.month} 2026`}
      description={data.meaning}
      keywords={[
        data.type === 'full' ? 'full moon' : 'new moon',
        data.month,
        '2026',
        data.sign,
        'moon rituals',
        'lunar magic',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/moon/2026/${moonPhase}`}
      datePublished='2025-12-01'
      dateModified='2025-12-06'
      articleSection='Moon Phases'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Moon', href: '/grimoire/moon' },
        { label: '2026', href: '/grimoire/moon/2026' },
        {
          label: `${data.month} ${data.type === 'full' ? 'Full' : 'New'} Moon`,
        },
      ]}
      whatIs={{
        question: `When is the ${data.type === 'full' ? data.name || 'Full Moon' : 'New Moon'} in ${data.month} 2026?`,
        answer: `The ${data.type === 'full' ? (data.name ? `${data.name}${data.altNames ? ` (also known as ${data.altNames.join(', ')})` : ''} (` : '') + `Full Moon in ${data.sign}` + (data.name ? ')' : '') : `New Moon in ${data.sign}`} occurs on ${data.date}. This ${data.element} energy ${data.type === 'full' ? 'illuminates and brings to completion' : 'initiates and plants seeds for'} themes related to ${data.sign}.`,
      }}
      tldr={`${data.date} brings a ${data.type === 'full' ? 'Full Moon' : 'New Moon'} in ${data.sign}. This ${data.element} moon is ideal for ${data.type === 'full' ? 'releasing, completing, and celebrating' : 'new beginnings, intention setting, and planting seeds'} around ${data.sign.toLowerCase()} themes.`}
      meaning={data.meaning}
      rituals={data.rituals}
      emotionalThemes={data.intentions}
      signsMostAffected={[data.sign]}
      tables={[
        {
          title: 'Moon Phase Details',
          headers: ['Aspect', 'Details'],
          rows: [
            ['Date', data.date],
            ['Type', data.type === 'full' ? 'Full Moon' : 'New Moon'],
            ...(data.name ? [['Traditional Name', data.name]] : []),
            ...(data.altNames
              ? [['Also Known As', data.altNames.join(', ')]]
              : []),
            ['Sign', data.sign],
            ['Element', data.element],
            ['Crystals', data.crystals.join(', ')],
            ['Herbs', data.herbs.join(', ')],
          ],
        },
      ]}
      relatedItems={[
        {
          name: `${data.sign} Zodiac Sign`,
          href: `/grimoire/zodiac/${data.sign.toLowerCase()}`,
          type: 'Zodiac',
        },
        {
          name: 'Moon Rituals',
          href: '/grimoire/moon-rituals',
          type: 'Ritual',
        },
        {
          name: '2026 Moon Calendar',
          href: '/grimoire/moon/2026',
          type: 'Calendar',
        },
        {
          name: data.type === 'full' ? 'Full Moon Rituals' : 'New Moon Rituals',
          href: '/grimoire/moon-rituals',
          type: 'Ritual',
        },
      ]}
      ctaText={`Get personalized ${data.type === 'full' ? 'Full Moon' : 'New Moon'} insights for your chart`}
      ctaHref='/welcome'
      sources={[
        { name: 'NASA Moon Phase Data' },
        { name: 'Traditional lunar correspondences' },
      ]}
    />
  );
}
