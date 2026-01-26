// Comprehensive data structures for SEO-optimized Grimoire pages
// This file contains all the data needed for individual SEO pages

import { zodiacSigns, planetaryBodies } from '../../../utils/zodiac/zodiac';
import { monthlyMoonPhases } from '../../../utils/moon/monthlyPhases';
import { tarotCards } from '../../../utils/tarot/tarot-cards';

// Houses data
export const astrologicalHouses = {
  first: {
    number: 1,
    name: 'First House',
    symbol: 'ASC',
    keywords: ['Identity', 'Self', 'Appearance', 'First Impressions'],
    element: 'Fire',
    rulingSign: 'Aries',
    rulingPlanet: 'Mars',
    area: 'Identity, confidence, how you present yourself',
    description:
      'The First House represents your identity, self-image, and how you present yourself to the world. It governs your physical appearance, personality, and the first impression you make.',
    themes: [
      'Personal identity and self-expression',
      'Physical appearance and body',
      'Personality traits and characteristics',
      'How others perceive you',
      'New beginnings and fresh starts',
    ],
    planets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'],
    relatedSigns: ['Aries'],
  },
  second: {
    number: 2,
    name: 'Second House',
    symbol: '2H',
    keywords: ['Money', 'Possessions', 'Values', 'Self-Worth'],
    element: 'Earth',
    rulingSign: 'Taurus',
    rulingPlanet: 'Venus',
    area: 'Finances, self-worth, possessions',
    description:
      'The Second House governs your material resources, personal finances, and what you value most. It reveals your relationship with money, possessions, and self-worth.',
    themes: [
      'Personal finances and income',
      'Material possessions and resources',
      'Self-worth and values',
      'Talent and skills',
      'Sensual pleasures and comfort',
    ],
    planets: ['Venus'],
    relatedSigns: ['Taurus'],
  },
  third: {
    number: 3,
    name: 'Third House',
    symbol: '3H',
    keywords: ['Communication', 'Learning', 'Siblings', 'Short Travel'],
    element: 'Air',
    rulingSign: 'Gemini',
    rulingPlanet: 'Mercury',
    area: 'Communication, learning, siblings',
    description:
      'The Third House represents communication, learning, and your immediate environment. It governs how you think, learn, and interact with siblings and neighbors.',
    themes: [
      'Communication and expression',
      'Learning and education',
      'Siblings and close relatives',
      'Short-distance travel',
      'Writing and speaking',
    ],
    planets: ['Mercury'],
    relatedSigns: ['Gemini'],
  },
  fourth: {
    number: 4,
    name: 'Fourth House',
    symbol: '4H',
    keywords: ['Home', 'Family', 'Roots', 'Foundation'],
    element: 'Water',
    rulingSign: 'Cancer',
    rulingPlanet: 'Moon',
    area: 'Home, family, inner foundation',
    description:
      'The Fourth House represents your home, family, and emotional foundation. It reveals your roots, private life, and what makes you feel secure.',
    themes: [
      'Home and domestic life',
      'Family and ancestry',
      'Emotional foundation',
      'Privacy and inner world',
      'Real estate and property',
    ],
    planets: ['Moon'],
    relatedSigns: ['Cancer'],
  },
  fifth: {
    number: 5,
    name: 'Fifth House',
    symbol: '5H',
    keywords: ['Creativity', 'Romance', 'Children', 'Pleasure'],
    element: 'Fire',
    rulingSign: 'Leo',
    rulingPlanet: 'Sun',
    area: 'Creativity, joy, romance, children',
    description:
      'The Fifth House governs creativity, romance, children, and self-expression. It represents joy, pleasure, and the things that bring you happiness.',
    themes: [
      'Creativity and self-expression',
      'Romance and dating',
      'Children and parenting',
      'Hobbies and entertainment',
      'Gambling and risk-taking',
    ],
    planets: ['Sun'],
    relatedSigns: ['Leo'],
  },
  sixth: {
    number: 6,
    name: 'Sixth House',
    symbol: '6H',
    keywords: ['Health', 'Work', 'Routine', 'Service'],
    element: 'Earth',
    rulingSign: 'Virgo',
    rulingPlanet: 'Mercury',
    area: 'Health, habits, work environment',
    description:
      'The Sixth House represents daily work, health, and routines. It governs your work environment, health habits, and service to others.',
    themes: [
      'Daily work and employment',
      'Health and wellness',
      'Routines and habits',
      'Service and duty',
      'Pets and small animals',
    ],
    planets: ['Mercury'],
    relatedSigns: ['Virgo'],
  },
  seventh: {
    number: 7,
    name: 'Seventh House',
    symbol: '7H',
    keywords: ['Partnerships', 'Marriage', 'Relationships', 'Others'],
    element: 'Air',
    rulingSign: 'Libra',
    rulingPlanet: 'Venus',
    area: 'Partnerships, marriage, collaboration',
    description:
      'The Seventh House governs partnerships, marriage, and one-on-one relationships. It reveals how you relate to others and what you seek in partnerships.',
    themes: [
      'Marriage and committed partnerships',
      'Business partnerships',
      'Open enemies and conflicts',
      'Contracts and agreements',
      'Balance and harmony',
    ],
    planets: ['Venus'],
    relatedSigns: ['Libra'],
  },
  eighth: {
    number: 8,
    name: 'Eighth House',
    symbol: '8H',
    keywords: ['Transformation', 'Intimacy', 'Shared Resources', 'Death'],
    element: 'Water',
    rulingSign: 'Scorpio',
    rulingPlanet: 'Pluto',
    area: 'Intimacy, shared money, transformation',
    description:
      'The Eighth House represents transformation, shared resources, and deep intimacy. It governs inheritance, taxes, and psychological transformation.',
    themes: [
      'Transformation and rebirth',
      'Shared resources and finances',
      'Intimacy and sexuality',
      'Inheritance and legacies',
      'Psychological depth',
    ],
    planets: ['Pluto'],
    relatedSigns: ['Scorpio'],
  },
  ninth: {
    number: 9,
    name: 'Ninth House',
    symbol: '9H',
    keywords: ['Philosophy', 'Travel', 'Higher Learning', 'Beliefs'],
    element: 'Fire',
    rulingSign: 'Sagittarius',
    rulingPlanet: 'Jupiter',
    area: 'Travel, philosophy, beliefs, education',
    description:
      'The Ninth House governs higher learning, philosophy, long-distance travel, and your belief system. It represents your quest for meaning and understanding.',
    themes: [
      'Higher education and learning',
      'Philosophy and religion',
      'Long-distance travel',
      'Publishing and media',
      'Foreign cultures and languages',
    ],
    planets: ['Jupiter'],
    relatedSigns: ['Sagittarius'],
  },
  tenth: {
    number: 10,
    name: 'Tenth House',
    symbol: '10H',
    keywords: ['Career', 'Reputation', 'Public Image', 'Authority'],
    element: 'Earth',
    rulingSign: 'Capricorn',
    rulingPlanet: 'Saturn',
    area: 'Career, reputation, leadership',
    description:
      'The Tenth House represents your career, public reputation, and social status. It governs your ambitions, achievements, and how you are seen by society.',
    themes: [
      'Career and profession',
      'Public reputation and status',
      'Authority and leadership',
      'Achievements and recognition',
      'Relationship with authority figures',
    ],
    planets: ['Saturn'],
    relatedSigns: ['Capricorn'],
  },
  eleventh: {
    number: 11,
    name: 'Eleventh House',
    symbol: '11H',
    keywords: ['Friends', 'Community', 'Goals', 'Innovation'],
    element: 'Air',
    rulingSign: 'Aquarius',
    rulingPlanet: 'Uranus',
    area: 'Community, friends, social causes',
    description:
      'The Eleventh House governs friendships, community, and your hopes and dreams. It represents your social circle, group affiliations, and future goals.',
    themes: [
      'Friendships and social networks',
      'Community and groups',
      'Hopes and dreams',
      'Innovation and technology',
      'Humanitarian causes',
    ],
    planets: ['Uranus'],
    relatedSigns: ['Aquarius'],
  },
  twelfth: {
    number: 12,
    name: 'Twelfth House',
    symbol: '12H',
    keywords: ['Subconscious', 'Spirituality', 'Hidden', 'Karma'],
    element: 'Water',
    rulingSign: 'Pisces',
    rulingPlanet: 'Neptune',
    area: 'Subconscious, solitude, healing',
    description:
      'The Twelfth House represents the subconscious, spirituality, and hidden matters. It governs karma, secrets, and your connection to the collective unconscious.',
    themes: [
      'Subconscious and hidden matters',
      'Spirituality and mysticism',
      'Solitude and retreat',
      'Karma and past lives',
      'Self-undoing and limitations',
    ],
    planets: ['Neptune'],
    relatedSigns: ['Pisces'],
  },
};

// Aspects data
export const astrologicalAspects = {
  conjunction: {
    name: 'Conjunction',
    symbol: '☌',
    degrees: 0,
    orb: 8,
    type: 'major',
    nature: 'neutral',
    description:
      'A Conjunction occurs when two planets are in the same sign or very close together (within 8 degrees). This creates a blending of energies, intensifying the qualities of both planets.',
    meaning:
      'Planets work together, creating a powerful fusion of their energies. This aspect can be harmonious or challenging depending on the planets involved.',
    keywords: ['Intensity', 'Fusion', 'Focus', 'Combined Energy'],
    examples: [
      'Sun conjunct Moon: Strong sense of self, emotional clarity',
      'Venus conjunct Mars: Passionate relationships, strong desires',
      'Mercury conjunct Saturn: Serious thinking, disciplined communication',
    ],
  },
  opposition: {
    name: 'Opposition',
    symbol: '☍',
    degrees: 180,
    orb: 8,
    type: 'major',
    nature: 'challenging',
    description:
      'An Opposition occurs when two planets are directly opposite each other (180 degrees apart). This creates tension and a need for balance between opposing forces.',
    meaning:
      'Planets pull in opposite directions, creating internal tension that requires integration and balance. This aspect often brings awareness through contrast.',
    keywords: ['Tension', 'Balance', 'Awareness', 'Integration'],
    examples: [
      'Sun opposite Moon: Inner conflict between needs and wants',
      'Venus opposite Mars: Tension between love and desire',
      'Mercury opposite Jupiter: Balancing detail with big picture',
    ],
  },
  trine: {
    name: 'Trine',
    symbol: '△',
    degrees: 120,
    orb: 8,
    type: 'major',
    nature: 'harmonious',
    description:
      'A Trine occurs when planets are 120 degrees apart, forming a harmonious angle. This creates easy flow and natural talent in the areas governed by these planets.',
    meaning:
      'Planets work together effortlessly, creating natural talents and easy expression. This aspect brings blessings and opportunities.',
    keywords: ['Harmony', 'Talent', 'Ease', 'Flow'],
    examples: [
      'Sun trine Moon: Emotional harmony, natural self-expression',
      'Venus trine Jupiter: Natural charm, abundance in relationships',
      'Mercury trine Neptune: Intuitive communication, creative expression',
    ],
  },
  square: {
    name: 'Square',
    symbol: '□',
    degrees: 90,
    orb: 8,
    type: 'major',
    nature: 'challenging',
    description:
      'A Square occurs when planets are 90 degrees apart, creating friction and tension. This aspect requires action and growth through challenge.',
    meaning:
      'Planets create friction that demands resolution. This aspect brings challenges that lead to growth and development.',
    keywords: ['Challenge', 'Tension', 'Growth', 'Action'],
    examples: [
      'Sun square Moon: Inner conflict requiring resolution',
      'Venus square Mars: Passionate but conflicted relationships',
      'Mercury square Saturn: Communication challenges, learning through difficulty',
    ],
  },
  sextile: {
    name: 'Sextile',
    symbol: '⚹',
    degrees: 60,
    orb: 6,
    type: 'minor',
    nature: 'harmonious',
    description:
      'A Sextile occurs when planets are 60 degrees apart, creating opportunities and positive connections. This aspect brings ease and cooperation.',
    meaning:
      'Planets work together cooperatively, creating opportunities and positive connections. This aspect brings ease and support.',
    keywords: ['Opportunity', 'Cooperation', 'Support', 'Ease'],
    examples: [
      'Sun sextile Moon: Emotional support and understanding',
      'Venus sextile Mars: Harmonious expression of love and desire',
      'Mercury sextile Jupiter: Optimistic communication, learning opportunities',
    ],
  },
  quincunx: {
    name: 'Quincunx',
    symbol: '⚻',
    degrees: 150,
    orb: 3,
    type: 'minor',
    nature: 'challenging',
    description:
      'A Quincunx (also called Inconjunct) occurs when planets are 150 degrees apart. This creates a subtle but persistent friction between energies that have no natural affinity.',
    meaning:
      'Planets struggle to find common ground, requiring constant adjustment and adaptation. This aspect often manifests as health or lifestyle adjustments.',
    keywords: ['Adjustment', 'Discomfort', 'Integration', 'Fine-tuning'],
    examples: [
      'Sun quincunx Moon: Ongoing tension between identity and emotional needs',
      'Venus quincunx Saturn: Adjusting expectations in relationships and values',
      'Mars quincunx Neptune: Difficulty aligning action with intuition',
    ],
  },
  semisextile: {
    name: 'Semi-Sextile',
    symbol: '⚺',
    degrees: 30,
    orb: 2,
    type: 'minor',
    nature: 'harmonious',
    description:
      'A Semi-Sextile occurs when planets are 30 degrees apart, connecting adjacent signs. This creates a minor but supportive connection that encourages gradual growth.',
    meaning:
      'Planets offer subtle support through their proximity, creating opportunities for incremental development and learning from contrast.',
    keywords: ['Growth', 'Potential', 'Subtle Opportunity', 'Adjacent Energy'],
    examples: [
      'Sun semi-sextile Moon: Subtle emotional awareness supporting identity',
      'Venus semi-sextile Mars: Gentle harmony between love and desire',
      'Mercury semi-sextile Venus: Natural connection between thought and aesthetics',
    ],
  },
};

// Retrogrades overview
export const retrogradeInfo = {
  mercury: {
    name: 'Mercury Retrograde',
    frequency: '3-4 times per year',
    duration: '3 weeks',
    description:
      'Mercury Retrograde is the most well-known retrograde period, occurring 3-4 times per year for about 3 weeks each time. During this period, communication, technology, and travel can be disrupted.',
    effects: [
      'Communication delays and misunderstandings',
      'Technology glitches and malfunctions',
      'Travel delays and cancellations',
      'Revisiting past conversations and decisions',
      'Reflection and review of plans',
    ],
    whatToDo: [
      'Review and revise existing projects',
      'Reconnect with old friends',
      'Back up important data',
      'Double-check communications',
      'Reflect on past decisions',
    ],
    whatToAvoid: [
      'Signing important contracts',
      'Making major purchases',
      'Starting new projects',
      'Making hasty decisions',
      'Expecting smooth communication',
    ],
    keywords: ['Review', 'Reflection', 'Reconnection', 'Revision'],
  },
  venus: {
    name: 'Venus Retrograde',
    frequency: 'Every 18 months',
    duration: '6 weeks',
    description:
      'Venus Retrograde occurs every 18 months for about 6 weeks. During this time, relationships, values, and finances are re-evaluated. Old lovers may return, and you may reassess what you truly value.',
    effects: [
      'Re-evaluation of relationships',
      'Revisiting past loves',
      'Reassessing values and priorities',
      'Financial review',
      'Aesthetic and creative reflection',
    ],
    whatToDo: [
      'Reflect on relationship patterns',
      'Reassess your values',
      'Review your spending habits',
      'Reconnect with your creative side',
      'Heal past relationship wounds',
    ],
    whatToAvoid: [
      'Starting new relationships',
      'Making major purchases',
      'Getting married or engaged',
      'Changing your appearance drastically',
      'Making impulsive financial decisions',
    ],
    keywords: ['Re-evaluation', 'Values', 'Relationships', 'Reflection'],
  },
  mars: {
    name: 'Mars Retrograde',
    frequency: 'Every 2 years',
    duration: '2-3 months',
    description:
      "Mars Retrograde occurs every 2 years for 2-3 months. During this period, energy is turned inward, and you may feel frustrated or blocked in taking action. It's a time for internal work and re-evaluating goals.",
    effects: [
      'Decreased energy and motivation',
      'Frustration and blocked action',
      'Re-evaluation of goals and desires',
      'Suppressed anger coming to surface',
      'Internal reflection on assertiveness',
    ],
    whatToDo: [
      'Reflect on your goals and desires',
      'Work on internal issues',
      'Re-evaluate your approach to conflict',
      'Focus on planning rather than action',
      'Address suppressed anger',
    ],
    whatToAvoid: [
      'Starting new projects',
      'Making impulsive decisions',
      'Engaging in conflicts',
      'Expecting smooth progress',
      'Ignoring internal signals',
    ],
    keywords: ['Internal Work', 'Reflection', 'Re-evaluation', 'Patience'],
  },
  jupiter: {
    name: 'Jupiter Retrograde',
    frequency: 'Yearly',
    duration: '4 months',
    description:
      'Jupiter Retrograde occurs yearly for about 4 months. During this period, growth opportunities may be delayed or require internal reflection. It is a time to review beliefs, expand wisdom from within, and reassess your philosophical outlook.',
    effects: [
      'Re-evaluation of beliefs and philosophies',
      'Internal growth and wisdom development',
      'Delayed expansion opportunities',
      'Review of long-term goals',
      'Reflection on personal growth',
    ],
    whatToDo: [
      'Reflect on your beliefs and values',
      'Review and revise long-term goals',
      'Focus on internal growth and learning',
      'Reassess your expansion plans',
      'Study and deepen your understanding',
    ],
    whatToAvoid: [
      'Making major life changes impulsively',
      'Expanding too quickly without reflection',
      'Ignoring internal wisdom',
      'Making decisions based solely on external opportunities',
      'Overlooking the need for internal growth',
    ],
    keywords: ['Internal Growth', 'Beliefs', 'Wisdom', 'Reflection'],
  },
  saturn: {
    name: 'Saturn Retrograde',
    frequency: 'Yearly',
    duration: '4.5 months',
    description:
      'Saturn Retrograde occurs yearly for about 4.5 months. During this period, responsibilities and structures are re-evaluated. It is a time to review commitments, reassess boundaries, and work on internal discipline and maturity.',
    effects: [
      'Re-evaluation of responsibilities and commitments',
      'Review of structures and boundaries',
      'Internal work on discipline and maturity',
      'Reassessment of long-term goals',
      'Reflection on karma and life lessons',
    ],
    whatToDo: [
      'Review your commitments and responsibilities',
      'Reassess your boundaries and structures',
      'Work on internal discipline and maturity',
      'Reflect on life lessons and karma',
      'Plan for long-term stability',
    ],
    whatToAvoid: [
      'Taking on new major responsibilities',
      'Making hasty structural changes',
      'Ignoring internal discipline work',
      'Avoiding necessary boundaries',
      'Making decisions without considering long-term consequences',
    ],
    keywords: ['Responsibility', 'Structure', 'Discipline', 'Maturity'],
  },
  uranus: {
    name: 'Uranus Retrograde',
    frequency: 'Yearly',
    duration: '5 months',
    description:
      'Uranus Retrograde occurs yearly for about 5 months. During this period, innovation and change are turned inward. It is a time to reflect on personal freedom, review rebellious impulses, and work on internal transformation.',
    effects: [
      'Internal reflection on freedom and independence',
      'Review of rebellious impulses and changes',
      'Re-evaluation of innovation and technology',
      'Reflection on personal transformation',
      'Internal work on breaking free from limitations',
    ],
    whatToDo: [
      'Reflect on your need for freedom and independence',
      'Review past changes and their outcomes',
      'Work on internal transformation',
      'Reassess your relationship with technology',
      'Plan for authentic change from within',
    ],
    whatToAvoid: [
      'Making sudden, impulsive changes',
      'Rebelling without reflection',
      'Ignoring the need for internal transformation',
      'Making changes for the sake of change',
      'Overlooking the importance of stability',
    ],
    keywords: ['Innovation', 'Freedom', 'Transformation', 'Rebellion'],
  },
  neptune: {
    name: 'Neptune Retrograde',
    frequency: 'Yearly',
    duration: '5 months',
    description:
      'Neptune Retrograde occurs yearly for about 5 months. During this period, dreams, illusions, and spirituality are turned inward. It is a time to review your ideals, work on spiritual development, and discern between illusion and reality.',
    effects: [
      'Re-evaluation of dreams and ideals',
      'Review of spiritual beliefs and practices',
      'Reflection on illusions and reality',
      'Internal work on creativity and inspiration',
      'Reassessment of compassion and boundaries',
    ],
    whatToDo: [
      'Reflect on your dreams and ideals',
      'Review your spiritual practices',
      'Work on discerning illusion from reality',
      'Focus on internal creativity and inspiration',
      'Reassess your boundaries and compassion',
    ],
    whatToAvoid: [
      'Escaping into illusions or addictions',
      'Ignoring the need for spiritual reflection',
      'Making decisions based on unclear perceptions',
      'Overlooking boundaries in relationships',
      'Avoiding necessary reality checks',
    ],
    keywords: ['Dreams', 'Spirituality', 'Illusion', 'Creativity'],
  },
  pluto: {
    name: 'Pluto Retrograde',
    frequency: 'Yearly',
    duration: '5-6 months',
    description:
      'Pluto Retrograde occurs yearly for about 5-6 months. During this period, transformation, power, and deep change are turned inward. It is a time to review power dynamics, work on deep transformation, and process hidden or repressed material.',
    effects: [
      'Re-evaluation of power and control',
      'Review of transformation and change',
      'Reflection on hidden or repressed material',
      'Internal work on deep transformation',
      'Reassessment of death and rebirth cycles',
    ],
    whatToDo: [
      'Reflect on power dynamics in your life',
      'Review past transformations and their outcomes',
      'Work on processing repressed material',
      'Focus on deep internal transformation',
      'Reassess what needs to die and be reborn',
    ],
    whatToAvoid: [
      'Trying to control or manipulate situations',
      'Avoiding necessary deep transformation',
      'Ignoring repressed material that surfaces',
      'Making decisions based on power struggles',
      'Resisting necessary endings and rebirths',
    ],
    keywords: ['Transformation', 'Power', 'Rebirth', 'Depth'],
  },
};

// Eclipses overview
export const eclipseInfo = {
  solar: {
    name: 'Solar Eclipse',
    type: 'New Moon Eclipse',
    description:
      "A Solar Eclipse occurs during a New Moon when the Moon passes between the Earth and the Sun, temporarily blocking the Sun's light. This creates powerful new beginnings and major life changes.",
    meaning:
      'Solar Eclipses bring powerful new beginnings, major life changes, and opportunities for transformation. They often mark significant turning points in your life.',
    effects: [
      'Major new beginnings',
      'Life-changing events',
      'Sudden opportunities',
      'Revelations and insights',
      'Endings that lead to new starts',
    ],
    keywords: ['New Beginnings', 'Transformation', 'Revelation', 'Change'],
  },
  lunar: {
    name: 'Lunar Eclipse',
    type: 'Full Moon Eclipse',
    description:
      'A Lunar Eclipse occurs during a Full Moon when the Earth passes between the Sun and the Moon, casting a shadow on the Moon. This brings endings, completions, and emotional releases.',
    meaning:
      'Lunar Eclipses bring endings, completions, and emotional releases. They often mark the culmination of cycles and the need to let go of what no longer serves.',
    effects: [
      'Endings and completions',
      'Emotional releases',
      'Letting go of the past',
      'Revelations and insights',
      'Closure and resolution',
    ],
    keywords: ['Endings', 'Release', 'Completion', 'Closure'],
  },
};

// Moon in Sign data (will be generated dynamically)
export const moonInSignData = Object.keys(zodiacSigns).map((signKey) => {
  const sign = zodiacSigns[signKey as keyof typeof zodiacSigns];
  return {
    sign: sign.name,
    signKey: signKey,
    element: sign.element,
    description: `When the Moon is in ${sign.name}, emotions are expressed through ${sign.element.toLowerCase()} energy. This placement influences how you feel, react, and nurture yourself and others.`,
    emotionalThemes: [
      `Emotional expression through ${sign.element.toLowerCase()}`,
      `Nurturing style influenced by ${sign.name}`,
      `Intuitive responses aligned with ${sign.name} energy`,
      `Emotional needs shaped by ${sign.element.toLowerCase()} element`,
    ],
    howToWorkWith: [
      `Honor your ${sign.name} emotional nature`,
      `Express feelings through ${sign.element.toLowerCase()} activities`,
      `Create space for ${sign.name} emotional needs`,
      `Connect with ${sign.element.toLowerCase()} element practices`,
    ],
  };
});

// Export all data for use in pages
export const grimoireSEOData = {
  zodiacSigns,
  planetaryBodies,
  houses: astrologicalHouses,
  moonPhases: monthlyMoonPhases,
  moonInSign: moonInSignData,
  tarotCards,
  aspects: astrologicalAspects,
  retrogrades: retrogradeInfo,
  eclipses: eclipseInfo,
};
