/**
 * generate-yearly-transits.ts
 *
 * Reads slow-planet-sign-changes.json (astronomy-engine source of truth) and
 * produces src/constants/seo/yearly-transits-generated.ts.
 *
 * Run with:  tsx scripts/generate-yearly-transits.ts
 *
 * What this produces:
 *  - One YearlyTransit entry per outer-planet ingress (Jupiter, Saturn, Uranus,
 *    Neptune, Pluto) derived purely from the JSON.
 *  - Retrograde re-entries (planet briefly dips back into a prior sign) are
 *    flagged with transitType "Retrograde Re-entry" and an "-retrograde-{year}"
 *    suffix on the id.
 *  - Segments shorter than 14 days are skipped (short retrograde dips with no
 *    meaningful interpretive weight).
 *  - All hand-written special entries (conjunctions, eclipses, Saturn cycles,
 *    fast-planet retrogrades) from the existing file are preserved verbatim in
 *    the output.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Segment {
  start: string;
  end: string;
}

interface SlowPlanetData {
  generated: string;
  scanRange: { start: string; end: string };
  segments: Record<string, Record<string, Segment[]>>;
}

interface YearlyTransit {
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
  startDate?: Date;
  endDate?: Date;
}

// ---------------------------------------------------------------------------
// Planet × Sign content lookup
// ---------------------------------------------------------------------------

const PLANET_SIGN_CONTENT: Record<
  string,
  {
    description: string;
    themes: string[];
    doList: string[];
    avoidList: string[];
    tone: string;
  }
> = {
  // ── Jupiter ──────────────────────────────────────────────────────────────
  'Jupiter-Aries': {
    description:
      'Jupiter in Aries ignites bold ambition and the courage to start fresh. This fire-on-fire transit supercharges self-belief, entrepreneurial spirit, and the willingness to lead. New ventures launched now carry an unusually strong tailwind, and breakthroughs come to those who act first rather than wait.',
    themes: ['bold beginnings', 'entrepreneurship', 'leadership', 'courage'],
    doList: [
      'launch projects you have been sitting on',
      'step into leadership roles',
      'take calculated risks',
      'champion your ideas loudly',
    ],
    avoidList: [
      'impulsive overcommitment',
      'steamrolling others',
      'starting without a plan',
      'burning bridges for speed',
    ],
    tone: 'Charged and pioneering. Fortune rewards the bold who back their instincts with follow-through.',
  },
  'Jupiter-Taurus': {
    description:
      'Jupiter in Taurus slows the pace of expansion and deepens it. Growth comes through patience, sensory pleasure, and building material security over time. Real estate, creative arts, sustainable business, and anything rooted in the earth all benefit from this steady, abundant transit.',
    themes: ['material abundance', 'patience', 'values', 'steady growth'],
    doList: [
      'invest in property or long-term assets',
      'develop creative skills',
      'build savings and financial resilience',
      'enjoy simple pleasures without guilt',
    ],
    avoidList: [
      'overindulgence and excess',
      'stubborn refusal to adapt',
      'hoarding resources out of fear',
      'ignoring change signals',
    ],
    tone: 'Lush and grounding. The universe rewards those who plant seeds, tend them steadily, and trust the harvest.',
  },
  'Jupiter-Gemini': {
    description:
      'Jupiter in Gemini multiplies ideas, connections, and opportunities at speed. This transit is golden for writers, educators, marketers, and anyone whose business runs on communication. The risk is doing too much at once; the gift is being able to see more angles than ever.',
    themes: ['communication', 'learning', 'networking', 'curiosity'],
    doList: [
      'write and publish widely',
      'learn new skills and share them',
      'network with intention',
      'explore ideas without over-committing',
    ],
    avoidList: [
      'shallow dabbling without depth',
      'overloading your schedule',
      'spreading unverified information',
      'gossip and empty chatter',
    ],
    tone: 'Bright, busy, and curious. The more you communicate and connect, the more doors open.',
  },
  'Jupiter-Cancer': {
    description:
      "Jupiter in Cancer is one of its most nourishing placements — Cancer is Jupiter's sign of exaltation. This transit expands home, family, emotional security, and the ability to nurture yourself and others into genuine abundance. Real estate, family life, and healing all flourish.",
    themes: ['home expansion', 'family', 'emotional healing', 'nurturing'],
    doList: [
      'invest in your home environment',
      'strengthen family and close bonds',
      'heal old emotional patterns',
      'create spaces of safety and belonging',
    ],
    avoidList: [
      'smothering others with care',
      'living entirely in the past',
      'emotional over-eating',
      'fostering unhealthy dependency',
    ],
    tone: 'Warm and restorative. Growth comes through emotional openness, domestic investment, and radical self-nurturing.',
  },
  'Jupiter-Leo': {
    description:
      'Jupiter in Leo turns up the volume on creativity, self-expression, romance, and the sheer joy of being alive. Artists, performers, leaders, and anyone stepping into a more visible role receive a significant boost. The key is generosity — Jupiter in Leo gives most to those who share their light rather than hoard it.',
    themes: ['creativity', 'self-expression', 'romance', 'joyful visibility'],
    doList: [
      'create and share boldly',
      'pursue romance and passion',
      'lead with warmth and generosity',
      'own and celebrate your achievements',
    ],
    avoidList: [
      'arrogance and superiority',
      'drama and ego clashes',
      'lavish overspending',
      'seeking validation over genuine connection',
    ],
    tone: 'Radiant and generous. Confidence compounds when you create authentically and let others bask in your energy.',
  },
  'Jupiter-Virgo': {
    description:
      'Jupiter in Virgo expands through precision, improvement, and devoted service. Health, wellness, craft, and systems thinking all benefit from this industrious transit. Progress may feel slow compared to flashier Jupiter positions, but the gains made here are thorough and lasting.',
    themes: ['health', 'service', 'skill mastery', 'practical improvement'],
    doList: [
      'overhaul health and wellness routines',
      'master your craft or trade',
      'offer genuine service and build reputation',
      'organise systems that support long-term growth',
    ],
    avoidList: [
      'perfectionism that prevents completion',
      'over-analysis and worry',
      'martyrdom through endless service',
      'dismissing the big picture for tiny details',
    ],
    tone: 'Diligent and improving. The gains are earned through care, not luck — and they compound beautifully.',
  },
  'Jupiter-Libra': {
    description:
      'Jupiter in Libra expands partnerships, diplomacy, and the pursuit of fairness. This transit blesses legal matters, marriage, creative collaborations, and anything that requires balanced negotiation. Growth comes through others — the more you invest in healthy partnerships, the more Jupiter returns.',
    themes: ['partnerships', 'harmony', 'justice', 'creative collaboration'],
    doList: [
      'invest meaningfully in key relationships',
      'pursue legal matters or contracts',
      'collaborate on creative ventures',
      'seek fairness and reciprocity in all dealings',
    ],
    avoidList: [
      'people-pleasing at your own expense',
      'chronic indecision',
      'codependent dynamics',
      'prioritising appearances over substance',
    ],
    tone: 'Harmonising and collaborative. Expansion flows through others when the exchange is genuinely balanced.',
  },
  'Jupiter-Scorpio': {
    description:
      'Jupiter in Scorpio plunges expansion into depth, transformation, and hidden power. Inheritance, shared finances, sexuality, psychological insight, and occult knowledge all intensify. The rewards are profound but require willingness to go where others fear to look.',
    themes: [
      'transformation',
      'depth',
      'shared resources',
      'psychological insight',
    ],
    doList: [
      'commit to deep self-inquiry',
      'pursue joint financial opportunities',
      'release what has outlived its purpose',
      'harness focus for transformational projects',
    ],
    avoidList: [
      'manipulation and power games',
      'obsessive jealousy',
      'financial secrecy that undermines trust',
      'avoiding the emotional depths that hold your answers',
    ],
    tone: 'Intense and revealing. The greatest gains come to those willing to excavate what others leave buried.',
  },
  'Jupiter-Sagittarius': {
    description:
      'Jupiter rules Sagittarius, making this its most natural and optimistic placement. Philosophy, higher education, international travel, publishing, and spiritual seeking all receive a magnificent boost. The world feels expansive and full of possibility — use this window to pursue your biggest visions.',
    themes: ['philosophy', 'higher learning', 'travel', 'spiritual expansion'],
    doList: [
      'travel and experience different cultures',
      'pursue higher education or advanced study',
      'publish and share your worldview',
      'commit to a meaningful belief system',
    ],
    avoidList: [
      'reckless excess and overindulgence',
      'dogmatic preaching',
      'promising more than you can deliver',
      'glossing over practical details',
    ],
    tone: 'Boundlessly optimistic. This is Jupiter at home — dream as big as you dare and back it with honest effort.',
  },
  'Jupiter-Capricorn': {
    description:
      "Jupiter in Capricorn is in its detriment, but this doesn't mean hardship — it means expansion through discipline and earned achievement. Success comes to those who plan carefully, honour their ambitions with hard work, and build structures designed to last rather than impress.",
    themes: ['ambition', 'discipline', 'earned success', 'long-term planning'],
    doList: [
      'set ambitious but structured long-term goals',
      'pursue career advancement through merit',
      'build systems and institutions that endure',
      'partner with experienced mentors',
    ],
    avoidList: [
      'cutting corners to reach the top faster',
      'cynicism that blocks opportunity',
      'rigid adherence to status quo rules',
      'putting wealth above ethics',
    ],
    tone: 'Sober and ambitious. The rewards here are real, substantial, and built to last — patience is the price.',
  },
  'Jupiter-Aquarius': {
    description:
      'Jupiter in Aquarius expands collective thinking, social innovation, and the vision of a better future for all. Technology, community, humanitarian causes, and unconventional ideas thrive. The best outcomes arise from collaborative efforts that value the group over the individual ego.',
    themes: ['innovation', 'community', 'humanitarian vision', 'technology'],
    doList: [
      'invest in community and collective projects',
      'embrace unconventional solutions',
      'use technology to connect and serve',
      'champion causes bigger than personal gain',
    ],
    avoidList: [
      'detached intellectual superiority',
      'rebellion without a constructive alternative',
      'ignoring emotional needs for the sake of ideals',
      'groupthink masquerading as community',
    ],
    tone: 'Visionary and progressive. Jupiter rewards those who think beyond themselves and build toward shared flourishing.',
  },
  'Jupiter-Pisces': {
    description:
      "Jupiter co-rules Pisces, making this a deeply potent placement for spiritual growth, artistic expression, compassion, and intuitive insight. Boundaries dissolve beautifully here — both personal limitations and the walls between self and others. It's an extraordinary transit for healing, creativity, and acts of selfless generosity.",
    themes: ['spirituality', 'compassion', 'artistic expression', 'intuition'],
    doList: [
      'deepen meditation and spiritual practice',
      'create from your innermost vision',
      'offer healing and compassionate service',
      'trust your intuitive knowing',
    ],
    avoidList: [
      'escapism through substances or fantasy',
      'martyrdom through boundless self-sacrifice',
      'gullibility and spiritual naivety',
      'avoiding practical responsibilities',
    ],
    tone: 'Transcendent and compassionate. The most meaningful growth happens when you dissolve into something larger than yourself.',
  },

  // ── Saturn ────────────────────────────────────────────────────────────────
  'Saturn-Capricorn': {
    description:
      'Saturn in its home sign of Capricorn is authority in its purest form — demanding, fair, and ultimately rewarding. This transit calls for serious commitment to career, reputation, and the structures you inhabit. Those who apply patient discipline will find lasting achievements; those who cut corners will be found out.',
    themes: [
      'career ambition',
      'reputation',
      'discipline',
      'structural integrity',
    ],
    doList: [
      'commit to long-term professional goals',
      'build your reputation through consistent work',
      'take responsibility at every level',
      'construct systems that outlast you',
    ],
    avoidList: [
      'climbing at any ethical cost',
      'cold ambition without humanity',
      'rigidity disguised as professionalism',
      'sacrificing relationships for career',
    ],
    tone: 'Demanding and clarifying. Saturn in Capricorn rewards the builders who play the long game with integrity.',
  },
  'Saturn-Aquarius': {
    description:
      "Saturn in its modern rulership of Aquarius restructures society, technology, and collective responsibility. This transit asks institutions to reform rather than collapse. Individuals are challenged to balance personal freedom with communal duty — the structures we build now will shape the next generation's world.",
    themes: [
      'social reform',
      'technology governance',
      'collective responsibility',
      'innovation within structure',
    ],
    doList: [
      'build fair, durable institutions',
      'use technology as a responsible tool',
      'commit to communities that share your values',
      'balance idealism with pragmatic systems',
    ],
    avoidList: [
      'anarchic disruption without a plan',
      'cold detachment from human cost',
      'technocratic solutions that ignore people',
      'group pressure that stifles individuality',
    ],
    tone: 'Progressive and structured. Saturn asks us to build the future we want with honesty about what structures it will take.',
  },
  'Saturn-Pisces': {
    description:
      'Saturn in Pisces asks the dreamer to grow up without losing the dream. This transit tests spiritual resilience, creative discipline, and the ability to build real foundations for intangible visions. It is also a time of karmic reckoning around compassion, healing, and what we have sacrificed or denied.',
    themes: [
      'spiritual discipline',
      'creative structure',
      'karmic reckoning',
      'boundaries with compassion',
    ],
    doList: [
      'build practical frameworks for creative visions',
      'commit to regular spiritual practice',
      'set compassionate but firm boundaries',
      'face what you have been avoiding through fantasy',
    ],
    avoidList: [
      'escapism through substances or avoidance',
      'martyrdom disguised as spirituality',
      "taking on others' karma without discernment",
      'sacrificing your needs to maintain illusions',
    ],
    tone: 'Sobering and sacred. Saturn asks the mystic to do the work — the dreams that survive this transit are the ones worth having.',
  },
  'Saturn-Aries': {
    description:
      'Saturn in Aries demands that boldness be earned and action be responsible. Impulse without structure is punished; disciplined courage is rewarded. This transit teaches the lessons of mature leadership — how to initiate without burning others, and how to compete without losing integrity.',
    themes: [
      'disciplined courage',
      'mature leadership',
      'accountability',
      'identity construction',
    ],
    doList: [
      'take leadership roles with full accountability',
      'build self-discipline into your daily practice',
      'act decisively but with considered planning',
      'own the consequences of your choices',
    ],
    avoidList: [
      'reckless impulsivity',
      'aggression framed as ambition',
      'blame-shifting when plans fail',
      'starting more than you can finish',
    ],
    tone: 'Firm and formative. Saturn in Aries forges leaders through consequence — not punishment, but honest feedback.',
  },
  'Saturn-Taurus': {
    description:
      'Saturn in Taurus restructures your relationship with money, resources, and personal values. Financial security must be earned through long-term thinking, not short-term comfort. This transit rewards steady saving, genuine skill development, and building something tangible that holds its value over time.',
    themes: [
      'financial discipline',
      'material security',
      'values clarity',
      'sustainable building',
    ],
    doList: [
      'build long-term savings and financial resilience',
      'invest in skills with lasting market value',
      'reassess what you genuinely value vs what you desire',
      'create sustainable material structures',
    ],
    avoidList: [
      'luxury spending that masks insecurity',
      'hoarding out of scarcity mindset',
      'stubbornness about outdated financial methods',
      'overworking for comfort without meaning',
    ],
    tone: 'Grounding and clarifying. Real security is built through discipline, not speed — Saturn in Taurus makes sure you learn that.',
  },
  'Saturn-Gemini': {
    description:
      'Saturn in Gemini disciplines the mind, demanding that communication be clear, informed, and purposeful. This transit rewards writers, teachers, and thinkers who do the real intellectual work. Superficial knowledge is penalised; deep, applied expertise is cultivated and recognised.',
    themes: [
      'intellectual discipline',
      'communication mastery',
      'teaching',
      'mental focus',
    ],
    doList: [
      'develop genuine expertise in your field',
      'commit to long-form writing and clear communication',
      'mentor and teach what you know',
      'slow down your thinking to think more accurately',
    ],
    avoidList: [
      'spreading misinformation or half-formed ideas',
      'scattered thinking across too many topics',
      'gossip and empty conversation',
      'avoiding difficult intellectual work',
    ],
    tone: 'Focused and intellectually demanding. Saturn in Gemini rewards those who think deeply, speak honestly, and teach with integrity.',
  },
  'Saturn-Cancer': {
    description:
      'Saturn in Cancer is one of its more emotionally demanding placements, asking you to build security from the inside out rather than seeking it from others. This transit tests family structures, home stability, and emotional resilience. The lesson is self-sufficiency — creating your own emotional foundation without abandoning vulnerability.',
    themes: [
      'emotional resilience',
      'family responsibility',
      'inner security',
      'domestic structure',
    ],
    doList: [
      'build emotional independence without closing down',
      'take responsibility for your family structures',
      'create stable, nurturing home environments',
      'face childhood wounds with mature compassion',
    ],
    avoidList: [
      'emotional withdrawal disguised as strength',
      'using family obligation to avoid personal growth',
      'expecting others to provide the security only you can build',
      'clinging to the past to avoid present responsibility',
    ],
    tone: 'Tender but demanding. Saturn in Cancer teaches that real safety comes from within — and is built through honest emotional work.',
  },
  'Saturn-Leo': {
    description:
      'Saturn in Leo tests the authenticity of how you shine. True self-expression must be earned through consistent creative practice, not performed for validation. This transit challenges leaders, artists, and visionaries to build something that outlasts their ego — work driven by genuine mastery rather than the need to be seen.',
    themes: [
      'authentic self-expression',
      'creative discipline',
      'ego integration',
      'responsible leadership',
    ],
    doList: [
      'commit to long-term creative projects',
      'lead with generosity rather than ego',
      'build a body of work that reflects genuine growth',
      'earn recognition through substance, not performance',
    ],
    avoidList: [
      'seeking approval at the cost of integrity',
      'creative entitlement without effort',
      'leadership that prioritises status over service',
      'grandiosity masking self-doubt',
    ],
    tone: 'Disciplined and dignified. Saturn in Leo says: earn your spotlight through craft and integrity, and it will last.',
  },
  'Saturn-Virgo': {
    description:
      'Saturn in Virgo intensifies the pursuit of perfection in ways that can either refine or paralyse. This transit rewards mastery, methodical improvement, and dedicated service. Health routines, work systems, and professional craft all come under scrutiny — and those who respond with diligent refinement rather than anxious self-criticism will thrive.',
    themes: [
      'mastery',
      'methodical improvement',
      'health discipline',
      'practical service',
    ],
    doList: [
      'audit and improve your key systems and processes',
      'commit to health routines with consistency',
      'develop specialised, in-demand expertise',
      'offer service that solves real problems',
    ],
    avoidList: [
      'perfectionism that prevents all action',
      'hypercritical self-judgment',
      'anxious overwork without strategic direction',
      'micromanaging others instead of leading',
    ],
    tone: 'Precise and demanding. Saturn in Virgo rewards those who do the quiet, disciplined work of genuine mastery.',
  },
  'Saturn-Libra': {
    description:
      'Saturn is exalted in Libra, making this one of its most constructive placements. Relationships, contracts, and the pursuit of fairness come under serious evaluation. This transit demands that partnerships be built on honest, mutual foundations — and removes those that are merely convenient or comfortable.',
    themes: [
      'relationship integrity',
      'justice',
      'commitment',
      'balanced responsibility',
    ],
    doList: [
      'formalise important relationships through commitment',
      'pursue legal matters and contractual clarity',
      'practice fair, reciprocal partnership',
      'build diplomatic skills for difficult conversations',
    ],
    avoidList: [
      'staying in relationships out of fear of being alone',
      'legalistic rigidity that kills connection',
      'sacrificing your needs for false harmony',
      'avoiding necessary confrontations indefinitely',
    ],
    tone: 'Fair and formative. Saturn exalted in Libra builds the partnerships worth keeping — through honesty, commitment, and mutual respect.',
  },

  // ── Uranus ────────────────────────────────────────────────────────────────
  'Uranus-Taurus': {
    description:
      'Uranus in Taurus revolutionises money, material security, and the very concept of value. Over its seven-year transit, cryptocurrency, regenerative agriculture, land reform, and radical shifts in how we earn and own all emerge. Expect the unexpected in finances and a reawakening of what truly matters.',
    themes: [
      'financial revolution',
      'values disruption',
      'material innovation',
      'earth transformation',
    ],
    doList: [
      'diversify income streams beyond traditional employment',
      'embrace emerging financial technologies',
      'reassess what you truly value vs what you were conditioned to want',
      'build resilience into your material foundations',
    ],
    avoidList: [
      'rigid attachment to how money has always worked',
      'resisting every financial innovation out of fear',
      'hoarding resources as a response to instability',
      'ignoring signals that the old economic model is shifting',
    ],
    tone: 'Disruptive and liberating. Uranus in Taurus rewrites the rules of ownership, value, and security — willingness to adapt is everything.',
  },
  'Uranus-Gemini': {
    description:
      'Uranus in Gemini ignites a revolution in communication, information, artificial intelligence, and how the human mind processes reality. Breakthroughs in language technology, media infrastructure, and neural science characterise this 7-year transit. Expect everything about how we share knowledge to be overhauled.',
    themes: [
      'communication revolution',
      'AI and technology',
      'information liberation',
      'cognitive evolution',
    ],
    doList: [
      'embrace new communication technologies early',
      'develop skills that are future-proof and adaptable',
      'think laterally and cross-disciplinarily',
      'champion information access and transparency',
    ],
    avoidList: [
      'clinging to outdated media and communication models',
      'information overload that creates paralysis',
      'spreading misinformation in the name of freedom',
      'anxious resistance to inevitable technological change',
    ],
    tone: 'Electric and mind-expanding. Uranus in Gemini upgrades the collective operating system — curiosity and adaptability are survival skills.',
  },
  'Uranus-Cancer': {
    description:
      'Uranus in Cancer disrupts the structures of home, family, and emotional belonging at both personal and societal levels. New models of family life, housing innovation, and collective care reshape the domestic sphere. Expect surprises around home, ancestry, and how society defines the concept of belonging.',
    themes: [
      'family reinvention',
      'housing innovation',
      'emotional liberation',
      'ancestral disruption',
    ],
    doList: [
      'experiment with alternative living and family structures',
      'release inherited emotional patterns that no longer serve',
      'explore innovative approaches to home ownership',
      'create belonging that transcends traditional family forms',
    ],
    avoidList: [
      'clinging to family structures purely out of tradition',
      'emotional instability masking as freedom',
      'uprooting everything without a grounding anchor',
      'dismissing the genuine need for security and roots',
    ],
    tone: 'Liberating and unsettling. Uranus in Cancer breaks open what home means — and invites something truer to emerge.',
  },
  'Uranus-Leo': {
    description:
      'Uranus in Leo electrifies creative expression, individuality, and the nature of fame and leadership. A generation emerges that reinvents art, performance, and how we understand charisma and celebrity. Personal freedom of expression is prized above conformity, and technology amplifies individual voices to unprecedented reach.',
    themes: [
      'creative revolution',
      'individual expression',
      'fame reimagined',
      'generational identity',
    ],
    doList: [
      'express your most authentic creative vision without apology',
      'leverage new platforms for personal expression',
      'lead in ways that inspire rather than control',
      'celebrate individuality and champion others to shine',
    ],
    avoidList: [
      'ego-driven disruption for shock value alone',
      'using creativity as rebellion without substance',
      'seeking attention at the cost of meaning',
      'suppressing your distinctiveness to fit trends',
    ],
    tone: 'Bold and revolutionary. Uranus in Leo says: your authentic self is the disruption — own it fully.',
  },

  // ── Neptune ───────────────────────────────────────────────────────────────
  'Neptune-Pisces': {
    description:
      'Neptune in its home sign of Pisces is one of the most spiritually significant transits of our era. For over a decade, collective consciousness has been dissolving boundaries between science and spirit, self and other, reality and dream. Compassion, creativity, and ecological awareness have deepened globally — alongside confusion, escapism, and the erosion of shared fact.',
    themes: [
      'spiritual awakening',
      'compassion',
      'artistic vision',
      'dissolution of barriers',
    ],
    doList: [
      'cultivate deep spiritual and contemplative practice',
      'create art that channels universal truth',
      'practise radical compassion for self and others',
      'honour intuitive knowing alongside rational thought',
    ],
    avoidList: [
      'escapism through substances, screens, or fantasy',
      'spiritual bypassing of real-world responsibilities',
      'gullibility toward manipulative ideologies',
      'victim mentality masking as sensitivity',
    ],
    tone: 'Transcendent and dissolving. Neptune in Pisces asks the collective to imagine a kinder world — and then slowly, painstakingly, build it.',
  },
  'Neptune-Aries': {
    description:
      "Neptune in Aries pioneers new spiritual identities and dissolves the old ones. For the first time since the 1860s, idealism takes on a warrior's energy — collective dreams become calls to action. Spiritual movements, identity politics, and visionary leadership all reach new intensity. The challenge is distinguishing genuine inspiration from inflated ego.",
    themes: [
      'spiritual pioneering',
      'identity transcendence',
      'visionary action',
      'idealistic courage',
    ],
    doList: [
      'act on your deepest spiritual convictions',
      'pioneer new paths in consciousness and healing',
      'lead movements rooted in genuine compassion',
      'dissolve the ego-limits that stop you from beginning',
    ],
    avoidList: [
      'aggressive idealism that bulldozes nuance',
      'identity confusion disguised as spiritual evolution',
      'spiritual ego that excludes rather than unites',
      'chasing inspiration without grounded execution',
    ],
    tone: 'Visionary and urgent. Neptune in Aries asks: what are you willing to dream into being — and brave enough to actually start?',
  },
  'Neptune-Taurus': {
    description:
      'Neptune in Taurus dissolves the boundaries of material reality, inviting a profound reimagining of wealth, nature, and the physical world. Expect new relationships between spirituality and money, AI-generated physical experiences, and a softening of the line between natural and artificial. Art, ecology, and finance all become more fluid.',
    themes: [
      'material spirituality',
      'ecological consciousness',
      'value dissolution',
      'sensory transcendence',
    ],
    doList: [
      'seek the sacred in the physical — in nature, craft, and beauty',
      'question conventional definitions of wealth and ownership',
      'build a relationship with money rooted in values, not fear',
      'create art or products that blend the tangible and the transcendent',
    ],
    avoidList: [
      'financial delusion and wishful thinking',
      'ecological denial while seeking spiritual comfort',
      'confusing luxury for spiritual fulfilment',
      'passivity around material realities that need active care',
    ],
    tone: 'Sensual and visionary. Neptune in Taurus asks us to find the sacred in the physical — and to build a world worth inhabiting.',
  },

  // ── Pluto ─────────────────────────────────────────────────────────────────
  'Pluto-Capricorn': {
    description:
      'Pluto in Capricorn transformed the structures of global power — governments, corporations, financial systems, and institutions — over a 16-year period. What could not be reformed was dismantled. The old hierarchies of the 20th century faced their reckoning, and new, more accountable forms of authority slowly emerged from the wreckage.',
    themes: [
      'power structures',
      'institutional transformation',
      'accountability',
      'systemic change',
    ],
    doList: [
      'build sustainable, ethical institutions',
      'hold power accountable at every level',
      'release structures that serve dominance over service',
      'build long-term with integrity as the foundation',
    ],
    avoidList: [
      'clinging to power past its legitimate expiry',
      'blind deference to crumbling institutions',
      'cynicism about all authority',
      'building for status rather than durability',
    ],
    tone: 'Tectonic and uncompromising. Pluto in Capricorn stripped away what was corrupt and asked us to rebuild from honest bedrock.',
  },
  'Pluto-Aquarius': {
    description:
      'Pluto in Aquarius is a 20-year transformation of collective power, technology, and what it means to be an individual within society. The last time this occurred coincided with the French and American Revolutions. Now, artificial intelligence, decentralised systems, and social movements are the vehicles of this generation-defining upheaval.',
    themes: [
      'collective transformation',
      'technological revolution',
      'social restructuring',
      'decentralised power',
    ],
    doList: [
      'engage with technology consciously and critically',
      'participate in community-building and collective action',
      'question and reform power structures that concentrate rather than distribute',
      'balance individual freedom with genuine collective responsibility',
    ],
    avoidList: [
      'blind adoption of technology without ethical consideration',
      'surrendering privacy and agency for convenience',
      'tribalism that undermines genuine solidarity',
      'extremist ideologies that promise simple solutions to complex transformations',
    ],
    tone: 'Generational and tectonic. Pluto in Aquarius does not change a year — it changes a civilisation. Every choice you make within it is part of the story.',
  },
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function durationDays(start: string, end: string): number {
  return (
    (new Date(end).getTime() - new Date(start).getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

function calendarYear(iso: string): number {
  return new Date(iso).getUTCFullYear();
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Determine whether a segment is a retrograde re-entry
//
// A segment is a retrograde re-entry when a planet briefly returns to a sign
// it was previously in. We detect this by looking at whether the planet was
// in this sign before AND the gap between the previous period in this sign
// and the current start is small (< 18 months).
// ---------------------------------------------------------------------------

function isRetrogradeDip(
  planet: string,
  sign: string,
  segIndex: number,
  allSegments: Record<string, Segment[]>,
): boolean {
  // Only the first segment per sign is a "true" ingress; anything after is
  // the planet returning (retrograde or otherwise).
  return segIndex > 0;
}

// ---------------------------------------------------------------------------
// Build YearlyTransit entries from the JSON
// ---------------------------------------------------------------------------

function buildIngressTransits(data: SlowPlanetData): YearlyTransit[] {
  const OUTER_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const MIN_DAYS = 14;
  const transits: YearlyTransit[] = [];

  // Track ids already used so we can disambiguate same-year same-sign duplicates
  const seenIds = new Map<string, number>();

  // Pre-compute the last (longest/final) segment index per planet-sign so we
  // can mark the final permanent ingress as a "settled" entry, not retrograde.
  const finalSettledIndex: Map<string, number> = new Map();
  for (const planet of OUTER_PLANETS) {
    const planetSegments = data.segments[planet];
    if (!planetSegments) continue;
    for (const [sign, segments] of Object.entries(planetSegments)) {
      // The last segment that is >= 180 days is considered the settled ingress
      let lastLongIdx = -1;
      for (let i = segments.length - 1; i >= 0; i--) {
        if (durationDays(segments[i].start, segments[i].end) >= 180) {
          lastLongIdx = i;
          break;
        }
      }
      finalSettledIndex.set(`${planet}-${sign}`, lastLongIdx);
    }
  }

  for (const planet of OUTER_PLANETS) {
    const planetSegments = data.segments[planet];
    if (!planetSegments) continue;

    for (const [sign, segments] of Object.entries(planetSegments)) {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const days = durationDays(seg.start, seg.end);

        // Skip very short dips (< MIN_DAYS)
        if (days < MIN_DAYS) continue;

        // A segment is a retrograde re-entry unless it is the first segment
        // for this sign OR it is the last long segment (the settled permanent
        // ingress, e.g. Pluto into Aquarius Nov 2024).
        const lastLong = finalSettledIndex.get(`${planet}-${sign}`) ?? -1;
        const isFirstSegment = i === 0;
        const isSettledIngress = i === lastLong && lastLong > 0;
        const retrograde = !isFirstSegment && !isSettledIngress;

        const ingressYear = calendarYear(seg.start);

        // Build base id
        const idBase = `${slugify(planet)}-${slugify(sign)}`;
        let candidateId = retrograde
          ? `${idBase}-retrograde-${ingressYear}`
          : `${idBase}-${ingressYear}`;

        // Disambiguate duplicate ids (same planet-sign-year, multiple segments)
        const count = seenIds.get(candidateId) ?? 0;
        seenIds.set(candidateId, count + 1);
        const id = count === 0 ? candidateId : `${candidateId}-b${count + 1}`;

        // Look up content
        const contentKey = `${planet}-${sign}`;
        const content = PLANET_SIGN_CONTENT[contentKey];

        if (!content) {
          console.warn(`Missing content for ${contentKey} — skipping`);
          continue;
        }

        // Build dates string relative to the ingress year
        const startDate = new Date(seg.start);
        const endDate = new Date(seg.end);
        const yearStart = new Date(`${ingressYear}-01-01T00:00:00.000Z`);
        const yearEnd = new Date(`${ingressYear + 1}-01-01T00:00:00.000Z`);

        const startInYear = startDate >= yearStart;
        const endInYear = endDate <= yearEnd;

        let dates: string;
        if (!startInYear && !endInYear) {
          dates = 'All year';
        } else if (!startInYear && endInYear) {
          dates = `Until ${formatDate(seg.end)}`;
        } else if (startInYear && !endInYear) {
          dates = `${formatDate(seg.start)} onwards`;
        } else {
          dates = `${formatDate(seg.start)} - ${formatDate(seg.end)}`;
        }

        const transitType = retrograde
          ? 'Retrograde Re-entry'
          : `${planet} Ingress`;

        const retroSuffix = retrograde ? ' (Retrograde Re-entry)' : '';
        const title = `${planet} in ${sign} ${ingressYear}${retroSuffix}`;

        transits.push({
          id,
          year: ingressYear,
          planet,
          transitType,
          title,
          dates,
          signs: [sign],
          description: content.description,
          themes: content.themes,
          doList: content.doList,
          avoidList: content.avoidList,
          tone: content.tone,
          startDate,
          endDate,
        });
      }
    }
  }

  // Sort by year then startDate
  transits.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const aTime = a.startDate?.getTime() ?? 0;
    const bTime = b.startDate?.getTime() ?? 0;
    return aTime - bTime;
  });

  return transits;
}

// ---------------------------------------------------------------------------
// Serialise a transit entry to TypeScript source
// ---------------------------------------------------------------------------

function serialiseDate(d: Date): string {
  return `new Date('${d.toISOString()}')`;
}

function serialiseStringArray(arr: string[]): string {
  return `[${arr.map((s) => `'${s.replace(/'/g, "\\'")}'`).join(', ')}]`;
}

function serialiseTransit(t: YearlyTransit, indent = '  '): string {
  const i = indent;
  const lines: string[] = [
    `${i}{`,
    `${i}  id: '${t.id}',`,
    `${i}  year: ${t.year},`,
    `${i}  planet: '${t.planet}',`,
    `${i}  transitType: '${t.transitType}',`,
    `${i}  title: '${t.title.replace(/'/g, "\\'")}',`,
    `${i}  dates: '${t.dates.replace(/'/g, "\\'")}',`,
    `${i}  signs: ${serialiseStringArray(t.signs)},`,
    `${i}  description:`,
    `${i}    '${t.description.replace(/'/g, "\\'")}',`,
    `${i}  themes: ${serialiseStringArray(t.themes)},`,
    `${i}  doList: ${serialiseStringArray(t.doList)},`,
    `${i}  avoidList: ${serialiseStringArray(t.avoidList)},`,
    `${i}  tone: '${t.tone.replace(/'/g, "\\'")}',`,
  ];

  if (t.startDate)
    lines.push(`${i}  startDate: ${serialiseDate(t.startDate)},`);
  if (t.endDate) lines.push(`${i}  endDate: ${serialiseDate(t.endDate)},`);

  lines.push(`${i}},`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Hand-written special entries preserved verbatim from yearly-transits.ts
// These are conjunctions, eclipses, Saturn cycles, and fast-planet retrogrades
// that cannot be derived from slow-planet-sign-changes.json.
// ---------------------------------------------------------------------------

const PRESERVED_SPECIAL_ENTRIES_SOURCE = `
  // ---------------------------------------------------------------------------
  // Saturn cycle entries (Saturn Returns, Squares, Oppositions) — hand-written
  // ---------------------------------------------------------------------------
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
    tone: 'Brave and clarifying. This transit pushes you to define yourself, lead your life, and commit to a new chapter.',
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
      'Saturn\\u2019s second check-in hits the natal square line for people born in the mid-80s. This is about confronting ambition, discipline, and how you prove your reliability after the first return.',
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
  {
    id: 'saturn-aries-2027',
    year: 2027,
    planet: 'Saturn',
    transitType: 'Saturn Return',
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
      'The midway opposition amplifies partnership lessons for the mid-70s cohort and those who are integrating Saturn\\u2019s second square. It mirrors how you share power, resources, and responsibility.',
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

  // ---------------------------------------------------------------------------
  // Major conjunctions
  // ---------------------------------------------------------------------------
  {
    id: 'saturn-neptune-conjunction-aries-2025',
    year: 2025,
    planet: 'Saturn',
    transitType: 'Saturn-Neptune Conjunction',
    title: 'Saturn-Neptune Conjunction in Aries 2025',
    dates: 'First pass: July 16, 2025. Exact conjunction: February 21, 2026',
    signs: ['Aries'],
    description:
      'Saturn and Neptune meet in Aries for the first time since 1989. This once-in-a-generation conjunction merges structure with dreams, discipline with imagination. The first pass on July 16 2025 sets the tone; the exact conjunction on February 21 2026 crystallises it. Both planets entering Aries together signals a collective reset in how we pursue ideals.',
    themes: [
      'merging dreams with discipline',
      'spiritual maturity',
      'idealistic action',
      'dissolving old structures',
    ],
    doList: [
      'get serious about a creative or spiritual vision',
      'build practical foundations for idealistic goals',
      'face illusions honestly',
      'commit to causes that matter',
    ],
    avoidList: [
      'escapism disguised as spirituality',
      'rigid thinking that blocks imagination',
      'expecting overnight transformation',
      'cynicism about dreams',
    ],
    tone: 'Rare and deeply meaningful. When the taskmaster meets the dreamer in the warrior sign, it is time to build something visionary with real bones.',
    startDate: new Date('2025-07-16T00:00:00Z'),
    endDate: new Date('2026-02-21T00:00:00Z'),
  },
  {
    id: 'saturn-uranus-conjunction-gemini-2032',
    year: 2032,
    planet: 'Saturn',
    transitType: 'Saturn-Uranus Conjunction',
    title: 'Saturn-Uranus Conjunction in Gemini 2032',
    dates: 'June 28, 2032',
    signs: ['Gemini'],
    description:
      'Saturn and Uranus meet in Gemini, fusing stability with revolution in the sign of communication. The last Saturn-Uranus conjunction was in 1988 in Sagittarius. This one rewrites how we structure information, education, and media. Expect breakthroughs in AI governance, communication infrastructure, and how truth is verified.',
    themes: [
      'revolutionary structure',
      'communication overhaul',
      'information integrity',
      'technological accountability',
    ],
    doList: [
      'embrace new communication systems',
      'question information structures',
      'balance innovation with reliability',
      'invest in education and literacy',
    ],
    avoidList: [
      'clinging to outdated media',
      'resisting technological change',
      'spreading unverified information',
      'fear of disruption',
    ],
    tone: 'Electric and structural. The old guard of communication meets its radical upgrade. Think less about what is said and more about how truth travels.',
    startDate: new Date('2032-06-28T00:00:00Z'),
    endDate: new Date('2032-06-28T00:00:00Z'),
  },
  {
    id: 'jupiter-neptune-conjunction-aries-2035',
    year: 2035,
    planet: 'Jupiter',
    transitType: 'Jupiter-Neptune Conjunction',
    title: 'Jupiter-Neptune Conjunction in Aries 2035',
    dates: 'March 25, 2035',
    signs: ['Aries'],
    description:
      'Jupiter and Neptune unite in Aries, expanding spiritual vision and idealistic ambition to extraordinary levels. The last Jupiter-Neptune conjunction was in Pisces in 2022. In Aries, this energy becomes active, pioneering, and personally charged. Expect a wave of visionary leadership, spiritual entrepreneurship, and collective inspiration.',
    themes: [
      'visionary expansion',
      'spiritual leadership',
      'inspired action',
      'cosmic optimism',
    ],
    doList: [
      'dream bigger than you think is reasonable',
      'launch spiritual or creative projects',
      'trust your intuition and act on it',
      'connect with communities that share your vision',
    ],
    avoidList: [
      'grandiose delusions',
      'overlooking practical details',
      'following false prophets',
      'escapism through excess',
    ],
    tone: 'Expansive and transcendent. When the planet of abundance meets the planet of dreams in the sign of new beginnings, the cosmos is giving you permission to aim impossibly high.',
    startDate: new Date('2035-03-25T00:00:00Z'),
    endDate: new Date('2035-03-25T00:00:00Z'),
  },
  {
    id: 'jupiter-pluto-conjunction-aquarius-2033',
    year: 2033,
    planet: 'Jupiter',
    transitType: 'Jupiter-Pluto Conjunction',
    title: 'Jupiter-Pluto Conjunction in Aquarius 2033',
    dates: 'February 5, 2033',
    signs: ['Aquarius'],
    description:
      'Jupiter and Pluto meet in Aquarius, amplifying collective transformation and the power of movements. The last Jupiter-Pluto conjunction was in Capricorn in 2020, coinciding with the pandemic. In Aquarius, this conjunction empowers grassroots movements, technological revolution, and radical reimagining of social structures.',
    themes: [
      'collective empowerment',
      'technological transformation',
      'social revolution',
      'power to the people',
    ],
    doList: [
      'join or lead movements aligned with your values',
      'use technology as a force for good',
      'challenge power structures that no longer serve',
      'think in terms of community, not just individual gain',
    ],
    avoidList: [
      'manipulative group dynamics',
      'technology addiction',
      'extremism in any direction',
      'losing individuality in the crowd',
    ],
    tone: 'Powerful and collective. When the amplifier meets the transformer in the sign of the people, small actions can reshape civilisation.',
    startDate: new Date('2033-02-05T00:00:00Z'),
    endDate: new Date('2033-02-05T00:00:00Z'),
  },

  // ---------------------------------------------------------------------------
  // Mercury retrogrades 2025
  // ---------------------------------------------------------------------------
  {
    id: 'mercury-retrograde-aries-2025',
    year: 2025,
    planet: 'Mercury',
    transitType: 'Mercury Retrograde',
    title: 'Mercury Retrograde in Aries March 2025',
    dates: 'March 16 - April 8, 2025',
    signs: ['Aries'],
    description:
      'Mercury stations retrograde in Aries, slowing down impulsive communication and forcing a review of how you assert yourself. In the sign of the warrior, expect misunderstandings around identity, leadership, and hasty decisions.',
    themes: [
      'communication review',
      'identity reflection',
      'impulsive errors',
      'rethinking plans',
    ],
    doList: [
      'pause before reacting',
      'revisit old conversations',
      'back up devices',
      'reflect on how you present yourself',
    ],
    avoidList: [
      'starting arguments',
      'signing contracts impulsively',
      'launching new projects',
      'assuming people understand your tone',
    ],
    tone: 'Frustrating but useful. Mercury retrograde in Aries asks you to slow down the warrior and let the thinker catch up.',
    startDate: new Date('2025-03-16T00:00:00Z'),
    endDate: new Date('2025-04-08T00:00:00Z'),
  },
  {
    id: 'mercury-retrograde-leo-2025',
    year: 2025,
    planet: 'Mercury',
    transitType: 'Mercury Retrograde',
    title: 'Mercury Retrograde in Leo July 2025',
    dates: 'July 18 - August 11, 2025',
    signs: ['Leo'],
    description:
      'Mercury retrogrades in Leo, revisiting themes of self-expression, creativity, and how you seek recognition. Drama in communication is likely -- old creative projects may resurface, and ego-driven misunderstandings need careful handling.',
    themes: [
      'creative review',
      'ego in communication',
      'self-expression',
      'past recognition',
    ],
    doList: [
      'revisit creative projects',
      'edit rather than publish',
      'reconnect with your authentic voice',
      'let go of needing validation',
    ],
    avoidList: [
      'attention-seeking behaviour',
      'dramatic public statements',
      'ignoring your creative impulses',
      'taking criticism personally',
    ],
    tone: 'Theatrical and reflective. The spotlight turns inward -- use it to refine your creative voice rather than perform.',
    startDate: new Date('2025-07-18T00:00:00Z'),
    endDate: new Date('2025-08-11T00:00:00Z'),
  },
  {
    id: 'mercury-retrograde-sagittarius-2025',
    year: 2025,
    planet: 'Mercury',
    transitType: 'Mercury Retrograde',
    title: 'Mercury Retrograde in Sagittarius November 2025',
    dates: 'November 11 - December 1, 2025',
    signs: ['Sagittarius'],
    description:
      'Mercury retrogrades in Sagittarius during the holiday season, disrupting travel plans, philosophical debates, and big-picture thinking. Beliefs you took for granted may need revisiting. International communication and publishing are especially affected.',
    themes: [
      'belief systems',
      'travel disruptions',
      'philosophical review',
      'international miscommunication',
    ],
    doList: [
      'double-check travel bookings',
      'revisit your beliefs and assumptions',
      'finish writing projects',
      'have open-minded conversations',
    ],
    avoidList: [
      'booking last-minute travel',
      'preaching your worldview',
      'publishing without editing',
      'dismissing other perspectives',
    ],
    tone: 'Expansive and clumsy. Sagittarius wants to run free but Mercury retrograde keeps tripping over the details.',
    startDate: new Date('2025-11-11T00:00:00Z'),
    endDate: new Date('2025-12-01T00:00:00Z'),
  },

  // ---------------------------------------------------------------------------
  // Venus retrograde 2025
  // ---------------------------------------------------------------------------
  {
    id: 'venus-retrograde-aries-2025',
    year: 2025,
    planet: 'Venus',
    transitType: 'Venus Retrograde',
    title: 'Venus Retrograde in Aries 2025',
    dates: 'March 3 - April 13, 2025',
    signs: ['Aries'],
    description:
      'Venus retrograde in Aries forces a deep reassessment of relationships, self-worth, and desire. In the sign of independence, expect past lovers to resurface, financial decisions to need review, and a fundamental questioning of what you truly value versus what you chase impulsively.',
    themes: [
      'relationship review',
      'self-worth',
      'desire vs need',
      'financial reassessment',
    ],
    doList: [
      'reflect on relationship patterns',
      'reassess your finances',
      'reconnect with what you genuinely value',
      'practice self-love',
    ],
    avoidList: [
      'starting new relationships',
      'major purchases',
      'cosmetic procedures',
      'ignoring red flags from the past',
    ],
    tone: 'Intense and revealing. Venus retrograde in Aries strips away the performance of love and asks what is real underneath.',
    startDate: new Date('2025-03-03T00:00:00Z'),
    endDate: new Date('2025-04-13T00:00:00Z'),
  },

  // ---------------------------------------------------------------------------
  // Mars retrograde 2024-2025
  // ---------------------------------------------------------------------------
  {
    id: 'mars-retrograde-leo-2025',
    year: 2025,
    planet: 'Mars',
    transitType: 'Mars Retrograde',
    title: 'Mars Retrograde in Leo 2024-2025',
    dates: 'December 8, 2024 - February 25, 2025',
    signs: ['Leo'],
    description:
      'Mars retrogrades in Leo, cooling the fire of ambition, anger, and drive. In the sign of creative courage, this retrograde forces a review of how you assert yourself, compete, and channel your energy. Physical energy may dip, and old frustrations can resurface for resolution.',
    themes: [
      'anger review',
      'ambition recalibration',
      'creative blocks',
      'energy management',
    ],
    doList: [
      'reflect on how you handle conflict',
      'revisit stalled projects',
      'rest and recover',
      'channel frustration into creative work',
    ],
    avoidList: [
      'picking fights',
      'overexertion',
      'starting competitive ventures',
      'suppressing anger',
    ],
    tone: 'Slow-burning and confrontational. Mars retrograde in Leo is the universe asking you to fight smarter, not louder.',
    startDate: new Date('2024-12-08T00:00:00Z'),
    endDate: new Date('2025-02-25T00:00:00Z'),
  },

  // ---------------------------------------------------------------------------
  // Eclipse seasons 2025
  // ---------------------------------------------------------------------------
  {
    id: 'eclipse-season-spring-2025',
    year: 2025,
    planet: 'Moon',
    transitType: 'Eclipse Season',
    title: 'Eclipse Season Spring 2025: Virgo-Aries',
    dates: 'March 14 - March 29, 2025',
    signs: ['Virgo', 'Aries'],
    description:
      'The spring 2025 eclipse season opens with a total lunar eclipse in Virgo on March 14 and closes with a partial solar eclipse in Aries on March 29. Lunar eclipses illuminate what needs releasing; solar eclipses open new portals. This axis highlights the tension between service and self, perfection and impulse.',
    themes: [
      'endings and beginnings',
      'service vs self',
      'letting go of perfectionism',
      'bold new starts',
    ],
    doList: [
      'journal through the eclipse window',
      'release habits that no longer serve you',
      'set intentions on the solar eclipse',
      'pay attention to what the universe removes',
    ],
    avoidList: [
      'forcing outcomes',
      'manifesting during lunar eclipses',
      'ignoring emotional signals',
      'making permanent decisions impulsively',
    ],
    tone: 'Intense and fated. Eclipse seasons accelerate change -- what needs to end, ends. What needs to begin, begins. Your job is to let it.',
    startDate: new Date('2025-03-14T00:00:00Z'),
    endDate: new Date('2025-03-29T00:00:00Z'),
  },
  {
    id: 'eclipse-season-autumn-2025',
    year: 2025,
    planet: 'Moon',
    transitType: 'Eclipse Season',
    title: 'Eclipse Season Autumn 2025: Pisces-Virgo',
    dates: 'September 7 - September 21, 2025',
    signs: ['Pisces', 'Virgo'],
    description:
      'The autumn 2025 eclipse season features a total lunar eclipse in Pisces on September 7 and a partial solar eclipse in Virgo on September 21. This season dissolves illusions while demanding practical clarity. Spiritual growth meets grounded action.',
    themes: [
      'spiritual clarity',
      'dissolving illusions',
      'practical spirituality',
      'health and healing',
    ],
    doList: [
      'release spiritual bypassing',
      'ground your intuition in action',
      'review health routines',
      'trust what is ending',
    ],
    avoidList: [
      'escapism',
      'obsessing over details',
      'resisting emotional release',
      'clinging to what the eclipse removes',
    ],
    tone: 'Mystical and cleansing. The Pisces-Virgo axis washes away what is false and asks you to build something real from what remains.',
    startDate: new Date('2025-09-07T00:00:00Z'),
    endDate: new Date('2025-09-21T00:00:00Z'),
  },
`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const jsonPath = path.resolve(
    __dirname,
    '../src/data/slow-planet-sign-changes.json',
  );
  const outPath = path.resolve(
    __dirname,
    '../src/constants/seo/yearly-transits-generated.ts',
  );

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data: SlowPlanetData = JSON.parse(raw);

  const ingressTransits = buildIngressTransits(data);

  console.log(
    `Generated ${ingressTransits.length} ingress/re-entry entries from JSON.`,
  );

  // Log a summary
  for (const t of ingressTransits) {
    const retro =
      t.transitType === 'Retrograde Re-entry' ? ' [RETROGRADE]' : '';
    console.log(`  ${t.id}  (${t.dates})${retro}`);
  }

  // Build output file
  const ingressBlocks = ingressTransits
    .map((t) => serialiseTransit(t))
    .join('\n');

  const output = `// AUTO-GENERATED from slow-planet-sign-changes.json — do not hand-edit ingress entries
// Generated: ${new Date().toISOString()}
// Run 'tsx scripts/generate-yearly-transits.ts' to regenerate.

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

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
  startDate?: Date;
  endDate?: Date;
}

// ---------------------------------------------------------------------------
// AUTO-GENERATED ingress entries — sourced from slow-planet-sign-changes.json
// ---------------------------------------------------------------------------

const INGRESS_TRANSITS: YearlyTransit[] = [
${ingressBlocks}
];

// ---------------------------------------------------------------------------
// Hand-written special entries
// Conjunctions, eclipses, Saturn cycles, and fast-planet retrogrades
// that cannot be derived from slow-planet-sign-changes.json.
// ---------------------------------------------------------------------------

const SPECIAL_TRANSITS: YearlyTransit[] = [
${PRESERVED_SPECIAL_ENTRIES_SOURCE}
];

// ---------------------------------------------------------------------------
// Merged export
// ---------------------------------------------------------------------------

export const YEARLY_TRANSITS: YearlyTransit[] = [
  ...INGRESS_TRANSITS,
  ...SPECIAL_TRANSITS,
].sort((a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  const aTime = a.startDate?.getTime() ?? 0;
  const bTime = b.startDate?.getTime() ?? 0;
  return aTime - bTime;
});

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
`;

  fs.writeFileSync(outPath, output, 'utf-8');
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
