import type {
  DailyFacet,
  SabbatTheme,
  ThemeCategory,
  ThreadIntent,
  ThreadsSeed,
  WeeklyTheme,
} from './types';

const STOPWORDS = new Set([
  'the',
  'and',
  'of',
  'to',
  'in',
  'a',
  'an',
  'for',
  'with',
  'on',
  'at',
  'your',
  'how',
  'what',
  'why',
  'when',
  'is',
  'are',
  'as',
  'into',
  'from',
]);

function clampWords(text: string, min: number, max: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < min) return { ok: false, text, count: words.length };
  if (words.length > max)
    return {
      ok: false,
      text: words.slice(0, max).join(' '),
      count: words.length,
    };
  return { ok: true, text, count: words.length };
}

function toKeyword(title: string, fallback: string) {
  const cleaned = title
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned.split(' ').filter((t) => t && !STOPWORDS.has(t));
  // Prefer 2-word phrase if possible
  if (tokens.length >= 2) return `${tokens[0]} ${tokens[1]}`;
  if (tokens.length === 1) return tokens[0];
  return fallback;
}

function categoryDefaultKeyword(category: ThemeCategory) {
  switch (category) {
    case 'zodiac':
      return 'zodiac signs';
    case 'planetary':
      return 'planet energy';
    case 'tarot':
      return 'tarot reading';
    case 'lunar':
      return 'moon phase';
    case 'crystals':
      return 'crystal work';
    case 'numerology':
      return 'numerology';
    case 'chakras':
      return 'chakra';
    case 'sabbat':
      return 'wheel of the year';
    default:
      return 'cosmic timing';
  }
}

function categoryAngleTemplates(category: ThemeCategory): Array<{
  intent: ThreadIntent;
  opener: string;
  payload?: string;
  closerType: 'question' | 'try_this';
  closer: string;
}> {
  // Openers are written to be 8–16 words and avoid definition verbs.
  // Keep these punchy. Your renderer will insert the keyword once in sentence one.
  switch (category) {
    case 'tarot':
      return [
        {
          intent: 'observation',
          opener: 'Tarot clicks when you read the pattern, not the card name',
          payload:
            'Look for repeating suits, numbers, and direction across the spread.',
          closerType: 'question',
          closer: 'What pattern keeps showing up for you lately?',
        },
        {
          intent: 'contrast',
          opener:
            'Majors feel like chapters, Minors feel like scenes inside the chapter',
          payload: 'Both matter, but they land differently in a reading.',
          closerType: 'question',
          closer: 'Do you feel stuck in a chapter or a scene right now?',
        },
        {
          intent: 'misconception',
          opener: 'A “bad” card often marks a boundary, not a punishment',
          payload:
            'It shows the part of you that wants to protect your energy.',
          closerType: 'try_this',
          closer:
            'Write one boundary you can hold this week, then keep it tiny.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: read the suit first, then the number, then the story',
          payload:
            'That order stops you from spiralling into one keyword meaning.',
          closerType: 'try_this',
          closer:
            'Try reading one card using that sequence and notice what changes.',
        },
        {
          intent: 'signal',
          opener:
            'A strong signal is the same theme arriving in different suits',
          payload: 'That is the message insisting on being heard.',
          closerType: 'question',
          closer:
            'What theme keeps returning even when you shuffle everything?',
        },
      ];

    case 'zodiac':
      return [
        {
          intent: 'observation',
          opener:
            'Zodiac nuance shows up in habits, not just personality labels',
          payload: 'Watch how you respond under stress and under ease.',
          closerType: 'question',
          closer: 'What habit reveals the real you when nobody is watching?',
        },
        {
          intent: 'contrast',
          opener: 'Elements show the vibe, modalities show the way you move',
          payload:
            'Together they explain why two signs can feel totally different.',
          closerType: 'question',
          closer: 'Do you initiate, stabilise, or adapt most naturally?',
        },
        {
          intent: 'misconception',
          opener: 'Sun sign talk is not the whole story, it is the headline',
          payload: 'Rising, Moon, and house placements add the real plot.',
          closerType: 'try_this',
          closer:
            'Check your Moon and Rising and write one trait you recognise.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: look at the house to find where the sign plays out',
          payload: 'The same sign acts differently depending on life area.',
          closerType: 'try_this',
          closer:
            'Name one life area that feels loud right now, then check its house.',
        },
        {
          intent: 'signal',
          opener: 'A signal you are living a sign well is steadier self-trust',
          payload: 'Less overreaction, more clear choice.',
          closerType: 'question',
          closer: 'Where would you like steadier self-trust this month?',
        },
      ];

    case 'planetary':
      return [
        {
          intent: 'observation',
          opener: 'Planet moods show up as urges before they show up as events',
          payload: 'Notice the impulse, then choose your response.',
          closerType: 'question',
          closer: 'What urge is loud for you today?',
        },
        {
          intent: 'contrast',
          opener:
            'Fast planets shift your day, slow planets reshape your decade',
          payload: 'Both matter, just on different clocks.',
          closerType: 'question',
          closer: 'Do you feel like you are in a daily shift or a life shift?',
        },
        {
          intent: 'misconception',
          opener:
            'A tense transit is not doom, it is pressure that reveals truth',
          payload:
            'It highlights the part of life asking for better structure.',
          closerType: 'try_this',
          closer: 'Pick one pressure point and add one supportive constraint.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: follow Mercury for timing, follow Saturn for commitments',
          payload: 'One helps clarity, one helps durability.',
          closerType: 'try_this',
          closer: 'Delay one commitment until you can name the real cost.',
        },
        {
          intent: 'signal',
          opener:
            'A signal a planet is activated is repetition in the same life theme',
          payload: 'Same lesson, new setting.',
          closerType: 'question',
          closer: 'What lesson do you keep meeting in different disguises?',
        },
      ];

    case 'lunar':
      return [
        {
          intent: 'observation',
          opener: 'Moon timing helps when your energy runs hot and cold',
          payload:
            'It gives your goals a rhythm that does not rely on willpower.',
          closerType: 'question',
          closer: 'Where does your energy swing the most each month?',
        },
        {
          intent: 'contrast',
          opener: 'New Moon is quiet momentum, Full Moon is visible clarity',
          payload: 'Both can be powerful when you stop forcing the same speed.',
          closerType: 'try_this',
          closer: 'Choose one intention and one release and keep both simple.',
        },
        {
          intent: 'misconception',
          opener: 'Moon work is not superstition, it is a planning pattern',
          payload: 'Cycles keep you from treating every day like an emergency.',
          closerType: 'try_this',
          closer: 'Map one project onto the phases and see where it belongs.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: begin, build, adjust, harvest, release, rest, repeat',
          payload: 'Use the phase as a container, not a command.',
          closerType: 'try_this',
          closer: 'Pick today’s phase and do the matching smallest action.',
        },
        {
          intent: 'signal',
          opener:
            'A signal you are aligned is steadier emotion across the month',
          payload: 'Less whiplash, more clear pacing.',
          closerType: 'question',
          closer: 'What would “steady” feel like for you this cycle?',
        },
      ];

    case 'crystals':
      return [
        {
          intent: 'observation',
          opener:
            'Crystal work lands best when your intention is specific and small',
          payload: 'Vague goals create noisy results.',
          closerType: 'question',
          closer: 'What is the smallest intention you want support with today?',
        },
        {
          intent: 'contrast',
          opener:
            'Grounding stones calm the body, clarity stones sharpen the mind',
          payload: 'Pick based on the system you want to soothe.',
          closerType: 'question',
          closer: 'Do you need calmer nerves or clearer thoughts right now?',
        },
        {
          intent: 'misconception',
          opener:
            'You do not need twenty crystals, you need one you actually use',
          payload: 'Consistency beats collecting.',
          closerType: 'try_this',
          closer: 'Choose one stone for seven days and track what shifts.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: cleanse when life feels heavy, charge when you feel ready',
          payload: 'Treat it like energetic hygiene.',
          closerType: 'try_this',
          closer: 'Cleanse one tool today, then set one sentence of intention.',
        },
        {
          intent: 'signal',
          opener:
            'A signal a stone is working is you remembering your intention faster',
          payload: 'Less autopilot, more choice.',
          closerType: 'question',
          closer: 'What pattern do you want to catch sooner next time?',
        },
      ];

    case 'numerology':
      return [
        {
          intent: 'observation',
          opener: 'Numbers show up most when you are at a decision threshold',
          payload: 'They often mirror timing rather than predicting outcomes.',
          closerType: 'question',
          closer: 'What choice is hovering in front of you right now?',
        },
        {
          intent: 'contrast',
          opener:
            'Single digits feel like themes, master numbers feel like assignments',
          payload: 'Same frequency, more intensity and responsibility.',
          closerType: 'question',
          closer: 'Does your current season feel gentle or demanding?',
        },
        {
          intent: 'misconception',
          opener: 'Angel numbers are not commands, they are attention cues',
          payload: 'They highlight what you already know but keep postponing.',
          closerType: 'try_this',
          closer: 'Write the first thought you had when you saw the number.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: reduce the date, then reduce your choices to match the theme',
          payload: 'Simple maths, cleaner direction.',
          closerType: 'try_this',
          closer:
            'Pick one action that matches today’s number theme and do it.',
        },
        {
          intent: 'signal',
          opener:
            'A signal you are on-track is repeating numbers during aligned actions',
          payload: 'Not during doom scrolling, during movement.',
          closerType: 'question',
          closer: 'When do you notice numbers most, during rest or action?',
        },
      ];

    case 'chakras':
      return [
        {
          intent: 'observation',
          opener: 'Chakra imbalances show up in patterns, not just feelings',
          payload: 'Your habits point to the energetic bottleneck.',
          closerType: 'question',
          closer: 'What habit keeps repeating when you are stressed?',
        },
        {
          intent: 'contrast',
          opener:
            'Lower chakras focus stability, upper chakras focus meaning and trust',
          payload: 'Balance is the goal, not living in one zone.',
          closerType: 'question',
          closer: 'Do you need grounding or clarity more right now?',
        },
        {
          intent: 'misconception',
          opener: 'Healing a chakra is not a one-time fix, it is a practice',
          payload: 'Small daily actions change the signal over time.',
          closerType: 'try_this',
          closer:
            'Choose one micro-practice and do it for three days straight.',
        },
        {
          intent: 'quick_rule',
          opener: 'Quick rule: start at the body before you chase insight',
          payload: 'Stability first makes intuition cleaner.',
          closerType: 'try_this',
          closer:
            'Do one grounding action, then check how your thoughts shift.',
        },
        {
          intent: 'signal',
          opener:
            'A signal you are clearing energy is calmer reactions in old triggers',
          payload: 'Same trigger, new response.',
          closerType: 'question',
          closer: 'Which trigger do you want to meet differently next time?',
        },
      ];

    case 'sabbat':
      return [
        {
          intent: 'observation',
          opener:
            'Seasonal rites hit deeper when you treat them as checkpoints',
          payload:
            'They mark shifts in effort, rest, and intention across the year.',
          closerType: 'question',
          closer: 'What season are you in emotionally right now?',
        },
        {
          intent: 'contrast',
          opener:
            'Some sabbats celebrate growth, some honour endings that make space',
          payload: 'Both are needed for a full cycle.',
          closerType: 'question',
          closer: 'Are you building, harvesting, or releasing at the moment?',
        },
        {
          intent: 'misconception',
          opener:
            'You do not need elaborate ritual, you need presence and meaning',
          payload: 'Simple acts done consciously change the tone of the day.',
          closerType: 'try_this',
          closer: 'Light one candle and speak one sentence of gratitude aloud.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: choose one symbol, one action, one intention for the day',
          payload: 'Keep it focused so it stays real.',
          closerType: 'try_this',
          closer: 'Pick a symbol from nature and use it as your anchor today.',
        },
        {
          intent: 'signal',
          opener:
            'A signal the sabbat is landing is sudden clarity about what to keep',
          payload: 'And what you are done carrying.',
          closerType: 'question',
          closer: 'What are you ready to stop carrying into the next season?',
        },
      ];

    default:
      return [
        {
          intent: 'observation',
          opener: 'Some patterns repeat until you change how you meet them',
          closerType: 'question',
          closer: 'What keeps repeating for you lately?',
        },
        {
          intent: 'contrast',
          opener: 'Clarity and comfort rarely arrive at the same time',
          closerType: 'question',
          closer: 'Which one are you choosing right now?',
        },
        {
          intent: 'misconception',
          opener: 'A sign is not proof, it is a prompt to pay attention',
          closerType: 'try_this',
          closer:
            'Write what you felt in the moment, then act from that truth.',
        },
        {
          intent: 'quick_rule',
          opener:
            'Quick rule: name the theme, then pick the smallest aligned action',
          closerType: 'try_this',
          closer: 'Do the smallest version today, not the perfect version.',
        },
        {
          intent: 'signal',
          opener:
            'A signal you are aligned is less forcing and more follow-through',
          closerType: 'question',
          closer: 'Where could you stop forcing and start pacing?',
        },
      ];
  }
}

type ThemeWithCategory = { category: ThemeCategory };

function buildThreads(
  theme: ThemeWithCategory,
  facet: DailyFacet,
): ThreadsSeed {
  const fallbackKeyword = categoryDefaultKeyword(theme.category);
  const keyword = toKeyword(facet.title, fallbackKeyword);

  const angles = categoryAngleTemplates(theme.category).map((a) => {
    const clamped = clampWords(a.opener, 8, 16);
    return {
      ...a,
      opener: clamped.text,
    };
  });

  return { keyword, angles };
}

function ensureFacetThreads(
  theme: ThemeWithCategory,
  facet: DailyFacet,
): DailyFacet {
  return {
    ...facet,
    threads: facet.threads ?? buildThreads(theme, facet),
  };
}

function ensureFacetArray(
  theme: ThemeWithCategory,
  facets: DailyFacet[],
): DailyFacet[] {
  return facets.map((facet) => ensureFacetThreads(theme, facet));
}

/**
 * Attach thread seeds (keyword + angles) to all facets in each theme.
 * Ensures every facet has a .threads property.
 */
export function withThreads(themes: WeeklyTheme[]): WeeklyTheme[] {
  return themes.map((theme) => ({
    ...theme,
    facets: ensureFacetArray(theme, theme.facets),
    facetPool: theme.facetPool
      ? ensureFacetArray(theme, theme.facetPool)
      : undefined,
  }));
}

export function withSabbatThreads(themes: SabbatTheme[]): SabbatTheme[] {
  return themes.map((theme) => ({
    ...theme,
    leadUpFacets: ensureFacetArray(theme, theme.leadUpFacets),
  }));
}
