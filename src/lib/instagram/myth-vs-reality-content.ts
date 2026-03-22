/**
 * Myth vs Reality Carousel Generator
 *
 * Contrarian hook format: "People think X, actually Y"
 * 5-slide carousel using the existing carousel OG route.
 * Content pool: 60+ myth/reality pairs from zodiac, tarot, crystals, general astrology.
 */

import type { IGCarouselSlide } from './types';
import type { ThemeCategory } from '@/lib/social/types';
import { seededRandom } from './ig-utils';

// ---------------------------------------------------------------------------
// Content pool
// ---------------------------------------------------------------------------

interface MythRealityPair {
  topic: string;
  myth: string;
  reality: string;
  takeaway: string;
  category: ThemeCategory;
}

const MYTH_REALITY_POOL: MythRealityPair[] = [
  // --- Zodiac myths (12) ---
  {
    topic: 'Gemini',
    myth: 'Geminis are two-faced and cannot be trusted.',
    reality:
      'Gemini is adaptable and multifaceted. They adjust to different social settings, which looks like inconsistency but is actually emotional intelligence.',
    takeaway:
      'Gemini thrives when allowed to show all sides of who they are instead of being reduced to a stereotype.',
    category: 'zodiac',
  },
  {
    topic: 'Scorpio',
    myth: 'Scorpios are vengeful and hold grudges forever.',
    reality:
      'Scorpio values loyalty above everything. Their intensity is not about revenge but about protecting what they love. They remember because they care deeply.',
    takeaway:
      'A Scorpio who remembers your betrayal also remembers every kindness. Their memory is a feature, not a flaw.',
    category: 'zodiac',
  },
  {
    topic: 'Capricorn',
    myth: 'Capricorns are cold and emotionless workaholics.',
    reality:
      'Capricorn shows love through actions, not words. They work hard to provide security for the people they care about. Their emotional depth runs as deep as their ambition.',
    takeaway:
      'When a Capricorn builds something, they are building it for you. Their effort is their love language.',
    category: 'zodiac',
  },
  {
    topic: 'Virgo',
    myth: 'Virgos are uptight perfectionists who criticise everything.',
    reality:
      'Virgo notices details others miss because they genuinely want to help. Their suggestions come from care, not judgment. They hold themselves to the same standards.',
    takeaway:
      'A Virgo who critiques your work is invested in you. Indifference is when they stop noticing altogether.',
    category: 'zodiac',
  },
  {
    topic: 'Aries',
    myth: 'Aries are selfish and only care about themselves.',
    reality:
      'Aries leads with courage and will fight harder for the people they love than for themselves. Their directness is not selfishness but honesty.',
    takeaway:
      'An Aries who challenges you is one who believes in your potential. They push because they care.',
    category: 'zodiac',
  },
  {
    topic: 'Pisces',
    myth: 'Pisces are weak, overly emotional, and disconnected from reality.',
    reality:
      'Pisces feels everything more deeply than most signs. That emotional depth is not weakness but a profound strength. They see beauty and meaning where others see nothing.',
    takeaway:
      'Pisces absorbs the pain of others and still chooses compassion. That requires more strength than most people have.',
    category: 'zodiac',
  },
  {
    topic: 'Cancer',
    myth: 'Cancers are clingy and emotionally manipulative.',
    reality:
      'Cancer protects their inner circle with fierce devotion. They set deep emotional boundaries and their sensitivity is how they read the room better than any other sign.',
    takeaway:
      'A Cancer who opens up to you has given you something rare. Honour the trust behind their vulnerability.',
    category: 'zodiac',
  },
  {
    topic: 'Leo',
    myth: 'Leos are narcissists who only care about attention.',
    reality:
      'Leo is generous to a fault and uplifts everyone around them. Their confidence inspires others and their need for recognition comes from wanting to know they matter.',
    takeaway:
      'Leo gives more than they take. The attention they seek is simply acknowledgement of the energy they pour into others.',
    category: 'zodiac',
  },
  {
    topic: 'Aquarius',
    myth: 'Aquarius is emotionally detached and incapable of intimacy.',
    reality:
      'Aquarius loves differently, not less. They express care through intellectual engagement, loyalty to their values, and actions that serve the greater good.',
    takeaway:
      'An Aquarius who shares their mind with you is sharing the most intimate part of themselves.',
    category: 'zodiac',
  },
  {
    topic: 'Libra',
    myth: 'Libras are fake and agree with everyone to avoid conflict.',
    reality:
      'Libra sees multiple perspectives simultaneously. What looks like people-pleasing is actually deep empathy and a genuine desire for fairness and harmony.',
    takeaway:
      'Libra does not lack opinions. They weigh all sides before forming one. That is wisdom, not weakness.',
    category: 'zodiac',
  },
  {
    topic: 'Sagittarius',
    myth: 'Sagittarius cannot commit and runs from responsibility.',
    reality:
      'Sagittarius commits deeply when they find something worth staying for. They value freedom because they refuse to settle for connections that do not grow.',
    takeaway:
      'When a Sagittarius chooses you, it is the most intentional choice they have ever made.',
    category: 'zodiac',
  },
  {
    topic: 'Taurus',
    myth: 'Taurus is lazy and resists all change.',
    reality:
      'Taurus is deliberate, not lazy. They think before acting and resist change that lacks purpose. When they commit to a direction, they follow through with unmatched endurance.',
    takeaway:
      'Taurus does not resist change. They resist pointless change. Give them a good reason and they will move mountains.',
    category: 'zodiac',
  },

  // --- Tarot myths (10) ---
  {
    topic: 'The Death Card',
    myth: 'Pulling the Death card means someone will die.',
    reality:
      'The Death card represents transformation, endings, and powerful new beginnings. It is one of the most positive cards for personal growth.',
    takeaway:
      'When Death appears, something old is ending so something new can begin. Welcome the transformation.',
    category: 'tarot',
  },
  {
    topic: 'The Tower',
    myth: 'The Tower card is the worst card in the deck.',
    reality:
      'The Tower destroys what was never built on solid ground. It is a card of liberation, truth, and necessary upheaval that leads to authentic foundations.',
    takeaway:
      'The Tower hurts because it strips away illusions. What remains after is real. That is the gift.',
    category: 'tarot',
  },
  {
    topic: 'The Devil',
    myth: 'The Devil card means evil or dark forces are at work.',
    reality:
      'The Devil represents self-imposed bondage, unhealthy attachments, and shadow work. The chains in the card are loose enough to remove at any time.',
    takeaway:
      'The Devil asks what is controlling you and reminds you that you have always had the power to walk away.',
    category: 'tarot',
  },
  {
    topic: 'Reversed Cards',
    myth: 'Reversed tarot cards always mean the opposite of the upright meaning.',
    reality:
      'Reversed cards often indicate blocked, delayed, or internalised energy. They add nuance, not negation.',
    takeaway:
      'A reversed card is not bad news. It is a deeper layer of the same message asking you to look inward.',
    category: 'tarot',
  },
  {
    topic: 'The Hanged Man',
    myth: 'The Hanged Man represents suffering and punishment.',
    reality:
      'The Hanged Man chose to hang upside down. It represents voluntary surrender, seeing from a new perspective, and the wisdom that comes from stillness.',
    takeaway:
      'Sometimes the most powerful thing you can do is stop, surrender, and see the world differently.',
    category: 'tarot',
  },
  {
    topic: 'The Moon Card',
    myth: 'The Moon card is purely negative and means deception.',
    reality:
      'The Moon represents the subconscious, intuition, and things not yet fully revealed. It asks you to trust your instincts even when the path is unclear.',
    takeaway:
      'The Moon is not lying to you. It is asking you to see with your intuition, not just your eyes.',
    category: 'tarot',
  },
  {
    topic: 'The Lovers',
    myth: 'The Lovers card only refers to romantic relationships.',
    reality:
      'The Lovers is fundamentally about choice, alignment, and values. It can appear for career decisions, moral dilemmas, and self-alignment, not just romance.',
    takeaway:
      'When The Lovers appears, ask what choice you are facing, not who you are dating.',
    category: 'tarot',
  },
  {
    topic: 'Buying Your Own Deck',
    myth: 'You must receive your first tarot deck as a gift or it will not work.',
    reality:
      'This is a modern superstition with no historical basis. Choosing your own deck creates a personal connection that actually strengthens your readings.',
    takeaway:
      'Buy the deck that calls to you. Your connection to the cards matters more than how they arrived.',
    category: 'tarot',
  },
  {
    topic: 'Judgement',
    myth: 'The Judgement card means you are being judged or punished.',
    reality:
      'Judgement is about spiritual awakening, answering a higher calling, and honest self-evaluation. It is a card of reckoning, not punishment.',
    takeaway:
      'Judgement asks if you are living in alignment with your truth. It is an invitation to rise, not a sentence.',
    category: 'tarot',
  },
  {
    topic: 'The Fool',
    myth: 'The Fool card means you are being foolish or making a mistake.',
    reality:
      'The Fool is numbered 0 and represents infinite potential, new beginnings, and the courage to leap before you see the net.',
    takeaway:
      'The Fool is not naive. They trust the journey enough to take the first step into the unknown.',
    category: 'tarot',
  },

  // --- Crystal myths (10) ---
  {
    topic: 'Selenite Cleansing',
    myth: 'Selenite can be cleansed with water like any other crystal.',
    reality:
      'Selenite is a soft mineral (Mohs 2) that dissolves in water. Cleanse it with sound, smoke, moonlight, or by placing it on a bed of dry salt.',
    takeaway:
      'Always check crystal hardness before water cleansing. Not all crystals are water-safe.',
    category: 'crystals',
  },
  {
    topic: 'Citrine',
    myth: 'Most citrine sold in shops is natural citrine.',
    reality:
      'The majority of "citrine" on the market is heat-treated amethyst. Natural citrine is pale yellow and much rarer. Both work energetically, but know what you are buying.',
    takeaway:
      'Heat-treated citrine still carries solar energy. Appreciate it for what it is rather than what it is marketed as.',
    category: 'crystals',
  },
  {
    topic: 'Crystal Charging',
    myth: 'All crystals need to be charged in sunlight.',
    reality:
      'Sunlight fades many crystals including amethyst, rose quartz, and fluorite. Moonlight, sound, earth, and intention are safer charging methods for most stones.',
    takeaway:
      'Moonlight is the universal charger. It works for every crystal without risking damage.',
    category: 'crystals',
  },
  {
    topic: 'Crystal Size',
    myth: 'Bigger crystals are always more powerful.',
    reality:
      'A crystal you carry daily has more impact than a large one sitting on a shelf. Frequency of interaction matters more than physical size.',
    takeaway:
      'The crystal that changes your life might fit in your pocket. Connection beats size every time.',
    category: 'crystals',
  },
  {
    topic: 'Malachite Safety',
    myth: 'Malachite is completely safe to handle and use in elixirs.',
    reality:
      'Raw malachite contains copper which is toxic. Never use raw malachite in water, baths, or elixirs. Polished malachite is safe to handle but should never be ingested.',
    takeaway:
      'Crystal work requires knowledge, not just intuition. Some stones demand respect and safe handling practices.',
    category: 'crystals',
  },
  {
    topic: 'Clear Quartz',
    myth: 'Clear quartz only amplifies positive energy.',
    reality:
      'Clear quartz amplifies whatever energy it encounters, positive or negative. Program it with intention and cleanse it regularly to ensure it works in your favour.',
    takeaway:
      'Clear quartz is the most powerful amplifier, which is exactly why it needs the most intentional care.',
    category: 'crystals',
  },
  {
    topic: 'Moldavite',
    myth: 'Moldavite is dangerous and will destroy your life.',
    reality:
      'Moldavite is a high-vibration tektite that accelerates transformation. It does not create chaos. It reveals and accelerates what was already in motion.',
    takeaway:
      'Moldavite shows you what needs to change. If everything falls apart, it was already crumbling. Moldavite just turned on the light.',
    category: 'crystals',
  },
  {
    topic: 'Black Tourmaline',
    myth: 'Black tourmaline absorbs all negativity like a sponge.',
    reality:
      'Black tourmaline repels and deflects negative energy rather than absorbing it. It creates an energetic shield. It still benefits from regular cleansing.',
    takeaway:
      'Think of black tourmaline as armour, not a sponge. It deflects rather than absorbs.',
    category: 'crystals',
  },
  {
    topic: 'Crystals as Medicine',
    myth: 'Crystals can replace medical treatment.',
    reality:
      'Crystals are complementary, not a substitute for medical care. They support emotional and energetic wellbeing alongside proper healthcare.',
    takeaway:
      'Use crystals as part of a holistic approach. They enhance your journey but should never replace professional guidance.',
    category: 'crystals',
  },
  {
    topic: 'Rose Quartz',
    myth: 'Rose quartz only works for romantic love.',
    reality:
      'Rose quartz is the stone of all love: self-love, familial love, friendship, and universal compassion. Its most powerful application is often self-love and emotional healing.',
    takeaway:
      'Start with self-love. Rose quartz teaches that the relationship with yourself sets the foundation for every other connection.',
    category: 'crystals',
  },

  // --- General astrology myths (8) ---
  {
    topic: 'Mercury Retrograde',
    myth: 'Mercury retrograde causes bad things to happen.',
    reality:
      'Mercury retrograde is a time for review, reflection, and revision. Problems arise when we resist the slower pace, not from the retrograde itself.',
    takeaway:
      'Use retrograde periods to revisit, revise, and reflect. The chaos comes from fighting the energy, not from the energy itself.',
    category: 'planetary',
  },
  {
    topic: 'Sun Sign Astrology',
    myth: 'Your zodiac sign (Sun sign) defines your entire personality.',
    reality:
      'Your Sun sign is one of many placements. Your Moon sign governs emotions, your Rising sign shapes first impressions, and each planet adds a layer of complexity.',
    takeaway:
      'You are not just your Sun sign. Your full birth chart is a map of your entire being. Read the whole chart, not just the headline.',
    category: 'zodiac',
  },
  {
    topic: 'Astrology Compatibility',
    myth: 'Some zodiac signs are fundamentally incompatible.',
    reality:
      'Any two signs can build a strong relationship. Challenging aspects create growth, while harmonious aspects create ease. Both are valuable.',
    takeaway:
      'Compatibility is about understanding differences, not avoiding them. The best relationships often have a mix of tension and harmony.',
    category: 'zodiac',
  },
  {
    topic: 'Void of Course Moon',
    myth: 'Nothing works during a void of course Moon.',
    reality:
      'Void of course Moon means the Moon makes no more major aspects before changing signs. It is ideal for routine tasks, rest, and reflection. Avoid starting new projects.',
    takeaway:
      'Void of course is not a cosmic stoplight. It is a rest period. Use it wisely rather than fearing it.',
    category: 'lunar',
  },
  {
    topic: 'Saturn Return',
    myth: 'Saturn return is a period of suffering that ruins your life.',
    reality:
      'Saturn return (ages 27-30) is a maturation checkpoint. It dismantles what is not built to last and rewards what is. The discomfort comes from growth, not punishment.',
    takeaway:
      'Your Saturn return is the universe asking: are you living authentically? The answer shapes your next 30 years.',
    category: 'planetary',
  },
  {
    topic: 'Full Moon Madness',
    myth: 'Full Moons make people crazy and cause more chaos.',
    reality:
      'Full Moons illuminate what is hidden. Emotions surface because they were already there, not because the Moon created them. Awareness is the first step to healing.',
    takeaway:
      'The Full Moon does not make you emotional. It reveals the emotions you have been suppressing.',
    category: 'lunar',
  },
  {
    topic: '13th Sign Ophiuchus',
    myth: 'There is a secret 13th zodiac sign that changes your sign.',
    reality:
      'Ophiuchus is a constellation, not a zodiac sign. Astrology uses a tropical zodiac based on seasons, not constellations. Your sign has not changed.',
    takeaway:
      'Astronomical constellations and astrological signs are different systems. Your Sun sign is exactly where it has always been.',
    category: 'zodiac',
  },
  {
    topic: 'Retrograde Planets',
    myth: 'Retrograde planets are bad and everything goes wrong.',
    reality:
      "Retrogrades are optical illusions from Earth. Energetically, they turn a planet's energy inward. They are ideal for review, reflection, and inner work.",
    takeaway:
      'Retrogrades are the cosmos hitting the review button. Use them to revisit, rethink, and realign before moving forward.',
    category: 'planetary',
  },
];

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a myth vs reality carousel for a given date.
 * Deterministic: same date = same myth/reality pair.
 */
export function generateMythVsReality(dateStr: string): {
  slides: IGCarouselSlide[];
  topic: string;
  category: ThemeCategory;
} {
  const rng = seededRandom(`myth-${dateStr}`);
  const pair = MYTH_REALITY_POOL[Math.floor(rng() * MYTH_REALITY_POOL.length)];
  const totalSlides = 5;

  const slides: IGCarouselSlide[] = [];

  // Slide 1: Cover
  slides.push({
    slideIndex: 0,
    totalSlides,
    title: `Myth vs Reality: ${pair.topic}`,
    content: 'Swipe to learn the truth',
    category: pair.category,
    variant: 'cover',
  });

  // Slide 2: The myth
  slides.push({
    slideIndex: 1,
    totalSlides,
    title: 'The myth',
    content: pair.myth,
    subtitle: 'What most people believe',
    category: pair.category,
    variant: 'body',
  });

  // Slide 3: The reality
  slides.push({
    slideIndex: 2,
    totalSlides,
    title: 'The reality',
    content: pair.reality,
    subtitle: 'What is actually true',
    category: pair.category,
    variant: 'body',
  });

  // Slide 4: Takeaway
  slides.push({
    slideIndex: 3,
    totalSlides,
    title: 'What this means for you',
    content: pair.takeaway,
    category: pair.category,
    variant: 'body',
  });

  // Slide 5: CTA
  slides.push({
    slideIndex: 4,
    totalSlides,
    title: 'Learn more in the grimoire',
    content: 'lunary.app/grimoire',
    category: pair.category,
    variant: 'cta',
  });

  return {
    slides,
    topic: pair.topic,
    category: pair.category,
  };
}
