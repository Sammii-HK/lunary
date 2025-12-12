/**
 * Crystal Pack Content Generator
 *
 * Generates rich PDF content for crystal packs from the shop configurations.
 */

import { PdfCrystalPack, PdfCrystal } from '../schema';
import {
  crystalDatabase,
  getCrystalsByIntention,
  getCrystalsByZodiacSign,
  getCrystalsByChakra,
  Crystal,
} from '@/constants/grimoire/crystals';

interface CrystalPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  crystalSelectionMethod: 'intention' | 'zodiac' | 'chakra' | 'custom';
  selectionValue: string;
  customCrystals?: string[];
  perfectFor: string[];
}

function polishHowToUse(text: string): string {
  if (!text) return '';
  let polished = text;
  const fixes: [RegExp, string][] = [
    [/^Hold for /i, 'Hold this crystal to support '],
    [/^Carry for /i, 'Carry this stone to encourage '],
    [/^Place for /i, 'Place the crystal nearby to invite '],
    [/^Use for /i, 'Work with this crystal to cultivate '],
    [/^Meditate for /i, 'Meditate with this stone to deepen '],
    [/for calm$/i, 'to cultivate a sense of calm'],
    [/for peace$/i, 'to invite inner peace'],
    [/for grounding$/i, 'to feel more grounded'],
    [/for clarity$/i, 'to bring mental clarity'],
    [/for protection$/i, 'to create a sense of protection'],
  ];
  for (const [pattern, replacement] of fixes) {
    polished = polished.replace(pattern, replacement);
  }
  if (
    !polished.endsWith('.') &&
    !polished.endsWith('!') &&
    !polished.endsWith('?')
  ) {
    polished += '.';
  }
  return polished.charAt(0).toUpperCase() + polished.slice(1);
}

function crystalToPdfCrystal(crystal: Crystal, theme: string): PdfCrystal {
  return {
    id: crystal.id,
    name: crystal.name,
    chakras: crystal.chakras,
    element: crystal.elements[0] || 'Earth',
    zodiacSigns: crystal.zodiacSigns,
    properties: crystal.properties.slice(0, 6),
    howToUse: [
      crystal.workingWith.meditation,
      crystal.workingWith.healing,
      crystal.workingWith.manifestation,
    ]
      .filter(Boolean)
      .map(polishHowToUse)
      .slice(0, 4),
    affirmation: generateCrystalAffirmation(crystal, theme),
    cleansing: crystal.careInstructions.cleansing[0],
  };
}

function generateCrystalAffirmation(crystal: Crystal, theme: string): string {
  const affirmations: Record<string, string> = {
    anxiety: `I welcome the calming energy of ${crystal.name}. I am safe, grounded, and at peace.`,
    calm: `With ${crystal.name} as my ally, I find stillness within the storm.`,
    peace: `${crystal.name} reminds me that peace is always available within.`,
    protection: `${crystal.name} shields my energy. I am safe and sovereign in my space.`,
    love: `${crystal.name} opens my heart to give and receive love freely.`,
    abundance: `I align with the abundant energy of ${crystal.name}. Prosperity flows to me naturally.`,
    grounding: `${crystal.name} anchors me to the earth. I am stable, present, and secure.`,
    intuition: `${crystal.name} awakens my inner knowing. I trust my intuition completely.`,
    healing: `${crystal.name} supports my healing journey. I release what no longer serves me.`,
    creativity: `${crystal.name} ignites my creative fire. Ideas flow through me effortlessly.`,
    confidence: `With ${crystal.name}, I stand in my power. I am worthy and capable.`,
    clarity: `${crystal.name} clears my mind. I see my path with perfect clarity.`,
  };
  return (
    affirmations[theme.toLowerCase()] ||
    `I welcome the supportive energy of ${crystal.name} into my practice.`
  );
}

function getCrystalsForPack(config: CrystalPackConfig): Crystal[] {
  if (config.customCrystals) {
    return config.customCrystals
      .map((name) =>
        crystalDatabase.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        ),
      )
      .filter((c): c is Crystal => c !== undefined)
      .slice(0, 6);
  }

  let crystals: Crystal[] = [];
  switch (config.crystalSelectionMethod) {
    case 'intention':
      crystals = getCrystalsByIntention(config.selectionValue);
      break;
    case 'zodiac':
      crystals = getCrystalsByZodiacSign(config.selectionValue);
      break;
    case 'chakra':
      crystals = getCrystalsByChakra(config.selectionValue);
      break;
    default:
      crystals = crystalDatabase.slice(0, 6);
  }
  return crystals.slice(0, 6);
}

const THEME_INTROS: Record<string, string> = {
  anxiety:
    'Anxiety can feel overwhelming, but you are not alone. These crystals offer gentle, grounding support as you navigate challenging moments. Use them as companions for presence—not as substitutes for professional care when needed.',
  protection:
    'Your energy is sacred and deserving of protection. These crystals create energetic boundaries that shield you from negativity while keeping you open to love and positive connection.',
  love: 'Love begins within. These crystals support the heart chakra, helping you cultivate self-love as the foundation for all other relationships. Open your heart gently.',
  abundance:
    'Abundance is your natural state. These crystals help clear blocks to receiving and align you with the flow of prosperity that is always available.',
  grounding:
    'In a world that often feels chaotic, grounding brings you home to yourself. These crystals anchor your energy to the earth, creating stability and presence.',
  intuition:
    'Your intuition is a powerful guide. These crystals support the third eye and crown chakras, helping you access your inner wisdom and spiritual connection.',
  healing:
    'Healing is a journey, not a destination. These crystals offer gentle support as you process, release, and restore. Be patient and compassionate with yourself.',
  creativity:
    'Creativity is your birthright. These crystals ignite the sacral chakra, unblocking creative energy and inspiring new ideas and expressions.',
  confidence:
    'True confidence comes from within. These crystals support the solar plexus chakra, helping you stand in your power and trust your capabilities.',
  zodiac:
    'These crystals resonate with your zodiac energy, amplifying your natural strengths and offering support for your challenges. Work with them during your season or whenever you need their energy.',
  chakra:
    'Each crystal in this collection has been selected for its connection to specific energy centres. Use them for chakra healing, meditation, or simply as supportive companions.',
};

const THEME_CLOSINGS: Record<string, string> = {
  anxiety:
    'Thank you for exploring these calming crystals with Lunary. Remember: healing is not linear. These stones are companions on your journey, offering support as you learn to find calm within yourself.',
  protection:
    'Thank you for building your protective practice with Lunary. May these crystals serve as steadfast guardians of your energy and sacred space.',
  love: 'Thank you for opening your heart with Lunary. May these crystals remind you daily that you are worthy of love—from others and especially from yourself.',
  abundance:
    'Thank you for aligning with abundance through Lunary. May these crystals help you recognise and receive the prosperity that surrounds you.',
  grounding:
    'Thank you for grounding with Lunary. May these crystals keep you anchored, present, and connected to the supportive energy of the earth.',
  intuition:
    'Thank you for developing your intuition with Lunary. May these crystals enhance your inner knowing and strengthen your connection to guidance.',
  healing:
    'Thank you for your courage in seeking healing. May these crystals offer gentle support as you continue on your path of restoration.',
  creativity:
    'Thank you for igniting your creativity with Lunary. May these crystals keep your creative channels open and flowing.',
  confidence:
    'Thank you for stepping into your power with Lunary. May these crystals remind you of your inherent worth and capability.',
  default:
    'Thank you for exploring these crystals with Lunary. May they serve as faithful companions on your magical journey.',
};

export function generateCrystalPackContent(
  config: CrystalPackConfig,
): PdfCrystalPack {
  const crystals = getCrystalsForPack(config);
  const theme = config.selectionValue.toLowerCase();
  const themeKey =
    Object.keys(THEME_INTROS).find((k) => theme.includes(k)) || 'default';

  return {
    type: 'crystal',
    slug: config.slug,
    title: config.title,
    subtitle: config.tagline,
    moodText: config.description,
    perfectFor: config.perfectFor.map((item) =>
      item.endsWith('.') ? item : `${item}.`,
    ),
    introText:
      THEME_INTROS[themeKey] || THEME_INTROS.default || config.description,
    crystals: crystals.map((c) =>
      crystalToPdfCrystal(c, config.selectionValue),
    ),
    closingText: THEME_CLOSINGS[themeKey] || THEME_CLOSINGS.default,
    optionalAffirmation:
      'I honour the wisdom of the mineral kingdom. These crystals support my highest good and guide me on my path.',
  };
}
