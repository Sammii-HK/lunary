/**
 * Astrology Pack Content Generator
 *
 * Generates rich PDF content for astrology packs (zodiac seasons, Saturn Return, etc.).
 */

import { PdfAstrologyPack, PdfAstrologySection } from '../schema';

const ZODIAC_SEASONS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const ZODIAC_DATA: Record<
  string,
  {
    element: string;
    modality: string;
    ruler: string;
    dates: string;
    themes: string[];
    energy: string;
    practicalTips: string[];
    journalPrompts: string[];
  }
> = {
  Aries: {
    element: 'Fire',
    modality: 'Cardinal',
    ruler: 'Mars',
    dates: 'March 21 – April 19',
    themes: ['New beginnings', 'Courage', 'Initiative', 'Leadership'],
    energy: 'fiery and initiating',
    practicalTips: [
      'Start projects you have been postponing—Aries energy favours bold action.',
      'Channel any restlessness into physical activity or new challenges.',
      'Practice patience with yourself and others; Aries can bring impulsivity.',
      'Set intentions for the astrological new year.',
    ],
    journalPrompts: [
      'Where in my life am I being called to take courageous action?',
      'What new beginning is ready to emerge?',
    ],
  },
  Taurus: {
    element: 'Earth',
    modality: 'Fixed',
    ruler: 'Venus',
    dates: 'April 20 – May 20',
    themes: ['Stability', 'Pleasure', 'Abundance', 'Groundedness'],
    energy: 'grounded and sensual',
    practicalTips: [
      "Slow down and savour life's pleasures during this season.",
      'Focus on financial planning and material security.',
      'Spend time in nature to enhance your connection to earth energy.',
      'Invest in quality over quantity—Taurus appreciates lasting value.',
    ],
    journalPrompts: [
      'What do I truly value, and am I investing my resources accordingly?',
      'Where can I bring more pleasure and sensuality into my daily life?',
    ],
  },
  Gemini: {
    element: 'Air',
    modality: 'Mutable',
    ruler: 'Mercury',
    dates: 'May 21 – June 20',
    themes: ['Communication', 'Curiosity', 'Learning', 'Connection'],
    energy: 'curious and communicative',
    practicalTips: [
      'Embrace learning and intellectual exploration during this season.',
      'Reach out to friends, siblings, and community—Gemini loves connection.',
      'Start that writing project or course you have been considering.',
      'Be mindful of scattered energy; focus is valuable.',
    ],
    journalPrompts: [
      'What am I curious about learning right now?',
      'How can I communicate more authentically?',
    ],
  },
  Cancer: {
    element: 'Water',
    modality: 'Cardinal',
    ruler: 'Moon',
    dates: 'June 21 – July 22',
    themes: ['Home', 'Nurturing', 'Emotions', 'Family'],
    energy: 'nurturing and intuitive',
    practicalTips: [
      'Focus on home, family, and emotional wellbeing.',
      'Create a cosy sanctuary in your living space.',
      'Honor your emotional needs without apology.',
      'Connect with your roots and ancestry.',
    ],
    journalPrompts: [
      'What does home mean to me, and how can I nurture that feeling?',
      'What emotional patterns from my family am I ready to heal?',
    ],
  },
  Leo: {
    element: 'Fire',
    modality: 'Fixed',
    ruler: 'Sun',
    dates: 'July 23 – August 22',
    themes: ['Creativity', 'Self-expression', 'Joy', 'Confidence'],
    energy: 'radiant and expressive',
    practicalTips: [
      'Express yourself creatively—Leo season celebrates your unique gifts.',
      'Step into the spotlight; let yourself be seen.',
      'Play, have fun, and reconnect with childlike joy.',
      'Practice generous leadership in your community.',
    ],
    journalPrompts: [
      'How can I express my authentic self more boldly?',
      'Where am I dimming my light, and why?',
    ],
  },
  Virgo: {
    element: 'Earth',
    modality: 'Mutable',
    ruler: 'Mercury',
    dates: 'August 23 – September 22',
    themes: ['Health', 'Service', 'Organisation', 'Refinement'],
    energy: 'discerning and helpful',
    practicalTips: [
      'Focus on health habits and daily routines.',
      'Organise your space and life systems.',
      'Offer your skills in service to others.',
      'Practice discernment without harsh self-criticism.',
    ],
    journalPrompts: [
      'What daily habits would support my highest wellbeing?',
      'How can I be of service while maintaining healthy boundaries?',
    ],
  },
  Libra: {
    element: 'Air',
    modality: 'Cardinal',
    ruler: 'Venus',
    dates: 'September 23 – October 22',
    themes: ['Balance', 'Partnership', 'Beauty', 'Harmony'],
    energy: 'harmonious and diplomatic',
    practicalTips: [
      'Focus on relationships and partnership dynamics.',
      'Seek balance in all areas of life.',
      'Surround yourself with beauty—art, music, nature.',
      'Practice diplomacy while still honouring your own needs.',
    ],
    journalPrompts: [
      'Where is my life out of balance, and how can I restore equilibrium?',
      'What do I need from my relationships to feel truly partnered?',
    ],
  },
  Scorpio: {
    element: 'Water',
    modality: 'Fixed',
    ruler: 'Pluto (traditional: Mars)',
    dates: 'October 23 – November 21',
    themes: ['Transformation', 'Depth', 'Power', 'Mystery'],
    energy: 'intense and transformative',
    practicalTips: [
      'Embrace deep inner work and shadow exploration.',
      'Allow things to die that are ready to transform.',
      'Investigate what lies beneath the surface.',
      'Reclaim your personal power in healthy ways.',
    ],
    journalPrompts: [
      'What am I avoiding looking at, and why?',
      'Where am I ready for profound transformation?',
    ],
  },
  Sagittarius: {
    element: 'Fire',
    modality: 'Mutable',
    ruler: 'Jupiter',
    dates: 'November 22 – December 21',
    themes: ['Adventure', 'Wisdom', 'Expansion', 'Truth'],
    energy: 'adventurous and philosophical',
    practicalTips: [
      'Plan travel or expand your horizons in some way.',
      'Study philosophy, spirituality, or higher learning.',
      'Seek truth and meaning in your experiences.',
      'Stay optimistic while remaining grounded.',
    ],
    journalPrompts: [
      'What adventure is calling to me?',
      'What beliefs am I ready to examine or expand?',
    ],
  },
  Capricorn: {
    element: 'Earth',
    modality: 'Cardinal',
    ruler: 'Saturn',
    dates: 'December 22 – January 19',
    themes: ['Ambition', 'Structure', 'Legacy', 'Discipline'],
    energy: 'ambitious and disciplined',
    practicalTips: [
      'Set long-term goals and create practical plans.',
      'Build structures that will last.',
      'Embrace discipline as a form of self-love.',
      'Consider the legacy you wish to leave.',
    ],
    journalPrompts: [
      'What am I building that will stand the test of time?',
      'Where do I need more structure in my life?',
    ],
  },
  Aquarius: {
    element: 'Air',
    modality: 'Fixed',
    ruler: 'Uranus (traditional: Saturn)',
    dates: 'January 20 – February 18',
    themes: ['Innovation', 'Community', 'Freedom', 'Vision'],
    energy: 'innovative and humanitarian',
    practicalTips: [
      'Embrace your uniqueness and think outside the box.',
      'Connect with community and like-minded groups.',
      'Work toward causes greater than yourself.',
      'Allow yourself to be unconventional.',
    ],
    journalPrompts: [
      'How can I contribute to positive change in my community?',
      'Where am I conforming when I long to be free?',
    ],
  },
  Pisces: {
    element: 'Water',
    modality: 'Mutable',
    ruler: 'Neptune (traditional: Jupiter)',
    dates: 'February 19 – March 20',
    themes: ['Intuition', 'Compassion', 'Dreams', 'Spirituality'],
    energy: 'mystical and compassionate',
    practicalTips: [
      'Trust your intuition and pay attention to dreams.',
      'Engage in creative and spiritual practices.',
      'Practice compassion for yourself and others.',
      "Maintain boundaries to avoid absorbing others' energy.",
    ],
    journalPrompts: [
      'What are my dreams trying to tell me?',
      'How can I deepen my spiritual connection?',
    ],
  },
};

export function generateZodiacSeasonContent(sign: string): PdfAstrologyPack {
  const data = ZODIAC_DATA[sign];
  if (!data) {
    throw new Error(`Unknown zodiac sign: ${sign}`);
  }

  const sections: PdfAstrologySection[] = [
    {
      title: `Welcome to ${sign} Season`,
      description: `From ${data.dates}, the sun moves through ${sign}, infusing the collective with ${data.energy} energy. Whether or not you have ${sign} in your chart, this season invites you to work with its themes: ${data.themes.join(', ').toLowerCase()}.`,
      practicalTips: data.practicalTips,
      journalPrompts: data.journalPrompts,
    },
    {
      title: `${sign} Energy`,
      description: `${sign} is a ${data.modality} ${data.element} sign, ruled by ${data.ruler}. This combination creates energy that is ${data.energy}. Understanding this helps you work with the season more intentionally.`,
      practicalTips: [
        `As a ${data.element} sign, ${sign} resonates with ${data.element.toLowerCase()} element practices.`,
        `The ${data.modality.toLowerCase()} modality suggests ${data.modality === 'Cardinal' ? 'initiating new projects' : data.modality === 'Fixed' ? 'deepening existing commitments' : 'adapting and integrating'}.`,
        `Working with ${data.ruler} energy can enhance your ${sign} season experience.`,
      ],
    },
    {
      title: 'Ritual Suggestions',
      description: `Align your practice with ${sign} season through these ritual ideas:`,
      practicalTips: [
        `Create an altar with ${sign} correspondences: ${data.element.toLowerCase()} symbols and colours.`,
        `Perform a ${sign} new moon intention-setting ritual.`,
        `Meditate on ${sign} themes during the full moon in ${sign} (which occurs during the opposite season).`,
        `Journal daily on how ${sign} energy is showing up in your life.`,
      ],
    },
  ];

  return {
    type: 'astrology',
    slug: `${sign.toLowerCase()}-season-pack`,
    title: `${sign} Season`,
    subtitle: `Embrace ${data.energy} energy`,
    moodText: `${sign} season invites you to work with themes of ${data.themes.slice(0, 2).join(' and ').toLowerCase()}. Let this pack guide you through meaningful rituals and practices.`,
    perfectFor: [
      `Making the most of ${sign} season.`,
      `${sign} sun, moon, or rising placements.`,
      `Anyone drawn to ${data.themes[0].toLowerCase()} and ${data.themes[1].toLowerCase()}.`,
    ],
    introText: `From ${data.dates}, the sun illuminates the sign of ${sign}. Regardless of your personal placements, this season affects the collective energy. These practices help you align with ${sign}'s gifts.`,
    sections,
    journalPrompts: data.journalPrompts,
    closingText: `Thank you for journeying through ${sign} season with Lunary. May the themes of ${data.themes.slice(0, 2).join(' and ').toLowerCase()} continue to guide you as the wheel turns.`,
    optionalAffirmation: `I align with the energy of ${sign} season. I embrace its lessons and gifts with an open heart.`,
  };
}

export function generateSaturnReturnContent(): PdfAstrologyPack {
  const sections: PdfAstrologySection[] = [
    {
      title: 'What Is Saturn Return?',
      description:
        'Saturn takes approximately 29.5 years to complete its orbit around the Sun, eventually returning to the position it held at your birth. This cosmic homecoming marks a significant life transition, often bringing challenges that catalyse profound growth and lasting maturity.',
      practicalTips: [
        'Your Saturn Return typically begins when Saturn comes within 5 degrees of your natal Saturn position.',
        'The transit lasts about 2.5 years as Saturn moves through your natal Saturn sign.',
        'This is a time of reckoning: what you have built on shaky foundations may crumble, while what is solid will endure.',
        'Major life decisions made during this period often define the trajectory of the next 29-year cycle.',
      ],
      journalPrompts: [
        'Which structures in my life feel solid? Which feel unstable?',
        'What have I been avoiding that Saturn is now asking me to address?',
      ],
    },
    {
      title: 'Saturn Return by House',
      description:
        'The house where your natal Saturn resides determines the life area most deeply affected by your Saturn Return. This is where you will face your greatest tests—and achieve your most meaningful growth.',
      practicalTips: [
        '1st House: Lessons around identity, self-image, physical body, and personal authority.',
        '2nd House: Lessons around finances, self-worth, personal values, and material security.',
        '3rd House: Lessons around communication, learning, relationships with siblings, and local community.',
        '4th House: Lessons around home, family, emotional foundations, and ancestral patterns.',
        '5th House: Lessons around creativity, romance, children, and authentic self-expression.',
        '6th House: Lessons around health, daily routines, work habits, and service to others.',
        '7th House: Lessons around partnerships, marriage, contracts, and committed relationships.',
        '8th House: Lessons around shared resources, intimacy, deep transformation, and endings.',
        '9th House: Lessons around higher education, travel, philosophy, and belief systems.',
        '10th House: Lessons around career, public reputation, legacy, and overall life direction.',
        '11th House: Lessons around friendships, community involvement, hopes, and long-term aspirations.',
        '12th House: Lessons around solitude, spirituality, hidden patterns, and deep inner work.',
      ],
    },
    {
      title: 'The Three Phases',
      description:
        'Saturn Return unfolds in three distinct phases, each offering different opportunities for growth and restructuring.',
      practicalTips: [
        'Phase 1 – The Reckoning: Old patterns rise to the surface. You begin to see clearly what is no longer working.',
        'Phase 2 – The Work: This is often the most challenging phase. You must take action, establish boundaries, and make difficult choices.',
        'Phase 3 – The Rebuild: You emerge with new foundations, clearer purpose, and greater maturity than before.',
        'Trust the process, even when it feels uncomfortable. Saturn rewards sustained effort and integrity.',
      ],
      journalPrompts: [
        'Which phase do I believe I am currently in?',
        'What specific action is Saturn asking me to take right now?',
      ],
    },
    {
      title: 'Survival Strategies',
      description:
        'Saturn Return is demanding, but it is not punishing. These strategies can help you navigate this transit with grace and emerge stronger on the other side.',
      practicalTips: [
        'Embrace responsibility: Saturn rewards accountability and will expose patterns of avoidance.',
        'Set boundaries: Learn to say no to what does not align with your authentic path.',
        'Practice delayed gratification: Build slowly and sustainably rather than seeking quick fixes.',
        'Seek mentorship: Connect with elders, guides, or therapists who have walked a similar path.',
        'Cultivate patience: Saturn teaches through time. Trust the slow unfolding of your growth.',
        'Honour your body: Saturn rules bones, teeth, and structure. Prioritise your physical health.',
      ],
    },
    {
      title: 'Life After Saturn Return',
      description:
        'Those who commit to the work of their Saturn Return emerge with a clearer sense of purpose, stronger foundations, and the quiet wisdom that comes from meeting challenge with integrity.',
      practicalTips: [
        'The foundations you build during this period will support the next 29 years of your life.',
        'You may notice a renewed sense of purpose, direction, and self-trust.',
        'Relationships that survive Saturn Return often emerge deeper and more authentic.',
        'Your second Saturn Return (ages 56–60) will revisit these themes at a higher octave.',
      ],
      journalPrompts: [
        'What do I want the next 29 years of my life to look like?',
        'What am I most proud of building or becoming during this transit?',
      ],
    },
  ];

  return {
    type: 'astrology',
    slug: 'saturn-return-pack',
    title: 'Saturn Return',
    subtitle: 'Your cosmic coming of age',
    moodText:
      'Saturn Return is not a punishment; it is an invitation to grow up, take responsibility, and build a life aligned with your deepest truth.',
    perfectFor: [
      'Those approaching ages 27–30 or 56–60.',
      'Anyone experiencing major life restructuring or transition.',
      "Those seeking to understand Saturn's lessons in their chart.",
    ],
    introText:
      'Welcome to your Saturn Return—one of the most significant astrological transits you will ever experience. This pack is your guide to understanding, navigating, and ultimately thriving through this transformative period.',
    sections,
    journalPrompts: [
      'What does growing up truly mean to me?',
      'What am I finally ready to take full responsibility for?',
      'What legacy do I want to build over the next 29 years?',
    ],
    closingText:
      'Thank you for navigating your Saturn Return with Lunary. This is not an ending; it is a powerful new beginning. You are building the foundation for the rest of your life. Trust the process, do the work, and know that you are exactly where you need to be.',
    optionalAffirmation:
      'I embrace the lessons of Saturn. I am building a life of integrity, purpose, and authentic alignment.',
  };
}

export function generateJupiterExpansionContent(): PdfAstrologyPack {
  const sections: PdfAstrologySection[] = [
    {
      title: 'Understanding Jupiter Transits',
      description:
        'Jupiter, the planet of expansion, luck, and growth, moves through each sign approximately once per year. Every 12 years, it returns to its natal position, opening major doors of opportunity.',
      practicalTips: [
        'Jupiter transits bring growth, opportunity, and sometimes excess.',
        'The house Jupiter transits shows where expansion is available.',
        'Jupiter Return (every 12 years) marks a major growth cycle.',
        "Jupiter's gifts require you to say yes and take action.",
      ],
      journalPrompts: [
        'Where am I being invited to expand?',
        'What opportunities am I not seeing or not acting upon?',
      ],
    },
    {
      title: 'Jupiter Through the Houses',
      description:
        'Understanding where Jupiter is transiting in your chart reveals which life area is blessed with expansion.',
      practicalTips: [
        '1st House: Personal growth, new beginnings, improved self-image.',
        '2nd House: Financial opportunities, increased income, values clarification.',
        '3rd House: Learning opportunities, improved communication, local travel.',
        '4th House: Home expansion, family blessings, emotional growth.',
        '5th House: Creative flourishing, romance, joy with children.',
        '6th House: Health improvements, better work conditions, service opportunities.',
        '7th House: Partnership blessings, beneficial contracts, relationship growth.',
        '8th House: Shared resources increase, transformation, inheritance.',
        '9th House: Travel, higher education, spiritual expansion, publishing.',
        '10th House: Career advancement, public recognition, reputation growth.',
        '11th House: Community expansion, friendship blessings, dreams manifesting.',
        '12th House: Spiritual growth, healing, hidden blessings revealed.',
      ],
    },
    {
      title: 'Working with Jupiter Energy',
      description:
        "To maximise Jupiter's gifts, you must actively engage with the opportunities presented.",
      practicalTips: [
        'Say yes to opportunities that align with your growth.',
        'Think big—Jupiter rewards expansive vision.',
        'Practice gratitude to attract more blessings.',
        'Share your abundance generously.',
        'Avoid overextending or taking on too much.',
      ],
    },
  ];

  return {
    type: 'astrology',
    slug: 'jupiter-expansion-pack',
    title: 'Jupiter Expansion',
    subtitle: 'Grow into your greatest potential',
    moodText:
      'Jupiter opens doors of opportunity and expansion. This pack helps you recognise, embrace, and maximise the blessings available to you.',
    perfectFor: [
      'Those experiencing a Jupiter return (every 12 years).',
      'Anyone wanting to expand abundance in their life.',
      'Growth, opportunity, and manifestation work.',
    ],
    introText:
      'Jupiter is the planet of luck, growth, and expansion. Wherever Jupiter transits in your chart, blessings become available—but you must say yes and take action to receive them.',
    sections,
    journalPrompts: [
      'What am I ready to grow into?',
      'Where am I playing too small?',
      'What blessings am I not noticing?',
    ],
    closingText:
      "Thank you for opening to Jupiter's gifts with Lunary. May you recognise abundance everywhere and have the courage to say yes to growth.",
    optionalAffirmation:
      'I am open to expansion. I receive the blessings available to me with gratitude and joy.',
  };
}
