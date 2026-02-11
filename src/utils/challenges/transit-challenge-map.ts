/**
 * Static map of transit-to-challenge templates.
 * Each template has a title, description, and 7 daily prompts
 * following an arc: awareness -> engagement -> integration -> reflection.
 */

export interface ChallengeTemplate {
  transitKey: string;
  title: string;
  description: string;
  dailyPrompts: string[];
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Retrogrades
  {
    transitKey: 'mercury_retrograde',
    title: 'Mercury Retrograde Survival',
    description:
      'Navigate communication and tech chaos with intention. Slow down, review, and reconnect.',
    dailyPrompts: [
      'Notice where communication feels unclear today. Pause before reacting.',
      'Revisit an old conversation or relationship that needs closure.',
      'Double-check one important message before sending it.',
      'Try a digital detox for 1 hour. Journal what comes up.',
      "Reach out to someone you've been meaning to reconnect with.",
      "Review and update something you've been putting off (plans, lists, goals).",
      'Reflect: What has Mercury Retrograde revealed about your communication patterns?',
    ],
  },
  {
    transitKey: 'venus_retrograde',
    title: 'Venus Retrograde: Heart Review',
    description:
      'Examine your values, relationships, and what brings you true pleasure.',
    dailyPrompts: [
      'What do you truly value? List 5 things that matter most right now.',
      'Reflect on a past relationship. What did it teach you about love?',
      'Do something that brings you genuine pleasure (not performative).',
      'Examine your spending. Does it align with your values?',
      'Write a love letter to yourself, acknowledging your growth.',
      'Create something beautiful today, even something small.',
      'Reflect: How has your relationship with love and beauty evolved this week?',
    ],
  },
  {
    transitKey: 'mars_retrograde',
    title: 'Mars Retrograde: Inner Fire',
    description:
      'Channel your energy inward. Review your ambitions and how you assert yourself.',
    dailyPrompts: [
      'Notice your energy levels today. Where do you feel most alive?',
      'Reflect on a conflict you handled poorly. How would you approach it differently?',
      'Channel physical energy intentionally: exercise, dance, or stretch mindfully.',
      'Examine your anger. What boundary is it trying to protect?',
      'Practice patience with something that usually frustrates you.',
      'Revisit a goal you abandoned. Does it still call to you?',
      'Reflect: What have you learned about your drive and determination this week?',
    ],
  },
  {
    transitKey: 'jupiter_retrograde',
    title: 'Jupiter Retrograde: Inner Wisdom',
    description:
      'Turn your search for meaning inward. Deepen your existing beliefs rather than seeking new ones.',
    dailyPrompts: [
      'What do you believe about the universe? Write freely for 5 minutes.',
      'Read or study something that expands your perspective.',
      'Practice gratitude for an abundance you usually overlook.',
      'Examine where you might be overextending. Where can you simplify?',
      "Share a piece of wisdom you've earned through experience.",
      'Reflect on your biggest lesson from this year so far.',
      'Reflect: How has your understanding of growth and meaning deepened?',
    ],
  },
  {
    transitKey: 'saturn_retrograde',
    title: 'Saturn Retrograde: Restructure',
    description:
      'Review your commitments, boundaries, and long-term foundations.',
    dailyPrompts: [
      'Examine your daily structure. Does it serve your goals?',
      'Identify one boundary that needs strengthening or adjusting.',
      'Reflect on a responsibility that feels heavy. Is it truly yours to carry?',
      "Take one small step toward a long-term goal you've neglected.",
      'Have an honest conversation about expectations (with yourself or someone else).',
      'Declutter one area of your life: physical, digital, or emotional.',
      'Reflect: What structures in your life need rebuilding, and which are solid?',
    ],
  },

  // Planet-in-sign (high-affinity combos)
  {
    transitKey: 'venus_in_pisces',
    title: 'Venus in Pisces: Cosmic Love',
    description:
      'Venus is exalted in Pisces. Embrace unconditional love, creativity, and spiritual connection.',
    dailyPrompts: [
      'Practice an act of unconditional kindness today.',
      'Create something inspired by your emotions: art, music, or writing.',
      'Spend time near water. Let it cleanse your emotional energy.',
      'Forgive someone (including yourself) for something small.',
      'Listen to music that moves your soul. Let the feelings flow.',
      'Practice a compassion meditation for someone you find difficult.',
      'Reflect: How has compassion shown up in your life this week?',
    ],
  },
  {
    transitKey: 'mars_in_aries',
    title: 'Mars in Aries: Bold Action',
    description:
      'Mars is home in Aries. Channel this fiery energy into courage and initiative.',
    dailyPrompts: [
      "Do something brave today, even if it's small.",
      "Start something new you've been putting off.",
      'Physical challenge: push your body in a way that feels empowering.',
      'Speak up about something that matters to you.',
      'Set a bold intention and take the first step right now.',
      'Channel competitive energy into self-improvement, not comparison.',
      'Reflect: Where did courage show up for you this week?',
    ],
  },
  {
    transitKey: 'mercury_in_gemini',
    title: 'Mercury in Gemini: Curious Mind',
    description:
      'Mercury thrives in Gemini. Embrace curiosity, learning, and diverse perspectives.',
    dailyPrompts: [
      'Learn one new thing about a topic you know nothing about.',
      'Have a meaningful conversation with someone whose views differ from yours.',
      'Write stream-of-consciousness for 5 minutes without stopping.',
      'Read or listen to content outside your usual interests.',
      'Practice active listening in every conversation today.',
      'Share an interesting idea with someone who might appreciate it.',
      'Reflect: How has curiosity expanded your world this week?',
    ],
  },
  {
    transitKey: 'moon_in_cancer',
    title: 'Moon in Cancer: Nurture',
    description:
      'The Moon is home in Cancer. Honor your emotional needs and nurture your inner world.',
    dailyPrompts: [
      'Create a cozy, nurturing space in your home today.',
      'Cook or eat something comforting that nourishes your soul.',
      'Call or write to a family member or chosen family.',
      'Allow yourself to feel your feelings without judgment.',
      'Take care of something that needs tending: a plant, a pet, yourself.',
      'Share a warm memory with someone you love.',
      'Reflect: How have you nurtured yourself and others this week?',
    ],
  },
  {
    transitKey: 'sun_in_leo',
    title: 'Sun in Leo: Shine Bright',
    description:
      'The Sun rules Leo. Step into your authentic self-expression and creative power.',
    dailyPrompts: [
      'Express yourself creatively today in any form.',
      'Give a genuine compliment to someone.',
      'Celebrate a personal achievement, no matter how small.',
      'Do something playful and joyful, just for fun.',
      'Share your unique perspective with the world.',
      'Practice generous leadership: lift someone else up today.',
      'Reflect: How did you let your inner light shine this week?',
    ],
  },
  {
    transitKey: 'venus_in_taurus',
    title: 'Venus in Taurus: Sensual Grounding',
    description:
      "Venus is at home in Taurus. Savor life's pleasures and ground into your senses.",
    dailyPrompts: [
      'Engage all five senses today. Notice beauty in the ordinary.',
      'Prepare a meal with care and eat slowly, savoring each bite.',
      'Spend time in nature. Feel the earth beneath your feet.',
      'Invest in something that brings lasting quality to your life.',
      'Create a self-care ritual involving touch: a bath, massage, or skincare.',
      'Appreciate something you already own rather than wanting something new.',
      'Reflect: How has slowing down and savoring changed your perspective?',
    ],
  },
  {
    transitKey: 'jupiter_in_sagittarius',
    title: 'Jupiter in Sagittarius: Expand',
    description:
      'Jupiter rules Sagittarius. Expand your horizons through adventure, learning, and faith.',
    dailyPrompts: [
      'Plan an adventure, even a small one in your neighborhood.',
      'Study a philosophy or belief system different from your own.',
      'Share your vision for the future with someone you trust.',
      "Try something you've never done before.",
      'Practice optimism: find the silver lining in a challenge.',
      'Teach someone something you know well.',
      'Reflect: How has your worldview expanded this week?',
    ],
  },
  {
    transitKey: 'saturn_in_capricorn',
    title: 'Saturn in Capricorn: Build',
    description:
      'Saturn rules Capricorn. Build something lasting through discipline and strategic effort.',
    dailyPrompts: [
      'Set a specific, measurable goal for the week.',
      'Create or refine your daily routine for maximum effectiveness.',
      'Do the hardest task on your list first thing.',
      'Mentor or guide someone who could benefit from your experience.',
      'Review your long-term plan. Is it still aligned with your values?',
      'Practice delayed gratification: choose long-term benefit over short-term comfort.',
      'Reflect: What have you built this week that will last?',
    ],
  },
  {
    transitKey: 'mercury_in_virgo',
    title: 'Mercury in Virgo: Refine',
    description:
      'Mercury is exalted in Virgo. Perfect your craft through analysis and attention to detail.',
    dailyPrompts: [
      "Organize one area of your life that's been neglected.",
      'Analyze a problem methodically instead of reacting emotionally.',
      'Help someone with a practical task.',
      'Review your health habits. Make one small improvement.',
      'Edit or refine a project, piece of writing, or plan.',
      "Practice discernment: distinguish between what's essential and what's not.",
      'Reflect: How has attention to detail improved your week?',
    ],
  },
  {
    transitKey: 'venus_in_libra',
    title: 'Venus in Libra: Harmony',
    description:
      'Venus rules Libra. Seek balance, beauty, and harmony in all your relationships.',
    dailyPrompts: [
      'Create balance in your day between work and rest.',
      'Resolve a small disagreement with grace and diplomacy.',
      'Add beauty to your environment: flowers, art, or a tidy space.',
      'Listen to both sides of a situation before forming an opinion.',
      'Practice the art of compromise without losing yourself.',
      "Appreciate the beauty in someone else's perspective.",
      'Reflect: Where did you find harmony this week?',
    ],
  },

  // Aspect energies
  {
    transitKey: 'conjunction_energy',
    title: 'Cosmic Conjunction: New Beginnings',
    description:
      'A powerful conjunction merges planetary energies. Plant seeds for new cycles.',
    dailyPrompts: [
      'Set a powerful intention for a new beginning.',
      'Merge two areas of your life that usually feel separate.',
      'Focus your energy on one single priority today.',
      'Meditate on unity: how are seeming opposites actually connected?',
      'Start a project that combines your talents in a new way.',
      'Notice where new energy is trying to emerge in your life.',
      'Reflect: What new cycle is beginning for you?',
    ],
  },
  {
    transitKey: 'trine_energy',
    title: 'Cosmic Trine: Easy Flow',
    description:
      'A harmonious trine supports effortless creativity. Let things flow naturally.',
    dailyPrompts: [
      'Do something creative without overthinking it.',
      'Notice where things come easily today. Follow that energy.',
      'Share your talents generously with others.',
      'Take the path of least resistance today (in a healthy way).',
      'Express gratitude for your natural gifts and abilities.',
      'Allow a project to develop organically without forcing it.',
      'Reflect: Where did you experience effortless flow this week?',
    ],
  },
  {
    transitKey: 'square_energy',
    title: 'Cosmic Square: Growth Through Tension',
    description:
      'A square creates productive tension. Use friction as fuel for transformation.',
    dailyPrompts: [
      'Identify a tension in your life. What is it trying to teach you?',
      'Do something uncomfortable that you know will lead to growth.',
      'Transform frustration into motivation for change.',
      "Address a challenge you've been avoiding.",
      'Find a creative solution to a persistent problem.',
      'Practice sitting with discomfort instead of numbing it.',
      'Reflect: How has tension catalyzed your growth this week?',
    ],
  },
  {
    transitKey: 'opposition_energy',
    title: 'Cosmic Opposition: Balance',
    description:
      'An opposition calls for awareness of polarities. Find the middle path.',
    dailyPrompts: [
      'Notice where you feel pulled in two directions. Honor both sides.',
      'Seek a second perspective on something you feel strongly about.',
      "Balance an area where you've been too extreme.",
      'Practice both giving and receiving today.',
      'Have an honest dialogue about a disagreement.',
      'Integrate something you usually reject about yourself.',
      'Reflect: What balance have you found between opposing forces?',
    ],
  },
  {
    transitKey: 'sextile_energy',
    title: 'Cosmic Sextile: Opportunity',
    description:
      'A sextile opens doors of opportunity. Take initiative to activate its gifts.',
    dailyPrompts: [
      "Notice an opportunity you've been overlooking. Take one step toward it.",
      'Connect with someone who could be a collaborator or ally.',
      'Learn a new skill that complements something you already know.',
      'Say yes to an invitation or possibility you might normally decline.',
      'Share a resource or opportunity with someone who needs it.',
      'Plant a seed for something you want to develop over time.',
      'Reflect: What opportunities opened up for you this week?',
    ],
  },

  // Moon phase fallbacks
  {
    transitKey: 'new_moon_week',
    title: 'New Moon: Plant Seeds',
    description:
      'The New Moon invites fresh starts. Set intentions and plant seeds for the cycle ahead.',
    dailyPrompts: [
      'Write down 3 intentions for this lunar cycle.',
      'Clear space (physical or mental) for something new to enter.',
      "Begin a project or habit you've been contemplating.",
      'Practice visualization: see your intentions already manifested.',
      'Take one small action toward your biggest dream.',
      'Share your intentions with someone you trust.',
      'Reflect: What seeds have you planted this week?',
    ],
  },
  {
    transitKey: 'full_moon_week',
    title: 'Full Moon: Illuminate & Release',
    description:
      "The Full Moon reveals what's hidden. Celebrate progress and release what no longer serves you.",
    dailyPrompts: [
      "Write down what you're ready to release from your life.",
      'Celebrate a win or milestone from the past two weeks.',
      "Have an honest conversation you've been avoiding.",
      "Forgive yourself for something that's been weighing on you.",
      "Practice a release ritual: burn, tear, or flush what you're letting go.",
      'Express gratitude for the lessons of this lunar cycle.',
      'Reflect: What has the Full Moon illuminated for you?',
    ],
  },
  {
    transitKey: 'waxing_week',
    title: 'Waxing Moon: Build Momentum',
    description:
      'The Waxing Moon supports growth and action. Build momentum toward your goals.',
    dailyPrompts: [
      'Take a concrete step toward a goal you set recently.',
      "Notice what's growing in your life and nourish it.",
      'Push past a comfort zone in one small way.',
      'Connect with someone who supports your growth.',
      'Add structure to a plan or project that needs it.',
      'Celebrate small progress instead of waiting for big results.',
      'Reflect: How have you built momentum this week?',
    ],
  },
  {
    transitKey: 'waning_week',
    title: 'Waning Moon: Rest & Review',
    description:
      'The Waning Moon invites rest and reflection. Review, integrate, and prepare for renewal.',
    dailyPrompts: [
      'Rest more intentionally today. What does your body need?',
      "Review what worked and didn't work this lunar cycle.",
      'Declutter one area: physical space, digital files, or mental clutter.',
      "Practice surrender: release control of something you can't change.",
      'Spend time in quiet reflection or meditation.',
      "Complete an unfinished task that's draining your energy.",
      'Reflect: What are you ready to leave behind as the Moon wanes?',
    ],
  },

  // Seasonal
  {
    transitKey: 'solstice_week',
    title: 'Solstice: Light & Shadow',
    description:
      'The Solstice marks a turning point of light. Honor both illumination and darkness within.',
    dailyPrompts: [
      'Acknowledge the balance of light and shadow in your life.',
      'Set an intention for the season ahead.',
      'Spend time outdoors during sunrise or sunset.',
      'Honor an ancestor or tradition that connects you to the seasons.',
      'Create a ritual marking this turning point in the year.',
      'Share warmth with someone who needs it.',
      'Reflect: How do you honor the turning of seasons in your life?',
    ],
  },
  {
    transitKey: 'equinox_week',
    title: 'Equinox: Perfect Balance',
    description:
      'The Equinox brings equal day and night. Seek equilibrium in all areas of life.',
    dailyPrompts: [
      'Assess the balance between work and rest in your life.',
      'Equal time for giving and receiving today.',
      'Balance solitude with connection.',
      'Bring harmony to an area of conflict or imbalance.',
      'Practice equanimity: respond to good and bad news with equal poise.',
      'Create balance in your environment: tidy, organize, harmonize.',
      'Reflect: Where have you found balance this week?',
    ],
  },
  {
    transitKey: 'eclipse_week',
    title: 'Eclipse Season: Transformation',
    description:
      'Eclipse energy accelerates change and reveals hidden truths. Surrender to transformation.',
    dailyPrompts: [
      "Notice what feels like it's ending in your life. Honor the transition.",
      'Pay attention to synchronicities and signs today.',
      "Journal about a truth you've been avoiding.",
      'Release attachment to a specific outcome.',
      'Embrace uncertainty as an invitation for growth.',
      "Trust the process even when you can't see the destination.",
      'Reflect: What transformation is the eclipse catalyzing in your life?',
    ],
  },
];

/**
 * Look up a challenge template by transit key.
 */
export function getChallengeTemplate(
  transitKey: string,
): ChallengeTemplate | null {
  return CHALLENGE_TEMPLATES.find((t) => t.transitKey === transitKey) || null;
}

/**
 * Get all valid transit keys.
 */
export function getValidTransitKeys(): string[] {
  return CHALLENGE_TEMPLATES.map((t) => t.transitKey);
}

/**
 * Get a fallback template based on moon phase.
 */
export function getMoonPhaseFallbackKey(moonPhaseName: string): string {
  const lower = moonPhaseName.toLowerCase();
  if (lower.includes('new')) return 'new_moon_week';
  if (lower.includes('full')) return 'full_moon_week';
  if (lower.includes('waxing')) return 'waxing_week';
  return 'waning_week';
}
