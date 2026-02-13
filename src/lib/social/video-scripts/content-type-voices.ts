/**
 * Content-type specific voices and script structures for video generation
 * Each content type has its own distinct voice, banned phrases, and script structures
 */

export type ContentTypeKey =
  | 'angel_numbers'
  | 'tarot_major'
  | 'tarot_minor'
  | 'planets'
  | 'moon_phases'
  | 'mirror_hours'
  | 'zodiac_sun'
  | 'zodiac_moon'
  | 'zodiac_rising'
  | 'crystals'
  | 'chakras'
  | 'elements'
  | 'numerology_life_path'
  | 'numerology_expression'
  | 'sabbats'
  | 'retrogrades'
  | 'eclipses'
  | 'houses'
  | 'aspects'
  | 'spells'
  | 'quiz'
  | 'ranking'
  | 'hot_take'
  | 'sign_check'
  | 'myth'
  | 'did_you_know'
  | 'default';

/**
 * Map category names to content type keys
 */
export function getContentTypeFromCategory(category: string): ContentTypeKey {
  const lower = category.toLowerCase();

  // Spells
  if (
    lower.includes('spell') ||
    lower.includes('ritual') ||
    lower.includes('witchcraft') ||
    lower.includes('incantation') ||
    /\b(protection spell|love spell|abundance spell|cleansing|banishing|manifestation spell)\b/i.test(
      lower,
    )
  ) {
    return 'spells';
  }

  // Angel Numbers
  if (
    lower.includes('angel') ||
    (lower.includes('number') && /\b\d{3,4}\b/.test(lower)) ||
    /\b(111|222|333|444|555|666|777|888|999|000|1010|1111|1212)\b/.test(lower)
  ) {
    return 'angel_numbers';
  }

  // Tarot - Major vs Minor Arcana
  if (
    lower.includes('major arcana') ||
    /\b(fool|magician|high priestess|empress|emperor|hierophant|lovers|chariot|strength|hermit|wheel|justice|hanged|death|temperance|devil|tower|star|moon|sun|judgement|judgment|world)\b/i.test(
      lower,
    )
  ) {
    return 'tarot_major';
  }
  if (
    lower.includes('minor arcana') ||
    lower.includes('tarot') ||
    /\b(wands|cups|swords|pentacles|ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)\b/i.test(
      lower,
    )
  ) {
    return 'tarot_minor';
  }

  // Retrogrades (before general planets)
  if (lower.includes('retrograde')) {
    return 'retrogrades';
  }

  // Eclipses
  if (lower.includes('eclipse')) {
    return 'eclipses';
  }

  // Planets
  if (
    lower.includes('planet') ||
    /\b(mercury|venus|mars|jupiter|saturn|neptune|uranus|pluto)\b/i.test(
      lower,
    ) ||
    lower.includes('transit')
  ) {
    return 'planets';
  }

  // Moon Phases
  if (
    lower.includes('moon phase') ||
    lower.includes('lunar') ||
    /\b(new moon|full moon|waxing|waning|gibbous|crescent|first quarter|last quarter|third quarter)\b/i.test(
      lower,
    )
  ) {
    return 'moon_phases';
  }

  // Mirror Hours
  if (
    lower.includes('mirror') ||
    lower.includes('double hour') ||
    /\b\d{2}:\d{2}\b/.test(lower)
  ) {
    return 'mirror_hours';
  }

  // Zodiac - differentiate by placement
  if (lower.includes('rising') || lower.includes('ascendant')) {
    return 'zodiac_rising';
  }
  if (lower.includes('moon sign') || lower.includes('moon in')) {
    return 'zodiac_moon';
  }
  if (
    lower.includes('zodiac') ||
    lower.includes('sun sign') ||
    /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i.test(
      lower,
    )
  ) {
    return 'zodiac_sun';
  }

  // Houses
  if (
    lower.includes('house') &&
    /\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\b/i.test(
      lower,
    )
  ) {
    return 'houses';
  }

  // Aspects
  if (/\b(conjunction|opposition|trine|square|sextile|aspect)\b/i.test(lower)) {
    return 'aspects';
  }

  // Crystals
  if (
    lower.includes('crystal') ||
    lower.includes('stone') ||
    /\b(amethyst|quartz|obsidian|citrine|selenite|tourmaline|jade|moonstone|labradorite)\b/i.test(
      lower,
    )
  ) {
    return 'crystals';
  }

  // Chakras
  if (
    lower.includes('chakra') ||
    /\b(root|sacral|solar plexus|heart|throat|third eye|crown)\b/i.test(lower)
  ) {
    return 'chakras';
  }

  // Elements
  if (
    /\b(fire sign|earth sign|air sign|water sign|fire element|earth element|air element|water element)\b/i.test(
      lower,
    )
  ) {
    return 'elements';
  }

  // Numerology - Life Path
  if (lower.includes('life path')) {
    return 'numerology_life_path';
  }

  // Numerology - Expression/Destiny
  if (lower.includes('expression') || lower.includes('destiny number')) {
    return 'numerology_expression';
  }

  // Sabbats
  if (
    /\b(samhain|yule|imbolc|ostara|beltane|litha|lughnasadh|lammas|mabon)\b/i.test(
      lower,
    )
  ) {
    return 'sabbats';
  }

  return 'default';
}

/**
 * Content type voice configurations
 */
export const CONTENT_TYPE_VOICES: Record<
  ContentTypeKey,
  {
    tone: string;
    voiceDescription: string;
    exampleEnergy: string;
    specificBans: string[];
    keyPhrases: string[];
  }
> = {
  angel_numbers: {
    tone: 'Direct, pattern-recognition focused, actionable',
    voiceDescription: `ANGEL NUMBER VOICE:
- Speak like you're explaining a pattern you've personally noticed
- Focus on WHEN this number appears (specific situations)
- Be direct about what to DO when you see it
- Use short, punchy sentences
- Ground it in real moments: stuck at a light, checking your phone, receipts
- This is pattern recognition, not mysticism`,
    exampleEnergy: `Example energy:
"222 appears when you're about to quit something. Job feels stuck. Relationship feels off. Then: 222. It's not saying everything's fine. It's saying: not yet. Give it more time."
"111 shows up at the START of something. New idea. New person. New direction. If you're seeing it, something just began whether you noticed or not."
"444 is stability confirmation. You're questioning if the foundation is solid. It is. Stop second-guessing."`,
    specificBans: [
      'the universe is sending you',
      'divine message',
      'spiritual download',
      'your angels want you to know',
      'sacred number',
      'angelic realm',
    ],
    keyPhrases: [
      'shows up when',
      'appears during',
      'you notice it when',
      'check the context',
      'what were you thinking about',
      'the pattern here',
    ],
  },

  tarot_major: {
    tone: 'Archetypal, profound, psychologically rich',
    voiceDescription: `MAJOR ARCANA VOICE:
- These are the BIG themes - speak with weight
- Challenge the surface reading
- Go to the shadow, the depth, the paradox
- This is psychology through ancient symbolism
- Cards REVEAL patterns, they don't PREDICT futures
- Be provocative - shake assumptions about what cards "mean"`,
    exampleEnergy: `Example energy:
"The Empress isn't gentle. She's relentless. This card shows up when you're holding back creativity because it doesn't feel practical. She doesn't care about practical."
"The Tower doesn't destroy what's working. It destroys what you've been pretending works. There's relief in that if you let it come."
"Death never means death. It means the thing you're gripping? Time to let go. The tighter you hold, the harder this card hits."
"The Fool isn't naive. The Fool has already completed the journey once. This is the second leap, knowing what's coming."`,
    specificBans: [
      'this card means',
      'the universe is telling you',
      'your reading shows',
      'destiny says',
      'fate has decided',
      'the cards say you will',
    ],
    keyPhrases: [
      'shows up when you',
      'this card asks',
      'the shadow here is',
      'what you resist',
      'the invitation is',
      'the paradox',
    ],
  },

  tarot_minor: {
    tone: 'Situational, practical, everyday wisdom',
    voiceDescription: `MINOR ARCANA VOICE:
- These are daily life themes - keep it grounded
- Connect to specific situations people recognize
- Suit matters: Wands (action), Cups (emotion), Swords (thought), Pentacles (material)
- Numbers tell a story: Aces (beginnings), Tens (completion)
- Less cosmic, more "this is what's happening in your Tuesday"`,
    exampleEnergy: `Example energy:
"Five of Cups: You're staring at what spilled. There are two cups behind you, still full. You haven't turned around yet."
"Three of Swords: This isn't about betrayal. It's about the moment you finally admit the truth you've been avoiding."
"Eight of Pentacles: Mastery isn't glamorous. It's the same task, done slightly better, over and over. This card asks: are you willing to be boring to become excellent?"`,
    specificBans: [
      'this card predicts',
      'you will receive',
      'expect to',
      'the universe will bring',
    ],
    keyPhrases: [
      'in daily life this looks like',
      'the situation here',
      'you might recognize this as',
      'the work being asked',
    ],
  },

  planets: {
    tone: 'Observational, cause-and-effect, transit-focused',
    voiceDescription: `PLANET VOICE:
- Speak like an observer of patterns, not a fortune teller
- Focus on EFFECTS you can actually notice
- Connect to real behaviors and tendencies
- Use transit language: "during", "while", "as"
- This is astronomy meeting psychology
- Be practical about timing windows`,
    exampleEnergy: `Example energy:
"Venus transits shift what feels attractive. Not just people. Jobs, places, ideas. If something suddenly looks different, check where Venus is."
"Saturn doesn't punish. Saturn audits. What did you build? Does it hold? If not, Saturn will show you where the cracks are."
"Jupiter expands whatever it touches. That includes problems. Good luck can be overwhelming if you're not ready for it."`,
    specificBans: [
      'the planet wants',
      'cosmic energy flowing',
      'planetary alignment brings',
      'the stars say',
      'celestial guidance',
    ],
    keyPhrases: [
      'during this transit',
      'you might notice',
      'the effect shows up as',
      'timing-wise',
      'watch for',
      'the pattern here',
    ],
  },

  retrogrades: {
    tone: 'Debunking, practical, timing-aware',
    voiceDescription: `RETROGRADE VOICE:
- Lead with what it DOESN'T mean
- Explain what actually shifts
- Focus on the "re-" words: review, revisit, reconnect
- This isn't cosmic punishment, it's a timing pattern
- Be practical about what to pause vs continue`,
    exampleEnergy: `Example energy:
"Mercury retrograde doesn't break technology. It exposes communication you've been avoiding. Old texts resurface. Conversations restart. That's the pattern."
"Venus retrograde isn't about exes coming back. It's about reconsidering what you value. The ex is just a symbol of an old priority."
"Mars retrograde slows momentum. Not a stop sign. A yellow light. Projects take longer. Patience becomes the strategy."`,
    specificBans: [
      'everything will go wrong',
      'dont sign contracts',
      'mercury is punishing',
      'cosmic chaos',
    ],
    keyPhrases: [
      'what actually happens',
      're-examine',
      'the real effect',
      'timing matters here',
      'review rather than',
    ],
  },

  eclipses: {
    tone: 'Significant, portal-focused, before/after',
    voiceDescription: `ECLIPSE VOICE:
- These are inflection points, not disasters
- Focus on the before/after shift
- Solar vs Lunar: External change vs Internal shift
- Connect to the nodes: what's being released, what's being gained
- Six-month windows of change`,
    exampleEnergy: `Example energy:
"Solar eclipses don't bring crisis. They bring clarity you weren't asking for. The path forward gets lit whether you're ready or not."
"Lunar eclipses surface what you've been feeling but not saying. Emotions don't stay hidden during these. Neither do secrets."
"Eclipse seasons accelerate timelines. What would've taken a year might happen in weeks. Buckle up."`,
    specificBans: [
      'eclipse doom',
      'terrible eclipse',
      'dangerous time',
      'hide during',
    ],
    keyPhrases: [
      'the shift happens',
      'before and after',
      'acceleration',
      'clarity arrives',
      'timing portal',
    ],
  },

  moon_phases: {
    tone: 'Cyclical, rhythmic, energy-focused',
    voiceDescription: `MOON PHASE VOICE:
- Speak in cycles and rhythms, not events
- Focus on ENERGY levels and direction
- Use body-awareness language
- This is about internal tides, not external events
- Connect to rest, action, release, intention
- Be practical about what to DO in each phase`,
    exampleEnergy: `Example energy:
"Waning Gibbous is the exhale after the Full Moon's peak. Energy's still high, but direction shifts. This is harvest time, not planting time."
"New Moon isn't about big action. It's about clarity. What do you want? Not what sounds good. What do you actually want?"
"Full Moon amplifies whatever's already there. Good mood? Better. Bad mood? Worse. It's not creating the feeling. It's turning up the volume."`,
    specificBans: [
      'lunar goddess',
      'moon magic ritual',
      'the moon wants you to',
      'celestial feminine',
      'divine lunar timing',
    ],
    keyPhrases: [
      'energy shifts toward',
      'this phase is for',
      'you might feel',
      'the rhythm here',
      'notice your',
      'the cycle suggests',
    ],
  },

  mirror_hours: {
    tone: 'Pattern-focused, synchronicity-aware, grounded',
    voiceDescription: `MIRROR HOUR VOICE:
- Similar to angel numbers but focused on TIME
- Speak about the moment of noticing
- Ground it in daily routine
- This is about pattern awareness, not messages
- Connect the specific time to its meaning`,
    exampleEnergy: `Example energy:
"11:11 shows up when you're at a threshold. Not after the decision. Before it. You're being asked to pay attention to what you're about to do."
"22:22 appears in relationship moments. Small ones. A text you're debating sending. A call you're avoiding."
"00:00 is the reset point. Midnight. Something is ending so something can begin. Check what cycle you're in."`,
    specificBans: [
      'the universe is messaging',
      'divine timing alert',
      'spiritual message from',
      'your guides say',
      'angel message at',
    ],
    keyPhrases: [
      'appears when',
      'the moment you notice',
      'check what you were',
      'the timing suggests',
      'the pattern here',
    ],
  },

  zodiac_sun: {
    tone: 'Behavioral, observational, identity-focused',
    voiceDescription: `SUN SIGN VOICE:
- This is core identity - how someone expresses themselves
- Focus on BEHAVIORS and TENDENCIES
- Be specific about how this sign shows up in real life
- Slight humor is okay - signs have quirks
- This is personality observation, not destiny
- CRITICAL: Every script MUST include a direct identity callout in lines 1-3
- Use "If you're a [sign]..." / "[Sign]s already know..." / "Every [sign] reading this..."
- Analytics: zodiac WITH identity callouts -> 20x more comments than without`,
    exampleEnergy: `Example energy:
"Sagittarius overshares within 5 minutes of meeting someone. It's not nervous energy. They genuinely think the story's too good not to tell."
"Capricorns don't rest. They schedule rest like it's a meeting. Then often cancel that meeting for actual work."
"Scorpios aren't mysterious on purpose. They just learned early that information is power. They're watching. Always watching."`,
    specificBans: [
      'your sun sign destiny',
      'zodiac fate',
      'the stars have decided',
      'cosmic purpose says',
    ],
    keyPhrases: [
      'you might notice',
      'tends to',
      'shows up as',
      'the pattern here',
      'in daily life',
    ],
  },

  zodiac_moon: {
    tone: 'Emotional, intimate, needs-focused',
    voiceDescription: `MOON SIGN VOICE:
- This is emotional needs - what someone requires to feel safe
- Focus on private behaviors, not public ones
- How someone processes feelings
- What comforts them when stressed
- More intimate than sun sign content
- CRITICAL: Every script MUST include a direct identity callout in lines 1-3
- Use "If you're a [sign]..." / "[Sign]s already know..." / "Every [sign] reading this..."
- Analytics: zodiac WITH identity callouts -> 20x more comments than without`,
    exampleEnergy: `Example energy:
"Capricorn moons don't do emotional chaos. They schedule their breakdowns. Tuesday at 3pm, feelings. Then back to work."
"Cancer moons need home base. Not a building. A feeling of belonging. Without it, nothing else lands right."
"Aquarius moons process emotions intellectually first. They need to understand the feeling before they can feel it."`,
    specificBans: [
      'your emotional destiny',
      'the moon determines',
      'you are fated to feel',
    ],
    keyPhrases: [
      'when stressed',
      'needs to feel safe',
      'processes emotion by',
      'the comfort pattern',
      'privately',
    ],
  },

  zodiac_rising: {
    tone: 'First-impression focused, social-mask aware',
    voiceDescription: `RISING SIGN VOICE:
- This is the social mask - first impressions, public persona
- How others perceive them before knowing them
- The lens through which life is approached
- Often different from the sun sign self
- Focus on appearance, vibe, first meetings
- CRITICAL: Every script MUST include a direct identity callout in lines 1-3
- Use "If you're a [sign]..." / "[Sign]s already know..." / "Every [sign] reading this..."
- Analytics: zodiac WITH identity callouts -> 20x more comments than without`,
    exampleEnergy: `Example energy:
"Scorpio risings enter a room and everyone notices. They didn't do anything. The intensity is automatic. It reads as power or threat."
"Libra risings are immediately likeable. Almost suspiciously likeable. People wonder what they're not showing."
"Virgo risings give off 'has their life together' energy even when they absolutely do not. The organization is aesthetic."`,
    specificBans: [
      'your rising determines your fate',
      'destined to appear',
      'cosmic first impression',
    ],
    keyPhrases: [
      'first impression is',
      'comes across as',
      'others perceive',
      'the social mask',
      'in public',
    ],
  },

  crystals: {
    tone: 'Grounded, practical, sensation-focused',
    voiceDescription: `CRYSTAL VOICE:
- Speak about physical and energetic properties
- Be practical about use cases
- Ground it in sensory experience
- This is tool-focused, not magic-focused
- Connect to specific situations where it helps`,
    exampleEnergy: `Example energy:
"Black tourmaline isn't just protection. It's grounding. If you're spiraling, hold it. Feel the weight. That's the point."
"Rose quartz doesn't create love. It softens your edges so you can receive it. Useful distinction."
"Clear quartz amplifies whatever's around it. Including bad vibes. Cleanse it regularly or it becomes a problem."`,
    specificBans: [
      'magic crystal powers',
      'the stone wants you to',
      'crystal spirits speak',
      'mystical crystal energy',
    ],
    keyPhrases: [
      'use this when',
      'you might feel',
      'the property here',
      'practically speaking',
      'the effect is',
    ],
  },

  chakras: {
    tone: 'Body-aware, blockage-focused, practical',
    voiceDescription: `CHAKRA VOICE:
- Connect to physical sensations and locations
- Focus on what blockage looks like vs flow
- Practical ways to work with each
- This is energy mapped to the body
- Less mystical, more somatic`,
    exampleEnergy: `Example energy:
"Throat chakra blockage isn't mystical. It's the lump you feel when you don't say what needs saying. The body keeps score."
"Root chakra issues show up as anxiety about basic needs. Money, safety, belonging. The body panics even when the mind says you're fine."
"Heart chakra closure looks like independence. But it's often just protection. There's a difference between not needing people and not letting them in."`,
    specificBans: [
      'mystical chakra energy',
      'divine energy centers',
      'spiritual awakening through',
    ],
    keyPhrases: [
      'shows up in the body as',
      'you might notice',
      'blockage looks like',
      'flow feels like',
      'the work here is',
    ],
  },

  elements: {
    tone: 'Foundational, temperament-focused, relational',
    voiceDescription: `ELEMENT VOICE:
- This is about fundamental nature
- How someone processes, reacts, relates
- Fire (action), Earth (stability), Air (thought), Water (feeling)
- Element interactions and conflicts
- Foundational personality patterns`,
    exampleEnergy: `Example energy:
"Fire signs act first, think second. The thinking happens while already moving. Waiting feels like dying."
"Earth signs need proof. They believe what they can touch, verify, track over time. Abstract isn't convincing."
"Air signs live in ideas. The concept is often more interesting than the execution. That's not laziness. It's processing style."
"Water signs absorb the room. They know what everyone's feeling, often before the person does. It's exhausting."`,
    specificBans: [
      'elemental destiny',
      'cosmic element assignment',
      'divine element purpose',
    ],
    keyPhrases: [
      'processes by',
      'reacts to stress with',
      'needs in relationship',
      'the fundamental approach',
    ],
  },

  numerology_life_path: {
    tone: 'Lifelong theme focused, developmental',
    voiceDescription: `LIFE PATH VOICE:
- This is the central life lesson
- Not what you ARE, but what you're learning
- Challenges and gifts of the number
- Shows up differently at different life stages
- The long arc, not the daily pattern`,
    exampleEnergy: `Example energy:
"Life Path 7 isn't about being spiritual. It's about needing to understand before trusting. Everything gets questioned. Including this."
"Life Path 1 keeps learning about independence the hard way. Every time they lean too much on others, something collapses."
"Life Path 4 builds. Whether they want to or not. Systems, routines, foundations. The lesson is: what are you building, and is it yours?"`,
    specificBans: [
      'your destiny number says',
      'fated to be',
      'numerology predicts your life',
    ],
    keyPhrases: [
      'the lesson here',
      'keeps encountering',
      'the gift and challenge',
      'over a lifetime',
    ],
  },

  numerology_expression: {
    tone: 'Talent and potential focused',
    voiceDescription: `EXPRESSION NUMBER VOICE:
- This is natural ability and expression style
- How someone's meant to contribute
- Talents that feel effortless
- The frequency they broadcast at
- Less about lessons, more about gifts`,
    exampleEnergy: `Example energy:
"Expression 3: Communication flows. Words, art, presence. The challenge isn't finding the voice. It's deciding what to do with it."
"Expression 8: Power and resources gravitate. But so does the responsibility that comes with them. Can't have one without the other."`,
    specificBans: [
      'destined to express',
      'your cosmic talent is',
      'fated abilities',
    ],
    keyPhrases: [
      'natural ability in',
      'expresses through',
      'the talent here',
      'contribution style',
    ],
  },

  sabbats: {
    tone: 'Seasonal, cyclical, nature-connected',
    voiceDescription: `SABBAT VOICE:
- Connect to the actual season and what's happening in nature
- This is about living in rhythm with the year
- What energy is available, what's falling away
- Practical ways to align
- Less ritual, more rhythm`,
    exampleEnergy: `Example energy:
"Samhain isn't spooky. It's the year dying. Gardens are done. Days are short. This is the natural time to honor endings."
"Beltane is life force. Fertility yes, but broader than that. Projects start. Energy returns. The body wants to move."
"Mabon is the second harvest. What did you plant that you're now collecting? And what needs storing for winter?"`,
    specificBans: [
      'mystical sabbat ritual',
      'divine holiday energy',
      'cosmic sabbat purpose',
    ],
    keyPhrases: [
      'in nature right now',
      'the season asks',
      'energy shifts toward',
      'the rhythm here',
      'aligning with',
    ],
  },

  houses: {
    tone: 'Life-area focused, practical astrology',
    voiceDescription: `HOUSE VOICE:
- Houses are WHERE life happens (areas of life)
- Connect to specific life domains
- What planets here mean
- How the house theme shows up
- Very practical astrology`,
    exampleEnergy: `Example energy:
"4th house isn't just about family. It's about foundations. Where you feel safe. What 'home' means in your nervous system."
"10th house is public reputation. Career yes, but broader. How you're seen by people who don't know you personally."
"12th house isn't mystical nonsense. It's the unconscious. What you don't know about yourself. Others often see it first."`,
    specificBans: [
      'house destiny',
      'cosmic house assignment',
      'fated house themes',
    ],
    keyPhrases: [
      'this area of life',
      'shows up in',
      'planets here affect',
      'the theme is',
      'in practical terms',
    ],
  },

  aspects: {
    tone: 'Relationship between energies, dynamic',
    voiceDescription: `ASPECT VOICE:
- This is how planetary energies interact
- Conjunctions (merge), Oppositions (tension), Trines (flow), Squares (friction), Sextiles (opportunity)
- Not good or bad, just different dynamics
- How two parts of the chart talk to each other`,
    exampleEnergy: `Example energy:
"Squares aren't bad aspects. They're friction. Friction creates heat. Heat creates change. It's uncomfortable but productive."
"Trines flow too easily sometimes. Natural talent with no push to develop it. Watch for complacency with trines."
"Oppositions create awareness through contrast. You see yourself clearly when something reflects back at you."`,
    specificBans: [
      'cosmic aspect destiny',
      'fated planetary relationship',
      'divine aspect purpose',
    ],
    keyPhrases: [
      'the dynamic between',
      'creates friction that',
      'flows together as',
      'tension produces',
      'the relationship here',
    ],
  },

  spells: {
    tone: 'Practical, instructional, empowering',
    voiceDescription: `SPELL VOICE:
- Speak like you're teaching a practical skill, not performing mysticism
- Focus on INGREDIENTS, TIMING, and INTENTION
- Be specific about when, how, and why
- This is practical craft, not fantasy
- Every spell has a mechanism — explain it
- Connect moon phases, days of the week, and seasons to timing`,
    exampleEnergy: `Example energy:
"Protection salt doesn't just sit there. Salt absorbs. Place it at thresholds, windows, anywhere energy enters. Replace it monthly."
"Friday isn't random for love spells. Venus rules Friday. You're matching the intention to the planetary energy."
"Cinnamon in abundance spells isn't decorative. Cinnamon generates heat. Heat moves energy. That's why you blow it toward the door, not away from it."`,
    specificBans: [
      'magical powers',
      'cast a spell to make',
      'this spell will make someone',
      'guaranteed results',
      'dark magic',
      'hexing instructions',
    ],
    keyPhrases: [
      'the timing matters because',
      'the ingredient does',
      'practically speaking',
      'the mechanism here',
      'pair this with',
      'moon phase for this',
    ],
  },

  ranking: {
    tone: 'Provocative, definitive, list-format',
    voiceDescription: `RANKING VOICE:
- Speak with absolute confidence, like you've settled the debate
- Rankings must feel specific and opinionated, not generic
- Use tier-list and ranked-list language
- Each sign's placement must feel earned with a specific reason
- The goal is DEBATE in comments — make people agree AND disagree
- Brief, punchy justifications per rank`,
    exampleEnergy: `Example energy:
"Ranking signs by who'd survive a zombie apocalypse. Scorpio goes first because they've already planned for this. Gemini goes last because they'd try to negotiate."
"Top 3 signs you don't want to argue with: 1. Scorpio. They remember everything. 2. Capricorn. They have receipts. 3. Aries. They don't care if they're wrong."
"Signs ranked by how fast they move on: Sagittarius is already dating someone new before the conversation ends. Cancer is still thinking about it 3 years later."`,
    specificBans: [
      'all signs are equal',
      'no offense',
      'just kidding',
      'this is just for fun',
      'dont take it personally',
      'every sign is special',
    ],
    keyPhrases: [
      'ranked from',
      'and its not close',
      'bottom tier',
      'top tier',
      'prove me wrong',
      'comment if you disagree',
      'tell me where I went wrong',
    ],
  },

  hot_take: {
    tone: 'Confident, debate-provoking, combative',
    voiceDescription: `HOT TAKE VOICE:
- Lead with the most controversial claim possible
- Speak like someone who has a STRONG opinion and doesn't apologise for it
- Back up the take with one specific, undeniable observation
- The goal is duets, stitches, and comment wars
- Short, declarative sentences
- End with something that dares people to disagree`,
    exampleEnergy: `Example energy:
"Unpopular opinion: Libras are the most manipulative sign. They're just so charming about it you don't notice until it's too late."
"Hot take: your rising sign matters more than your sun sign. The sun sign is who you think you are. The rising is who everyone else actually deals with."
"I don't trust anyone who says they 'don't believe in astrology' but then acts exactly like their sign."`,
    specificBans: [
      'I could be wrong',
      'some people might disagree',
      'this is just my opinion',
      'no shade',
      'with all due respect',
      'everyone is different',
    ],
    keyPhrases: [
      'unpopular opinion',
      'hot take',
      'nobody talks about this',
      'prove me wrong',
      'I said what I said',
      'tell me I am wrong',
      'change my mind',
    ],
  },

  sign_check: {
    tone: 'Direct, personal, teasing',
    voiceDescription: `SIGN CHECK VOICE:
- Speak DIRECTLY to one sign as if you're calling them out personally
- Use "you" language constantly — this is a conversation
- Tease but with affection — callout, not attack
- Reference specific, hyper-relatable behaviours
- The viewer should feel SEEN, almost uncomfortably so
- End with something that makes them save or share`,
    exampleEnergy: `Example energy:
"If you're a Virgo, stop scrolling. You've reorganised your entire life this week and still feel like it's not enough. That's not productivity. That's avoidance."
"Capricorns. You're working right now, aren't you? Put the phone down. Actually, no. Listen to this first."
"Geminis. You've started 4 conversations today and finished none of them. Not a character flaw. Just Tuesday."`,
    specificBans: [
      'all signs should',
      'if you happen to be',
      'some of you might',
      'this might apply',
      'no judgment',
      'just a generalisation',
    ],
    keyPhrases: [
      'stop scrolling',
      'this is your sign',
      'you already know',
      'be honest',
      'tag yourself',
      'send this to your',
    ],
  },

  myth: {
    tone: 'Storytelling, captivating, reveal-structured',
    voiceDescription: `MYTH VOICE:
- Open with intrigue — "The real reason...", "Nobody tells you..."
- Build like a story with a setup, twist, and reveal
- Ground mythology in real meaning — why this origin story MATTERS
- Make ancient stories feel relevant to modern life
- The payoff should make the viewer see the sign/planet differently
- Pace it like a bedtime story that gets intense`,
    exampleEnergy: `Example energy:
"The real reason Scorpio is associated with death has nothing to do with being dark. The original symbol was the eagle. Death and rebirth. Transformation. Somewhere along the way, we forgot the rebirth part."
"Nobody tells you why Cancer's symbol is the crab. It's not about being moody. Crabs carry their home on their back. They never feel safe unless they can retreat. That's the whole sign."
"Aquarius isn't actually a water sign. The water bearer is pouring knowledge, not water. The original myth is about someone who saw the truth and shared it regardless of consequence."`,
    specificBans: [
      'according to legend',
      'ancient peoples believed',
      'in olden times',
      'the mythology says',
      'scholars think',
      'its commonly believed',
    ],
    keyPhrases: [
      'the real reason',
      'nobody tells you',
      'the part they leave out',
      'here is what actually happened',
      'the origin changes everything',
      'once you know this',
    ],
  },

  quiz: {
    tone: 'Interactive, identity-affirming, playful',
    voiceDescription: `QUIZ VOICE:
- Frame everything as identity discovery
- Use "which one are you" framing
- Make viewers comment their answer
- Each option must be recognizable and specific
- The goal is engagement, not education
- Viewers should tag friends who match each option`,
    exampleEnergy: `Example energy:
"Which moon sign response is yours? Option A: 'I need to be alone.' Option B: 'Let me process this out loud.' Option C: 'I'm fine.' (they are not fine)"
"Rank these by how much they describe you: 1. Overplans everything 2. Wings it and somehow wins 3. Plans, then throws out the plan"`,
    specificBans: [
      'correct answer',
      'you should be',
      'the best one is',
      'wrong answer',
      'the right choice',
    ],
    keyPhrases: [
      'which one are you',
      'drop yours',
      'tag the friend who',
      'comment your answer',
      'be honest',
      'no wrong answers',
    ],
  },

  did_you_know: {
    tone: 'Curious, informative, slightly conspiratorial',
    voiceDescription: `DID YOU KNOW VOICE:
- Open with genuine surprise — "Did you know...?"
- Speak like you just discovered something fascinating and can't wait to share it
- Deliver the fact with context that makes it stick
- Explain WHY it matters, not just WHAT it is
- End with a reframe or closer that makes people want to save the video
- The viewer should feel smarter after watching`,
    exampleEnergy: `Example energy:
"Did you know the Death card doesn't mean death? It's actually one of the most misunderstood cards in tarot. It represents transformation. Endings that make space for new beginnings. Next time you pull it, don't panic."
"Did you know 11:11 isn't a coincidence? In numerology, 11 is a master number. It represents spiritual awakening. You're not randomly noticing. You're at a threshold."
"Did you know salt circles have been used for protection across almost every culture in history? From Ancient Rome to medieval Europe to Japanese Shinto. The practice is thousands of years old."`,
    specificBans: [
      'fun fact',
      'interesting trivia',
      'here is a cool fact',
      'random fact',
      'bet you didnt know',
      'mind blown',
    ],
    keyPhrases: [
      'did you know',
      'most people dont realise',
      'the reason is',
      'next time you see this',
      'save this',
      'now you know',
    ],
  },

  default: {
    tone: 'Clear, grounded, educational',
    voiceDescription: `DEFAULT VOICE:
- Speak clearly and directly
- Ground concepts in real experience
- Be specific rather than vague
- Avoid mystical language unless earned
- Focus on practical understanding`,
    exampleEnergy: `Example energy: Write like you're explaining something interesting you learned to a curious friend. Specific details, not vague gestures.`,
    specificBans: [],
    keyPhrases: [
      'shows up when',
      'you might notice',
      'the pattern here',
      'in practice',
    ],
  },
};

/**
 * Script structures for each content type
 * Each structure is a completely different approach
 */
export const SCRIPT_STRUCTURES: Record<ContentTypeKey, string[]> = {
  angel_numbers: [
    `PATTERN RECOGNITION: "You keep seeing [X]. Here's what's actually happening..." - Open with the repeated sighting - Name SPECIFIC situations where it appears - Reveal what ties those situations together - End with what to do next time`,
    `SITUATIONAL: "[X] appears when you're [specific situation]. Not before. Not after. During." - Open with the exact moment it shows up - Describe the internal state - Connect the number to that state - One action to take`,
    `TIMING VALIDATION: "Seeing [X] when you've been waiting forever?" - Open with the frustration - Explain what the number says about timing - Ground it in patience or action - Practical next step`,
    `CONTRAST: "Most people think [X] means [common belief]. It doesn't." - Name the misconception - Explain what it ACTUALLY indicates - Give a real example - Reframe the meaning`,
    `ACTION-BASED: "[X] showed up. Here's what to do with that." - Skip explanation, go straight to action - Explain why this action fits - When to expect results`,
    `ENDPOINT: "[X] appears at endings. Not beginnings." - When this shows up in cycles - What's completing - What to release - What comes next`,
    `CONTEXT CHECK: "Before you read into [X], check the context." - Pause on assumption - Different meanings in different situations - How to discern - The nuance matters`,
    `VALIDATION: "[X] as confirmation. You asked a question. This is the answer." - Frame as response, not message - What question it's answering - Trust the direction - Move forward`,
  ],

  tarot_major: [
    `ARCHETYPAL CHALLENGE: "[Card] isn't [expected]. [Card] is [unexpected]." - Challenge surface reading - Go to shadow/depth - When this card appears - The real invitation`,
    `SHADOW WORK: "This card shows up when you're [resistance pattern]." - Name the avoidance - How card mirrors it - What you're being asked to see - The release available`,
    `INVITATION: "[Card] asks: [provocative question]" - Open with card's central question - What avoiding it costs - What answering reveals - Transformation possible`,
    `PARADOX: "[Card] teaches through [contradiction]." - Name the paradox - How opposing forces work together - Wisdom in holding both - Practical application`,
    `REVERSAL MEANING: "[Card] reversed doesn't mean opposite. It means..." - Challenge simple reversal - Internal vs external shift - When reversed appears - What to examine`,
    `TIMING: "[Card] appears during [specific life transition]." - Name the transition - What card illuminates - What's completing/beginning - How to work with it`,
    `LIBERATION: "[Card] isn't warning you. It's freeing you from [thing]." - Reframe from warning to release - What's being shed - The permission granted - Move forward`,
    `DEPTH: "The surface read of [Card] misses [deeper layer]." - Acknowledge common read - Go deeper - The psychology underneath - What it asks of you`,
  ],

  tarot_minor: [
    `DAILY LIFE: "In daily life, [Card] looks like [specific scenario]." - Ground in recognizable situation - What the suit adds - The number's significance - What to do with it`,
    `SUIT FOCUS: "[Card] as a [Suit] card means [specific]." - Suit context matters - Wands/Cups/Swords/Pentacles lens - How it changes meaning - Practical reading`,
    `NUMBER JOURNEY: "[Card] as the [Number] shows where you are in the cycle." - Position in 1-10 journey - What came before - What comes next - The current task`,
    `COURT CARD ENERGY: "[Court Card] isn't a person. It's an energy you're embodying." - Energy not prediction - How this shows up in your behavior - When to channel it - When to release it`,
    `REVERSAL PRACTICE: "[Card] reversed in daily life shows up as [behavior]." - Practical reversal meaning - Blocked or internalized - What to adjust - How to flow again`,
    `ELEMENTAL: "[Card] brings [element] energy to [life area]." - Element + number + suit = meaning - Specific application - Where this plays out - Action step`,
  ],

  planets: [
    `TRANSIT EFFECT: "When [Planet] transits [sign/house], you notice [effect]." - Name the transit - Describe observable effects - How long it lasts - What to do during`,
    `CAUSE-EFFECT: "[Planet] rules [domain]. During [transit], [behavior] happens." - Connect planet to life domain - Explain mechanism - Real examples - Timing window`,
    `NATAL POSITION: "[Planet] in your [house/sign] shows [pattern]." - What natal position indicates - How it plays out over life - The work it asks - The gift it gives`,
    `COMPARISON: "[Planet A] vs [Planet B] in [context]." - Compare planetary effects - How they differ - Net effect when both active - Navigation tips`,
    `CYCLE: "Every [time period], [Planet] [action]. Here's what shifts." - Name the cycle - What activates - How to prepare - What to track`,
    `BEHAVIORAL: "Notice [behavior]? Check where [Planet] is." - Start with observable behavior - Connect to planetary position - Explain correlation - What it suggests`,
  ],

  retrogrades: [
    `DEBUNKING: "[Planet] retrograde doesn't [fear]. It [actual effect]." - Lead with what it doesn't mean - What actually shifts - The "re-" words active - What to do differently`,
    `TIMING: "During [Planet] retrograde, [specific timing advice]." - Practical timing guidance - What to pause - What to continue - How to use the time`,
    `RETURNS: "[Planet] retrograde brings back [specific type of thing]." - What resurfaces - Why it's returning - How to handle it - The opportunity here`,
    `INTERIOR: "[Planet] retrograde turns attention inward to [specific]." - The internal work activated - What to examine - The review process - Emerging clearer`,
    `PRACTICAL: "The practical way to handle [Planet] retrograde." - Skip fear, go practical - Day-to-day adjustments - What to expect - How to navigate`,
    `COMPLETION: "[Planet] retrograde is for finishing [type of thing]." - What needs completing - Why now - How to close loops - What opens after`,
  ],

  eclipses: [
    `BEFORE/AFTER: "Solar/Lunar eclipse marks the shift from [before] to [after]." - Name the before - Name the after - How the shift happens - Navigating the portal`,
    `ACCELERATION: "Eclipse season accelerates [type of change]." - What speeds up - Why now - How to ride it - What to release`,
    `NODE FOCUS: "This eclipse activates [North/South Node theme]." - What's being gained/released - The lesson embedded - How it manifests - What to do`,
    `LUNAR VS SOLAR: "Lunar eclipse: internal shift. Solar eclipse: external shift." - Distinguish the types - What each surfaces - How to work with each - The integration`,
    `SIX MONTH WINDOW: "This eclipse opens a [theme] window through [date]." - The timeline activated - What unfolds over months - Checkpoints along the way - How to track`,
    `VISIBILITY: "If you can see the eclipse, [specific]." - Visibility matters - What it indicates - Local vs global effect - Personal relevance`,
  ],

  moon_phases: [
    `ENERGY DIRECTION: "[Phase] shifts energy [direction]. You might feel..." - Name the energetic shift - Physical/emotional signs - What phase is for - What to avoid`,
    `PRACTICAL ACTION: "During [Phase], do this: [action]. Here's why." - Lead with action - Explain energetic reason - When to time it - What to expect`,
    `BODY AWARENESS: "[Phase] shows up in your body as [sensation]." - Start with physical experience - Connect to lunar cycle - What it's asking - How to respond`,
    `CYCLE POSITION: "[Phase] after [previous] before [next]. This is [metaphor] moment." - Position in cycle - What completed - What's building - Current focus`,
    `AMPLIFICATION: "[Phase] amplifies [quality]. Whatever's there gets louder." - What intensifies - Why now - How to work with it - Caution if needed`,
    `REST VS ACTION: "[Phase] isn't for [action type]. It's for [other type]." - Clarify the energy - What to pause - What to pursue - Timing matters`,
  ],

  mirror_hours: [
    `THRESHOLD: "[Time] shows up at decision points. You're at a threshold." - Connect to decision moment - What kind of threshold - What's being asked - How to proceed`,
    `ROUTINE DISRUPTION: "You glance at clock. [Time]. Again. What were you thinking?" - Start with noticing moment - Invite reflection - What synchronicity highlights - Pattern to watch`,
    `RELATIONSHIP: "[Time] appears in relationship moments. Small ones." - Connect to interpersonal - Specific examples - What it's pointing to - Action to take`,
    `CONFIRMATION: "Seeing [Time] right after [action/thought]? Confirmation." - Frame as response - What it validates - Trust the direction - Move forward`,
    `ALIGNMENT: "[Time] suggests alignment. You're in sync with [aspect]." - Frame as positive signal - What's aligned - How to maintain - What to continue`,
    `PAUSE: "[Time] as pattern means slow down. Something needs attention." - Frame as pause signal - What needs attention - How to check in - Course correct`,
  ],

  zodiac_sun: [
    `BEHAVIORAL QUIRK: "[Sign] does this thing: [specific behavior]." - Lead with observable behavior - Explain why - More examples - The gift in it`,
    `MISCONCEPTION: "Everyone thinks [Sign] is [trait]. Actually..." - Name common belief - Reveal deeper truth - What drives behavior - How to recognize it`,
    `COPING: "When stressed, [Sign] [specific behavior]. It's not random." - Name stress response - Explain the logic - What they need - How to support`,
    `EVOLUTION: "Immature [Sign]: [behavior]. Evolved [Sign]: [different]." - Show growth arc - What triggers evolution - Signs of each stage - The invitation`,
    `COMPATIBILITY: "[Sign A] and [Sign B] clash on [specific]. But..." - Name friction point - Explain why - Growth opportunity - When it works`,
    `SUPERPOWER: "[Sign]'s actual superpower isn't [expected]. It's [unexpected]." - Challenge expected strength - Reveal real gift - How it manifests - When to use it`,
  ],

  zodiac_moon: [
    `EMOTIONAL NEED: "[Moon Sign] needs [specific] to feel safe." - Name core need - How it manifests - What absence looks like - How to provide it`,
    `PRIVATE BEHAVIOR: "In private, [Moon Sign] [behavior others don't see]." - Private vs public difference - Why this happens - What it means - How to honor it`,
    `STRESS RESPONSE: "When emotionally overwhelmed, [Moon Sign] [specific pattern]." - Name the pattern - Why this coping exists - What helps - What hurts`,
    `COMFORT: "What actually comforts [Moon Sign]: [specific]." - Not generic comfort - Sign-specific soothing - Why this works - How to provide it`,
    `PROCESSING: "[Moon Sign] processes emotion by [specific method]." - Name processing style - How it looks - What it needs - Timeframe expected`,
    `CHILDHOOD: "[Moon Sign] learned early that emotions [specific lesson]." - Childhood pattern - How it shapes adult - The healing available - Moving forward`,
  ],

  zodiac_rising: [
    `FIRST IMPRESSION: "[Rising] walks in. Everyone thinks [impression]." - Lead with impression - Why this happens - The truth underneath - The gap between`,
    `SOCIAL MASK: "[Rising] projects [quality] even when feeling [opposite]." - Name the mask - Name what's hidden - Why the gap exists - When mask slips`,
    `APPROACH TO LIFE: "[Rising] approaches life like [metaphor]." - Core approach - How this plays out - Strengths - Challenges`,
    `APPEARANCE: "People with [Rising] often [physical/style tendency]." - Observable patterns - Why this manifests - The aesthetic - Beyond surface`,
    `DEFENSE: "When threatened, [Rising] [specific defense]." - Defense mechanism - Why this one - How it looks - What's protected`,
    `LIFE LESSON: "[Rising] is learning to [specific lesson] through appearance." - The lesson embedded - How life teaches it - Progress signs - The gift`,
  ],

  crystals: [
    `SENSATION: "Pick up [Crystal]. Feel [sensation]. That's the point." - Start with physical - What sensation indicates - When to use - How to work with`,
    `USE CASE: "For [situation], use [Crystal]. Here's why." - Lead with practical - Match crystal to need - How to use - What to expect`,
    `MISTAKE: "People use [Crystal] for [thing]. That's not its strength." - Name misuse - Explain actual property - Better application - Right crystal for original need`,
    `COMBINATION: "[Crystal A] plus [Crystal B]: [effect]." - Pairing logic - What each contributes - When to combine - Caution if any`,
    `CARE: "[Crystal] needs [care]. Neglect it and [consequence]." - Care requirements - Why this matters - How to cleanse - Maintenance rhythm`,
    `SYMPTOM: "Feeling [symptom]? Reach for [Crystal]." - Start with feeling - Why this match - How to use - Expected shift`,
  ],

  chakras: [
    `BLOCKAGE SIGNS: "[Chakra] blockage looks like [specific signs]." - Observable signs - Physical location - What's blocked - First step to opening`,
    `BODY CONNECTION: "[Chakra] shows up in the body as [physical experience]." - Somatic connection - Where to feel it - What sensation means - How to work with`,
    `LIFE AREA: "[Chakra] governs [life area]. When blocked, [specific result]." - Life domain affected - How blockage manifests - The work needed - Flow restored`,
    `OVERACTIVE: "Overactive [Chakra] shows up as [behavior]." - Not just blockage - What overactivity looks like - The balance needed - Grounding it`,
    `OPENING PRACTICE: "To open [Chakra], try [specific practice]." - Practical approach - Why this works - How often - What to notice`,
    `INTERCONNECTION: "[Chakra] connects to [other chakras] by [specific]." - System view - How they relate - When one affects another - Working with the whole`,
  ],

  elements: [
    `PROCESSING STYLE: "[Element] signs process by [specific method]." - Core processing - How it looks - Strengths - Blind spots`,
    `STRESS RESPONSE: "Under stress, [Element] signs [behavior]." - Universal element stress - Why this pattern - What helps - What hurts`,
    `ELEMENT CLASH: "[Element A] and [Element B] clash because [specific]." - Name tension - Why it exists - The opportunity - Finding balance`,
    `ELEMENT SUPPORT: "[Element A] and [Element B] support each other through [specific]." - Name synergy - How it works - When to lean in - The gift`,
    `MISSING ELEMENT: "If you lack [Element] in your chart, you might [pattern]." - What's missing - How it shows - How to develop - Balance strategy`,
    `DOMINANT ELEMENT: "Heavy [Element] in chart means [specific tendency]." - What dominance looks like - Strengths - Challenges - Integration`,
  ],

  numerology_life_path: [
    `CENTRAL LESSON: "Life Path [X] keeps learning about [theme]." - Core lesson - How it shows up - Different life stages - The mastery available`,
    `CHALLENGE: "Life Path [X]'s main challenge: [specific]." - Name the challenge - Why it persists - Growth opportunities - Progress markers`,
    `GIFT: "The gift of Life Path [X]: [specific]." - Name the gift - How it develops - When it emerges - Sharing it`,
    `CAREER: "Life Path [X] thrives in work involving [specific]." - Career alignment - Why this fits - What to avoid - Where to grow`,
    `RELATIONSHIP: "In relationships, Life Path [X] [pattern]." - Relationship tendency - What they need - What they give - Growth edge`,
    `MATURITY: "Life Path [X] at 20 vs 50: [evolution]." - Early expression - Mature expression - What changes - The integration`,
  ],

  numerology_expression: [
    `NATURAL TALENT: "Expression [X]: [talent] comes naturally." - Name talent - How it shows early - Development over time - Fulfillment through it`,
    `COMMUNICATION: "Expression [X] communicates through [style]." - Communication mode - How others receive it - Strengths - Watch for`,
    `CONTRIBUTION: "Expression [X]'s contribution: [specific]." - How they add value - In what contexts - The difference they make - Owning it`,
    `CONFLICT: "Expression [X] struggles when [situation]." - Where it's hard - Why - The growth opportunity - Moving through`,
    `FULFILLMENT: "Expression [X] feels fulfilled when [specific]." - What creates fulfillment - How to create more - Alignment signs - The invitation`,
    `SHADOW: "The shadow side of Expression [X]: [specific]." - Name shadow - How it shows - Recognition - Integration`,
  ],

  sabbats: [
    `NATURAL RHYTHM: "[Sabbat]: What's happening in nature? [specific]." - Nature observation - How it translates - Practical alignment - What to do`,
    `ENERGY AVAILABLE: "[Sabbat] energy is [quality]. Use it for [specific]." - Name the energy - What it supports - What it doesn't - Practical application`,
    `HARVEST/PLANT: "[Sabbat] is [harvest/planting] time for [specific]." - Cycle position - What's being collected or planted - How to participate - What comes next`,
    `HONORING: "[Sabbat] honors [specific theme]. Here's how that looks practically." - The theme - Why now - Simple ways to honor - No ritual required`,
    `TRANSITION: "[Sabbat] marks transition from [before] to [after]." - What's ending - What's beginning - How to navigate - Setting intention`,
    `BODY: "Your body during [Sabbat] might [experience]." - Physical experience - Seasonal connection - Working with it - What it needs`,
  ],

  houses: [
    `LIFE DOMAIN: "[House] governs [domain]. Planets here affect [specific]." - Life area - How planets influence - Example with specific planet - What to track`,
    `EMPTY HOUSE: "[House] empty doesn't mean no [area]. It means [specific]." - What empty means - How it manifests - The truth - Working with it`,
    `HOUSE LORD: "Ruler of [House] in [other house] connects [areas]." - The link created - How it plays out - What to notice - Integration`,
    `PLANETS IN HOUSE: "[Planet] in [House] plays out as [specific]." - Specific combination - Observable effects - The work here - The gift`,
    `HOUSE AXIS: "[House] and [opposite house] work together as [axis theme]." - The polarity - How they balance - When off balance - Integration practice`,
    `TRANSITS TO HOUSE: "When planets transit [House], expect [specific shifts]." - Transit effects - Timing - What to do - What to track`,
  ],

  aspects: [
    `ASPECT DYNAMIC: "[Aspect] between [planets] creates [dynamic]." - The energy exchange - How it manifests - Challenges - Gifts`,
    `TIGHT ASPECT: "Tight [Aspect] means [specific intensity]." - What tight orb does - How it amplifies - Living with it - Working with it`,
    `APPLYING VS SEPARATING: "Applying vs separating [Aspect]: [difference]." - The difference - What each means - Timing implications - How to read`,
    `ASPECT PATTERN: "[Pattern name] in chart shows [specific theme]." - Pattern meaning - How it plays out - Life theme - Working with it`,
    `EASY VS HARD: "[Aspect] isn't good or bad. It's [specific quality]." - Reframe judgment - What each offers - Challenge = growth - Ease = natural`,
    `SYNASTRY: "[Aspect] between two charts shows [relationship dynamic]." - Relationship meaning - How it plays out - Challenges - Gifts`,
  ],

  spells: [
    `QUICK RITUAL: "[Spell] takes 5 minutes and one ingredient. Here's how." - Lead with simplicity - Name the ingredient and why - Step-by-step (3-4 steps) - When to do it - What to notice after`,
    `INGREDIENT SPOTLIGHT: "Why [ingredient] appears in [type] spells." - Name the ingredient - Explain the mechanism (absorbs, generates, attracts) - Three ways to use it - Storage/disposal tips`,
    `TIMING GUIDE: "[Spell] works best on [day/moon phase]. Here's why." - Lead with timing - Explain planetary/lunar connection - What happens if timing is wrong - Alternative windows`,
    `BEGINNER SPELL: "Your first [type] spell needs only [items]." - Name 2-3 accessible items - Why each item matters - Simple steps - Setting intention - What to expect`,
    `MOON PHASE RITUAL: "[Moon phase] is the window for [intention]. Try this." - Name the phase and energy - What it amplifies - Simple ritual steps - Duration and follow-up`,
    `SEASONAL SPELL: "[Season] energy supports [intention]. Here's a simple practice." - Connect to current season - Available natural materials - Simple steps - How to close the ritual`,
  ],

  ranking: [
    `DEFINITIVE_LIST: "Ranking [signs] by [trait]. Starting from the bottom." - Open with the ranking premise - Work through each tier with a punchy one-liner reason - Top placement gets the most detail - Close with "Comment your sign and whether you agree"`,
    `TIER_LIST: "Tier list: [trait]. S tier to F tier." - Open with the rating system - Group signs into tiers (S/A/B/C/F) - Each tier gets one justification - The controversial placements get extra emphasis - Close with "Which tier are you?"`,
    `SPEED_RANK: "Speed ranking signs by [trait]. Go." - Ultra-fast, one sentence per sign - Rapid delivery, no pauses - The speed itself is the hook - Close with "Pause on yours and tell me I'm wrong"`,
    `TOP_3_BOTTOM_3: "Top 3 and bottom 3 signs for [trait]." - Open with the bottom 3 (controversy first) - Brief reason for each - Then the top 3 with slightly more detail - Close with "Where do you land?"`,
  ],

  hot_take: [
    `BOLD_CLAIM: "Unpopular opinion: [statement]." - Open with the take, no buildup - One supporting observation that's undeniable - Double down on the claim - Close with a dare: "Prove me wrong"`,
    `COMPARISON: "[Thing A] matters more than [Thing B] and here's why." - Open with the controversial comparison - Explain why the popular choice is overrated - Show why the underdog wins - Close with "Stitch this if you disagree"`,
    `RANT: "I need to talk about [thing] because nobody else will." - Open with frustrated energy - Build the case with specific examples - Peak intensity at the middle - Close with "Am I wrong? Comment."`,
  ],

  sign_check: [
    `CALLOUT: "If you're a [sign], stop scrolling." - Direct address to one sign - Name the specific thing they're doing RIGHT NOW - Explain why they do it (the deeper pattern) - Close with "Send this to your [sign] friend"`,
    `WAKE_UP: "[Sign]. We need to talk." - Open like an intervention - Name the blind spot they don't see - Explain what everyone else notices - Close with "You know I'm right. Save this."`,
    `REALITY_CHECK: "Things [sign] does and thinks nobody notices." - List 3-4 hyper-specific behaviours - Each one more accurate than the last - The final one should make them feel exposed - Close with "Tag yourself"`,
  ],

  myth: [
    `ORIGIN_STORY: "The real reason [sign] is associated with [thing]." - Open with what everyone assumes - Reveal the actual origin/mythology - Explain why the real meaning matters more - Close with "You'll never see [sign] the same way"`,
    `HIDDEN_HISTORY: "Nobody tells you this about [topic]." - Open with the gap in common knowledge - Tell the story that fills it - The reveal should recontextualise something familiar - Close with "Now you know"`,
    `SYMBOL_DECODE: "The symbol for [sign/planet] means something most people miss." - Open with the visual symbol - Decode what it actually represents - Connect to how the sign/planet actually works - Close with "Save this for next time someone asks"`,
  ],

  quiz: [
    `WHICH_ONE: "Which [type] are you?" - Present 3-4 recognizable options - Each option is a specific, relatable behavior - Ask viewers to drop their answer - End with "Tag the friend who is Option [X]"`,
    `RANKING: "Rank these [topic] traits from most to least you." - List 4-5 specific traits or habits - Each must be immediately recognizable - Ask: "What's your order?" - Drive comments by making each ranking feel personal`,
    `SCENARIO: "[Scenario]. What do you do?" - Paint a specific, relatable situation - Give 3 options, each tied to a sign/number/type - Reveal what each choice says about them - "Comment your answer and I'll tell you what it means"`,
    `PAIR_TEST: "These two [types] either love or hate each other." - Name a specific pairing - Describe why they click or clash - Ask: "Is this your dynamic?" - "Tag who this is about"`,
  ],

  did_you_know: [
    `HOOK_FACT_CONTEXT: "Did you know [surprising fact]?" - Open with the hook question - Deliver the fact with one line of proof - Explain why it matters or what it changes - Close with a save-worthy reframe`,
    `MISCONCEPTION_REVEAL: "Most people think [common belief]. Here's what's actually true." - Open with what people assume - Reveal the real fact - Add context that makes it stick - Close with "Now you know"`,
    `FACT_THEN_WHY: "Did you know [fact]? Here's why that matters." - Open with the surprising fact - Explain the mechanism or history - Connect it to something the viewer does or believes - Close with practical takeaway`,
    `CHAIN_FACTS: "Did you know [fact 1]? It gets better." - Open with an interesting fact - Layer a second related fact on top - Build to the most surprising detail - Close with "Save this for later"`,
  ],

  default: [
    `DIRECT: State what it is. When it matters. What to do. One takeaway.`,
    `CONTRAST: What people assume. What's true. Why difference matters. New understanding.`,
    `PRACTICAL: Lead with use case. Explain mechanism. Example. Try this.`,
    `PATTERN: Name pattern. Where it shows up. What it indicates. How to use.`,
    `STORY: Set scene. The insight. Why it matters. Application.`,
    `QUESTION: Ask central question. Explore angles. Land on insight. Invitation.`,
  ],
};

/**
 * Loop/rewatch script structures appended to every content type
 * These structures are designed to maximize TikTok rewatch rates
 */
const LOOP_STRUCTURES: Array<{ name: string; structure: string }> = [
  {
    name: 'OPEN_LOOP',
    structure: `OPEN LOOP: Tease the payoff in the hook but don't deliver it. - Hook references "the part most miss" or "one detail changes everything" - Lines 2-6 build context, each adding one layer - Lines 7-8 reveal the actual insight - Final line callbacks to the hook so viewers rewatch to connect them`,
  },
  {
    name: 'BOOKEND',
    structure: `BOOKEND: Same observation opens and closes, but the middle changes its meaning. - Open with a statement that reads one way - Build 5-6 lines that recontextualize it - Close by repeating the same opening statement - Viewer rewatches to see how the meaning shifts`,
  },
  {
    name: 'COUNTDOWN',
    structure: `COUNTDOWN: "[Topic] has 3 layers most miss." - Hook with number and intrigue - Layer 1: The obvious reading - Layer 2: The practical nuance - Layer 3: The insight that recontextualizes layers 1-2 - Close with callback to hook`,
  },
  {
    name: 'REVEAL',
    structure: `REVEAL: Start with a surface-level read, then peel it back layer by layer. - Hook with the common understanding - Lines 2-3: Present the standard view (what most people think) - Line 4: "But here's what that misses..." - Lines 5-7: Reveal the deeper mechanic or surprising connection - Final line: Restate the topic with the new lens - viewer now sees it differently - Goal: the viewer's understanding is genuinely different by the end`,
  },
  {
    name: 'STITCH_BAIT',
    structure: `STITCH BAIT: End with a claim or question that invites creators to respond. - Hook with a confident take - Lines 2-6: Build the case with specific evidence - Line 7: Land the main insight - Final line: Provocative open question or "hot take" that invites disagreement or expansion - Goal: another creator stitches this to add their perspective, sending your video to their audience`,
  },
];

/**
 * Get a random script structure for a content type
 */
export function getRandomScriptStructure(contentType: ContentTypeKey): string {
  const structures = SCRIPT_STRUCTURES[contentType];
  // 55% chance of using a loop structure for rewatch optimization
  if (Math.random() < 0.55) {
    const loop =
      LOOP_STRUCTURES[Math.floor(Math.random() * LOOP_STRUCTURES.length)];
    return loop.structure;
  }
  return structures[Math.floor(Math.random() * structures.length)];
}

/**
 * Get a random script structure with metadata for tracking (#10)
 *
 * Selection weights:
 * - 30% → STITCH_BAIT specifically (up from ~11%)
 * - 25% → other 4 loop structures
 * - 45% → content-type-specific structures
 */
export function getRandomScriptStructureWithName(contentType: ContentTypeKey): {
  structure: string;
  name: string;
  isLoop: boolean;
  isStitchBait: boolean;
} {
  const structures = SCRIPT_STRUCTURES[contentType];
  const roll = Math.random();

  // 30% → STITCH_BAIT specifically
  if (roll < 0.3) {
    const stitchBait = LOOP_STRUCTURES.find((l) => l.name === 'STITCH_BAIT');
    if (stitchBait) {
      return {
        structure: stitchBait.structure,
        name: stitchBait.name,
        isLoop: true,
        isStitchBait: true,
      };
    }
  }

  // 25% → other loop structures (excluding STITCH_BAIT)
  if (roll < 0.55) {
    const nonStitchLoops = LOOP_STRUCTURES.filter(
      (l) => l.name !== 'STITCH_BAIT',
    );
    const loop =
      nonStitchLoops[Math.floor(Math.random() * nonStitchLoops.length)];
    return {
      structure: loop.structure,
      name: loop.name,
      isLoop: true,
      isStitchBait: false,
    };
  }

  // 45% → content-type-specific structures
  const idx = Math.floor(Math.random() * structures.length);
  const structureText = structures[idx];
  const name = structureText.split(':')[0]?.trim() || `STRUCTURE_${idx}`;
  return { structure: structureText, name, isLoop: false, isStitchBait: false };
}

/**
 * Get a performance-biased script structure (#11)
 *
 * - 70% chance: pick from top-performing structures (if data exists)
 * - 30% chance: random (exploration)
 * - Falls back to random when DB unavailable or insufficient data
 */
export async function getPerformanceBiasedStructure(
  contentType: ContentTypeKey,
): Promise<{
  structure: string;
  name: string;
  isLoop: boolean;
  isStitchBait: boolean;
}> {
  // 30% exploration — always random
  if (Math.random() < 0.3) {
    return getRandomScriptStructureWithName(contentType);
  }

  try {
    const { getTopPerformingStructures } = await import('./database');
    const topStructures = await getTopPerformingStructures(contentType);

    if (topStructures.length === 0) {
      return getRandomScriptStructureWithName(contentType);
    }

    // Pick from top performers weighted by score
    const totalScore = topStructures.reduce((sum, s) => sum + s.score, 0);
    let roll = Math.random() * totalScore;
    let selectedName = topStructures[0].name;
    for (const s of topStructures) {
      roll -= s.score;
      if (roll <= 0) {
        selectedName = s.name;
        break;
      }
    }

    // Find matching structure text
    const allStructures = SCRIPT_STRUCTURES[contentType];
    const matchIdx = allStructures.findIndex((s) =>
      s.startsWith(selectedName + ':'),
    );

    if (matchIdx >= 0) {
      return {
        structure: allStructures[matchIdx],
        name: selectedName,
        isLoop: false,
        isStitchBait: false,
      };
    }

    // Check loop structures
    const loopMatch = LOOP_STRUCTURES.find((l) => l.name === selectedName);
    if (loopMatch) {
      return {
        structure: loopMatch.structure,
        name: loopMatch.name,
        isLoop: true,
        isStitchBait: loopMatch.name === 'STITCH_BAIT',
      };
    }

    return getRandomScriptStructureWithName(contentType);
  } catch {
    return getRandomScriptStructureWithName(contentType);
  }
}

/**
 * Get voice configuration for a content type
 */
export function getVoiceConfig(contentType: ContentTypeKey) {
  return CONTENT_TYPE_VOICES[contentType];
}

/**
 * Get all available script structures for a content type (for validation/tracking)
 */
export function getAllScriptStructures(contentType: ContentTypeKey): string[] {
  return SCRIPT_STRUCTURES[contentType];
}
