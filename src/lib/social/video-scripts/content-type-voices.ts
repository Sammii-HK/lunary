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
  | 'default';

/**
 * Map category names to content type keys
 */
export function getContentTypeFromCategory(category: string): ContentTypeKey {
  const lower = category.toLowerCase();

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
- This is personality observation, not destiny`,
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
- More intimate than sun sign content`,
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
- Focus on appearance, vibe, first meetings`,
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
 * Get a random script structure for a content type
 */
export function getRandomScriptStructure(contentType: ContentTypeKey): string {
  const structures = SCRIPT_STRUCTURES[contentType];
  return structures[Math.floor(Math.random() * structures.length)];
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
