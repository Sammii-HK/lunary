/**
 * Spell Pack Content Generator
 *
 * Generates rich PDF content for spell packs from the shop configurations.
 */

import { PdfSpellPack, PdfSpell } from '../schema';
import { spellDatabase } from '@/constants/grimoire/spells';

interface SpellPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  descriptionTemplate: string;
  spellCategories: string[];
  moonPhases?: string[];
  keywords: string[];
  perfectFor: string[];
}

function polishStepText(step: string): string {
  if (!step) return step;
  let polished = step.charAt(0).toUpperCase() + step.slice(1);
  if (
    !polished.endsWith('.') &&
    !polished.endsWith('!') &&
    !polished.endsWith('?')
  ) {
    polished += '.';
  }
  const fixes: [RegExp, string][] = [
    [/^Deep breathing/i, 'Take slow, grounding breaths'],
    [/^Intention writing/i, 'Write your intention clearly'],
    [/^Visualisation of/i, 'Visualise'],
    [/^Meditation on/i, 'Meditate on'],
    [/^Focus on/i, 'Bring your attention to'],
    [/as boundary reminder/gi, 'as a reminder of your boundaries'],
    [/as protection/gi, 'as a form of protection'],
    [/for grounding/gi, 'to ground yourself'],
    [/for calmness/gi, 'to cultivate calm'],
    [/for peace/gi, 'to invite peace'],
    [/for clarity/gi, 'to bring clarity'],
    [/Carry (\w+) as /gi, 'Carry $1 to serve as '],
    [/Place crystal on/gi, 'Place the crystal on'],
    [/Light candle/gi, 'Light a candle'],
  ];
  for (const [pattern, replacement] of fixes) {
    polished = polished.replace(pattern, replacement);
  }
  return polished;
}

function polishMaterial(material: string): string {
  let polished = material.charAt(0).toUpperCase() + material.slice(1);
  if (
    !polished.match(/^\d/) &&
    !polished.match(/^(A |An |One |Two |Three )/i)
  ) {
    if (polished.match(/^[aeiou]/i)) {
      polished = `An ${polished.toLowerCase()}`;
    }
  }
  return polished;
}

function getSpellsForCategory(
  categories: string[],
  moonPhases?: string[],
): PdfSpell[] {
  const matchingSpells = spellDatabase.filter((spell) => {
    const categoryMatch = categories.includes(spell.category);
    const moonMatch =
      !moonPhases ||
      moonPhases.some(
        (phase) =>
          spell.timing.moonPhases?.includes(phase) ||
          spell.timing.moonPhases?.includes('Any'),
      );
    return categoryMatch || moonMatch;
  });

  return matchingSpells.slice(0, 5).map((spell) => ({
    id: spell.id,
    title: spell.title,
    level:
      (spell.difficulty as 'beginner' | 'intermediate' | 'advanced') ||
      'beginner',
    duration: spell.duration || '15–20 minutes',
    moonPhases: spell.timing.moonPhases,
    description: spell.description || spell.purpose || '',
    materials: (spell.ingredients || spell.materials || []).map((m: any) =>
      typeof m === 'string'
        ? polishMaterial(m)
        : polishMaterial(m.name || String(m)),
    ),
    steps: (spell.steps || []).map(polishStepText),
    incantation: spell.incantation,
  }));
}

const INTRO_TEMPLATES: Record<string, string> = {
  manifestation:
    'Manifestation is the art of aligning your intentions with universal energy. These rituals help you plant seeds of desire and nurture them into reality. Approach each spell with clarity of purpose and an open heart.',
  protection:
    'Protection magic creates sacred boundaries around your energy, space, and loved ones. These rituals draw from ancient traditions of warding and shielding, adapted for the modern practitioner.',
  love: 'Love magic begins with self-love—the foundation from which all healthy connections flow. These rituals help you open your heart, heal old wounds, and attract the love you deserve.',
  healing:
    'Healing is not linear, and neither is the magic that supports it. These rituals offer gentle companionship on your healing journey, helping you release what no longer serves and restore what nourishes.',
  banishing:
    'Sometimes we must release before we can receive. These banishing rituals help you clear stagnant energy, break unhelpful patterns, and create space for new growth.',
  divination:
    'Divination opens a dialogue with the unseen. These rituals enhance your intuitive abilities and create sacred space for receiving guidance from higher realms.',
  cleansing:
    'Cleansing restores clarity to your energy, space, and spirit. These rituals draw on the purifying power of the elements to refresh and renew.',
};

const CLOSING_TEMPLATES: Record<string, string> = {
  manifestation:
    'Thank you for practising manifestation magic with Lunary. Remember that the universe responds to consistent intention and aligned action. Trust your timing.',
  protection:
    'Thank you for building your protective practice with Lunary. May these shields serve you well, keeping you safe while remaining open to love and connection.',
  love: 'Thank you for opening your heart with Lunary. Love magic works best when rooted in self-compassion. You are worthy of the love you seek.',
  healing:
    'Thank you for your courage in seeking healing. Remember that every small step matters. Be gentle with yourself as you continue this journey.',
  banishing:
    'Thank you for doing this clearing work with Lunary. What you release creates space for what you truly need. Trust the emptiness—it will fill with blessing.',
  divination:
    'Thank you for opening to guidance with Lunary. May your intuition grow stronger with each practice. Trust the messages you receive.',
  cleansing:
    'Thank you for this purification work. May you feel lighter, clearer, and more aligned with your highest self.',
};

export function generateSpellPackContent(
  config: SpellPackConfig,
): PdfSpellPack {
  const primaryCategory = config.spellCategories[0] || 'manifestation';
  const spells = getSpellsForCategory(
    config.spellCategories,
    config.moonPhases,
  );

  if (spells.length === 0) {
    spells.push(
      {
        id: `${config.id}-foundation`,
        title: `${config.title.replace(' Pack', '')} Foundation Ritual`,
        level: 'beginner',
        duration: '15–20 minutes',
        description: `A foundational ritual for ${config.keywords.join(', ')}. This spell establishes the energetic groundwork for deeper practice.`,
        materials: [
          'White candle',
          'Clear quartz crystal',
          'Journal and pen',
          'A quiet, private space',
        ],
        steps: [
          'Create your sacred space by lighting the candle and placing the crystal before you.',
          'Take three deep breaths, releasing tension with each exhale.',
          'Hold the crystal and set your intention clearly in your mind.',
          'Speak your intention aloud, feeling the words resonate in your body.',
          'Sit in stillness for several minutes, allowing the energy to settle.',
          'Journal any insights or feelings that arose during the ritual.',
          'Thank the elements and close your circle.',
        ],
      },
      {
        id: `${config.id}-daily`,
        title: `Daily ${config.keywords[0]?.charAt(0).toUpperCase()}${config.keywords[0]?.slice(1) || 'Practice'} Ritual`,
        level: 'beginner',
        duration: '5–10 minutes',
        description: `A quick daily practice to maintain your connection to ${config.keywords[0] || 'this energy'}.`,
        materials: [
          'A dedicated candle or crystal',
          'Your intention written on paper',
        ],
        steps: [
          'Light your candle or hold your crystal.',
          'Read your written intention with full presence.',
          'Visualise your goal as already achieved.',
          'Feel gratitude for this manifestation.',
          'Carry this energy into your day.',
        ],
      },
      {
        id: `${config.id}-deep`,
        title: `Deep ${config.title.replace(' Pack', '')} Ceremony`,
        level: 'intermediate',
        duration: '30–45 minutes',
        description: `An extended ceremonial working for significant ${config.keywords.join(' and ')} intentions.`,
        materials: [
          'Candles in appropriate colours',
          'Crystals aligned with your intention',
          'Herbs or incense for atmosphere',
          'Journal and pen',
          'Offering bowl',
        ],
        steps: [
          'Prepare your space with care, arranging all materials thoughtfully.',
          'Cast a circle of protection using your preferred method.',
          'Light candles and incense, setting the ceremonial atmosphere.',
          'Enter a meditative state through breath and visualisation.',
          'Speak your intention as a formal invocation.',
          'Perform any specific ritual actions required.',
          'Sit in receptive stillness, open to guidance.',
          'Record all insights and messages received.',
          'Thank any spirits or energies you worked with.',
          'Close your circle and ground your energy.',
        ],
      },
    );
  }

  return {
    type: 'spell',
    slug: config.slug,
    title: config.title,
    subtitle: config.tagline,
    moodText: config.descriptionTemplate,
    perfectFor: config.perfectFor.map((item) =>
      item.endsWith('.') ? item : `${item}.`,
    ),
    introText:
      INTRO_TEMPLATES[primaryCategory] || INTRO_TEMPLATES.manifestation,
    beforeYouBegin:
      'Before beginning any ritual, take a moment to centre yourself. Find a quiet space where you will not be disturbed. Ground your energy, set your intention, and create a sense of sacred space. These practices work best when you are fully present.',
    spells,
    closingText:
      CLOSING_TEMPLATES[primaryCategory] || CLOSING_TEMPLATES.manifestation,
    optionalAffirmation: `I trust my practice. I honour my intentions. The magic I create serves my highest good and the good of all.`,
  };
}
