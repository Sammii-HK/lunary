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
      "Slow down and savour life\'s pleasures during this season.",
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

// Element correspondences for zodiac signs
const ELEMENT_CORRESPONDENCES: Record<
  string,
  { crystals: string[]; herbs: string[]; colors: string[] }
> = {
  Fire: {
    crystals: ['Carnelian', 'Red Jasper', 'Citrine', 'Sunstone', "Tiger's Eye"],
    herbs: ['Cinnamon', 'Ginger', 'Basil', 'Clove', 'Rosemary'],
    colors: ['Red', 'Orange', 'Gold', 'Yellow'],
  },
  Earth: {
    crystals: [
      'Hematite',
      'Green Aventurine',
      'Black Tourmaline',
      'Jade',
      'Moss Agate',
    ],
    herbs: ['Sage', 'Cedar', 'Patchouli', 'Oak', 'Mugwort'],
    colors: ['Green', 'Brown', 'Black', 'Tan'],
  },
  Air: {
    crystals: [
      'Clear Quartz',
      'Amethyst',
      'Sodalite',
      'Lapis Lazuli',
      'Aquamarine',
    ],
    herbs: ['Lavender', 'Mint', 'Eucalyptus', 'Lemongrass', 'Sage'],
    colors: ['Yellow', 'White', 'Light Blue', 'Silver'],
  },
  Water: {
    crystals: ['Aquamarine', 'Moonstone', 'Pearl', 'Opal', 'Amethyst'],
    herbs: ['Jasmine', 'Rose', 'Lotus', 'Willow', 'Chamomile'],
    colors: ['Blue', 'Silver', 'Sea Green', 'Teal'],
  },
};

export function generateZodiacSeasonContent(sign: string): PdfAstrologyPack {
  const data = ZODIAC_DATA[sign];
  if (!data) {
    throw new Error(`Unknown zodiac sign: ${sign}`);
  }

  const elementCorrespondences =
    ELEMENT_CORRESPONDENCES[data.element] || ELEMENT_CORRESPONDENCES.Fire;

  const sections: PdfAstrologySection[] = [
    {
      title: `${sign} Season Dates and Astrological Significance`,
      description: `From ${data.dates}, the sun moves through ${sign}, infusing the collective with ${data.energy} energy. Whether or not you have ${sign} in your chart, this season invites you to work with its themes: ${data.themes.join(', ').toLowerCase()}.`,
      practicalTips: [
        ...data.practicalTips,
        `This season marks a ${data.modality.toLowerCase()} point in the astrological year.`,
        `${sign} is ruled by ${data.ruler}, which influences how this energy manifests.`,
      ],
      journalPrompts: data.journalPrompts,
    },
    {
      title: `Rituals Aligned with ${sign} Energy`,
      description: `These rituals help you work intentionally with ${sign}'s ${data.energy} energy throughout the season.`,
      practicalTips: [
        `Create an altar with ${sign} correspondences: ${data.element.toLowerCase()} symbols and ${elementCorrespondences.colors.slice(0, 2).join(' and ').toLowerCase()} colours.`,
        `Perform a ${sign} new moon intention-setting ritual during the new moon in ${sign}.`,
        `Meditate on ${sign} themes during the full moon in ${sign} (which occurs during the opposite season).`,
        `Light candles in ${elementCorrespondences.colors[0]?.toLowerCase() || 'appropriate'} and ${elementCorrespondences.colors[1]?.toLowerCase() || 'seasonal'} during ${sign} season.`,
        `Create a ${sign} season spell or ritual focused on ${data.themes[0].toLowerCase()} and ${data.themes[1].toLowerCase()}.`,
      ],
    },
    {
      title: `Crystal and Herb Correspondences for ${sign}`,
      description: `Working with ${sign}'s element (${data.element}) and ruling planet (${data.ruler}) through crystals and herbs can amplify your seasonal practice.`,
      practicalTips: [
        `Crystals for ${sign} season: ${elementCorrespondences.crystals.slice(0, 4).join(', ')}.`,
        `Herbs for ${sign} season: ${elementCorrespondences.herbs.slice(0, 4).join(', ')}.`,
        `Place these crystals on your altar or carry them during ${sign} season.`,
        `Burn ${elementCorrespondences.herbs[0]?.toLowerCase() || 'appropriate'} incense or use ${elementCorrespondences.herbs[1]?.toLowerCase() || 'seasonal'} in ritual baths.`,
        `Create a crystal grid with ${elementCorrespondences.crystals[0]} and ${elementCorrespondences.crystals[1]} to amplify ${sign} energy.`,
        `Use ${elementCorrespondences.herbs[0]?.toLowerCase() || 'seasonal'} in teas or as offerings during ${sign} season rituals.`,
      ],
      journalPrompts: [
        `Which ${sign} correspondences resonate most with me?`,
        `How can I incorporate these crystals and herbs into my daily practice?`,
      ],
    },
    {
      title: `Altar Setup for ${sign} Season`,
      description: `Creating a dedicated altar space helps you connect with ${sign}'s energy throughout the season.`,
      practicalTips: [
        `Choose a location that receives natural light or faces the direction associated with ${data.element} (${data.element === 'Fire' ? 'South' : data.element === 'Earth' ? 'North' : data.element === 'Air' ? 'East' : 'West'}).`,
        `Cover your altar with a cloth in ${elementCorrespondences.colors[0]?.toLowerCase() || 'seasonal'} or ${elementCorrespondences.colors[1]?.toLowerCase() || 'appropriate'} colours.`,
        `Place ${elementCorrespondences.crystals.slice(0, 3).join(', ')} on your altar.`,
        `Add candles in ${elementCorrespondences.colors.slice(0, 2).join(' and ').toLowerCase()} colours.`,
        `Include symbols of ${sign}: the ${sign} glyph (${sign === 'Aries' ? '♈' : sign === 'Taurus' ? '♉' : sign === 'Gemini' ? '♊' : sign === 'Cancer' ? '♋' : sign === 'Leo' ? '♌' : sign === 'Virgo' ? '♍' : sign === 'Libra' ? '♎' : sign === 'Scorpio' ? '♏' : sign === 'Sagittarius' ? '♐' : sign === 'Capricorn' ? '♑' : sign === 'Aquarius' ? '♒' : '♓'}), images representing ${data.themes[0].toLowerCase()}, or items that embody ${sign} energy.`,
        `Place a small bowl of ${elementCorrespondences.herbs[0]?.toLowerCase() || 'seasonal'} herbs on your altar.`,
        `Light the candles daily and spend a few moments connecting with ${sign}'s energy.`,
      ],
      journalPrompts: [
        `What does my ${sign} season altar represent to me?`,
        `How does this sacred space support my work with ${sign} themes?`,
      ],
    },
    {
      title: `${sign} Season Tarot Spread`,
      description: `Use this three-card spread to gain insight into how ${sign} energy is manifesting in your life during this season.`,
      practicalTips: [
        `Card 1 - ${sign} Energy in My Life: How is ${sign}'s ${data.energy} energy currently showing up?`,
        `Card 2 - What ${sign} Asks of Me: What lesson or action is ${sign} season inviting?`,
        `Card 3 - Embracing ${sign} Gifts: How can I best work with this energy for growth?`,
        `Perform this spread at the beginning of ${sign} season and again at the midpoint.`,
        `Journal about the cards and how they relate to ${sign}'s themes of ${data.themes.slice(0, 2).join(' and ').toLowerCase()}.`,
        `Use ${elementCorrespondences.crystals[0]} or ${elementCorrespondences.crystals[1]} as a focus stone during the reading.`,
      ],
      journalPrompts: [
        `What message does ${sign} season have for me?`,
        `How can I honour ${sign}'s energy through my actions?`,
      ],
    },
    {
      title: `Daily Practices for ${sign} Season`,
      description: `Simple, daily practices to stay connected with ${sign}'s energy throughout the month.`,
      practicalTips: [
        `Morning: Light a ${elementCorrespondences.colors[0]?.toLowerCase() || 'seasonal'} candle and set an intention aligned with ${sign}'s themes.`,
        `Midday: Carry ${elementCorrespondences.crystals[0]} or ${elementCorrespondences.crystals[1]} with you as a reminder of ${sign} energy.`,
        `Evening: Journal about how ${sign} energy showed up in your day.`,
        `Weekly: Perform the ${sign} season tarot spread to track your progress.`,
        `Throughout: Practice ${data.themes[0].toLowerCase()} in small, daily ways.`,
        `End of Season: Reflect on what you learned and how you grew during ${sign} season.`,
      ],
      journalPrompts: [
        `What daily practice feels most aligned with ${sign} energy?`,
        `How can I make ${sign}'s themes part of my everyday life?`,
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
      title: 'Understanding Your Saturn Return Timing and Themes',
      description:
        'Saturn takes approximately 29.5 years to complete its orbit around the Sun, eventually returning to the position it held at your birth. This cosmic homecoming marks a significant life transition, often bringing challenges that catalyse profound growth and lasting maturity.',
      practicalTips: [
        'Your Saturn Return typically begins when Saturn comes within 5 degrees of your natal Saturn position.',
        'The transit lasts about 2.5 years as Saturn moves through your natal Saturn sign.',
        'This is a time of reckoning: what you have built on shaky foundations may crumble, while what is solid will endure.',
        'Major life decisions made during this period often define the trajectory of the next 29-year cycle.',
        "Track Saturn's current position relative to your natal Saturn to know when your Return begins.",
      ],
      journalPrompts: [
        'Which structures in my life feel solid? Which feel unstable?',
        'What have I been avoiding that Saturn is now asking me to address?',
        'When did or will my Saturn Return begin?',
      ],
    },
    {
      title: 'Saturn Natal Sign Interpretations',
      description:
        'Your natal Saturn sign reveals the specific lessons and challenges you will face during your Saturn Return. Understanding this helps you prepare and work consciously with the energy.',
      practicalTips: [
        'Saturn in Aries: Lessons around independence, assertiveness, and learning to lead without dominating.',
        'Saturn in Taurus: Lessons around security, values, material stability, and building lasting foundations.',
        'Saturn in Gemini: Lessons around communication, learning, mental discipline, and expressing your truth.',
        'Saturn in Cancer: Lessons around emotional security, family patterns, nurturing boundaries, and home.',
        'Saturn in Leo: Lessons around creative expression, confidence, recognition, and authentic self-love.',
        'Saturn in Virgo: Lessons around health, service, perfectionism, and finding balance in work and wellness.',
        'Saturn in Libra: Lessons around relationships, balance, justice, and learning to stand alone when needed.',
        'Saturn in Scorpio: Lessons around power, transformation, intimacy, and releasing control.',
        'Saturn in Sagittarius: Lessons around beliefs, philosophy, expansion, and finding your truth.',
        'Saturn in Capricorn: Lessons around ambition, structure, authority, and building your legacy.',
        'Saturn in Aquarius: Lessons around freedom, community, innovation, and balancing individuality with belonging.',
        'Saturn in Pisces: Lessons around boundaries, spirituality, compassion, and dissolving illusions.',
      ],
      journalPrompts: [
        'What does my natal Saturn sign reveal about my core lessons?',
        'How have I been working with or avoiding these Saturn themes?',
      ],
    },
    {
      title: 'Saturn House Meaning for Your Return',
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
      title: 'Rituals for Each Phase of the Return',
      description:
        'Saturn Return unfolds in three distinct phases, each requiring different ritual approaches. These practices help you work consciously with each stage.',
      practicalTips: [
        'Phase 1 – The Reckoning Ritual: Create a release ceremony. Write down what is no longer working on black paper. Light a black candle and safely burn each item, saying: "I release what no longer serves. I see clearly what must change."',
        'Phase 1 – Shadow Work: Spend time in meditation identifying patterns that have kept you stuck. Journal about what you are ready to face.',
        'Phase 2 – The Work Ritual: On a Saturday (Saturn\'s day), create a commitment ceremony. Write your Saturn Return goals on paper. Place obsidian or hematite on top. Say: "I commit to the work. I accept responsibility for my growth."',
        'Phase 2 – Boundary Setting: Perform a protection ritual. Create a salt circle and visualise healthy boundaries forming around you.',
        'Phase 3 – The Rebuild Ritual: Create a foundation-laying ceremony. Gather stones or crystals representing your new foundations. Arrange them on your altar, saying: "I build on solid ground. These foundations will last."',
        'Phase 3 – Integration Practice: Create a daily ritual of checking in with your commitments and celebrating small wins.',
      ],
      journalPrompts: [
        'Which phase do I believe I am currently in?',
        'What specific ritual feels most aligned with where I am?',
        'What action is Saturn asking me to take right now?',
      ],
    },
    {
      title: 'Grounding and Stability Practices',
      description:
        'Saturn Return can feel destabilising. These grounding practices help you stay centred and build the stability Saturn demands.',
      practicalTips: [
        'Daily Grounding Meditation: Spend 10 minutes each morning with your feet on the earth (or visualise roots). Feel yourself anchored to the ground.',
        'Earth Element Work: Work with earth element crystals (hematite, obsidian, black tourmaline) daily. Hold them while setting intentions.',
        'Structure Your Days: Create consistent daily routines. Saturn rewards discipline and structure.',
        'Physical Grounding: Practice yoga, walking barefoot, or weight-bearing exercises. Saturn rules the skeleton—honour your body.',
        'Salt Baths: Weekly salt baths (Epsom or sea salt) help release what no longer serves and ground your energy.',
        "Nature Connection: Spend time in nature, especially near mountains, rocks, or old trees. These embody Saturn's energy.",
        'Breathwork: Practice slow, deep breathing to calm the nervous system and connect with your body.',
      ],
      journalPrompts: [
        'What grounding practice feels most supportive right now?',
        'How can I create more stability in my daily life?',
      ],
    },
    {
      title: 'Career and Life Structure Assessment Tools',
      description:
        'Saturn Return often brings major career and life structure changes. These tools help you assess what needs restructuring and what to build.',
      practicalTips: [
        'Career Assessment: List your current career path. Ask: Does this align with my authentic self? What needs to change?',
        'Life Structure Review: Map out your current life structure (home, work, relationships, health). Identify what feels solid vs. unstable.',
        'Values Clarification: Write down your core values. Compare them to how you are currently living. Where is there misalignment?',
        'Long-term Vision: Visualise your life 10 years from now. What structures do you need to build now to get there?',
        'Responsibility Audit: List all your current responsibilities. Which ones are truly yours? Which can you release?',
        'Boundary Assessment: Identify areas where you need stronger boundaries. What commitments are draining you?',
        'Legacy Reflection: What do you want to leave behind? What structures will support that legacy?',
      ],
      journalPrompts: [
        'What career or life structure changes is Saturn asking me to make?',
        'What am I building that will last beyond this Saturn Return?',
        'Where do I need to take more responsibility? Where do I need to release responsibility?',
      ],
    },
    {
      title: 'Saturn-Honouring Altar Guide',
      description:
        "Create a dedicated altar space to work with Saturn's energy during your Return. This sacred space supports your growth and provides a focal point for your practice.",
      practicalTips: [
        'Colours: Black, dark brown, lead grey, deep indigo.',
        'Crystals: Obsidian, hematite, onyx, jet, black tourmaline, smoky quartz.',
        'Herbs and plants: Comfrey, horsetail, cypress, sage, cedar, patchouli.',
        'Symbols: The Saturn glyph (♄), images of mountains or old structures, hourglasses or clocks, images of elders or wise teachers.',
        'Candles: Black, dark brown, or grey candles.',
        "Day: Saturday is Saturn's day—set up or refresh your altar on Saturdays.",
        'Offerings: Dark bread, root vegetables, salt, or items representing structure and discipline.',
        'Placement: North (earth element direction) or a quiet, structured space.',
        'Intention: Focus on discipline, structure, responsibility, and building lasting foundations.',
      ],
      journalPrompts: [
        'What does my Saturn altar represent to me?',
        'How does this sacred space support my Saturn Return work?',
      ],
    },
    {
      title: 'Crystal and Herb Correspondences',
      description:
        "Working with Saturn's correspondences can help you align with the planet's energy and support your growth during this transit.",
      practicalTips: [
        'Crystals for Saturn Return: Obsidian (protection and grounding), Hematite (stability and structure), Onyx (boundaries and strength), Jet (banishing and protection), Black Tourmaline (grounding and protection), Smoky Quartz (transformation and release).',
        'How to Use Crystals: Carry them daily, place them on your Saturn altar, use them in meditation, or create a crystal grid for structure and stability.',
        'Herbs for Saturn Return: Comfrey (healing and structure), Horsetail (strength and support), Cypress (protection and boundaries), Sage (cleansing and wisdom), Cedar (protection and grounding), Patchouli (stability and earth connection).',
        'How to Use Herbs: Burn as incense, use in ritual baths, create sachets to carry, or use in teas (check safety first).',
        'Elemental Connection: Saturn is associated with Earth element. Work with earth element practices: gardening, working with soil, spending time in nature.',
      ],
      journalPrompts: [
        'Which Saturn correspondences resonate most with me?',
        'How can I incorporate these into my daily Saturn Return practice?',
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
      "Those seeking to understand Saturn\'s lessons in their chart.",
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
      title: 'Jupiter Transit Timing and Meaning',
      description:
        'Jupiter, the planet of expansion, luck, and growth, moves through each sign approximately once per year. Every 12 years, it returns to its natal position, opening major doors of opportunity.',
      practicalTips: [
        'Jupiter transits bring growth, opportunity, and sometimes excess.',
        'The house Jupiter transits shows where expansion is available.',
        'Jupiter Return (every 12 years) marks a major growth cycle.',
        "Jupiter's gifts require you to say yes and take action.",
        "Track Jupiter's current position to identify where blessings are available.",
      ],
      journalPrompts: [
        'Where am I being invited to expand?',
        'What opportunities am I not seeing or not acting upon?',
        'When was my last Jupiter Return, and what growth did it bring?',
      ],
    },
    {
      title: 'Jupiter Through the Houses Guide',
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
      title: 'Abundance and Expansion Rituals',
      description:
        "Rituals to align with Jupiter's expansive energy and invite abundance into your life.",
      practicalTips: [
        'Create a Jupiter altar with purple and gold candles, amethyst, and citrine crystals.',
        'Light candles during Jupiter hour (Thursday, 1st hour after sunrise or sunset).',
        'Write a list of what you wish to expand, then burn it with gratitude.',
        'Perform a prosperity bath with bay leaves, cinnamon, and gold-coloured items.',
        'Create a vision board focusing on your biggest dreams and opportunities.',
        'Practice daily gratitude for existing abundance to attract more.',
        'Share your resources generously—Jupiter rewards generosity.',
      ],
      journalPrompts: [
        'What areas of my life are ready for expansion?',
        "How can I align my actions with Jupiter's energy?",
        'What abundance am I already experiencing that I can build upon?',
      ],
    },
    {
      title: 'Luck-Enhancing Practices',
      description:
        "Practical ways to work with Jupiter's lucky energy and increase your receptivity to blessings.",
      practicalTips: [
        "Wear purple or gold on Thursdays (Jupiter's day).",
        'Carry citrine, amethyst, or pyrite as lucky talismans.',
        'Practice saying yes to opportunities that feel aligned.',
        'Expand your horizons through travel, education, or new experiences.',
        'Connect with mentors, teachers, and wise guides.',
        'Engage in acts of generosity and sharing your abundance.',
        "Meditate on Jupiter's energy, visualising expansion and growth.",
        'Keep a gratitude journal focused on blessings and opportunities.',
      ],
      journalPrompts: [
        'What does luck mean to me?',
        'How can I become more receptive to opportunities?',
        'What limiting beliefs about abundance am I ready to release?',
      ],
    },
    {
      title: 'Opportunity Manifestation Spell',
      description:
        "A powerful spell to align with Jupiter's energy and manifest opportunities for growth and expansion.",
      practicalTips: [
        'Gather: purple candle, citrine or amethyst crystal, bay leaves, gold ribbon, paper and pen.',
        'Light the purple candle during Jupiter hour (Thursday).',
        'Write down three opportunities you wish to manifest.',
        'Place the paper under the citrine crystal.',
        'Hold the bay leaves and speak: "Jupiter, planet of expansion, open doors of opportunity. I am ready to receive your blessings and grow into my greatest potential."',
        'Tie the bay leaves with the gold ribbon and place on your altar.',
        'Visualise the opportunities manifesting with clarity and gratitude.',
        'Take one concrete action step toward each opportunity within 24 hours.',
        'Keep the crystal and bay leaves on your altar until opportunities manifest.',
      ],
      journalPrompts: [
        'What opportunities am I ready to say yes to?',
        'How will I recognise opportunities when they arrive?',
        'What action steps will I take to meet opportunities halfway?',
      ],
    },
    {
      title: 'Jupiter-Honouring Altar Guide',
      description:
        "Create a sacred space dedicated to Jupiter's energy to invite expansion and blessings.",
      practicalTips: [
        'Colours: Purple, gold, deep blue, royal blue.',
        'Crystals: Amethyst, citrine, pyrite, lapis lazuli, sapphire.',
        'Herbs and plants: Bay leaves, oak, cedar, sage, mint.',
        "Symbols: The number 4 (Jupiter's number), the glyph for Jupiter (♃), images of eagles or oak trees.",
        'Candles: Purple, gold, or deep blue candles.',
        "Day: Thursday is Jupiter's day—set up or refresh your altar on Thursdays.",
        'Offerings: Wine, honey, grains, or items representing abundance.',
        'Placement: East or centre of your sacred space.',
        'Intention: Focus on expansion, growth, wisdom, and abundance.',
      ],
      journalPrompts: [
        'What does abundance look like in my life?',
        "How can I honour Jupiter's energy in my daily practice?",
        'What symbols of expansion and growth resonate with me?',
      ],
    },
    {
      title: 'Sagittarius and Pisces Season Connections',
      description:
        'Jupiter rules both Sagittarius and Pisces, making these seasons especially potent for Jupiter work.',
      practicalTips: [
        'Sagittarius Season (Nov 22 - Dec 21): Focus on adventure, learning, philosophy, and expanding horizons. This is a time for big-picture thinking and taking bold leaps.',
        'Pisces Season (Feb 19 - Mar 20): Focus on spiritual expansion, intuition, compassion, and dissolving boundaries. This is a time for mystical experiences and universal connection.',
        "During these seasons, Jupiter's energy is amplified—use this time for major expansion work.",
        'Align rituals and intentions with the themes of the current Jupiter-ruled season.',
        'Pay attention to Jupiter transits during these seasons for extra potency.',
        'These seasons are ideal for starting long-term expansion projects or educational pursuits.',
      ],
      journalPrompts: [
        'How do I experience expansion differently during Sagittarius vs Pisces season?',
        'What adventures or spiritual practices am I drawn to during these seasons?',
        'How can I honour both the adventurous and mystical sides of Jupiter?',
      ],
    },
    {
      title: 'Gratitude and Growth Journal Prompts',
      description:
        "Reflective prompts to deepen your relationship with Jupiter's energy and track your expansion journey.",
      practicalTips: [
        'Use these prompts weekly or during Jupiter transits.',
        'Keep a dedicated Jupiter journal to track growth over time.',
        'Review your entries during Jupiter Returns to see your evolution.',
        'Share insights with trusted friends or mentors.',
      ],
      journalPrompts: [
        'What am I grateful for today, and how does this gratitude open me to more abundance?',
        'Where have I grown or expanded in the past year?',
        'What opportunities did I say yes to that changed my life?',
        'What limiting beliefs about abundance am I ready to release?',
        'How can I share my abundance with others?',
        'What does my greatest potential look like?',
        'What doors of opportunity are opening for me right now?',
        "How can I align my daily actions with Jupiter's expansive energy?",
        'What wisdom have I gained through my expansion journey?',
        'What am I ready to grow into next?',
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
      "Thank you for opening to Jupiter\'s gifts with Lunary. May you recognise abundance everywhere and have the courage to say yes to growth.",
    optionalAffirmation:
      'I am open to expansion. I receive the blessings available to me with gratitude and joy.',
  };
}
