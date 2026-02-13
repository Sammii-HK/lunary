import type { IGCarouselSlide } from './types';
import type { ThemeCategory } from '@/lib/social/types';
import { seededRandom } from './ig-utils';

// --- Zodiac Sign Data ---

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈' },
  { name: 'Taurus', symbol: '♉' },
  { name: 'Gemini', symbol: '♊' },
  { name: 'Cancer', symbol: '♋' },
  { name: 'Leo', symbol: '♌' },
  { name: 'Virgo', symbol: '♍' },
  { name: 'Libra', symbol: '♎' },
  { name: 'Scorpio', symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn', symbol: '♑' },
  { name: 'Aquarius', symbol: '♒' },
  { name: 'Pisces', symbol: '♓' },
] as const;

// --- Trait Data ---

interface TraitData {
  [key: string]: {
    label: string;
    words: Record<string, string>;
    explanations: Record<string, string>;
  };
}

const TRAIT_DATA: TraitData = {
  love_language: {
    label: 'Love Language',
    words: {
      Aries: 'Passion',
      Taurus: 'Devotion',
      Gemini: 'Words',
      Cancer: 'Nurture',
      Leo: 'Adoration',
      Virgo: 'Service',
      Libra: 'Romance',
      Scorpio: 'Intensity',
      Sagittarius: 'Freedom',
      Capricorn: 'Loyalty',
      Aquarius: 'Space',
      Pisces: 'Empathy',
    },
    explanations: {
      Aries:
        'You express love through fiery intensity and spontaneous gestures.',
      Taurus:
        'You show love through steady commitment and unwavering presence.',
      Gemini:
        'You communicate love through heartfelt conversations and witty banter.',
      Cancer:
        'You express care through emotional support and nurturing actions.',
      Leo: 'You love by making your partner feel like the center of the universe.',
      Virgo: 'You show love through thoughtful acts and practical support.',
      Libra:
        'You express affection through beauty, balance, and grand gestures.',
      Scorpio:
        'You love with deep emotional connection and all-consuming devotion.',
      Sagittarius:
        'You show love by giving space and sharing adventures together.',
      Capricorn:
        'You express commitment through reliability and long-term dedication.',
      Aquarius:
        'You love by respecting independence and intellectual connection.',
      Pisces:
        'You show love through deep understanding and emotional resonance.',
    },
  },
  biggest_fear: {
    label: 'Biggest Fear',
    words: {
      Aries: 'Irrelevance',
      Taurus: 'Instability',
      Gemini: 'Silence',
      Cancer: 'Rejection',
      Leo: 'Being ignored',
      Virgo: 'Failure',
      Libra: 'Loneliness',
      Scorpio: 'Betrayal',
      Sagittarius: 'Routine',
      Capricorn: 'Mediocrity',
      Aquarius: 'Conformity',
      Pisces: 'Reality',
    },
    explanations: {
      Aries: 'You fear becoming invisible or losing your edge in the world.',
      Taurus:
        "You dread chaos and the loss of security you've worked to build.",
      Gemini:
        'You fear boredom and being trapped without stimulation or dialogue.',
      Cancer:
        'You fear emotional abandonment and not being needed by loved ones.',
      Leo: 'You dread being overlooked or your light going unacknowledged.',
      Virgo: 'You fear not meeting your own impossibly high standards.',
      Libra: 'You dread isolation and navigating life without partnership.',
      Scorpio:
        'You fear vulnerability being weaponized or trust being shattered.',
      Sagittarius:
        'You dread being confined to monotony and losing your sense of freedom.',
      Capricorn:
        "You fear settling for less than the legacy you're meant to build.",
      Aquarius: 'You dread losing your individuality to societal expectations.',
      Pisces:
        'You fear harsh realities that shatter your idealistic worldview.',
    },
  },
  toxic_trait: {
    label: 'Toxic Trait',
    words: {
      Aries: 'Impatience',
      Taurus: 'Stubbornness',
      Gemini: 'Inconsistency',
      Cancer: 'Clinginess',
      Leo: 'Ego',
      Virgo: 'Overthinking',
      Libra: 'Indecision',
      Scorpio: 'Jealousy',
      Sagittarius: 'Commitment-phobia',
      Capricorn: 'Coldness',
      Aquarius: 'Detachment',
      Pisces: 'Escapism',
    },
    explanations: {
      Aries: "You rush ahead without considering consequences or others' pace.",
      Taurus:
        'You refuse to budge even when flexibility would serve you better.',
      Gemini: "You change your mind so often others can't rely on your word.",
      Cancer: 'You hold on too tight, afraid to let people breathe and grow.',
      Leo: 'You make everything about yourself and crave constant validation.',
      Virgo: 'You analyze every detail until anxiety paralyzes your peace.',
      Libra:
        'You avoid choosing, leaving others frustrated and plans in limbo.',
      Scorpio:
        "You possessively guard what's yours, pushing people away with suspicion.",
      Sagittarius:
        'You flee at the first sign of restriction or long-term responsibility.',
      Capricorn:
        'You prioritize ambition over warmth, shutting people out emotionally.',
      Aquarius:
        'You intellectualize feelings instead of engaging with them authentically.',
      Pisces:
        'You retreat into fantasy when reality becomes too uncomfortable to face.',
    },
  },
  secret_talent: {
    label: 'Secret Talent',
    words: {
      Aries: 'Leadership',
      Taurus: 'Patience',
      Gemini: 'Adaptation',
      Cancer: 'Intuition',
      Leo: 'Inspiration',
      Virgo: 'Precision',
      Libra: 'Diplomacy',
      Scorpio: 'Transformation',
      Sagittarius: 'Optimism',
      Capricorn: 'Strategy',
      Aquarius: 'Innovation',
      Pisces: 'Healing',
    },
    explanations: {
      Aries:
        'You naturally rally others and charge forward when no one else will.',
      Taurus:
        'You possess the rare ability to wait for the perfect moment with grace.',
      Gemini:
        'You seamlessly adjust to any situation, blending in or standing out as needed.',
      Cancer:
        'You read emotional undercurrents others miss, sensing truth beneath words.',
      Leo: "You uplift others simply by believing in them and showing what's possible.",
      Virgo:
        'You notice the tiny details that make the difference between good and perfect.',
      Libra:
        'You navigate conflict with grace, finding common ground where others see war.',
      Scorpio:
        'You transmute pain into power, emerging stronger from every dark night.',
      Sagittarius:
        'You find the silver lining and inspire others to keep believing in possibility.',
      Capricorn:
        'You see the long game and plan moves that position you miles ahead.',
      Aquarius:
        "You envision futures others can't imagine and invent what doesn't exist yet.",
      Pisces:
        "You absorb others' pain and offer comfort that soothes the deepest wounds.",
    },
  },
  guilty_pleasure: {
    label: 'Guilty Pleasure',
    words: {
      Aries: 'Drama',
      Taurus: 'Indulgence',
      Gemini: 'Gossip',
      Cancer: 'Nostalgia',
      Leo: 'Attention',
      Virgo: 'Control',
      Libra: 'Flirting',
      Scorpio: 'Stalking',
      Sagittarius: 'Impulse',
      Capricorn: 'Workaholism',
      Aquarius: 'Chaos',
      Pisces: 'Daydreaming',
    },
    explanations: {
      Aries:
        'You secretly love stirring the pot just to feel that adrenaline rush.',
      Taurus:
        'You treat yourself to luxuries you swore you could resist this time.',
      Gemini:
        "You know everyone's business and honestly you wouldn't have it any other way.",
      Cancer:
        'You replay old memories and romanticize the past until it aches beautifully.',
      Leo: 'You refresh your notifications more than you would ever publicly admit.',
      Virgo:
        "You reorganize things that don't need it just because it calms your brain.",
      Libra:
        'You charm people with zero intention of following through and enjoy every second.',
      Scorpio:
        "You deep-dive into people's profiles at 2am and call it research.",
      Sagittarius:
        'You book trips you cannot afford and figure out the details later.',
      Capricorn: "You work on weekends and pretend it's just a quick check-in.",
      Aquarius:
        'You provoke conventional thinkers just to watch them short-circuit.',
      Pisces:
        'You build entire fantasy lives in your head instead of doing actual tasks.',
    },
  },
  red_flag: {
    label: 'Red Flag',
    words: {
      Aries: 'Aggression',
      Taurus: 'Possessiveness',
      Gemini: 'Gaslighting',
      Cancer: 'Guilt-tripping',
      Leo: 'Narcissism',
      Virgo: 'Criticism',
      Libra: 'People-pleasing',
      Scorpio: 'Manipulation',
      Sagittarius: 'Ghosting',
      Capricorn: 'Emotional-walls',
      Aquarius: 'Unavailability',
      Pisces: 'Victimhood',
    },
    explanations: {
      Aries:
        'You escalate conflicts to nuclear levels before anyone can finish a sentence.',
      Taurus:
        "You treat people like belongings and get territorial over what's not yours to keep.",
      Gemini:
        'You rewrite the narrative so smoothly that people question their own memory.',
      Cancer:
        'You weaponize your emotions to make others feel responsible for your pain.',
      Leo: "You redirect every conversation back to yourself and don't even notice you're doing it.",
      Virgo:
        'You disguise harsh judgment as helpful advice and wonder why people pull away.',
      Libra:
        'You agree with everyone to avoid conflict, then resent them for not reading your mind.',
      Scorpio:
        'You test loyalty with invisible games that nobody signed up to play.',
      Sagittarius:
        'You vanish when things get real and reappear like nothing happened.',
      Capricorn:
        'You shut down emotionally and expect others to just deal with the silence.',
      Aquarius:
        "You're physically present but emotionally on a different planet entirely.",
      Pisces:
        'You cast yourself as the main character tragedy and resist anyone trying to help.',
    },
  },
  hidden_strength: {
    label: 'Hidden Strength',
    words: {
      Aries: 'Resilience',
      Taurus: 'Endurance',
      Gemini: 'Versatility',
      Cancer: 'Protection',
      Leo: 'Generosity',
      Virgo: 'Devotion',
      Libra: 'Perception',
      Scorpio: 'Rebirth',
      Sagittarius: 'Faith',
      Capricorn: 'Discipline',
      Aquarius: 'Detachment',
      Pisces: 'Compassion',
    },
    explanations: {
      Aries:
        'You bounce back from devastation faster than anyone thinks is humanly possible.',
      Taurus:
        'You outlast every storm through sheer willpower when everyone else crumbles.',
      Gemini:
        'You reinvent yourself on command, turning any curveball into a new chapter.',
      Cancer:
        'You become an absolute force of nature when someone you love is threatened.',
      Leo: 'You give everything to the people you love, even when your own tank is empty.',
      Virgo:
        "You show love through quiet dedication that most people don't even notice.",
      Libra:
        'You read the room with surgical accuracy and see dynamics nobody else catches.',
      Scorpio:
        "You rise from your own ashes repeatedly and each time you're more powerful.",
      Sagittarius:
        'You maintain hope in situations that would break anyone else entirely.',
      Capricorn:
        'You keep building in silence while others are still talking about starting.',
      Aquarius:
        'You walk away from what no longer serves you without looking back once.',
      Pisces:
        'You hold space for pain that would crush others and somehow still choose kindness.',
    },
  },
  dealbreaker: {
    label: 'Dealbreaker',
    words: {
      Aries: 'Passivity',
      Taurus: 'Dishonesty',
      Gemini: 'Boredom',
      Cancer: 'Dismissiveness',
      Leo: 'Disrespect',
      Virgo: 'Laziness',
      Libra: 'Cruelty',
      Scorpio: 'Deception',
      Sagittarius: 'Control',
      Capricorn: 'Flakiness',
      Aquarius: 'Judgment',
      Pisces: 'Apathy',
    },
    explanations: {
      Aries:
        'You lose all attraction the moment someone refuses to match your energy.',
      Taurus:
        "You'll forgive almost anything except being lied to — trust is non-negotiable.",
      Gemini:
        "You'd rather be alone forever than stuck with someone who has nothing to say.",
      Cancer:
        'You shut down instantly when someone makes you feel like your emotions are too much.',
      Leo: "You're gone the second someone makes you feel small or takes you for granted.",
      Virgo:
        'You cannot respect anyone who consistently chooses shortcuts over doing things right.',
      Libra:
        'You draw hard lines at unkindness — cruelty disgusts you on a primal level.',
      Scorpio:
        "You can forgive chaos, but one lie and you'll never see that person the same.",
      Sagittarius:
        'You suffocate the instant someone tries to clip your wings or restrict your world.',
      Capricorn:
        "You can't build with someone who cancels plans and doesn't follow through.",
      Aquarius:
        'You immediately distance yourself from anyone who tries to shame your individuality.',
      Pisces:
        "You can't stay with someone who feels nothing deeply — coldness repels you.",
    },
  },
  emotional_weapon: {
    label: 'Emotional Weapon',
    words: {
      Aries: 'Rage',
      Taurus: 'Silence',
      Gemini: 'Words',
      Cancer: 'Tears',
      Leo: 'Withdrawal',
      Virgo: 'Logic',
      Libra: 'Charm',
      Scorpio: 'Revenge',
      Sagittarius: 'Indifference',
      Capricorn: 'Dismissal',
      Aquarius: 'Erasure',
      Pisces: 'Guilt',
    },
    explanations: {
      Aries:
        'You unleash a firestorm that leaves people stunned and scrambling for cover.',
      Taurus:
        "You go so quiet that people panic harder than if you'd actually yelled.",
      Gemini:
        'You know exactly what to say to dismantle someone with surgical precision.',
      Cancer:
        "You cry in a way that makes the other person feel like history's greatest villain.",
      Leo: 'You withdraw your warmth and suddenly they realize how cold the world gets without you.',
      Virgo:
        'You disassemble their argument point by point until they wish they never spoke.',
      Libra:
        'You stay so graceful during conflict that the other person looks unhinged by comparison.',
      Scorpio:
        "You don't get mad — you get even, and they never see it coming.",
      Sagittarius:
        'You move on so quickly it makes them question if you ever cared at all.',
      Capricorn:
        'You look at someone like they are completely beneath your consideration.',
      Aquarius:
        "You cut people out so cleanly it's as if they never existed in your world.",
      Pisces:
        'You make people feel the weight of how badly they hurt you without saying a word.',
    },
  },
  midnight_thought: {
    label: 'Midnight Thought',
    words: {
      Aries: 'Legacy',
      Taurus: 'Security',
      Gemini: 'Identity',
      Cancer: 'Belonging',
      Leo: 'Purpose',
      Virgo: 'Enough',
      Libra: 'Soulmate',
      Scorpio: 'Trust',
      Sagittarius: 'Meaning',
      Capricorn: 'Worth',
      Aquarius: 'Connection',
      Pisces: 'Escape',
    },
    explanations: {
      Aries:
        "You lie awake wondering if you're building something that will actually last.",
      Taurus:
        "You replay whether you've saved enough, loved enough, and protected what matters.",
      Gemini:
        'You spiral at 3am wondering which version of yourself is the real one.',
      Cancer:
        'You ache wondering if the people you love feel as deeply connected as you do.',
      Leo: "You stare at the ceiling asking yourself if you're chasing impact or just applause.",
      Virgo:
        'You torture yourself wondering if anything you do will ever feel truly good enough.',
      Libra:
        'You wonder if the right person is out there or if you keep choosing wrong.',
      Scorpio:
        'You question whether anyone in your life has ever seen the real you and stayed.',
      Sagittarius:
        'You wonder if all the running is actually toward something or just away from yourself.',
      Capricorn:
        'You lie awake calculating whether your sacrifices will actually pay off someday.',
      Aquarius:
        'You crave deep connection but wonder why closeness always feels like a trap.',
      Pisces:
        'You fantasize about disappearing to somewhere no one knows your name.',
    },
  },
  superpower: {
    label: 'Superpower',
    words: {
      Aries: 'Courage',
      Taurus: 'Stability',
      Gemini: 'Communication',
      Cancer: 'Empathy',
      Leo: 'Magnetism',
      Virgo: 'Analysis',
      Libra: 'Harmony',
      Scorpio: 'Intensity',
      Sagittarius: 'Vision',
      Capricorn: 'Ambition',
      Aquarius: 'Originality',
      Pisces: 'Imagination',
    },
    explanations: {
      Aries:
        'You charge into situations that terrify everyone else and somehow come out winning.',
      Taurus:
        'You ground everyone around you just by being present — your calm is contagious.',
      Gemini:
        'You explain complicated things simply and make anyone feel instantly understood.',
      Cancer:
        "You feel what others feel before they've even found the words for it themselves.",
      Leo: 'You walk into a room and the energy shifts — people gravitate to you without trying.',
      Virgo:
        'You spot patterns and flaws that are invisible to everyone else in the room.',
      Libra:
        'You turn hostile environments into peaceful ones just by showing up and listening.',
      Scorpio:
        'You lock onto a goal with laser focus and nothing in the universe can stop you.',
      Sagittarius:
        'You see possibilities where others see dead ends and inspire people to believe again.',
      Capricorn:
        'You set goals that intimidate others and then quietly crush every single one.',
      Aquarius:
        "You think in ways that haven't been invented yet and people call you crazy until they don't.",
      Pisces:
        'You create beauty and meaning from thin air in ways that leave people speechless.',
    },
  },
  survival_mode: {
    label: 'Survival Mode',
    words: {
      Aries: 'Fight',
      Taurus: 'Isolate',
      Gemini: 'Deflect',
      Cancer: 'Withdraw',
      Leo: 'Perform',
      Virgo: 'Overwork',
      Libra: 'Appease',
      Scorpio: 'Shutdown',
      Sagittarius: 'Flee',
      Capricorn: 'Suppress',
      Aquarius: 'Dissociate',
      Pisces: 'Numb',
    },
    explanations: {
      Aries:
        'You go into full warrior mode and fight everything, even people trying to help.',
      Taurus:
        'You lock the door, turn off your phone, and pretend the outside world ceased to exist.',
      Gemini:
        'You crack jokes and change the subject so fast nobody realizes you are breaking inside.',
      Cancer:
        'You crawl into your shell and become unreachable until the storm passes on its own.',
      Leo: "You smile harder and shine brighter so nobody suspects you're falling apart underneath.",
      Virgo:
        'You bury your feelings in productivity and clean everything like your life depends on it.',
      Libra:
        'You become whatever everyone needs you to be while silently losing yourself entirely.',
      Scorpio:
        'You go completely cold and emotionless like someone flipped a switch inside you.',
      Sagittarius:
        'You book a one-way ticket or make a reckless decision just to feel something different.',
      Capricorn:
        "You bottle everything up and keep grinding because you don't believe you're allowed to break.",
      Aquarius:
        "You mentally leave your body and observe your own life like it's happening to someone else.",
      Pisces:
        'You shut down emotionally and drift through the days like a ghost of yourself.',
    },
  },
};

// --- Available Traits ---

export const AVAILABLE_TRAITS = Object.keys(TRAIT_DATA);

// --- Carousel Generation ---

export function generateOneWordCarousel(traitKey: string): IGCarouselSlide[] {
  const trait = TRAIT_DATA[traitKey];
  if (!trait) {
    throw new Error(`Invalid trait key: ${traitKey}`);
  }

  const slides: IGCarouselSlide[] = [];
  const category: ThemeCategory = 'zodiac';

  // Slide 1: Cover
  slides.push({
    slideIndex: 0,
    totalSlides: 14,
    title: `Your sign's ${trait.label.toLowerCase()} in one word`,
    content: 'Which word is yours? Swipe →',
    category,
    variant: 'cover',
  });

  // Slides 2-13: One per sign
  ZODIAC_SIGNS.forEach((sign, index) => {
    const word = trait.words[sign.name];
    const explanation = trait.explanations[sign.name];

    slides.push({
      slideIndex: index + 1,
      totalSlides: 14,
      title: sign.name,
      content: word,
      subtitle: explanation,
      symbol: sign.symbol,
      category,
      variant: 'body',
    });
  });

  // Slide 14: CTA
  slides.push({
    slideIndex: 13,
    totalSlides: 14,
    title: 'Did yours feel right?',
    content: 'Explore your full chart → lunary.app',
    category,
    variant: 'cta',
  });

  return slides;
}

// --- Batch Generation (for scheduling) ---

export function generateOneWordBatch(
  dateStr: string,
  count: number = 1,
): Array<{
  traitKey: string;
  traitLabel: string;
  slides: IGCarouselSlide[];
}> {
  const rng = seededRandom(dateStr);
  const availableTraits = [...AVAILABLE_TRAITS];
  const batch: Array<{
    traitKey: string;
    traitLabel: string;
    slides: IGCarouselSlide[];
  }> = [];

  for (let i = 0; i < count && availableTraits.length > 0; i++) {
    const traitIndex = Math.floor(rng() * availableTraits.length);
    const traitKey = availableTraits.splice(traitIndex, 1)[0];
    const trait = TRAIT_DATA[traitKey];

    batch.push({
      traitKey,
      traitLabel: trait.label,
      slides: generateOneWordCarousel(traitKey),
    });
  }

  return batch;
}
