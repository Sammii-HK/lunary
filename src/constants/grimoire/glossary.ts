// Comprehensive Astrology Glossary - Single Source of Truth
export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category:
    | 'basic'
    | 'chart'
    | 'aspect'
    | 'planet'
    | 'sign'
    | 'house'
    | 'technique'
    | 'transit';
  relatedTerms?: string[];
  example?: string;
}

export const ASTROLOGY_GLOSSARY: GlossaryTerm[] = [
  // Basic Terms
  {
    term: 'Ascendant',
    slug: 'ascendant',
    definition:
      'Also known as the Rising Sign, the Ascendant is the zodiac sign that was rising on the eastern horizon at the exact moment of your birth. It represents your outward personality, physical appearance, and how others perceive you.',
    category: 'chart',
    relatedTerms: ['rising-sign', 'first-house', 'descendant'],
    example:
      'Someone with Leo Ascendant often has a commanding presence and natural charisma.',
  },
  {
    term: 'Rising Sign',
    slug: 'rising-sign',
    definition:
      'Another name for the Ascendant. The zodiac sign ascending on the eastern horizon at birth, shaping your outer personality and first impressions.',
    category: 'chart',
    relatedTerms: ['ascendant', 'first-house'],
  },
  {
    term: 'Sun Sign',
    slug: 'sun-sign',
    definition:
      'The zodiac sign the Sun was in at the time of your birth. This is what most people refer to as their "star sign" and represents your core identity, ego, and life purpose.',
    category: 'basic',
    relatedTerms: ['zodiac', 'natal-chart'],
    example: 'If you were born on April 15th, your Sun sign is Aries.',
  },
  {
    term: 'Moon Sign',
    slug: 'moon-sign',
    definition:
      'The zodiac sign the Moon was in at your birth. It governs your emotional nature, instincts, subconscious patterns, and what you need to feel secure.',
    category: 'basic',
    relatedTerms: ['emotions', 'natal-chart'],
  },
  {
    term: 'Natal Chart',
    slug: 'natal-chart',
    definition:
      'A map of the sky at the exact moment and location of your birth. Also called a birth chart, it shows the positions of the Sun, Moon, planets, and other celestial points in the zodiac signs and houses.',
    category: 'chart',
    relatedTerms: ['birth-chart', 'horoscope'],
  },
  {
    term: 'Birth Chart',
    slug: 'birth-chart',
    definition:
      'Synonymous with natal chart. A celestial snapshot of the sky at your birth that forms the foundation of personal astrology readings.',
    category: 'chart',
    relatedTerms: ['natal-chart', 'horoscope'],
  },
  {
    term: 'Zodiac',
    slug: 'zodiac',
    definition:
      'A belt of the heavens divided into twelve equal signs (Aries through Pisces), each spanning 30 degrees. The zodiac is the backdrop against which planetary movements are tracked.',
    category: 'basic',
    relatedTerms: ['tropical-zodiac', 'sidereal-zodiac'],
  },
  {
    term: 'Horoscope',
    slug: 'horoscope',
    definition:
      'Originally referring to the Ascendant or rising sign, the term now commonly means astrological forecasts based on Sun sign positions. It can also refer to the birth chart itself.',
    category: 'basic',
    relatedTerms: ['natal-chart', 'forecast'],
  },

  // Aspects
  {
    term: 'Aspect',
    slug: 'aspect',
    definition:
      'An angular relationship between two planets or points in a chart. Aspects describe how planetary energies interact—harmoniously, tensely, or neutrally.',
    category: 'aspect',
    relatedTerms: ['conjunction', 'opposition', 'trine', 'square', 'sextile'],
  },
  {
    term: 'Conjunction',
    slug: 'conjunction',
    definition:
      'An aspect where two planets are at the same degree (0°) in the zodiac. This is the most powerful aspect, fusing the energies of both planets together intensely.',
    category: 'aspect',
    relatedTerms: ['aspect', 'orb'],
    example:
      'Sun conjunct Moon creates a New Moon and blends identity with emotions.',
  },
  {
    term: 'Opposition',
    slug: 'opposition',
    definition:
      'An aspect of 180° between two planets, placing them directly across from each other. Oppositions create tension and require balance between opposing forces.',
    category: 'aspect',
    relatedTerms: ['aspect', 'polarity'],
    example:
      'Venus opposite Mars can create push-pull dynamics in relationships.',
  },
  {
    term: 'Trine',
    slug: 'trine',
    definition:
      'A harmonious aspect of 120° between planets. Trines indicate natural talent, ease, and flow between the energies involved.',
    category: 'aspect',
    relatedTerms: ['aspect', 'grand-trine'],
    example:
      'Moon trine Venus often indicates emotional warmth and artistic gifts.',
  },
  {
    term: 'Square',
    slug: 'square',
    definition:
      'A challenging aspect of 90° between planets. Squares create friction, tension, and obstacles that ultimately drive growth and action.',
    category: 'aspect',
    relatedTerms: ['aspect', 't-square', 'grand-cross'],
    example:
      'Mars square Saturn may indicate frustration with authority or delays.',
  },
  {
    term: 'Sextile',
    slug: 'sextile',
    definition:
      'A harmonious aspect of 60° between planets. Sextiles represent opportunities and talents that require some effort to activate.',
    category: 'aspect',
    relatedTerms: ['aspect'],
  },
  {
    term: 'Orb',
    slug: 'orb',
    definition:
      'The degree of allowance given when calculating aspects. A tight orb (1-3°) indicates a stronger aspect, while a wide orb (8-10°) is weaker.',
    category: 'aspect',
    relatedTerms: ['aspect'],
  },
  {
    term: 'Grand Trine',
    slug: 'grand-trine',
    definition:
      'A pattern formed when three planets form trines to each other, creating an equilateral triangle. Often indicates natural gifts in the element involved.',
    category: 'aspect',
    relatedTerms: ['trine', 'aspect-pattern'],
  },
  {
    term: 'T-Square',
    slug: 't-square',
    definition:
      'An aspect pattern formed by two planets in opposition, both square to a third planet. Creates dynamic tension and a focal point for action.',
    category: 'aspect',
    relatedTerms: ['square', 'opposition', 'aspect-pattern'],
  },
  {
    term: 'Grand Cross',
    slug: 'grand-cross',
    definition:
      'A powerful aspect pattern with four planets forming two oppositions and four squares, creating a cross shape. Indicates major life challenges and tremendous drive.',
    category: 'aspect',
    relatedTerms: ['square', 'opposition', 't-square'],
  },

  // Houses
  {
    term: 'House',
    slug: 'house',
    definition:
      'One of twelve divisions of the birth chart, each representing a different area of life. Houses are determined by your birth time and location.',
    category: 'house',
    relatedTerms: ['angular-house', 'succedent-house', 'cadent-house'],
  },
  {
    term: 'Angular House',
    slug: 'angular-house',
    definition:
      'The 1st, 4th, 7th, and 10th houses—the most powerful positions in the chart. Planets here have strong, visible effects in life.',
    category: 'house',
    relatedTerms: [
      'first-house',
      'fourth-house',
      'seventh-house',
      'tenth-house',
    ],
  },
  {
    term: 'Succedent House',
    slug: 'succedent-house',
    definition:
      'The 2nd, 5th, 8th, and 11th houses. These follow the angular houses and relate to resources, stability, and consolidation.',
    category: 'house',
    relatedTerms: ['house'],
  },
  {
    term: 'Cadent House',
    slug: 'cadent-house',
    definition:
      'The 3rd, 6th, 9th, and 12th houses. These precede the angular houses and relate to learning, adaptation, and transition.',
    category: 'house',
    relatedTerms: ['house'],
  },
  {
    term: 'Midheaven',
    slug: 'midheaven',
    definition:
      'Also called the MC (Medium Coeli), this is the highest point in the chart representing career, public image, reputation, and life direction.',
    category: 'chart',
    relatedTerms: ['tenth-house', 'ic'],
  },
  {
    term: 'IC',
    slug: 'ic',
    definition:
      'The Imum Coeli or "bottom of the sky." It represents your roots, home, family, and private self. The cusp of the 4th house.',
    category: 'chart',
    relatedTerms: ['fourth-house', 'midheaven'],
  },
  {
    term: 'Descendant',
    slug: 'descendant',
    definition:
      'The point directly opposite the Ascendant, marking the cusp of the 7th house. Represents partnerships, relationships, and what we seek in others.',
    category: 'chart',
    relatedTerms: ['seventh-house', 'ascendant'],
  },

  // Planets
  {
    term: 'Personal Planets',
    slug: 'personal-planets',
    definition:
      'The Sun, Moon, Mercury, Venus, and Mars. These fast-moving planets represent personal traits, daily experiences, and individual character.',
    category: 'planet',
    relatedTerms: ['social-planets', 'outer-planets'],
  },
  {
    term: 'Social Planets',
    slug: 'social-planets',
    definition:
      'Jupiter and Saturn. These planets bridge personal and collective themes, governing growth, structure, and societal roles.',
    category: 'planet',
    relatedTerms: ['personal-planets', 'outer-planets'],
  },
  {
    term: 'Outer Planets',
    slug: 'outer-planets',
    definition:
      'Uranus, Neptune, and Pluto. These slow-moving planets affect entire generations and represent transformation, transcendence, and collective evolution.',
    category: 'planet',
    relatedTerms: ['generational-planets', 'transpersonal-planets'],
  },
  {
    term: 'Benefic',
    slug: 'benefic',
    definition:
      'Planets considered fortunate and helpful. Venus (Lesser Benefic) and Jupiter (Greater Benefic) traditionally bring ease, luck, and positive outcomes.',
    category: 'planet',
    relatedTerms: ['malefic', 'jupiter', 'venus'],
  },
  {
    term: 'Malefic',
    slug: 'malefic',
    definition:
      'Planets traditionally considered challenging. Mars (Lesser Malefic) and Saturn (Greater Malefic) bring difficulties that ultimately strengthen character.',
    category: 'planet',
    relatedTerms: ['benefic', 'mars', 'saturn'],
  },
  {
    term: 'Luminary',
    slug: 'luminary',
    definition:
      'The Sun and Moon, the two brightest celestial bodies. Also called "the lights," they represent core identity (Sun) and emotional nature (Moon).',
    category: 'planet',
    relatedTerms: ['sun', 'moon'],
  },
  {
    term: 'Sun',
    slug: 'sun',
    definition:
      'The core of your identity, ego, and life purpose. Represents your conscious self, vitality, and how you express your individuality. Rules Leo.',
    category: 'planet',
    relatedTerms: ['luminary', 'moon', 'personal-planets'],
  },
  {
    term: 'Moon',
    slug: 'moon',
    definition:
      'Your emotional nature, instincts, and subconscious patterns. Represents how you nurture and need to be nurtured. Changes signs every 2.5 days. Rules Cancer.',
    category: 'planet',
    relatedTerms: ['luminary', 'sun', 'personal-planets'],
  },
  {
    term: 'Mercury',
    slug: 'mercury',
    definition:
      'The planet of communication, thinking, and information processing. Governs how you learn, speak, and connect ideas. Rules Gemini and Virgo.',
    category: 'planet',
    relatedTerms: ['personal-planets', 'mercury-retrograde'],
  },
  {
    term: 'Venus',
    slug: 'venus',
    definition:
      'The planet of love, beauty, pleasure, and values. Governs relationships, aesthetics, and what you attract. Rules Taurus and Libra.',
    category: 'planet',
    relatedTerms: ['personal-planets', 'benefic', 'mars'],
  },
  {
    term: 'Mars',
    slug: 'mars',
    definition:
      'The planet of action, desire, and assertion. Governs how you pursue goals, express anger, and take initiative. Rules Aries and co-rules Scorpio.',
    category: 'planet',
    relatedTerms: ['personal-planets', 'malefic', 'venus'],
  },
  {
    term: 'Jupiter',
    slug: 'jupiter',
    definition:
      'The planet of expansion, luck, and wisdom. Governs growth, optimism, higher learning, and abundance. The Greater Benefic. Rules Sagittarius and co-rules Pisces.',
    category: 'planet',
    relatedTerms: ['social-planets', 'benefic', 'saturn'],
  },
  {
    term: 'Saturn',
    slug: 'saturn',
    definition:
      'The planet of structure, discipline, and karma. Governs responsibility, limitations, and life lessons. The Greater Malefic. Rules Capricorn and co-rules Aquarius.',
    category: 'planet',
    relatedTerms: ['social-planets', 'malefic', 'jupiter', 'saturn-return'],
  },
  {
    term: 'Uranus',
    slug: 'uranus',
    definition:
      'The planet of revolution, innovation, and sudden change. Governs originality, rebellion, and awakening. Co-rules Aquarius with Saturn.',
    category: 'planet',
    relatedTerms: ['outer-planets', 'generational-planets'],
  },
  {
    term: 'Neptune',
    slug: 'neptune',
    definition:
      'The planet of dreams, spirituality, and dissolution. Governs intuition, imagination, and transcendence. Co-rules Pisces with Jupiter.',
    category: 'planet',
    relatedTerms: ['outer-planets', 'generational-planets'],
  },
  {
    term: 'Pluto',
    slug: 'pluto',
    definition:
      'The planet of transformation, power, and rebirth. Governs deep psychological change, death/rebirth cycles, and hidden truths. Co-rules Scorpio with Mars.',
    category: 'planet',
    relatedTerms: ['outer-planets', 'generational-planets'],
  },
  {
    term: 'Generational Planets',
    slug: 'generational-planets',
    definition:
      'Uranus, Neptune, and Pluto. These slow-moving outer planets stay in each sign for years to decades, affecting entire generations with shared themes and collective transformation.',
    category: 'planet',
    relatedTerms: ['outer-planets', 'transpersonal-planets'],
  },
  {
    term: 'Transpersonal Planets',
    slug: 'transpersonal-planets',
    definition:
      'Another name for the outer planets (Uranus, Neptune, Pluto). Called transpersonal because their influence extends beyond individual personality into collective and spiritual realms.',
    category: 'planet',
    relatedTerms: ['outer-planets', 'generational-planets'],
  },

  // Elements
  {
    term: 'Fire Signs',
    slug: 'fire-signs',
    definition:
      'Aries, Leo, and Sagittarius. Fire signs are passionate, energetic, and action-oriented. They lead with enthusiasm, creativity, and a pioneering spirit.',
    category: 'sign',
    relatedTerms: ['earth-signs', 'air-signs', 'water-signs'],
  },
  {
    term: 'Earth Signs',
    slug: 'earth-signs',
    definition:
      'Taurus, Virgo, and Capricorn. Earth signs are practical, grounded, and focused on material reality. They value stability, hard work, and tangible results.',
    category: 'sign',
    relatedTerms: ['fire-signs', 'air-signs', 'water-signs'],
  },
  {
    term: 'Air Signs',
    slug: 'air-signs',
    definition:
      'Gemini, Libra, and Aquarius. Air signs are intellectual, communicative, and socially oriented. They lead with ideas, logic, and connection.',
    category: 'sign',
    relatedTerms: ['fire-signs', 'earth-signs', 'water-signs'],
  },
  {
    term: 'Water Signs',
    slug: 'water-signs',
    definition:
      'Cancer, Scorpio, and Pisces. Water signs are emotional, intuitive, and deeply feeling. They navigate life through instinct, empathy, and emotional intelligence.',
    category: 'sign',
    relatedTerms: ['fire-signs', 'earth-signs', 'air-signs'],
  },

  // Dignities & Debilities
  {
    term: 'Domicile',
    slug: 'domicile',
    definition:
      'A planet in the sign it rules, where it expresses most naturally and powerfully. Example: Mars in Aries, Venus in Taurus.',
    category: 'technique',
    relatedTerms: ['rulership', 'detriment', 'essential-dignity'],
  },
  {
    term: 'Exaltation',
    slug: 'exaltation',
    definition:
      'A sign where a planet is honored and expresses its highest potential. Example: Sun in Aries, Moon in Taurus, Venus in Pisces.',
    category: 'technique',
    relatedTerms: ['fall', 'essential-dignity'],
  },
  {
    term: 'Detriment',
    slug: 'detriment',
    definition:
      'A planet in the sign opposite its domicile, where it must work harder to express itself. Example: Mars in Libra, Venus in Aries.',
    category: 'technique',
    relatedTerms: ['domicile', 'essential-dignity'],
  },
  {
    term: 'Fall',
    slug: 'fall',
    definition:
      'A planet in the sign opposite its exaltation, considered its weakest placement. Example: Sun in Libra, Moon in Scorpio.',
    category: 'technique',
    relatedTerms: ['exaltation', 'essential-dignity'],
  },
  {
    term: 'Essential Dignity',
    slug: 'essential-dignity',
    definition:
      'A system measuring planetary strength based on sign placement: domicile, exaltation, triplicity, term, and face.',
    category: 'technique',
    relatedTerms: ['domicile', 'exaltation', 'detriment', 'fall'],
  },
  {
    term: 'Rulership',
    slug: 'rulership',
    definition:
      'The relationship between a planet and the sign(s) it governs. Each sign has a traditional ruler, and some have modern co-rulers.',
    category: 'technique',
    relatedTerms: ['domicile', 'planetary-ruler'],
  },

  // Signs & Modalities
  {
    term: 'Element',
    slug: 'element',
    definition:
      'The four elements (Fire, Earth, Air, Water) that categorize the zodiac signs by temperament and approach to life.',
    category: 'sign',
    relatedTerms: ['fire-signs', 'earth-signs', 'air-signs', 'water-signs'],
  },
  {
    term: 'Modality',
    slug: 'modality',
    definition:
      'The three qualities (Cardinal, Fixed, Mutable) that describe how signs initiate, maintain, or adapt to energy.',
    category: 'sign',
    relatedTerms: ['cardinal', 'fixed', 'mutable'],
  },
  {
    term: 'Cardinal',
    slug: 'cardinal',
    definition:
      'Signs that begin each season (Aries, Cancer, Libra, Capricorn). Cardinal signs are initiators, leaders, and action-oriented.',
    category: 'sign',
    relatedTerms: ['modality', 'fixed', 'mutable'],
  },
  {
    term: 'Fixed',
    slug: 'fixed',
    definition:
      'Signs in the middle of each season (Taurus, Leo, Scorpio, Aquarius). Fixed signs are stabilizers, persistent, and resistant to change.',
    category: 'sign',
    relatedTerms: ['modality', 'cardinal', 'mutable'],
  },
  {
    term: 'Mutable',
    slug: 'mutable',
    definition:
      'Signs at the end of each season (Gemini, Virgo, Sagittarius, Pisces). Mutable signs are adaptable, flexible, and embrace transition.',
    category: 'sign',
    relatedTerms: ['modality', 'cardinal', 'fixed'],
  },
  {
    term: 'Polarity',
    slug: 'polarity',
    definition:
      'The division of signs into Masculine (Fire/Air) and Feminine (Earth/Water), also called Yang and Yin or Positive and Negative.',
    category: 'sign',
    relatedTerms: ['element', 'yin-yang'],
  },
  {
    term: 'Decan',
    slug: 'decan',
    definition:
      "Each zodiac sign is divided into three 10-degree segments called decans. Each decan has a sub-ruler that modifies the sign's expression.",
    category: 'sign',
    relatedTerms: ['zodiac'],
  },
  {
    term: 'Cusp',
    slug: 'cusp',
    definition:
      'The boundary between two signs or houses. Being "born on the cusp" means near the transition between signs, though you technically have only one Sun sign.',
    category: 'sign',
    relatedTerms: ['zodiac', 'house'],
  },

  // Transits & Timing
  {
    term: 'Transit',
    slug: 'transit',
    definition:
      'The current movement of planets through the zodiac and their aspects to your natal chart. Transits are the basis for astrological forecasting.',
    category: 'transit',
    relatedTerms: ['progression', 'solar-return'],
  },
  {
    term: 'Retrograde',
    slug: 'retrograde',
    definition:
      "When a planet appears to move backward in the sky from Earth's perspective. Retrograde periods are times for review, reflection, and revision.",
    category: 'transit',
    relatedTerms: ['direct', 'station'],
    example:
      'Mercury retrograde is famous for communication mishaps and technology glitches.',
  },
  {
    term: 'Direct',
    slug: 'direct',
    definition:
      'Normal forward motion of a planet through the zodiac. When a planet "goes direct," it resumes forward movement after retrograde.',
    category: 'transit',
    relatedTerms: ['retrograde', 'station'],
  },
  {
    term: 'Station',
    slug: 'station',
    definition:
      'The moment when a planet appears to stand still before changing direction (stationing retrograde or stationing direct). A powerful time.',
    category: 'transit',
    relatedTerms: ['retrograde', 'direct'],
  },
  {
    term: 'Solar Return',
    slug: 'solar-return',
    definition:
      'A chart cast for the exact moment the Sun returns to its natal position each year—your true astrological birthday. Used for yearly forecasting.',
    category: 'transit',
    relatedTerms: ['birthday', 'return'],
  },
  {
    term: 'Saturn Return',
    slug: 'saturn-return',
    definition:
      'When Saturn returns to its natal position, occurring around ages 29-30, 58-60, and 87-90. A major life passage marking maturity and responsibility.',
    category: 'transit',
    relatedTerms: ['return', 'saturn'],
  },
  {
    term: 'Void of Course',
    slug: 'void-of-course',
    definition:
      'A period when the Moon makes no major aspects before leaving its current sign. Traditionally, actions started during void moons may not manifest as expected.',
    category: 'transit',
    relatedTerms: ['moon', 'aspect'],
  },
  {
    term: 'Ingress',
    slug: 'ingress',
    definition:
      'When a planet enters a new zodiac sign. Major ingresses (like Saturn or Jupiter changing signs) mark significant collective shifts.',
    category: 'transit',
    relatedTerms: ['transit'],
  },

  // Lunar Nodes
  {
    term: 'North Node',
    slug: 'north-node',
    definition:
      "Also called the True Node or Dragon's Head. Represents your soul's evolutionary direction, growth edge, and lessons to embrace in this lifetime.",
    category: 'chart',
    relatedTerms: ['south-node', 'lunar-nodes'],
  },
  {
    term: 'South Node',
    slug: 'south-node',
    definition:
      "Also called the Dragon's Tail. Represents past life gifts, comfort zones, and patterns to release. Opposite the North Node.",
    category: 'chart',
    relatedTerms: ['north-node', 'lunar-nodes'],
  },
  {
    term: 'Lunar Nodes',
    slug: 'lunar-nodes',
    definition:
      "The points where the Moon's orbit crosses the ecliptic. The nodes move backward through the zodiac and relate to karma and destiny.",
    category: 'chart',
    relatedTerms: ['north-node', 'south-node', 'eclipse'],
  },

  // Eclipses
  {
    term: 'Eclipse',
    slug: 'eclipse',
    definition:
      'Powerful lunations occurring near the lunar nodes. Solar eclipses (New Moons) bring new beginnings; lunar eclipses (Full Moons) bring culminations.',
    category: 'transit',
    relatedTerms: ['solar-eclipse', 'lunar-eclipse', 'lunar-nodes'],
  },
  {
    term: 'Solar Eclipse',
    slug: 'solar-eclipse',
    definition:
      "A New Moon that occurs near the lunar nodes, blocking the Sun's light. Marks powerful new beginnings, fresh starts, and destiny activation.",
    category: 'transit',
    relatedTerms: ['eclipse', 'new-moon'],
  },
  {
    term: 'Lunar Eclipse',
    slug: 'lunar-eclipse',
    definition:
      "A Full Moon that occurs near the lunar nodes, with Earth's shadow on the Moon. Brings emotional revelations, endings, and release.",
    category: 'transit',
    relatedTerms: ['eclipse', 'full-moon'],
  },

  // Other Points
  {
    term: 'Part of Fortune',
    slug: 'part-of-fortune',
    definition:
      'An Arabic Part calculated from Sun, Moon, and Ascendant positions. Indicates where you find joy, luck, and material success.',
    category: 'chart',
    relatedTerms: ['arabic-parts', 'lot-of-fortune'],
  },
  {
    term: 'Vertex',
    slug: 'vertex',
    definition:
      'A mathematical point often called the "fated encounter" point. Contacts to the Vertex can indicate destined meetings and significant relationships.',
    category: 'chart',
    relatedTerms: ['fate', 'destiny'],
  },
  {
    term: 'Black Moon Lilith',
    slug: 'black-moon-lilith',
    definition:
      'The lunar apogee—the point where the Moon is farthest from Earth. Represents raw feminine power, shadow, sexuality, and what we suppress.',
    category: 'chart',
    relatedTerms: ['lilith', 'asteroid'],
  },

  // Techniques
  {
    term: 'Synastry',
    slug: 'synastry',
    definition:
      "The comparison of two birth charts to analyze relationship compatibility. Shows how two people's planets interact with each other.",
    category: 'technique',
    relatedTerms: ['composite', 'compatibility'],
  },
  {
    term: 'Composite Chart',
    slug: 'composite-chart',
    definition:
      "A single chart created from the midpoints of two people's charts. Represents the relationship itself as its own entity.",
    category: 'technique',
    relatedTerms: ['synastry', 'relationship-astrology'],
  },
  {
    term: 'Progression',
    slug: 'progression',
    definition:
      'A forecasting technique where one day after birth equals one year of life. Secondary progressions show inner psychological evolution.',
    category: 'technique',
    relatedTerms: ['transit', 'solar-arc'],
  },
  {
    term: 'Solar Arc',
    slug: 'solar-arc',
    definition:
      'A progression technique where all planets move forward at the same rate as the progressed Sun (about 1° per year).',
    category: 'technique',
    relatedTerms: ['progression'],
  },
  {
    term: 'Electional Astrology',
    slug: 'electional-astrology',
    definition:
      'The practice of choosing optimal times to begin important activities—weddings, businesses, surgeries—based on astrological timing.',
    category: 'technique',
    relatedTerms: ['mundane-astrology', 'horary'],
  },
  {
    term: 'Horary Astrology',
    slug: 'horary-astrology',
    definition:
      'A branch of astrology that answers specific questions by casting a chart for the moment the question is asked.',
    category: 'technique',
    relatedTerms: ['electional-astrology'],
  },

  // Systems
  {
    term: 'Tropical Zodiac',
    slug: 'tropical-zodiac',
    definition:
      'The zodiac used in Western astrology, based on the seasons. 0° Aries begins at the spring equinox, regardless of constellation positions.',
    category: 'basic',
    relatedTerms: ['sidereal-zodiac', 'zodiac'],
  },
  {
    term: 'Sidereal Zodiac',
    slug: 'sidereal-zodiac',
    definition:
      'A zodiac aligned with actual star constellations, used in Vedic (Jyotish) astrology. Currently about 24° behind the tropical zodiac.',
    category: 'basic',
    relatedTerms: ['tropical-zodiac', 'vedic-astrology'],
  },
  {
    term: 'House System',
    slug: 'house-system',
    definition:
      'The method used to divide the chart into 12 houses. Popular systems include Placidus, Whole Sign, Equal House, and Koch.',
    category: 'chart',
    relatedTerms: ['placidus', 'whole-sign-houses'],
  },
  {
    term: 'Placidus',
    slug: 'placidus',
    definition:
      'The most commonly used house system in Western astrology. Divides the chart based on time it takes each degree to move from horizon to meridian.',
    category: 'chart',
    relatedTerms: ['house-system'],
  },
  {
    term: 'Whole Sign Houses',
    slug: 'whole-sign-houses',
    definition:
      "The oldest house system, where each sign equals one house. The Ascendant's sign becomes the entire 1st house.",
    category: 'chart',
    relatedTerms: ['house-system', 'placidus'],
  },

  // Additional Terms
  {
    term: 'Lilith',
    slug: 'lilith',
    definition:
      "Black Moon Lilith represents the lunar apogee—the Moon's farthest point from Earth. Symbolizes raw feminine power, sexuality, independence, and the shadow self.",
    category: 'planet',
    relatedTerms: ['moon', 'asteroid'],
  },
  {
    term: 'Horary Astrology',
    slug: 'horary',
    definition:
      'A branch of astrology that answers specific questions by casting a chart for the moment the question is asked. Used for predictions and finding lost objects.',
    category: 'technique',
    relatedTerms: ['mundane-astrology', 'electional'],
  },
  {
    term: 'Mundane Astrology',
    slug: 'mundane-astrology',
    definition:
      'The branch of astrology dealing with world events, nations, and collective phenomena. Studies eclipses, ingresses, and planetary cycles affecting humanity.',
    category: 'technique',
    relatedTerms: ['horary', 'electional'],
  },
  {
    term: 'Vedic Astrology',
    slug: 'vedic-astrology',
    definition:
      'Also called Jyotish, the traditional Hindu system of astrology. Uses the sidereal zodiac and includes techniques like dashas (planetary periods) and nakshatras (lunar mansions).',
    category: 'technique',
    relatedTerms: ['sidereal-zodiac', 'tropical-zodiac'],
  },
  {
    term: 'Lot of Fortune',
    slug: 'lot-of-fortune',
    definition:
      'An Arabic Part calculated from the Ascendant, Sun, and Moon. Indicates material fortune, physical wellbeing, and worldly success in the birth chart.',
    category: 'chart',
    relatedTerms: ['arabic-parts', 'ascendant'],
  },
  {
    term: 'Arabic Parts',
    slug: 'arabic-parts',
    definition:
      'Sensitive points calculated from three chart factors (usually Ascendant + Planet A - Planet B). Include the Lot of Fortune, Lot of Spirit, and many others.',
    category: 'chart',
    relatedTerms: ['lot-of-fortune'],
  },
  {
    term: 'Electional Astrology',
    slug: 'electional',
    definition:
      'The practice of choosing optimal times for important events like weddings, business launches, or surgeries based on favorable planetary alignments.',
    category: 'technique',
    relatedTerms: ['horary', 'mundane-astrology'],
  },
  {
    term: 'Planetary Ruler',
    slug: 'planetary-ruler',
    definition:
      'Each zodiac sign is governed by a planet that shares its essential nature. The ruler of a sign or house adds another layer of influence. For example, Mars rules Aries, Venus rules Taurus and Libra, Mercury rules Gemini and Virgo.',
    category: 'planet',
    relatedTerms: ['domicile', 'rulership'],
  },
  {
    term: 'Asteroid',
    slug: 'asteroid',
    definition:
      'Minor celestial bodies used in astrology for additional nuance. Popular asteroids include Ceres (nurturing), Pallas (wisdom), Juno (partnership), and Vesta (devotion). They add layers of meaning to the birth chart.',
    category: 'planet',
    relatedTerms: ['lilith', 'chiron'],
  },
  {
    term: 'Chiron',
    slug: 'chiron',
    definition:
      'Known as the "Wounded Healer," Chiron represents our deepest wounds and our capacity to heal others through our own pain. Its house and sign placement shows where we experience vulnerability and ultimately wisdom.',
    category: 'planet',
    relatedTerms: ['asteroid', 'lilith'],
  },
  {
    term: 'Imum Coeli',
    slug: 'imum-coeli',
    definition:
      'The IC or "Bottom of the Sky" - the lowest point of the chart opposite the Midheaven. Represents roots, home, family, private life, and psychological foundations. The cusp of the 4th house.',
    category: 'chart',
    relatedTerms: ['midheaven', 'fourth-house', 'ascendant'],
  },
  {
    term: 'Stellium',
    slug: 'stellium',
    definition:
      'Three or more planets clustered in the same sign or house. Creates an intense concentration of energy in that area of life, making it a dominant theme in the chart.',
    category: 'chart',
    relatedTerms: ['conjunction', 'grand-trine'],
  },
  {
    term: 'Cazimi',
    slug: 'cazimi',
    definition:
      "When a planet is within 17 minutes of arc of the Sun's exact degree. Considered highly fortunate - the planet is 'in the heart of the Sun' and greatly strengthened.",
    category: 'aspect',
    relatedTerms: ['combust', 'conjunction'],
  },
  {
    term: 'Combust',
    slug: 'combust',
    definition:
      "When a planet is within 8 degrees of the Sun but not cazimi. The Sun's light overwhelms the planet, weakening its expression. The planet's significations become hidden or burned.",
    category: 'aspect',
    relatedTerms: ['cazimi', 'conjunction'],
  },
  {
    term: 'Applying Aspect',
    slug: 'applying',
    definition:
      'When a faster planet is moving toward exact aspect with a slower planet. Applying aspects are building in strength and represent future developments or incoming influences.',
    category: 'aspect',
    relatedTerms: ['separating', 'orb'],
  },
  {
    term: 'Separating Aspect',
    slug: 'separating',
    definition:
      'When a faster planet is moving away from exact aspect with a slower planet. Separating aspects are waning in influence and represent past events or diminishing effects.',
    category: 'aspect',
    relatedTerms: ['applying', 'orb'],
  },
  {
    term: 'Intercepted Sign',
    slug: 'intercepted',
    definition:
      'A sign fully contained within a house, not appearing on any house cusp. The sign and any planets within it may feel blocked or require extra effort to access and express.',
    category: 'chart',
    relatedTerms: ['cusp', 'house-system'],
  },
];

// Helper functions
export const getTermBySlug = (slug: string): GlossaryTerm | undefined => {
  return ASTROLOGY_GLOSSARY.find((term) => term.slug === slug);
};

export const getTermsByCategory = (
  category: GlossaryTerm['category'],
): GlossaryTerm[] => {
  return ASTROLOGY_GLOSSARY.filter((term) => term.category === category);
};

export const searchGlossary = (query: string): GlossaryTerm[] => {
  const lowerQuery = query.toLowerCase();
  return ASTROLOGY_GLOSSARY.filter(
    (term) =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery) ||
      term.relatedTerms?.some((rt) => rt.toLowerCase().includes(lowerQuery)),
  );
};

export const getRelatedTerms = (slug: string): GlossaryTerm[] => {
  const term = getTermBySlug(slug);
  if (!term?.relatedTerms) return [];
  return term.relatedTerms
    .map((rt) => getTermBySlug(rt))
    .filter((t): t is GlossaryTerm => t !== undefined);
};

export const glossaryCategories = [
  { id: 'basic', label: 'Basic Concepts' },
  { id: 'chart', label: 'Chart Elements' },
  { id: 'aspect', label: 'Aspects' },
  { id: 'planet', label: 'Planets' },
  { id: 'sign', label: 'Signs & Modalities' },
  { id: 'house', label: 'Houses' },
  { id: 'technique', label: 'Techniques' },
  { id: 'transit', label: 'Transits & Timing' },
] as const;
