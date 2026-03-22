/**
 * Self-Love Ritual Pack
 *
 * A curated collection of rituals focused on self-compassion,
 * boundaries, and inner reconnection.
 */

import { PdfPack, PdfSpell, createPdfPack } from '../schema';
import { watermarkTemplate } from '@/utils/steganography';
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
      title: 'Rose Quartz Heart-Opening Ritual',
      level: 'beginner',
      duration: '15-20 minutes',
      moonPhases: ['New Moon', 'Waxing Crescent'],
      description:
        'Rose quartz is the stone most associated with self-compassion -- not the performative kind, but the quiet, steady kind that helps you stop being so hard on yourself. This ritual uses it to soften the internal critic and open the heart chakra to receiving kindness inward. The mirror element makes it mirror work: looking at yourself directly while holding warmth toward what you see.',
      materials: [
        'Rose quartz crystal (one palm-sized piece, or two smaller ones)',
        'Pink or white candle',
        'A handful of fresh or dried rose petals',
        'A small mirror you can hold or rest on a surface',
        'Optional: a few drops of rose or geranium essential oil on your wrists',
      ],
      steps: [
        'Create a small circle of rose petals on your surface. Place the mirror at the centre and your candle behind it.',
        'Light the candle. Sit comfortably with your spine upright but not rigid.',
        'Hold the rose quartz in both hands over your heart. Feel its weight -- cool at first, then warming.',
        'Take five slow breaths. With each exhale, consciously soften your jaw, your shoulders, and your belly.',
        'Pick up the mirror and look at your face -- not to analyse or judge, but to simply witness. You are looking at someone who has been through things. Let that land.',
        'Say aloud, slowly: "I am learning to be as kind to myself as I am to the people I love." If this feels untrue, say it anyway -- it is an intention, not a claim.',
        'Rest the mirror down. Place both hands over your heart with the rose quartz underneath and sit quietly for three to five minutes. Feel the warmth building at your chest.',
        'When you feel complete, scatter the rose petals outside or place them in your bin with gratitude. Keep the rose quartz on your bedside table for the next week.',
      ],
      incantation:
        'I am worthy of the love I give so freely to others. I am allowed to receive. I am learning -- and that is enough.',
    },
    {
      id: 'mirror-affirmation-ritual',
      title: 'Mirror Work: Meeting Yourself',
      level: 'beginner',
      duration: '7-10 minutes daily for one week',
      moonPhases: ['Any moon phase'],
      description:
        'Mirror work is uncomfortable for most people -- and that discomfort is exactly the point. When you cannot hold your own gaze kindly, that is information about where self-love work needs to happen. This practice, developed by Louise Hay and used widely in somatic therapy, rewires the inner critical voice by interrupting it daily with direct compassionate contact. Do it for seven consecutive days before judging its effect.',
      materials: [
        'A mirror large enough to see your face clearly',
        'A quiet, private space where you will not be interrupted',
        'Optional: a candle to create intention around the practice',
      ],
      steps: [
        'Stand or sit before the mirror. If you are using a candle, light it now.',
        'Take three slow breaths. Notice your first instinct -- to look away, to find something wrong, to feel awkward. That instinct is what you are here to work with.',
        'Meet your own eyes. Hold the gaze for a full minute without looking away. This is harder than it sounds.',
        'Speak one of these statements aloud, slowly, as if you mean it even if you do not yet: "I see you. I am not going anywhere. You are safe with me."',
        'Notice what arises -- resistance, emotion, dismissal, or something unexpected like tenderness. Do not judge what comes up. Just notice.',
        'Continue for five to seven minutes, alternating between silence and speaking kindly to yourself. You might apologise for old harshness. You might say something you have needed to hear for years.',
        'Close by placing one hand on your own cheek or heart and saying: "I am learning to love you. I am showing up."',
        'Do this practice for seven consecutive days. Journal for two minutes after each session: what came up, what shifted, what surprised you.',
      ],
    },
    {
      id: 'self-love-bath',
      title: 'Ritual Cleansing Bath',
      level: 'beginner',
      duration: '40-60 minutes',
      moonPhases: ['Full Moon', 'Waxing Gibbous'],
      description:
        "Water has long been used in ritual for its capacity to hold, dissolve, and release. This bath is not about indulgence -- it is a somatic practice of letting yourself be held while consciously releasing the weight of how you have been treating yourself. The salt draws out energetic residue. The heat softens the body's habitual armour. Your only task is to stay present and receive.",
      materials: [
        'Epsom salt or coarse sea salt (one cup)',
        'Rose petals, fresh or dried',
        'Two or three pink or white candles',
        'Rose, ylang ylang, or neroli essential oil (five to eight drops)',
        'Optional: a piece of rose quartz to rest at the edge of the bath',
      ],
      steps: [
        'Before drawing the bath, tidy the bathroom briefly -- clutter in the space creates clutter in the mind. This is part of the ritual.',
        'Draw a comfortably warm bath. As the water runs, add the salt and speak your intention aloud: "I am releasing the weight of my own judgement. I am allowing myself to be held."',
        'Scatter the rose petals onto the water. Add the essential oil. Light your candles and turn off or dim the overhead lights.',
        'Step in slowly and deliberately. This is not a functional bath -- it is a ritual one. Feel the water receive your weight.',
        'Lie back and breathe. On each inhale, draw warmth into your chest. On each exhale, let your body release a layer of tension it has been holding.',
        'Spend at least twenty minutes soaking. If thoughts arise, do not chase them -- simply return to the sensation of the water.',
        'When you are ready to drain the bath, sit up first. Place both hands on the water and say: "I release what I no longer need to carry." Then pull the plug and remain until the water has fully drained. Let it take what it came for.',
        'Dry yourself slowly and with care, as if tending to someone you love.',
      ],
    },
    {
      id: 'inner-child-healing',
      title: 'Inner Child Reconnection',
      level: 'intermediate',
      duration: '25-35 minutes',
      moonPhases: ['New Moon', 'Waning Crescent'],
      description:
        'Much of the difficulty with self-love is not about the adult you are now -- it is about the child who was taught that certain parts of you were too much, not enough, wrong, or unlovable. Inner child work is the practice of going back to meet that younger self with the care they did not receive. This is emotionally active work. Have a journal nearby and be gentle with yourself afterwards.',
      materials: [
        'A childhood photograph of yourself, or simply your imagination',
        'A candle in a soft colour -- pink, cream, or pale yellow',
        'A journal and pen',
        'A comfortable place to sit or lie down',
        'Optional: a small soft object to hold during the visualisation',
      ],
      steps: [
        'Light your candle. Sit comfortably and spend two minutes breathing slowly to arrive fully in the present.',
        'If you have a childhood photo, hold it or place it where you can see it. If not, close your eyes and recall an image of yourself as a young child -- whatever age surfaces first.',
        'Close your eyes. Breathe slowly and allow that younger version of you to become clear in your mind. Notice how old they seem, what they are wearing, what their expression is.',
        'In your imagination, approach them. Sit down at their level. You are not here to fix anything -- you are here to be present.',
        'Speak to them, either silently or aloud: "I know things were hard. I know you felt [alone / not good enough / too much / overlooked -- use whatever is true]. That was not your fault."',
        'Ask them what they needed most that they did not get. Wait quietly for whatever arises -- an image, a word, a feeling, a memory.',
        'Offer them that thing now, symbolically. If they needed to feel safe, say: "You are safe now. I am here and I am not going anywhere." If they needed to be seen, say: "I see you. All of you. You are not too much."',
        'Sit with them for as long as feels right. When you are ready to close, let the image gently fade and return your attention to your breath and the room.',
        'Open your eyes and write in your journal immediately -- what came up, what surprised you, what the younger you seemed to need most.',
      ],
      incantation:
        'I see you, younger me. I am sorry it was hard. I am here now, and I am not going anywhere. You were always enough.',
    },
    {
      id: 'self-forgiveness-ritual',
      title: 'Self-Forgiveness Ritual',
      level: 'intermediate',
      duration: '20-30 minutes',
      moonPhases: ['Waning Moon', 'Dark Moon'],
      description:
        'Self-love without self-forgiveness is incomplete. Most people carry a private list of things they have done, said, or failed to do -- and that list sits in the body as low-level shame. This ritual is not about excusing harm. It is about releasing the ongoing punishment of guilt that has already taught you what it needed to. Repeating your mistakes in your mind does not undo them. Forgiving yourself creates space to do better.',
      materials: [
        'Paper and pen',
        'A fireproof bowl or cauldron (or a bowl of water if burning is not possible)',
        'One black candle and one white candle',
        'Optional: a piece of black tourmaline for protection during the process',
      ],
      steps: [
        'Light the black candle. Sit quietly and allow whatever you have been carrying to surface -- the things you regret, the ways you have let yourself or others down, the behaviours you wish had been different.',
        'Write them down, one per line, without softening them. Be honest. This list is for you only.',
        'Read back what you have written. For each item, ask: "Have I learned what this was trying to teach me?" If yes, you are ready to release it. If not yet, place it aside and return to it another time.',
        'For each item you are ready to release, say aloud: "I acknowledge what I did. I hold myself accountable. And I choose to stop punishing myself for it now."',
        "Light the white candle from the black candle's flame.",
        'Burn each piece of paper (or tear and dissolve in water), saying with each one: "I release this. I forgive myself. I am more than my worst moments."',
        'Sit with both candles burning for five minutes. Let the white candle represent who you are choosing to be from this point forward.',
        'Snuff both candles when you feel complete. Do not return to the list.',
      ],
      incantation:
        'I have carried this long enough. I acknowledge it, I learn from it, and I release it. I am not defined by my worst moments. I am becoming.',
    },
    {
      id: 'boundary-setting-spell',
      title: 'Boundaries as Self-Love',
      level: 'intermediate',
      duration: '25-35 minutes',
      moonPhases: ['Waning Moon', 'Last Quarter'],
      description:
        'Boundaries are not walls -- they are the structure that makes genuine connection possible. Without them, you give from depletion, resent those you love, and lose yourself trying to keep everyone else comfortable. Setting a boundary is not an act of rejection. It is an act of self-knowledge and self-respect, and it is one of the most concrete expressions of self-love available to you. This ritual helps you identify and commit to specific boundaries with intention.',
      materials: [
        'One black candle (for releasing people-pleasing and over-extension)',
        'One white candle (for your protected, sovereign self)',
        'A small bowl of salt (for protection)',
        'Paper and pen',
        'Optional: black tourmaline to hold during the ritual',
      ],
      steps: [
        'Create a small circle of salt around your workspace. This is your protected space.',
        'Light the black candle. Sit quietly and ask yourself: "Where am I giving more than I can honestly give? Where am I saying yes when I mean no? Where is my energy leaking?"',
        'Write down the specific boundaries you need to set. Not "better boundaries in general" -- actual, concrete ones. "I will stop answering work messages after 7pm." "I will not lend money to this person again." "I will leave situations where I am being spoken to unkindly."',
        'Read each boundary aloud once. Notice where your body tightens with fear or guilt -- that tightening is years of conditioning telling you that your needs are too much. They are not.',
        "Light the white candle from the black candle's flame.",
        'Rewrite your boundaries as affirmations on a fresh piece of paper: "My time after 7pm is protected." "My financial stability matters." "I am allowed to leave." Keep this paper.',
        'Speak aloud: "I am not responsible for managing other people\'s discomfort with my boundaries. My needs are legitimate. I choose myself."',
        'Allow both candles to burn down safely. Keep the affirmations paper somewhere you will see it regularly.',
      ],
      incantation:
        'I honour my needs without apology. My boundaries protect what matters most. Choosing myself is not selfish -- it is necessary.',
    },
    {
      id: 'self-worth-candle-magic',
      title: 'Self-Worth Candle Working',
      level: 'beginner',
      duration: '15-20 minutes',
      moonPhases: ['Waxing Moon', 'Full Moon'],
      description:
        'Candle magic works through the principle of focused intention carried by flame. This working specifically targets the deep belief that you are not enough -- a belief most people carry somewhere beneath their conscious thought. It is not a quick fix, but done with genuine focus, it begins to shift the internal narrative toward something more true.',
      materials: [
        'One pink or gold candle (pink for self-love, gold for self-worth and confidence)',
        'A pin, nail, or toothpick for carving',
        'Rose or cinnamon essential oil for anointing',
        'Paper and pen',
      ],
      steps: [
        'Before you begin, write one specific belief about yourself you want to change. Not "I want to love myself more" but the actual limiting belief underneath: "I believe I am too much." "I believe I am fundamentally unlovable." "I believe I do not deserve good things." Be honest.',
        'Carve your name into the candle with the pin. Then carve the opposite of your limiting belief: "I am worthy." "I am lovable." "I deserve good things."',
        'Anoint the candle with the oil, working from the middle outward toward both ends. This draws energy toward you.',
        'Light the candle. Read aloud your limiting belief first: "I have believed that [...]." Then read the carved affirmation: "I am choosing to believe instead that [...]."',
        'Sit with the candle for ten to fifteen minutes. Keep your gaze softly on the flame. Each time your mind wanders toward doubt or self-criticism, gently return to the carved affirmation.',
        'You may let the candle burn down in one session, or snuff it and return to it over several evenings. If you return to it, reread both statements each time.',
        'When the candle is fully burned, write in your journal: what shifted, what resisted, what you noticed.',
      ],
      incantation:
        'I am worthy of love, abundance, and good things -- not because I have earned them, but because I exist. That is enough.',
    },
    {
      id: 'somatic-self-compassion',
      title: 'Somatic Self-Compassion Practice',
      level: 'beginner',
      duration: '10-15 minutes',
      moonPhases: ['Any moon phase'],
      description:
        'Self-compassion is not a thought -- it is a felt experience in the body. This practice, rooted in somatic therapy and the work of Kristin Neff, uses physical touch and breath to activate the parasympathetic nervous system and create the actual felt sense of being comforted. You cannot think your way into self-love. You have to feel it. This practice is for the days when affirmations feel hollow.',
      materials: [
        'A comfortable place to sit or lie down',
        'No other materials needed',
      ],
      steps: [
        'Find a comfortable position. Close your eyes if that feels safe.',
        'Bring to mind something you are currently struggling with -- something you have been harsh toward yourself about. Hold it lightly, not with force.',
        'Notice where you feel this in your body. A tightness in the chest? A heaviness in the stomach? A constriction in the throat? Place one or both hands on that place.',
        'Apply gentle pressure -- the kind you would use to comfort a distressed friend. Feel the warmth of your own hands.',
        'Say silently or aloud: "This hurts. Struggling is part of being human. I am not alone in this."',
        'Now take three slow, deep breaths into the area beneath your hands. With each inhale, imagine warmth and ease flowing in. With each exhale, let some of the tightness soften.',
        'Repeat the phrases three times, slowly: "This is a moment of suffering. Suffering is part of life. I am giving myself the compassion I need right now."',
        'Remain in this position for five to eight minutes, breathing slowly. You do not need to feel dramatically different when you finish. The practice is the practice -- the shifts accumulate.',
      ],
    },
  ];
}

// The complete Self-Love Pack definition
export const selfLovePackData: PdfPack = createPdfPack({
  slug: 'self-love-ritual-pack',
  title: 'Self-Love Ritual Pack',
  subtitle: 'Practices for the person you keep putting last',
  moodText:
    'Self-care is what you do for yourself. Self-love is how you feel about yourself. This pack is for the second one -- the harder one. The one that requires you to actually look.',
  perfectFor: [
    'Those healing from relationships where they lost themselves.',
    'Anyone who finds it easier to care for others than to receive care themselves.',
    'People doing inner child work and wanting a ritual container for it.',
    'Those ready to move beyond surface-level self-care into something with more depth.',
  ],
  introText:
    'Self-love is not bubble baths and saying nice things. Those things can be part of it, but the root of self-love is something quieter and more demanding: the willingness to actually be with yourself, especially in the places that are hard. The rituals in this pack address eight distinct dimensions of self-love -- heart opening, mirror work, somatic release, inner child healing, self-forgiveness, boundaries, self-worth, and self-compassion. They are designed to be worked with over time, not all at once. Start with the one that makes you slightly uncomfortable. That is usually the most useful place to begin. A note on self-care versus self-love: self-care is an action -- taking a bath, resting, eating well. Self-love is a relationship -- with your own needs, your own body, your own history. Self-care without self-love can become another performance. This pack is interested in the relationship.',
  beforeYouBegin:
    'Before any of these practices, take two minutes to arrive. Not to be in the right mood -- you will rarely be in the right mood. Just to be present. Sit, place your feet on the floor, and take three slow breaths. That is enough. These practices are not about doing them perfectly. They are about showing up for yourself with whatever you have available today.',
  spells: buildSelfLoveSpells(),
  closingText: watermarkTemplate(
    'Thank you for spending this time with yourself. Self-love is built in small moments of choosing yourself -- not the grand gestures, but the quiet decisions to be a little less harsh, a little more patient, a little more honest about what you actually need. Return to these practices whenever you have drifted. There is no failing at this. There is only returning.',
    'self-love',
  ),
  optionalAffirmation:
    'I am learning to be on my own side. Not perfectly, not all at once -- but consistently, and with more kindness than I used to manage. That is enough.',
});

/**
 * Generate the Self-Love Pack PDF
 */
export async function generateSelfLovePackPdf(): Promise<Uint8Array> {
  return generatePackPdf(selfLovePackData);
}
