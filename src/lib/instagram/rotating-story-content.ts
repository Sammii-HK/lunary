import { seededRandom } from './ig-utils';
import { getMoonPhase } from '../../../utils/moon/moonPhases';
import { getDayOfYear } from 'date-fns';

// --- Affirmation Pool (keyed by moon phase) ---

const AFFIRMATION_POOL: Record<string, string[]> = {
  'New Moon': [
    'I plant seeds of intention with clarity and trust.',
    'I welcome new beginnings with an open heart.',
    'In the darkness, I find my deepest vision.',
    'I am a blank canvas, ready to create.',
    'My intentions are powerful and aligned.',
    'I release the old and embrace the new.',
    'The universe conspires in my favour.',
    'I am ready to begin again, stronger than before.',
  ],
  'Waxing Crescent': [
    'My dreams are taking root and growing.',
    'Every small step brings me closer to my vision.',
    'I nurture my intentions with patience and faith.',
    'Momentum is building in my favour.',
    'I trust the timing of my unfolding.',
    'I am brave enough to take the first step.',
    'My energy attracts what I need.',
    'Growth is happening, even when I cannot see it.',
  ],
  'First Quarter': [
    'I push through resistance with courage.',
    'Challenges sharpen my resolve.',
    'I choose action over hesitation.',
    'My willpower is unstoppable today.',
    'Obstacles are redirections toward something better.',
    'I trust myself to make the right decisions.',
    'I am stronger than any challenge before me.',
    'Bold action creates bold results.',
  ],
  'Waxing Gibbous': [
    'I refine my path with patience and precision.',
    'I trust the process of becoming.',
    'The details matter and I honour them.',
    'I am almost there. I keep going.',
    'My dedication is creating something beautiful.',
    'I fine-tune my vision with care.',
    'Persistence is my superpower.',
    'Everything is coming together perfectly.',
  ],
  'Full Moon': [
    'I celebrate how far I have come.',
    'My intuition illuminates the way forward.',
    'I release what no longer serves my highest good.',
    'I am radiant, powerful, and whole.',
    'The fullness of the universe lives within me.',
    'I honour my achievements and let go with grace.',
    'My inner light shines brightest tonight.',
    'I am exactly where I am meant to be.',
  ],
  'Waning Gibbous': [
    'I share my gifts generously with the world.',
    'Gratitude transforms everything it touches.',
    'I reflect on my journey with compassion.',
    'Wisdom flows through my experiences.',
    'I give thanks for every lesson learned.',
    'My story inspires others to grow.',
    'Abundance multiplies when shared.',
    'I appreciate both the light and the shadow.',
  ],
  'Last Quarter': [
    'I release old patterns with love.',
    'Letting go creates space for miracles.',
    'I surrender what was never mine to carry.',
    'Freedom comes from releasing control.',
    'I forgive, I release, I move forward.',
    'What falls away was never meant to stay.',
    'I make space for what truly matters.',
    'Every ending is a doorway to something new.',
  ],
  'Waning Crescent': [
    'I rest deeply and without guilt.',
    'In stillness, I find my power.',
    'I honour the sacred pause before rebirth.',
    'My body and spirit deserve this rest.',
    'I trust the quiet before the next chapter.',
    'Reflection is a form of wisdom.',
    'I am ready for what comes next.',
    'The cycle completes, and I am renewed.',
  ],
};

// --- Ritual Tip Pool ---

interface RitualTip {
  tip: string;
  theme: string;
}

const RITUAL_TIP_POOL: RitualTip[] = [
  {
    tip: 'Place a bowl of salt water by your front door to absorb negative energy. Replace weekly.',
    theme: 'protection',
  },
  {
    tip: 'Light a white candle and set one clear intention. Let it burn completely to seal the spell.',
    theme: 'abundance',
  },
  {
    tip: 'Write what you want to release on paper. Burn it safely and scatter the ashes outside.',
    theme: 'release',
  },
  {
    tip: "Charge your crystals under tonight's moonlight. Place them on a windowsill before bed.",
    theme: 'clarity',
  },
  {
    tip: 'Brew a cup of chamomile tea. Hold the cup and whisper your intention before drinking.',
    theme: 'love',
  },
  {
    tip: 'Walk barefoot on earth for 5 minutes. Visualise roots growing from your feet into the ground.',
    theme: 'grounding',
  },
  {
    tip: 'Place rosemary under your pillow for clarity in dreams and protection while you sleep.',
    theme: 'protection',
  },
  {
    tip: 'Write your biggest desire on a bay leaf. Burn it and let the smoke carry your wish upward.',
    theme: 'abundance',
  },
  {
    tip: 'Run a bath with sea salt and lavender. Soak for 20 minutes to cleanse your energy field.',
    theme: 'release',
  },
  {
    tip: 'Light incense and walk through each room of your home. Let the smoke clear stagnant energy.',
    theme: 'clarity',
  },
  {
    tip: 'Hold a rose quartz over your heart. Breathe deeply and repeat: "I am worthy of love."',
    theme: 'love',
  },
  {
    tip: 'Sit with your back against a tree for 10 minutes. Feel its steady, ancient energy stabilise yours.',
    theme: 'grounding',
  },
  {
    tip: 'Draw a protection sigil on the bottom of your shoe. You carry the ward wherever you walk.',
    theme: 'protection',
  },
  {
    tip: 'Keep a cinnamon stick in your wallet to attract financial abundance and opportunities.',
    theme: 'abundance',
  },
  {
    tip: 'Write a letter to your past self. Thank them, forgive them, then safely burn the letter.',
    theme: 'release',
  },
  {
    tip: 'Meditate with clear quartz for 5 minutes. Ask for one insight. Write down whatever comes.',
    theme: 'clarity',
  },
  {
    tip: 'Make moon water by leaving a glass jar of water under the full moon overnight. Use it to bless your space.',
    theme: 'love',
  },
  {
    tip: 'Collect a small stone from outside. Hold it and breathe your worries into it, then return it to the earth.',
    theme: 'grounding',
  },
  {
    tip: 'Tie a black thread around your wrist. When it falls off naturally, the protection cycle is complete.',
    theme: 'protection',
  },
  {
    tip: 'Place a green candle near your workspace. Light it when you need to attract prosperity and focus.',
    theme: 'abundance',
  },
  {
    tip: 'Stand in the shower and visualise dark energy washing off you and flowing down the drain.',
    theme: 'release',
  },
  {
    tip: 'Anoint your third eye with a drop of lavender oil before meditation to enhance intuition.',
    theme: 'clarity',
  },
  {
    tip: 'Create a small love altar with a pink candle, rose petals, and a written intention for your heart.',
    theme: 'love',
  },
  {
    tip: 'Eat root vegetables today: carrots, potatoes, beets. Grounding foods anchor grounding energy.',
    theme: 'grounding',
  },
  {
    tip: 'Hang dried herbs above your doorway. Rosemary for protection, lavender for peace, mint for prosperity.',
    theme: 'protection',
  },
  {
    tip: 'Write your financial goal 33 times for 3 days. This 3x33 method amplifies manifestation energy.',
    theme: 'abundance',
  },
  {
    tip: 'Light a black candle to absorb negativity. Let it burn out completely in a safe place.',
    theme: 'release',
  },
  {
    tip: 'Keep an amethyst on your desk while working. It sharpens focus and filters mental noise.',
    theme: 'clarity',
  },
  {
    tip: 'Whisper sweet words over a cup of honey tea. Drink it to sweeten your energy toward others.',
    theme: 'love',
  },
  {
    tip: 'Place hematite in your pocket today. Its iron content literally grounds electromagnetic energy.',
    theme: 'grounding',
  },
];

// --- Sign of the Day Data ---

interface SignData {
  sign: string;
  element: string;
  trait: string;
  message: string;
}

const SIGN_DATA: SignData[] = [
  {
    sign: 'Aries',
    element: 'Fire',
    trait: 'Courageous & bold',
    message: 'Channel your inner warrior. Today rewards decisive action.',
  },
  {
    sign: 'Taurus',
    element: 'Earth',
    trait: 'Steady & sensual',
    message: 'Slow down and savour. Your patience is your greatest strength.',
  },
  {
    sign: 'Gemini',
    element: 'Air',
    trait: 'Curious & witty',
    message: 'Follow your curiosity today. Every conversation holds a clue.',
  },
  {
    sign: 'Cancer',
    element: 'Water',
    trait: 'Nurturing & intuitive',
    message: 'Trust your gut feelings. Your emotions are guiding you home.',
  },
  {
    sign: 'Leo',
    element: 'Fire',
    trait: 'Radiant & generous',
    message: 'Shine unapologetically. The world needs your light today.',
  },
  {
    sign: 'Virgo',
    element: 'Earth',
    trait: 'Precise & healing',
    message: 'The details matter today. Your careful attention creates magic.',
  },
  {
    sign: 'Libra',
    element: 'Air',
    trait: 'Harmonious & fair',
    message: 'Seek balance in all things. Beauty and justice walk together.',
  },
  {
    sign: 'Scorpio',
    element: 'Water',
    trait: 'Intense & transformative',
    message:
      'Go deep today. What you uncover beneath the surface will set you free.',
  },
  {
    sign: 'Sagittarius',
    element: 'Fire',
    trait: 'Adventurous & wise',
    message: 'Expand your horizons. Truth and adventure await the bold.',
  },
  {
    sign: 'Capricorn',
    element: 'Earth',
    trait: 'Ambitious & disciplined',
    message:
      'Build something lasting today. Your discipline is your superpower.',
  },
  {
    sign: 'Aquarius',
    element: 'Air',
    trait: 'Innovative & humanitarian',
    message: 'Think differently. Your unique perspective changes everything.',
  },
  {
    sign: 'Pisces',
    element: 'Water',
    trait: 'Dreamy & empathic',
    message:
      'Let your imagination lead. Dreams and reality are closer than you think.',
  },
];

// --- Transit Alert Data ---

interface TransitAlert {
  type: 'retrograde' | 'general';
  planet: string;
  headline: string;
  message: string;
}

const GENERAL_TRANSIT_TIPS: TransitAlert[] = [
  {
    type: 'general',
    planet: 'Venus',
    headline: 'Venus Energy Active',
    message:
      'Love and beauty are highlighted today. Express appreciation freely.',
  },
  {
    type: 'general',
    planet: 'Mars',
    headline: 'Mars Energy Rising',
    message: 'Channel your drive into action. Physical energy is amplified.',
  },
  {
    type: 'general',
    planet: 'Jupiter',
    headline: 'Jupiter Expansion',
    message:
      'Opportunities are expanding. Say yes to what aligns with your growth.',
  },
  {
    type: 'general',
    planet: 'Saturn',
    headline: 'Saturn Discipline',
    message:
      'Structure creates freedom. Commit to your responsibilities today.',
  },
  {
    type: 'general',
    planet: 'Mercury',
    headline: 'Mercury Clarity',
    message: 'Communication flows freely. Express your ideas with confidence.',
  },
  {
    type: 'general',
    planet: 'Moon',
    headline: 'Lunar Shift',
    message: 'Emotions are shifting. Honour your feelings without judgment.',
  },
  {
    type: 'general',
    planet: 'Neptune',
    headline: 'Neptune Dreams',
    message:
      'The veil between worlds is thin. Pay attention to signs and dreams.',
  },
  {
    type: 'general',
    planet: 'Uranus',
    headline: 'Uranus Awakening',
    message:
      'Expect the unexpected. Breakthroughs come from breaking patterns.',
  },
  {
    type: 'general',
    planet: 'Pluto',
    headline: 'Pluto Transformation',
    message: 'Deep change is stirring. Trust the process of regeneration.',
  },
  {
    type: 'general',
    planet: 'Sun',
    headline: 'Solar Vitality',
    message: 'Your life force is strong today. Step into your power and shine.',
  },
];

// --- Numerology Story Data ---

// Angel number data for stories (inline pool to avoid importing JSON in edge routes)
const ANGEL_NUMBER_STORIES: Array<{
  number: string;
  meaning: string;
  message: string;
  keywords: string;
}> = [
  {
    number: '111',
    meaning: 'New Beginnings & Manifestation',
    message:
      'Your thoughts are manifesting rapidly. Focus on what you want, not what you fear.',
    keywords: 'Manifestation, Alignment, New starts',
  },
  {
    number: '222',
    meaning: 'Balance & Trust',
    message: 'Stay patient. Everything is coming together behind the scenes.',
    keywords: 'Patience, Partnership, Faith',
  },
  {
    number: '333',
    meaning: 'Divine Protection',
    message:
      'The Ascended Masters are near. You are being guided and supported right now.',
    keywords: 'Guidance, Creativity, Growth',
  },
  {
    number: '444',
    meaning: 'Foundation & Stability',
    message:
      'Angels surround you with protection. You are exactly where you need to be.',
    keywords: 'Protection, Stability, Hard work',
  },
  {
    number: '555',
    meaning: 'Major Change Coming',
    message:
      'Transformation is here. Release the old to welcome what is meant for you.',
    keywords: 'Change, Freedom, Adventure',
  },
  {
    number: '666',
    meaning: 'Rebalance & Refocus',
    message:
      'Shift your focus from material worries to spiritual alignment. Balance is key.',
    keywords: 'Balance, Healing, Harmony',
  },
  {
    number: '777',
    meaning: 'Spiritual Awakening',
    message:
      'You are on the right path. Divine luck and spiritual downloads are flowing.',
    keywords: 'Luck, Intuition, Wisdom',
  },
  {
    number: '888',
    meaning: 'Abundance & Flow',
    message:
      'Financial and energetic abundance is arriving. You are in the flow.',
    keywords: 'Abundance, Karma, Success',
  },
  {
    number: '999',
    meaning: 'Completion & Release',
    message:
      'A chapter is ending. Let it close with grace so something greater can begin.',
    keywords: 'Completion, Release, Purpose',
  },
  {
    number: '000',
    meaning: 'Infinite Potential',
    message:
      'You are at the beginning of everything. All possibilities are open to you.',
    keywords: 'Infinity, Wholeness, Reset',
  },
  {
    number: '1111',
    meaning: 'Spiritual Gateway',
    message:
      'A portal is open. Set your intentions now — the universe is listening.',
    keywords: 'Portal, Awakening, Alignment',
  },
  {
    number: '1212',
    meaning: 'Stepping Into Purpose',
    message:
      'You are being called to step into your higher purpose. Trust the journey.',
    keywords: 'Purpose, Progress, Trust',
  },
  {
    number: '1010',
    meaning: 'Quantum Leap',
    message:
      'You are at the threshold of a major spiritual upgrade. Embrace the shift.',
    keywords: 'Evolution, Breakthrough, Potential',
  },
  {
    number: '2222',
    meaning: 'Master Builder',
    message:
      'Your dreams are being built in the spiritual realm. Keep the faith.',
    keywords: 'Manifestation, Patience, Creation',
  },
];

// Life path number insights for stories
const LIFE_PATH_STORIES: Array<{
  number: number;
  name: string;
  trait: string;
  message: string;
}> = [
  {
    number: 1,
    name: 'The Pioneer',
    trait: 'Leadership & independence',
    message:
      'You came here to lead, not follow. Trust your instincts and forge your own path.',
  },
  {
    number: 2,
    name: 'The Diplomat',
    trait: 'Partnership & sensitivity',
    message:
      'Your strength lies in connection. You see what others miss in every interaction.',
  },
  {
    number: 3,
    name: 'The Creator',
    trait: 'Expression & joy',
    message:
      'Your creativity is your magic. When you express yourself, you light up the room.',
  },
  {
    number: 4,
    name: 'The Builder',
    trait: 'Structure & determination',
    message: 'You build things that last. Your discipline is your superpower.',
  },
  {
    number: 5,
    name: 'The Adventurer',
    trait: 'Freedom & change',
    message:
      'You thrive in transformation. Every change is taking you exactly where you need to go.',
  },
  {
    number: 6,
    name: 'The Nurturer',
    trait: 'Love & responsibility',
    message:
      'Your capacity to love and heal others is unmatched. Remember to nurture yourself too.',
  },
  {
    number: 7,
    name: 'The Seeker',
    trait: 'Wisdom & intuition',
    message:
      'Your mind runs deeper than most. Trust the answers that come from within.',
  },
  {
    number: 8,
    name: 'The Powerhouse',
    trait: 'Ambition & abundance',
    message:
      'You are wired for success. When you align ambition with purpose, nothing can stop you.',
  },
  {
    number: 9,
    name: 'The Humanitarian',
    trait: 'Compassion & completion',
    message:
      'You carry the wisdom of all numbers. Your purpose is to serve and inspire.',
  },
  {
    number: 11,
    name: 'The Intuitive',
    trait: 'Vision & illumination',
    message:
      'You feel everything deeply. Your sensitivity is not a weakness — it is your gift.',
  },
  {
    number: 22,
    name: 'The Master Builder',
    trait: 'Vision made real',
    message:
      'You dream big and have the power to make it real. The world needs what you are building.',
  },
  {
    number: 33,
    name: 'The Master Teacher',
    trait: 'Compassion & guidance',
    message:
      'You teach through love. Your presence alone raises the vibration of every room.',
  },
];

// Mirror hours for stories
const MIRROR_HOUR_STORIES: Array<{
  time: string;
  meaning: string;
  message: string;
}> = [
  {
    time: '11:11',
    meaning: 'Spiritual Awakening',
    message:
      'A portal is open. Your angels are signalling alignment. Make a wish.',
  },
  {
    time: '12:12',
    meaning: 'Cosmic Harmony',
    message:
      'You are in flow with the universe. Keep going — you are on the right track.',
  },
  {
    time: '13:13',
    meaning: 'Transformation',
    message:
      'Something is shifting beneath the surface. Trust the process of becoming.',
  },
  {
    time: '14:14',
    meaning: 'Angelic Guidance',
    message:
      'Your guardian angels are close. Ask for help and listen for signs.',
  },
  {
    time: '15:15',
    meaning: 'Positive Change',
    message:
      'Change is coming and it is for your highest good. Embrace it fully.',
  },
  {
    time: '16:16',
    meaning: 'Love & Connection',
    message: 'Open your heart. Love is trying to reach you in unexpected ways.',
  },
  {
    time: '17:17',
    meaning: 'Spiritual Progress',
    message:
      'You are growing faster than you realise. Your spiritual evolution is accelerating.',
  },
  {
    time: '21:21',
    meaning: 'Manifestation Peak',
    message:
      'Your manifestation power is at its peak. Be intentional with every thought.',
  },
  {
    time: '22:22',
    meaning: 'Master Builder',
    message:
      'You are building something extraordinary. Stay focused on your vision.',
  },
  {
    time: '23:23',
    meaning: 'Creative Potential',
    message:
      'Your creative energy is charged. Express yourself — the universe is amplifying your voice.',
  },
  {
    time: '00:00',
    meaning: 'Infinite Reset',
    message:
      'The slate is clean. Everything begins and ends here. Choose wisely.',
  },
  {
    time: '01:01',
    meaning: 'New Beginnings',
    message:
      'A fresh chapter is starting. Step forward with confidence and clarity.',
  },
];

type NumerologySubType = 'angel_number' | 'life_path' | 'mirror_hour';

export interface NumerologyStoryData {
  subType: NumerologySubType;
  number: string;
  label: string;
  mainText: string;
  secondary: string;
  extra: string;
}

export function generateNumerologyStory(dateStr: string): NumerologyStoryData {
  const date = new Date(dateStr);
  const dayOfYear = getDayOfYear(date);
  const rng = seededRandom(`numerology-${dateStr}`);

  // Cycle through sub-types: angel → life path → mirror hour
  const subTypes: NumerologySubType[] = [
    'angel_number',
    'life_path',
    'mirror_hour',
  ];
  const subType = subTypes[dayOfYear % subTypes.length];

  switch (subType) {
    case 'angel_number': {
      const entry =
        ANGEL_NUMBER_STORIES[Math.floor(rng() * ANGEL_NUMBER_STORIES.length)];
      return {
        subType,
        number: entry.number,
        label: `ANGEL NUMBER ${entry.number}`,
        mainText: entry.message,
        secondary: entry.meaning,
        extra: entry.keywords,
      };
    }
    case 'life_path': {
      const entry =
        LIFE_PATH_STORIES[Math.floor(rng() * LIFE_PATH_STORIES.length)];
      return {
        subType,
        number: String(entry.number),
        label: `LIFE PATH ${entry.number}`,
        mainText: entry.message,
        secondary: entry.name,
        extra: entry.trait,
      };
    }
    case 'mirror_hour': {
      const entry =
        MIRROR_HOUR_STORIES[Math.floor(rng() * MIRROR_HOUR_STORIES.length)];
      return {
        subType,
        number: entry.time,
        label: `MIRROR HOUR ${entry.time}`,
        mainText: entry.message,
        secondary: entry.meaning,
        extra: 'Did you see this time today?',
      };
    }
  }
}

// --- Generator Functions ---

export function generateAffirmation(dateStr: string): {
  affirmation: string;
  moonPhase: string;
} {
  const date = new Date(dateStr);
  const moonPhase = getMoonPhase(date);
  const rng = seededRandom(`affirmation-${dateStr}`);

  const pool = AFFIRMATION_POOL[moonPhase] || AFFIRMATION_POOL['Full Moon'];
  const affirmation = pool[Math.floor(rng() * pool.length)];

  return { affirmation, moonPhase };
}

export function generateRitualTip(dateStr: string): RitualTip {
  const rng = seededRandom(`ritual-${dateStr}`);
  return RITUAL_TIP_POOL[Math.floor(rng() * RITUAL_TIP_POOL.length)];
}

export function generateSignOfTheDay(dateStr: string): SignData {
  const date = new Date(dateStr);
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % SIGN_DATA.length;
  return SIGN_DATA[index];
}

export function generateTransitAlert(dateStr: string): TransitAlert {
  const rng = seededRandom(`transit-${dateStr}`);
  // Use general transit tips (retrograde check would require astronomical data
  // that's heavy for the content generator — cron can enhance if needed)
  return GENERAL_TRANSIT_TIPS[Math.floor(rng() * GENERAL_TRANSIT_TIPS.length)];
}
