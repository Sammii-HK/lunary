/**
 * Self-Love Ritual Pack
 *
 * A curated collection of rituals focused on self-compassion,
 * boundaries, and inner reconnection.
 */

import { PdfPack, PdfSpell, createPdfPack } from '../schema';
import { generatePackPdf } from '../generator';
import spellsData from '@/data/spells.json';

// Spell IDs that belong to the self-love pack
const SELF_LOVE_SPELL_IDS = [
  'rose-quartz-self-love',
  'mirror-affirmation-ritual',
  'self-love-bath',
  'heart-chakra-opening',
  'self-forgiveness-ritual',
  'boundary-setting-spell',
  'inner-child-healing',
  'self-worth-candle-magic',
];

// Format ingredient objects to readable strings with proper grammar
function formatMaterial(ingredient: unknown): string {
  if (typeof ingredient === 'string') {
    return polishMaterialText(ingredient);
  }
  if (ingredient && typeof ingredient === 'object') {
    const ing = ingredient as { name?: string; amount?: string };
    if (ing.name) {
      const text = ing.amount ? `${ing.name} (${ing.amount})` : ing.name;
      return polishMaterialText(text);
    }
  }
  return String(ingredient);
}

// Polish material text for consistency
function polishMaterialText(text: string): string {
  // Ensure proper capitalisation
  let polished = text.charAt(0).toUpperCase() + text.slice(1);

  // Add missing articles where appropriate
  const needsArticle = [/^(piece of|bowl of|handful of|cup of)/i];

  return polished;
}

// Polish step text to ensure natural, flowing language
function polishStepText(step: string): string {
  if (!step) return step;

  // Ensure first letter is capitalised
  let polished = step.charAt(0).toUpperCase() + step.slice(1);

  // Ensure ends with period
  if (
    !polished.endsWith('.') &&
    !polished.endsWith('!') &&
    !polished.endsWith('?')
  ) {
    polished += '.';
  }

  // Common fixes for clipped phrases and noun fragments
  const fixes: [RegExp, string][] = [
    // Convert clipped fragments to natural sentences
    [/^Deep breathing/i, 'Take slow, grounding breaths'],
    [/^Intention writing/i, 'Write your intention clearly'],
    [/^Visualisation of/i, 'Visualise'],
    [/^Meditation on/i, 'Meditate on'],
    [/^Focus on/i, 'Bring your attention to'],
    [/^Think about/i, 'Reflect on'],

    // Fix missing articles and prepositions
    [/as boundary reminder/gi, 'as a reminder of your boundaries'],
    [/as protection/gi, 'as a form of protection'],
    [/for grounding/gi, 'to ground yourself'],
    [/for calmness/gi, 'to cultivate calm'],
    [/for peace/gi, 'to invite peace'],
    [/for clarity/gi, 'to bring clarity'],
    [/for healing/gi, 'to support your healing'],
    [/Carry (\w+) as /gi, 'Carry $1 to serve as '],
    [/Use (\w+) for /gi, 'Work with $1 to support '],
    [/Hold (\w+) for /gi, 'Hold $1 to encourage '],

    // Soften harsh imperatives
    [/Let go of negativity/gi, 'Release what no longer supports you'],
    [/Release negativity/gi, 'Let go of what weighs on you'],
    [/Remove negative energy/gi, 'Gently clear any stagnant energy'],
    [
      /Think about boundaries/gi,
      'Reflect on where your energy needs protection',
    ],

    // Fix clipped action phrases
    [/Place crystal on/gi, 'Place the crystal on'],
    [/Light candle/gi, 'Light a candle'],
    [/Take breath/gi, 'Take a breath'],
    [/Close eyes/gi, 'Close your eyes'],
    [/Open eyes/gi, 'Open your eyes'],
  ];

  for (const [pattern, replacement] of fixes) {
    polished = polished.replace(pattern, replacement);
  }

  return polished;
}

// Format moon phases array to readable string
function formatMoonPhases(timing: unknown): string[] | undefined {
  if (!timing || typeof timing !== 'object') return undefined;
  const t = timing as { moonPhase?: string[] | string };
  if (!t.moonPhase) return undefined;
  if (Array.isArray(t.moonPhase)) return t.moonPhase;
  return [t.moonPhase];
}

// Map difficulty to our schema type
function mapDifficulty(
  d: string | undefined,
): 'beginner' | 'intermediate' | 'advanced' {
  if (d === 'intermediate') return 'intermediate';
  if (d === 'advanced') return 'advanced';
  return 'beginner';
}

// Build spells from the grimoire data
function buildSelfLoveSpells(): PdfSpell[] {
  const spells: PdfSpell[] = [];

  interface SpellDataRaw {
    id?: string;
    title?: string;
    difficulty?: string;
    duration?: string;
    timing?: unknown;
    description?: string;
    purpose?: string;
    ingredients?: unknown[];
    materials?: unknown[];
    steps?: string[];
    incantation?: string;
  }

  for (const spellId of SELF_LOVE_SPELL_IDS) {
    const spellData = (spellsData as SpellDataRaw[]).find(
      (s) =>
        s.id === spellId ||
        (s.title?.toLowerCase() || '').includes(spellId.replace(/-/g, ' ')),
    );

    if (spellData) {
      spells.push({
        id: spellData.id || spellId,
        title: spellData.title || spellId.replace(/-/g, ' '),
        level: mapDifficulty(spellData.difficulty),
        duration: spellData.duration || '15 minutes',
        moonPhases: formatMoonPhases(spellData.timing),
        description: spellData.description || spellData.purpose || '',
        materials: (spellData.ingredients || spellData.materials || []).map(
          formatMaterial,
        ),
        steps: (spellData.steps || []).map(polishStepText),
        incantation: spellData.incantation,
      });
    }
  }

  // If we didn't find spells in the data, use curated defaults
  if (spells.length === 0) {
    return getDefaultSelfLoveSpells();
  }

  return spells;
}

// Fallback spells with refined Lunary voice
function getDefaultSelfLoveSpells(): PdfSpell[] {
  return [
    {
      id: 'rose-quartz-self-love',
      title: 'Rose Quartz Self-Love Ritual',
      level: 'beginner',
      duration: '10-15 minutes',
      moonPhases: ['Waning Crescent', 'New Moon'],
      description:
        'A gentle heart-opening practice using rose quartz to cultivate self-compassion. This ritual invites you to soften toward yourself and remember your inherent worthiness.',
      materials: [
        'Rose quartz crystal (one piece)',
        'Pink or white candle',
        'A handful of rose petals',
        'A small mirror',
      ],
      steps: [
        'Light your candle and place it safely near the mirror.',
        'Hold the rose quartz over your heart and take three slow breaths.',
        'Gaze softly into the mirror and speak kindly to yourself.',
        'Scatter the rose petals around your candle as an offering of self-love.',
        'Sit quietly and feel warmth radiating from your heart centre.',
        'When you feel complete, thank yourself for showing up for this practice.',
      ],
      incantation:
        'I am worthy of love. I am enough, exactly as I am. My heart is open to receiving the love I so freely give to others.',
    },
    {
      id: 'mirror-affirmation-ritual',
      title: 'Mirror Affirmation Ritual',
      level: 'beginner',
      duration: '5-10 minutes',
      moonPhases: ['Any'],
      description:
        'A simple yet profound daily practice of speaking affirmations to your own reflection. This ritual strengthens self-trust and rewires old patterns of self-criticism.',
      materials: ['A mirror', 'A quiet, private space'],
      steps: [
        'Stand comfortably before a mirror, ideally in natural light.',
        'Take three slow, centering breaths.',
        'Meet your own gaze with gentle compassion.',
        'Speak your affirmations aloud, slowly and with intention.',
        'Notice any resistance that arises, and breathe through it.',
        'Close with a small nod or smile of acknowledgement to yourself.',
      ],
    },
    {
      id: 'self-love-bath',
      title: 'Self-Love Ritual Bath',
      level: 'beginner',
      duration: '30-45 minutes',
      moonPhases: ['Full Moon', 'Waxing Gibbous'],
      description:
        'A nourishing bath ritual designed to cleanse self-doubt and restore your sense of worth. Allow the water to hold you as you release what no longer serves you.',
      materials: [
        'Epsom salt or sea salt (one cup)',
        'Rose petals or dried lavender',
        'Two or three pink candles',
        'Rose or ylang ylang essential oil',
      ],
      steps: [
        'Draw a warm bath and add the salt while silently setting your intention.',
        'Scatter the rose petals and add a few drops of essential oil.',
        'Light your candles and soften the room lighting.',
        'Step into the bath and visualise the water glowing with soft pink light.',
        'As you soak, imagine all self-doubt gently dissolving into the water.',
        'When you drain the bath, visualise any lingering heaviness flowing away.',
      ],
    },
    {
      id: 'boundary-setting-spell',
      title: 'Boundary Setting Spell',
      level: 'intermediate',
      duration: '20-30 minutes',
      moonPhases: ['Waning Moon', 'Last Quarter'],
      description:
        'A protective ritual to help you establish and honour healthy boundaries. Setting boundaries is an essential act of self-preservation and, ultimately, an expression of self-love.',
      materials: [
        'One black candle',
        'One white candle',
        'A small bowl of salt',
        'Paper and pen',
      ],
      steps: [
        'Create a circle of salt around your workspace for protection.',
        'Light the black candle to represent what you are releasing.',
        'Write down the boundaries you need to set, being as specific as feels right.',
        'Light the white candle to represent your protected, sovereign self.',
        'Read your boundaries aloud with quiet conviction.',
        'Fold the paper and keep it somewhere safe as a reminder.',
        'Allow the candles to burn down safely as your intention takes root.',
      ],
      incantation:
        'I honour my needs. I protect my energy. My boundaries are valid, necessary, and an act of love.',
    },
  ];
}

// The complete Self-Love Pack definition
export const selfLovePackData: PdfPack = createPdfPack({
  slug: 'self-love-ritual-pack',
  title: 'Self-Love Ritual Pack',
  subtitle: 'Gentle rituals for reconnection',
  moodText:
    'A tender collection of practices to help you remember your worth, honour your boundaries, and cultivate deep compassion for yourself.',
  perfectFor: [
    'Those healing from difficult relationships.',
    'Anyone learning to prioritise their own needs.',
    'People working on inner child healing.',
    'Those seeking meaningful daily self-care rituals.',
  ],
  introText:
    'Self-love is not selfish — it is the foundation from which all other love flows. These rituals are designed to help you reconnect with yourself, honour your boundaries, and remember that you deserve the same care you so freely offer to others.',
  beforeYouBegin:
    'Before beginning any ritual, take a moment to centre yourself. Find a quiet space where you will not be disturbed. Ground your energy, set your intention, and create a sense of sacred space. These practices work best when you are fully present.',
  spells: buildSelfLoveSpells(),
  closingText:
    'Thank you for taking this time to nurture yourself. Self-love is a practice, not a destination — there is no finish line, only a deepening. Return to these rituals whenever you need to reconnect with your heart.',
  optionalAffirmation:
    'You are worthy of love — from others, and especially from yourself. Trust your journey, honour your pace, and know that you are enough, exactly as you are.',
});

/**
 * Generate the Self-Love Pack PDF
 */
export async function generateSelfLovePackPdf(): Promise<Uint8Array> {
  return generatePackPdf(selfLovePackData);
}
