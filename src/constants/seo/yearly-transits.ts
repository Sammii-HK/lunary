export interface YearlyTransit {
  id: string;
  year: number;
  planet: string;
  transitType: string;
  title: string;
  dates: string;
  signs: string[];
  description: string;
  themes: string[];
  doList: string[];
  avoidList: string[];
  tone: string;
}

export const YEARLY_TRANSITS: YearlyTransit[] = [
  // 2025
  {
    id: 'saturn-return-2025',
    year: 2025,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2025',
    dates: 'All year (for those born ~1995-1996)',
    signs: ['Pisces'],
    description:
      'Saturn Return occurs when Saturn returns to its natal position, happening around ages 29-30. In 2025, Saturn continues through Pisces, bringing karmic lessons about boundaries, spirituality, and dissolving old structures.',
    themes: ['maturity', 'responsibility', 'life assessment', 'karmic lessons'],
    doList: [
      'take stock of your life',
      'set long-term goals',
      'accept responsibility',
      'build sustainable structures',
    ],
    avoidList: [
      'avoiding hard truths',
      'resisting change',
      'shortcuts',
      'blaming others',
    ],
    tone: 'Sobering but empowering. A season of boundaries, truth-telling, and building a life you can actually sustain.',
  },
  {
    id: 'jupiter-gemini-2025',
    year: 2025,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Gemini 2025',
    dates: 'Until June 9, 2025',
    signs: ['Gemini'],
    description:
      'Jupiter in Gemini expands communication, learning, and networking. This transit favors writers, teachers, and those in media. Ideas flow freely and connections multiply.',
    themes: ['communication', 'learning', 'networking', 'curiosity'],
    doList: [
      'learn new skills',
      'write and publish',
      'network actively',
      'explore ideas',
    ],
    avoidList: [
      'scattered focus',
      'superficial knowledge',
      'gossip',
      'overcommitting',
    ],
    tone: 'Bright, busy, and curious. Momentum comes through learning, writing, networking, and saying yes strategically.',
  },
  {
    id: 'jupiter-cancer-2025',
    year: 2025,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Cancer 2025',
    dates: 'June 9, 2025 - June 30, 2026',
    signs: ['Cancer'],
    description:
      "Jupiter enters Cancer mid-2025, expanding themes of home, family, and emotional security. This is Jupiter's exaltation sign, making it especially powerful for nurturing, real estate, and family growth.",
    themes: ['home', 'family', 'emotional growth', 'nurturing'],
    doList: [
      'invest in home',
      'strengthen family bonds',
      'heal emotional wounds',
      'create safety',
    ],
    avoidList: [
      'overprotectiveness',
      'clinging to the past',
      'emotional manipulation',
      'over-eating',
    ],
    tone: 'Soft, healing, and protective. Growth comes through home, family, emotional safety, and nurturing what matters.',
  },
  // 2026
  {
    id: 'saturn-return-2026',
    year: 2026,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2026',
    dates: 'All year (for those born ~1996-1997)',
    signs: ['Pisces', 'Aries'],
    description:
      'In 2026, Saturn transitions from Pisces to Aries. Those born in late 1996-1997 experience their Saturn Return, a major life transition around age 29-30.',
    themes: ['new beginnings', 'identity', 'independence', 'taking charge'],
    doList: [
      'define your identity',
      'take leadership',
      'start new ventures',
      'be courageous',
    ],
    avoidList: ['recklessness', 'impatience', 'selfishness', 'burning bridges'],
    tone: ' Brave and clarifying. This transit pushes you to define yourself, lead your life, and commit to a new chapter.',
  },
  {
    id: 'jupiter-cancer-2026',
    year: 2026,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Cancer 2026',
    dates: 'Until June 30, 2026',
    signs: ['Cancer'],
    description:
      'Jupiter continues its exalted position in Cancer through the first half of 2026, blessing family matters, home investments, and emotional healing.',
    themes: [
      'family expansion',
      'home blessings',
      'emotional abundance',
      'nurturing',
    ],
    doList: [
      'buy property',
      'expand family',
      'heal generational patterns',
      'create sanctuary',
    ],
    avoidList: [
      'smothering',
      'living in the past',
      'emotional eating',
      'dependency',
    ],
    tone: 'Supportive and restorative. Emotional confidence grows when you prioritise home, care, and steady inner security.',
  },
  {
    id: 'jupiter-leo-2026',
    year: 2026,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Leo 2026',
    dates: 'June 30, 2026 - July 2027',
    signs: ['Leo'],
    description:
      'Jupiter enters Leo in mid-2026, bringing expansion to creativity, self-expression, and romance. This transit favors artists, performers, and those embracing their authentic selves.',
    themes: ['creativity', 'romance', 'self-expression', 'joy'],
    doList: ['create boldly', 'romance', 'perform', 'celebrate yourself'],
    avoidList: ['arrogance', 'drama', 'overspending', 'vanity'],
    tone: 'Joyful and bold. Confidence expands when you create, perform, love loudly, and stop shrinking your light.',
  },
  {
    id: 'saturn-second-cycle-2026',
    year: 2026,
    planet: 'Saturn',
    transitType: 'Saturn Square',
    title: 'Saturn Second Square 2026',
    dates: 'March 2026 - August 2026 (for those born ~1985-1989)',
    signs: ['Aries', 'Capricorn'],
    description:
      'Saturn’s second check-in hits the natal square line for people born in the mid-80s. This is about confronting ambition, discipline, and how you prove your reliability after the first return.',
    themes: ['discipline', 'maturity', 'authority', 'integration'],
    doList: [
      'review what you named as progress after your first return',
      'set clearer boundaries around work and leadership',
      'build sustainable systems rather than hustle harder',
      'lean into accountability partnerships',
    ],
    avoidList: [
      'acting out of aggression or impatience',
      'defensive perfectionism',
      'burning out while proving yourself',
      'letting fear of failure freeze movement',
    ],
    tone: 'Demanding but honest. Saturn squares ask for more maturity and steadiness, not just motion.',
  },
  // 2027
  {
    id: 'saturn-aries-2027',
    year: 2027,
    planet: 'Saturn',
    transitType: 'Saturn Transit',
    title: 'Saturn in Aries 2027',
    dates: 'All year',
    signs: ['Aries'],
    description:
      'Saturn fully commits to Aries in 2027, teaching lessons about independence, leadership, and taking mature action. This is about learning to be a responsible pioneer.',
    themes: ['leadership', 'independence', 'courage', 'discipline'],
    doList: [
      'lead responsibly',
      'take calculated risks',
      'build independence',
      'develop self-discipline',
    ],
    avoidList: ['impulsive action', 'aggression', 'selfishness', 'impatience'],
    tone: 'Disciplined fire. You are asked to act with maturity, lead with integrity, and build courage through consistency.',
  },
  {
    id: 'saturn-return-2027',
    year: 2027,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2027',
    dates: 'All year (for those born ~1998-1999)',
    signs: ['Aries'],
    description:
      'Saturn returns to its natal degree for people born in 1998-1999, making 2027 a pivotal year to confront where you have led, what you have shouldered, and who you are becoming.',
    themes: ['accountability', 'identity', 'commitment', 'leadership'],
    doList: [
      'assess long-term commitments',
      'refine your leadership style',
      'own responsibility for outcomes',
      'build structures that support growth',
    ],
    avoidList: [
      'giving up when things feel heavy',
      'acting impulsively for quick wins',
      'neglecting self-care',
      'blaming others for stalled progress',
    ],
    tone: 'Intense but steady. It asks you to see where you have fallen short, then rebuild with discipline and clarity.',
  },
  {
    id: 'saturn-opposition-2027',
    year: 2027,
    planet: 'Saturn',
    transitType: 'Saturn Opposition',
    title: 'Saturn Opposition 2027',
    dates: 'June 2027 - January 2028 (for those born ~1978-1982)',
    signs: ['Cancer', 'Capricorn'],
    description:
      'The midway opposition amplifies partnership lessons for the mid-70s cohort and those who are integrating Saturn’s second square. It mirrors how you share power, resources, and responsibility.',
    themes: ['relationships', 'balance', 'power sharing', 'accountability'],
    doList: [
      're-evaluate how you balance work and relationships',
      'say yes to mutual responsibility',
      'practice assertive but compassionate boundaries',
      'keep agreements and revise where needed',
    ],
    avoidList: [
      'standing rigid in old patterns of control',
      'ghosting or withdrawing from partnership friction',
      'sacrificing needs to keep the peace',
      'resisting honest conversations about fairness',
    ],
    tone: 'Reflective and relational. Opposition energy works best when it invites dialogue instead of blame.',
  },
  {
    id: 'uranus-taurus-2019',
    year: 2019,
    planet: 'Uranus',
    transitType: 'Uranus Transit',
    title: 'Uranus in Taurus 2019-2025',
    dates: 'March 6, 2019 - July 7, 2025',
    signs: ['Taurus'],
    description:
      'Uranus in Taurus revolutionizes finances, values, and material security. This 7-year transit brings sudden changes to how we earn, spend, and define worth. Expect disruptions in banking, agriculture, and personal resources.',
    themes: [
      'financial revolution',
      'values shift',
      'material innovation',
      'earth changes',
    ],
    doList: [
      'diversify income streams',
      'embrace financial technology',
      'reassess what you truly value',
      'stay flexible with resources',
    ],
    avoidList: [
      'rigid attachment to possessions',
      'resistance to financial change',
      'stubbornness about values',
      'ignoring new economic realities',
    ],
    tone: 'Groundbreaking and unsettling. Uranus asks you to revolutionize your relationship with money, security, and what you hold dear.',
  },
  {
    id: 'uranus-gemini-2025',
    year: 2025,
    planet: 'Uranus',
    transitType: 'Uranus Transit',
    title: 'Uranus Enters Gemini 2025',
    dates: 'July 7 - November 7, 2025 (preview)',
    signs: ['Gemini'],
    description:
      'Uranus enters Gemini for the first time on July 7, 2025, giving us a preview of its revolutionary energy in communication, technology, and information before retrograding back to Taurus in November.',
    themes: [
      'communication revolution',
      'technology',
      'information',
      'innovation',
    ],
    doList: [
      'embrace new tech',
      'learn cutting-edge skills',
      'be adaptable',
      'think differently',
    ],
    avoidList: [
      'resistance to change',
      'information overload',
      'nervous energy',
      'scattered thinking',
    ],
    tone: 'Electric and disruptive in the best way. This preview period hints at the major shifts coming when Uranus settles into Gemini permanently in 2026.',
  },
  {
    id: 'uranus-taurus-2026-retrograde',
    year: 2026,
    planet: 'Uranus',
    transitType: 'Uranus Transit',
    title: 'Uranus Returns to Taurus 2025-2026',
    dates: 'November 7, 2025 - April 26, 2026',
    signs: ['Taurus'],
    description:
      'Uranus retrogrades back into Taurus for a final review of the financial and material revolutions that began in 2019. This is the last chance to integrate lessons about values, security, and resources before Uranus moves into Gemini permanently.',
    themes: [
      'final integration',
      'financial review',
      'values completion',
      'material closure',
    ],
    doList: [
      'complete unfinished financial changes',
      'solidify new value systems',
      'release old material attachments',
      'prepare for the communication era ahead',
    ],
    avoidList: [
      'reverting to old money habits',
      'ignoring final lessons',
      'rushing closure',
      'clinging to outdated security',
    ],
    tone: 'Reflective and completing. Use this final passage to close out seven years of material revolution with intention.',
  },
  {
    id: 'uranus-gemini-2026',
    year: 2026,
    planet: 'Uranus',
    transitType: 'Uranus Transit',
    title: 'Uranus in Gemini 2026',
    dates: 'April 26, 2026 - July 2032',
    signs: ['Gemini'],
    description:
      'Uranus re-enters Gemini on April 26, 2026, beginning its long-term transit through the sign of the twins that lasts until 2032. Expect major breakthroughs in AI, media, and how we share information.',
    themes: [
      'communication revolution',
      'technology',
      'information',
      'innovation',
    ],
    doList: [
      'embrace new tech',
      'learn cutting-edge skills',
      'be adaptable',
      'think differently',
    ],
    avoidList: [
      'resistance to change',
      'information overload',
      'nervous energy',
      'scattered thinking',
    ],
    tone: 'Electric and disruptive in the best way. Expect fast change, breakthroughs, and a total upgrade in how you think and communicate.',
  },
  {
    id: 'neptune-pisces-2012',
    year: 2012,
    planet: 'Neptune',
    transitType: 'Neptune Transit',
    title: 'Neptune in Pisces 2012-2026',
    dates: 'February 3, 2012 - March 30, 2025',
    signs: ['Pisces'],
    description:
      'Neptune in its home sign of Pisces dissolves boundaries between reality and imagination. This 14-year transit has heightened collective spirituality, artistic expression, and compassion, while also bringing confusion, escapism, and idealism.',
    themes: ['spirituality', 'imagination', 'dissolution', 'compassion'],
    doList: [
      'develop spiritual practices',
      'embrace creativity',
      'practice compassion',
      'trust intuition',
    ],
    avoidList: [
      'escapism',
      'addiction',
      'denial of reality',
      'victim mentality',
    ],
    tone: 'Dreamy and transcendent. Neptune asks you to dissolve ego boundaries and connect with something greater than yourself.',
  },
  {
    id: 'neptune-aries-2025-preview',
    year: 2025,
    planet: 'Neptune',
    transitType: 'Neptune Transit',
    title: 'Neptune Enters Aries 2025',
    dates: 'March 30 - October 22, 2025 (preview)',
    signs: ['Aries'],
    description:
      'Neptune enters Aries for the first time since 1875, bringing a preview of spiritual pioneering and idealistic action before retrograding back to Pisces in October.',
    themes: [
      'spiritual courage',
      'idealistic action',
      'identity dissolution',
      'new dreams',
    ],
    doList: [
      'dream boldly',
      'pioneer spiritual paths',
      'act on inspiration',
      'embrace new ideals',
    ],
    avoidList: [
      'impulsive escapism',
      'identity confusion',
      'aggressive idealism',
      'spiritual bypassing',
    ],
    tone: 'Pioneering and visionary. This preview hints at the collective spiritual awakening and identity shifts coming in the years ahead.',
  },
  {
    id: 'neptune-aries-2026',
    year: 2026,
    planet: 'Neptune',
    transitType: 'Neptune Transit',
    title: 'Neptune in Aries 2026',
    dates: 'January 26, 2026 - March 2039',
    signs: ['Aries'],
    description:
      'Neptune settles into Aries for a 13-year transit that will redefine collective spirituality, identity, and idealism. Expect new spiritual movements, visionary leaders, and a generation inspired to act on their dreams.',
    themes: [
      'spiritual pioneering',
      'visionary action',
      'identity transcendence',
      'new ideals',
    ],
    doList: [
      'act on spiritual inspiration',
      'pioneer new paths',
      'embrace visionary leadership',
      'dissolve limiting self-concepts',
    ],
    avoidList: [
      'spiritual ego',
      'impulsive idealism',
      'identity confusion',
      'aggression masked as enlightenment',
    ],
    tone: 'Bold and transcendent. Neptune in Aries asks you to dream courageously and act on your highest vision.',
  },
  {
    id: 'saturn-return-2028',
    year: 2028,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2028',
    dates: 'All year (for those born ~1999-2000)',
    signs: ['Aries'],
    description:
      'Saturn continues its return for the late 1990s cohort as it finishes its journey through Aries, urging a final pass on identity, discipline, and the responsibilities you are ready to own.',
    themes: ['responsibility', 'maturity', 'integration', 'discipline'],
    doList: [
      'clarify long-term goals',
      'reaffirm commitments to yourself',
      'integrate lessons from the past few years',
      'lean into steady structures instead of quick fixes',
    ],
    avoidList: [
      'overworking without rest',
      'ignoring lessons from authority figures',
      'impulsive shifts in direction',
      'defensive reactions to feedback',
    ],
    tone: 'Steady and clarifying. This year rewards those who take a disciplined, patient approach to the life they are building.',
  },
  {
    id: 'saturn-second-square-2028',
    year: 2028,
    planet: 'Saturn',
    transitType: 'Saturn Square',
    title: 'Saturn Second Square 2028',
    dates: 'February 2028 - August 2028 (for those born ~1971-1975)',
    signs: ['Capricorn', 'Scorpio'],
    description:
      'The square returns one last time before the next Saturn return, nudging the late-60s and early-70s cohort to integrate leadership lessons, soften rigidity, and lean into more grounded, patient authority.',
    themes: ['integration', 'wisdom', 'boundaries', 'service'],
    doList: [
      'slow down to listen before reacting',
      'support the next generation with steadiness',
      'hold space for rest without guilt',
      'rewrite hard rules that no longer serve others',
    ],
    avoidList: [
      'cling to outdated power plays',
      'burn out proving relevance',
      'isolating to avoid pressure',
      'minimizing vulnerability for the sake of control',
    ],
    tone: 'Calmer than the first square but still firm. Use this time to finish what Saturn asked for and leave space for renewal.',
  },
  // 2028
  {
    id: 'jupiter-virgo-2028',
    year: 2028,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Virgo 2028',
    dates: 'July 2027 - August 2028',
    signs: ['Virgo'],
    description:
      'Jupiter in Virgo brings expansion through service, health, and practical improvement. This transit favors those in healthcare, wellness, and service industries.',
    themes: ['health', 'service', 'improvement', 'practical growth'],
    doList: [
      'optimize health',
      'serve others',
      'improve skills',
      'organize life',
    ],
    avoidList: ['perfectionism', 'over-analysis', 'criticism', 'workaholism'],
    tone: 'Practical and improving. Progress comes through routines, skill-building, health, and small changes that compound.',
  },
  // 2028
  {
    id: 'saturn-taurus-2028',
    year: 2028,
    planet: 'Saturn',
    transitType: 'Saturn Transit',
    title: 'Saturn Enters Taurus 2028',
    dates: 'April 12-14, 2028 onwards',
    signs: ['Taurus'],
    description:
      'Saturn enters Taurus in April 2028, bringing lessons about finances, values, and material security. This transit teaches sustainable wealth-building and lasts until May 2030.',
    themes: ['finances', 'values', 'security', 'sustainability'],
    doList: [
      'build savings',
      'define values',
      'create stability',
      'invest wisely',
    ],
    avoidList: [
      'overspending',
      'stubbornness',
      'materialism',
      'resistance to change',
    ],
    tone: 'Grounding and reality-based. It is time to stabilise money, values, and long-term security through patience and structure.',
  },
  // 2029
  {
    id: 'saturn-taurus-2029',
    year: 2029,
    planet: 'Saturn',
    transitType: 'Saturn Transit',
    title: 'Saturn in Taurus 2029',
    dates: 'All year (continuing from April 2028)',
    signs: ['Taurus'],
    description:
      'Saturn continues its journey through Taurus in 2029, deepening lessons about finances, values, and material security that began in April 2028.',
    themes: ['finances', 'values', 'security', 'sustainability'],
    doList: [
      'build savings',
      'define values',
      'create stability',
      'invest wisely',
    ],
    avoidList: [
      'overspending',
      'stubbornness',
      'materialism',
      'resistance to change',
    ],
    tone: 'Grounding and reality-based. It is time to stabilise money, values, and long-term security through patience and structure.',
  },
  {
    id: 'saturn-return-2029',
    year: 2029,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2029',
    dates: 'All year (for those born ~1999-2000)',
    signs: ['Taurus'],
    description:
      'The 1999/2000 birth cohort hits Saturn Return as Saturn moves through Taurus, demanding a sober review of finances, values, and how secure your routines really are.',
    themes: ['responsibility', 'stability', 'values', 'financial maturity'],
    doList: [
      'audit your spending and savings plans',
      'commit to long-term structures',
      'choose people and work that reinforce your values',
      'make decisions from patience rather than fear',
    ],
    avoidList: [
      'rushing financial fixes',
      'overcommitting before feeling secure',
      'neglecting self-worth for safety nets',
      'letting others set your worth',
    ],
    tone: 'Sober and grounding. Saturn asks for slow, steady steps that keep your resources and self-respect intact.',
  },
  // 2030
  {
    id: 'saturn-return-2030',
    year: 2030,
    planet: 'Saturn',
    transitType: 'Saturn Return',
    title: 'Saturn Return 2030',
    dates: 'Until May 2030 (for those born ~2000-2001)',
    signs: ['Taurus'],
    description:
      'Saturn finishes its journey through Taurus in May 2030, completing the return for people born in 2000-2001 and wrapping up lessons about values, security, and personal worth.',
    themes: ['integration', 'boundaries', 'security', 'personal worth'],
    doList: [
      'complete any commitments you promised yourself',
      'set boundaries that protect your time and resources',
      'lean into slow growth instead of quick wins',
      'track how you define success and reshape it if needed',
    ],
    avoidList: [
      'defaulting to old patterns that no longer serve you',
      'confusing busyness for progress',
      'allowing others to erode your boundaries',
      'underpricing the value you bring',
    ],
    tone: 'Clarifying and wrapping up. This year ties loose ends so you can enter the next Saturn cycle with confidence.',
  },
  {
    id: 'saturn-gemini-2030',
    year: 2030,
    planet: 'Saturn',
    transitType: 'Saturn Transit',
    title: 'Saturn Enters Gemini 2030',
    dates: 'May 31, 2030 onwards',
    signs: ['Gemini'],
    description:
      'Saturn enters Gemini on May 31, 2030, shifting lessons to communication, learning, and mental discipline. This transit teaches structured thinking and responsible information sharing.',
    themes: ['communication', 'learning', 'mental discipline', 'teaching'],
    doList: [
      'develop communication skills',
      'commit to learning',
      'write and teach',
      'think before speaking',
    ],
    avoidList: [
      'scattered thinking',
      'gossip',
      'superficial knowledge',
      'nervous anxiety',
    ],
    tone: 'Focused and intellectually grounding. Saturn asks you to deepen your knowledge and communicate with integrity.',
  },
  {
    id: 'jupiter-libra-2030',
    year: 2030,
    planet: 'Jupiter',
    transitType: 'Jupiter Transit',
    title: 'Jupiter in Libra 2030',
    dates: 'Late 2029 - Late 2030',
    signs: ['Libra'],
    description:
      'Jupiter in Libra expands relationships, partnerships, and justice. This transit favors marriage, legal matters, and collaborative ventures.',
    themes: ['relationships', 'partnership', 'justice', 'balance'],
    doList: ['partner up', 'seek balance', 'legal matters', 'beautify'],
    avoidList: [
      'codependency',
      'indecision',
      'people-pleasing',
      'superficiality',
    ],
    tone: 'Harmonising and partnership-focused. Expansion comes through collaboration, commitment, and choosing relationships that feel balanced.',
  },
  {
    id: 'saturn-square-2033',
    year: 2033,
    planet: 'Saturn',
    transitType: 'Saturn Square',
    title: 'Saturn First Square 2033',
    dates: 'April 2033 - September 2033 (for those born ~1984-1987)',
    signs: ['Capricorn', 'Libra'],
    description:
      'Saturn hits the first square to its natal position, stirring tension between what you built in your thirties and the new standards you are being asked to meet. Regardless of your chart, this is about recalibrating authority, responsibility, and integrity.',
    themes: [
      'responsibility',
      'boundary testing',
      'recalibration',
      'authority',
    ],
    doList: [
      'review your structures',
      'set clearer boundaries',
      'honour authority while staying authentic',
      'lean into disciplined creativity',
    ],
    avoidList: [
      'defensive overreaction',
      'sacrifice of integrity for approval',
      'burning out trying to control everything',
      'reactive leadership',
    ],
    tone: 'Demanding yet clarifying. This square forces you to confront what you have outgrown and gently nudges you toward more mature authority.',
  },
  {
    id: 'saturn-opposition-2040',
    year: 2040,
    planet: 'Saturn',
    transitType: 'Saturn Opposition',
    title: 'Saturn Opposition 2040',
    dates: 'May 2040 - December 2040 (for those born ~1975-1977)',
    signs: ['Cancer', 'Capricorn'],
    description:
      'Saturn opposes its natal position, spotlighting relationships, partnerships, and how you share responsibility. This is a mirror moment; you are asked to balance your needs with the needs of others without compromising your maturity.',
    themes: ['relationships', 'power balance', 'commitment', 'integration'],
    doList: [
      're-evaluate how you share power',
      'strengthen communication in partnerships',
      'stay accountable to agreements',
      'practice compassionate detachment',
    ],
    avoidList: [
      'co-dependent patterns',
      'letting fear of change block commitment',
      'overcorrecting or withdrawing completely',
      'shaming yourself for needing support',
    ],
    tone: 'Reflective and relational. Balance is the key; ask what you are ready to build together and where you still need to stand alone.',
  },
  {
    id: 'saturn-square-2048',
    year: 2048,
    planet: 'Saturn',
    transitType: 'Saturn Square',
    title: 'Saturn Second Square 2048',
    dates: 'January 2048 - July 2048 (for those born ~1967-1969)',
    signs: ['Scorpio', 'Aquarius'],
    description:
      'The second square arrives as Saturn approaches its return, asking for integration of the lessons that unfolded earlier in this cycle. Authority, transformation, and collective responsibility are themes to honour before the next cycle begins.',
    themes: [
      'integration',
      'transformation',
      'collective responsibility',
      'inner authority',
    ],
    doList: [
      'ease up on perfectionism',
      'mentor the next generation',
      'rebuild structures with wisdom',
      'prioritize rest alongside discipline',
    ],
    avoidList: [
      'resisting evolution',
      'clinging to the burnout-era hustle',
      'isolation out of fear',
      'ignoring the system-level shifts already underway',
    ],
    tone: 'Strong but sensible. Step back from proving yourself and lean into generous leadership that steadies others.',
  },
];

export function getTransitsForYear(year: number): YearlyTransit[] {
  return YEARLY_TRANSITS.filter((t) => t.year === year);
}

export function generateAllTransitParams(): { transit: string }[] {
  return YEARLY_TRANSITS.map((t) => ({ transit: t.id }));
}

export function generateTransitYears(): number[] {
  return Array.from(new Set(YEARLY_TRANSITS.map((t) => t.year))).sort(
    (a, b) => a - b,
  );
}
