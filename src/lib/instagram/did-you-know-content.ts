import type { ThemeCategory } from '@/lib/social/types';
import type { IGDidYouKnowContent } from './types';
import { seededRandom } from './ig-utils';

// Fact pools by grimoire category - surprising, shareable, save-worthy facts
export const FACT_POOLS: Record<
  string,
  Array<{ fact: string; source: string }>
> = {
  tarot: [
    {
      fact: "The Death card doesn't mean literal death. It represents transformation, endings, and powerful new beginnings.",
      source: 'tarot/death',
    },
    {
      fact: 'The Fool is numbered 0, not 1. It represents infinite potential before the journey even begins.',
      source: 'tarot/the-fool',
    },
    {
      fact: 'The Tower card is actually one of the most healing cards in tarot. It destroys what was never built on solid ground.',
      source: 'tarot/the-tower',
    },
    {
      fact: "The High Priestess guards the threshold between the conscious and unconscious mind. She's the keeper of hidden knowledge.",
      source: 'tarot/the-high-priestess',
    },
    {
      fact: 'The Lovers card is really about choice and alignment, not just romantic love.',
      source: 'tarot/the-lovers',
    },
    {
      fact: "The Wheel of Fortune reminds us that nothing is permanent. What goes up must come down, and what's down will rise again.",
      source: 'tarot/wheel-of-fortune',
    },
    {
      fact: 'The Star card appears after The Tower for a reason. After destruction comes hope and healing.',
      source: 'tarot/the-star',
    },
    {
      fact: 'The Major Arcana tells a complete story called "The Fool\'s Journey" from innocence to enlightenment.',
      source: 'tarot/the-fool',
    },
    {
      fact: "The Hanged Man isn't suffering. He chose to hang upside down. It represents surrender and seeing the world from a new perspective.",
      source: 'tarot/the-hanged-man',
    },
    {
      fact: 'The Moon card represents illusion and the subconscious. When it appears, things are not as they seem.',
      source: 'tarot/the-moon',
    },
    {
      fact: 'Temperance is the card of alchemy. It appears when opposing forces in your life need to be blended, not chosen between.',
      source: 'tarot/temperance',
    },
    {
      fact: 'The Empress and Emperor sit side by side in the Major Arcana. Together they represent the balance of nurture and structure.',
      source: 'tarot/the-empress',
    },
    {
      fact: 'The Devil card shows chains loose enough to remove. The bondage it represents is always self-imposed.',
      source: 'tarot/the-devil',
    },
    {
      fact: 'Judgement is the second-to-last card in the Major Arcana. It represents the moment of reckoning before wholeness.',
      source: 'tarot/judgement',
    },
    {
      fact: 'The Magician has all four suit symbols on his table: wand, cup, sword, pentacle. He has every tool he needs.',
      source: 'tarot/the-magician',
    },
    {
      fact: 'The Chariot moves forward through willpower alone. It appears when determination matters more than strategy.',
      source: 'tarot/the-chariot',
    },
    {
      fact: "Strength shows a woman gently closing a lion's mouth. True strength in tarot is patience, not force.",
      source: 'tarot/strength',
    },
  ],
  crystals: [
    {
      fact: "Amethyst gets its purple colour from iron impurities and natural radiation. The name comes from the Greek 'amethystos', meaning 'not intoxicated'.",
      source: 'crystals/amethyst',
    },
    {
      fact: "Rose Quartz has been used as a love talisman since 600 BC. Ancient Romans believed it was created by Cupid's tears.",
      source: 'crystals/rose-quartz',
    },
    {
      fact: "Citrine is called the 'merchant's stone' because it's believed to attract wealth. It never needs cleansing because it doesn't hold negative energy.",
      source: 'crystals/citrine',
    },
    {
      fact: 'Obsidian is volcanic glass formed when lava cools rapidly. Ancient civilisations used it for mirrors and surgical blades.',
      source: 'crystals/obsidian',
    },
    {
      fact: 'Moonstone appears to glow from within due to a phenomenon called adularescence, caused by light scattering between microscopic layers.',
      source: 'crystals/moonstone',
    },
    {
      fact: "Clear Quartz amplifies the energy of any crystal placed near it. It's called the 'master healer' for this reason.",
      source: 'crystals/clear-quartz',
    },
    {
      fact: "Labradorite's iridescent flash is called labradorescence. Inuit legend says it contains the Northern Lights trapped in stone.",
      source: 'crystals/labradorite',
    },
    {
      fact: 'Selenite is named after Selene, the Greek moon goddess. It dissolves in water, so never cleanse it with liquid.',
      source: 'crystals/selenite',
    },
    {
      fact: "Black tourmaline is piezoelectric: it generates an electric charge under pressure. It's been used for protection for thousands of years.",
      source: 'crystals/black-tourmaline',
    },
    {
      fact: "Tiger's Eye was carried by Roman soldiers into battle for courage. Its chatoyancy (cat's eye effect) comes from parallel fibres of crocidolite.",
      source: 'crystals/tigers-eye',
    },
    {
      fact: 'Fluorite comes in almost every colour and was called "the most colourful mineral in the world". It\'s known as the genius stone for mental clarity.',
      source: 'crystals/fluorite',
    },
    {
      fact: "Carnelian was placed in Egyptian tombs to protect the dead on their journey. It's one of the oldest known healing stones.",
      source: 'crystals/carnelian',
    },
    {
      fact: 'Lapis Lazuli was ground into powder to create ultramarine, the most expensive pigment in Renaissance painting.',
      source: 'crystals/lapis-lazuli',
    },
    {
      fact: "Smoky Quartz gets its colour from natural radiation in the earth. It's one of the most effective grounding stones.",
      source: 'crystals/smoky-quartz',
    },
    {
      fact: "Jade has been revered in Chinese culture for over 5,000 years. It's harder than steel and symbolises purity and moral integrity.",
      source: 'crystals/jade',
    },
    {
      fact: 'Malachite contains copper, which is toxic when ingested. Always use polished malachite and never put raw malachite in water.',
      source: 'crystals/malachite',
    },
  ],
  spells: [
    {
      fact: 'Moon water is most potent when charged under a full moon. Different moon phases infuse water with different intentions.',
      source: 'spells/moon-water',
    },
    {
      fact: 'Salt circles have been used for protection across almost every culture in history, from Ancient Rome to medieval Europe to Japanese Shinto.',
      source: 'spells/salt-circle-protection',
    },
    {
      fact: 'Candle colour matters in spellwork. White candles can substitute for any colour because they contain all colours in the spectrum.',
      source: 'spells/candle-spell',
    },
    {
      fact: 'Cord cutting rituals symbolically sever energetic attachments to people, habits, or situations that no longer serve you.',
      source: 'spells/cord-cutting',
    },
    {
      fact: "Mirror spells work on the principle of reflection: they send energy back to its source. That's why they're used for both protection and self-reflection.",
      source: 'spells/mirror-spell',
    },
    {
      fact: 'Money jars combine the magic of herbs, coins, and intention. They work through sympathetic magic: like attracts like.',
      source: 'spells/money-jar',
    },
    {
      fact: 'Bay leaves have been used in manifestation for centuries. Write your wish on one, burn it, and release the intention with the smoke.',
      source: 'spells/bay-leaf-manifestation',
    },
    {
      fact: 'The word "glamour" originally meant a spell cast to change how someone appears. Glamour magic is one of the oldest forms of spellwork.',
      source: 'spells/glamour-spell',
    },
    {
      fact: 'Rosemary was burned in hospitals during plagues for purification. In spellwork, it substitutes for almost any herb, like white candles substitute for any colour.',
      source: 'spells/herb-substitution',
    },
    {
      fact: 'Freezer spells work by literally freezing a situation in place. Write what you want to stop on paper, put it in water, and freeze it.',
      source: 'spells/freezer-spell',
    },
    {
      fact: 'Knot magic is one of the simplest spells: tie your intention into a cord. Each knot seals a layer of focus. Untie to release.',
      source: 'spells/knot-magic',
    },
    {
      fact: 'Egg cleansing (limpia) is a Mesoamerican practice that absorbs negative energy. The egg is passed over the body then cracked into water to read.',
      source: 'spells/egg-cleansing',
    },
    {
      fact: "Honey jars sweeten someone's disposition toward you. They're slow magic: the longer they sit, the stronger they work.",
      source: 'spells/honey-jar',
    },
    {
      fact: 'Sigils are symbols charged with intention. You design one, activate it, then forget it. The forgetting is the magic: it releases attachment to the outcome.',
      source: 'spells/sigil-creation',
    },
    {
      fact: 'Smoke cleansing has been practised by nearly every culture. Sage, palo santo, cedar, and incense all work differently depending on the intention.',
      source: 'spells/smoke-cleansing',
    },
    {
      fact: 'Waning moon is the best phase for banishing and letting go. Spells cast during this phase align with the energy of release.',
      source: 'spells/lunar-timing',
    },
  ],
  numerology: [
    {
      fact: "Seeing 11:11 isn't coincidence. In numerology, 11 is a master number representing spiritual awakening and intuitive insight.",
      source: 'numerology/angel-numbers/111',
    },
    {
      fact: "The number 222 means your manifestations are coming to fruition. It's the universe telling you to stay patient.",
      source: 'numerology/angel-numbers/222',
    },
    {
      fact: 'Your Life Path number is calculated from your full birth date. It reveals your core purpose and the lessons your soul chose to learn.',
      source: 'numerology/life-path/1',
    },
    {
      fact: '333 is the number of the Ascended Masters. When you see it, spiritual guides are nearby and want to help.',
      source: 'numerology/angel-numbers/333',
    },
    {
      fact: '444 means angels are surrounding you with protection and support. It appears most when you need reassurance.',
      source: 'numerology/angel-numbers/444',
    },
    {
      fact: '555 signals massive change is coming. In numerology, 5 is the number of freedom, adventure, and transformation.',
      source: 'numerology/angel-numbers/555',
    },
    {
      fact: '777 is the luckiest angel number. It means you are exactly where you are meant to be on your spiritual path.',
      source: 'numerology/angel-numbers/777',
    },
    {
      fact: '888 is the number of abundance and financial flow. It signals that rewards for past effort are arriving.',
      source: 'numerology/angel-numbers/888',
    },
    {
      fact: '999 marks completion. When you see it, a major chapter is ending. Let it close so the next one can begin.',
      source: 'numerology/angel-numbers/999',
    },
    {
      fact: 'Master numbers 11, 22, and 33 are never reduced in numerology. They carry amplified spiritual significance.',
      source: 'numerology/life-path/11',
    },
    {
      fact: 'Your Expression number is calculated from your full birth name. It reveals natural talents and abilities you came into this life with.',
      source: 'numerology/expression/1',
    },
    {
      fact: 'Pythagoras, the father of mathematics, believed that numbers were the language of the universe. He founded Western numerology in the 6th century BC.',
      source: 'numerology/life-path/1',
    },
    {
      fact: "Your Soul Urge number comes from the vowels in your name. It reveals your heart's deepest desires and what truly motivates you.",
      source: 'numerology/soul-urge/1',
    },
    {
      fact: 'The number 0 in numerology represents infinite potential and the void before creation. It amplifies any number it appears with.',
      source: 'numerology/angel-numbers/000',
    },
    {
      fact: '1010 is a portal number. It appears when you are at the threshold of a major spiritual upgrade or quantum leap.',
      source: 'numerology/angel-numbers/1010',
    },
    {
      fact: "Personal Year cycles run from birthday to birthday, not January to January. Your current Personal Year number shapes your year's themes.",
      source: 'numerology/personal-year/1',
    },
    {
      fact: "666 is not evil in numerology. It's a message to rebalance your focus between material concerns and spiritual growth.",
      source: 'numerology/angel-numbers/666',
    },
  ],
  runes: [
    {
      fact: 'The Elder Futhark has 24 runes, divided into three aettir of eight. Each aett is governed by a different Norse deity.',
      source: 'runes/fehu',
    },
    {
      fact: "Fehu, the first rune, literally means 'cattle'. In Norse society, cattle was wealth. It represents abundance and new beginnings.",
      source: 'runes/fehu',
    },
    {
      fact: "The word 'rune' comes from Old Norse 'rún', meaning 'secret' or 'whisper'. Runes were never just an alphabet: they were a system of magic.",
      source: 'runes/ansuz',
    },
    {
      fact: "Odin hung upside down from Yggdrasil for nine days and nights to gain the knowledge of runes. That's why rune magic is considered sacred.",
      source: 'runes/ansuz',
    },
    {
      fact: "The rune Gebo (ᚷ) means 'gift' and represents equal exchange. It's the origin of the X we use for kisses.",
      source: 'runes/gebo',
    },
    {
      fact: 'Vikings carved runes into their weapons believing it imbued them with power. The rune Tiwaz (ᛏ) was marked on swords for victory.',
      source: 'runes/tiwaz',
    },
    {
      fact: 'The rune Algiz (ᛉ) is the most recognisable protection symbol. Its shape — a person with arms raised — represents the shield of the divine.',
      source: 'runes/algiz',
    },
    {
      fact: "The blank rune (Wyrd) isn't historically authentic. It was added in the 1980s. Traditional Elder Futhark has exactly 24 runes.",
      source: 'runes/fehu',
    },
    {
      fact: 'Runes were never written left-to-right exclusively. They could be carved in any direction, even in spirals, and were read by context.',
      source: 'runes/ansuz',
    },
    {
      fact: "The rune Isa (ᛁ) is a single vertical line meaning 'ice'. It represents stillness, patience, and the power of doing nothing.",
      source: 'runes/isa',
    },
  ],
  chakras: [
    {
      fact: "The word 'chakra' comes from Sanskrit meaning 'wheel'. There are 7 main chakras aligned along your spine, each spinning at a different frequency.",
      source: 'chakras/root',
    },
    {
      fact: "Your Heart Chakra is the bridge between the lower (physical) and upper (spiritual) chakras. It's where earthly and divine energy meet.",
      source: 'chakras/heart',
    },
    {
      fact: 'The Third Eye Chakra vibrates at the colour indigo. When balanced, it enhances intuition, foresight, and the ability to see beyond the physical.',
      source: 'chakras/third-eye',
    },
    {
      fact: 'The Root Chakra at the base of your spine governs your survival instincts. When blocked, anxiety and fear take over.',
      source: 'chakras/root',
    },
    {
      fact: 'The Crown Chakra is associated with the colour violet or white. When open, it connects you to universal consciousness and your highest self.',
      source: 'chakras/crown',
    },
    {
      fact: 'The Sacral Chakra governs creativity, pleasure, and emotional flow. When blocked, both creative expression and intimacy suffer.',
      source: 'chakras/sacral',
    },
    {
      fact: 'The Solar Plexus Chakra is your personal power centre. A weak solar plexus shows up as people-pleasing and difficulty saying no.',
      source: 'chakras/solar-plexus',
    },
    {
      fact: "The Throat Chakra doesn't just govern speech. It governs all authentic expression: writing, art, singing, and honest communication.",
      source: 'chakras/throat',
    },
    {
      fact: 'Each chakra spins at a different frequency corresponding to a colour of the rainbow, from red (root) to violet (crown).',
      source: 'chakras/root',
    },
    {
      fact: 'Chakras can be overactive, not just blocked. An overactive Third Eye can cause overthinking, headaches, and difficulty staying grounded.',
      source: 'chakras/third-eye',
    },
  ],
  zodiac: [
    {
      fact: 'Your Sun sign is only one piece of the puzzle. Your Moon sign rules your emotions, and your Rising sign is how others perceive you.',
      source: 'zodiac/aries',
    },
    {
      fact: "Mercury retrograde happens 3-4 times per year and lasts about 3 weeks. It doesn't actually move backward: it's an optical illusion from Earth's perspective.",
      source: 'zodiac/gemini',
    },
    {
      fact: "Scorpio is the only sign ruled by two planets: Mars (traditional) and Pluto (modern). That's why Scorpios have both warrior energy and deep transformation power.",
      source: 'zodiac/scorpio',
    },
    {
      fact: 'The 12 zodiac signs are divided into 4 elements: Fire (action), Earth (stability), Air (intellect), Water (emotion). Your element reveals your core nature.',
      source: 'zodiac/aries',
    },
    {
      fact: "Pisces is the last sign of the zodiac, which means it carries a piece of every sign before it. That's why Pisces are the most empathic sign.",
      source: 'zodiac/pisces',
    },
    {
      fact: "Leo is ruled by the Sun, the only sign ruled by a star rather than a planet. That's why Leos naturally radiate main character energy.",
      source: 'zodiac/leo',
    },
    {
      fact: 'Each zodiac sign rules a body part, from Aries (head) to Pisces (feet). Stress often shows up in the body part your sign governs.',
      source: 'zodiac/aries',
    },
    {
      fact: "Ophiuchus, the 'thirteenth sign', has been known since ancient times. Astronomers acknowledge it but astrologers intentionally exclude it from the zodiac.",
      source: 'zodiac/scorpio',
    },
    {
      fact: "Taurus is the only sign that can match Scorpio's stubbornness. They're opposite signs and share an unshakeable determination.",
      source: 'zodiac/taurus',
    },
    {
      fact: "Virgo's symbol isn't just a maiden. The M with the crossed loop represents the intestines, connecting Virgo to digestion, analysis, and breaking things down.",
      source: 'zodiac/virgo',
    },
    {
      fact: "Aquarius is an air sign, not water. The water bearer pours knowledge and innovation, not emotion. It's the sign of collective progress.",
      source: 'zodiac/aquarius',
    },
    {
      fact: "Cancer is ruled by the Moon, the fastest-moving celestial body. That's why Cancers' moods shift so rapidly: their ruler changes signs every 2.5 days.",
      source: 'zodiac/cancer',
    },
  ],
};

const CATEGORIES: ThemeCategory[] = [
  'tarot',
  'crystals',
  'spells',
  'numerology',
  'runes',
  'chakras',
  'zodiac',
];

/**
 * Generate a "Did You Know" fact card for a given date.
 * Deterministic: same date = same fact.
 */
export function generateDidYouKnow(dateStr: string): IGDidYouKnowContent {
  const rng = seededRandom(`dyk-${dateStr}`);

  // Pick category
  const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
  const pool = FACT_POOLS[category] || FACT_POOLS.tarot;

  // Pick fact from pool
  const entry = pool[Math.floor(rng() * pool.length)];

  return {
    fact: entry.fact,
    category,
    source: entry.source,
  };
}

/**
 * Generate multiple "Did You Know" facts for preview purposes.
 */
export function generateDidYouKnowBatch(
  dateStr: string,
  count: number = 3,
): IGDidYouKnowContent[] {
  const results: IGDidYouKnowContent[] = [];
  const rng = seededRandom(`dyk-batch-${dateStr}`);

  const shuffledCategories = [...CATEGORIES].sort(() => rng() - 0.5);

  for (let i = 0; i < count; i++) {
    const category = shuffledCategories[i % shuffledCategories.length];
    const pool = FACT_POOLS[category] || FACT_POOLS.tarot;
    const entry = pool[Math.floor(rng() * pool.length)];

    results.push({
      fact: entry.fact,
      category,
      source: entry.source,
    });
  }

  return results;
}
