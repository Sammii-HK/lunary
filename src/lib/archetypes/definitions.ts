export interface LunaryArchetype {
  id: string;
  name: string;
  freeSummary: string;
  premiumNarrative: string;
  lightTraits: string[];
  shadowTraits: string[];
  suggestedWork: string[];
  triggers: {
    tarotSuits: string[];
    tarotMajors: string[];
    journalKeywords: string[];
    dreamMotifs: string[];
    moodTags: string[];
    transits: string[];
  };
}

export const LUNARY_ARCHETYPES: LunaryArchetype[] = [
  {
    id: 'restorer',
    name: 'The Restorer',
    freeSummary:
      'You are moving through a healing phase, rebuilding emotional foundations and cultivating resilience.',
    premiumNarrative: `The Restorer archetype is awakening in you—a profound healing presence that mends what has been broken and restores what has been lost. This is not passive healing where you simply wait for time to pass, but an active, conscious process of emotional reconstruction.

You may find yourself naturally drawn to practices that support recovery: rest, gentle movement, nourishing food, and the company of those who truly see you. The Restorer knows that healing is not linear—some days will feel like setbacks, but they are actually part of the integration process.

This archetype often emerges after periods of loss, heartbreak, or exhaustion. It brings the medicine of radical self-compassion and the understanding that you cannot pour from an empty cup. The Restorer teaches that returning to wholeness is not about becoming who you were before, but about becoming more fully who you are meant to be.

Your current cosmic patterns suggest this is a fertile time for inner work. The universe is holding space for your healing, and the more you honor this process, the deeper your restoration will be.`,
    lightTraits: [
      'Deep capacity for self-healing',
      'Natural resilience and emotional bounce-back',
      "Ability to hold space for others' healing",
      'Intuitive understanding of what nurtures',
      'Patience with the healing timeline',
    ],
    shadowTraits: [
      'Tendency to isolate when wounded',
      'Difficulty accepting help from others',
      'Over-identification with the healer role',
      'Perfectionism about the healing process',
      'Resistance to acknowledging pain',
    ],
    suggestedWork: [
      'Practice radical self-compassion daily',
      'Create a personal healing altar or sacred space',
      'Journal about what wholeness means to you',
      'Identify and release relationships that drain you',
      'Work with heart-opening crystals like rose quartz',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: [
        'The Star',
        'Temperance',
        'The Empress',
        'The High Priestess',
      ],
      journalKeywords: [
        'healing',
        'recovery',
        'restoration',
        'mending',
        'peace',
        'rest',
        'gentle',
        'care',
        'wounded',
        'rebuilding',
      ],
      dreamMotifs: ['water', 'gardens', 'hospitals', 'medicine', 'nurturing'],
      moodTags: ['healing', 'peaceful', 'tender', 'recovering', 'hopeful'],
      transits: ['Moon trine Venus', 'Venus in Cancer', 'Neptune trine Moon'],
    },
  },
  {
    id: 'seeker',
    name: 'The Seeker',
    freeSummary:
      'An inner explorer is awakening, drawn toward deeper understanding and the search for meaning.',
    premiumNarrative: `The Seeker archetype is calling you forward on a quest for meaning. This is the part of you that knows there is more to life than what appears on the surface—more depth, more truth, more understanding waiting to be discovered.

You may feel a restless curiosity, a sense that the questions you\'re asking now are more important than any answers you\'ve found before. The Seeker is not interested in superficial explanations; it wants to understand the why behind the what, the pattern beneath the chaos.

This archetype often awakens during times of transition or dissatisfaction with the status quo. It pushes you beyond comfort zones, encouraging exploration of philosophy, spirituality, psychology, or any domain that offers deeper insight into existence.

The Seeker\'s journey is both outward and inward. You may be drawn to travel, new teachers, or unfamiliar ideas. Equally, you may find yourself diving deeper into meditation, shadow work, or contemplative practices. Trust this drive—it is leading you somewhere important.

Your cosmic patterns suggest the universe is supporting your quest. Signs, synchronicities, and meaningful encounters are likely to increase as you follow your curiosity.`,
    lightTraits: [
      "Genuine curiosity about life's deeper questions",
      'Openness to new perspectives and ideas',
      'Courage to question established beliefs',
      'Natural philosophical or spiritual inclination',
      'Ability to find meaning in challenges',
    ],
    shadowTraits: [
      'Restlessness and difficulty with commitment',
      'Spiritual bypassing of practical matters',
      'Superiority about depth of understanding',
      'Endless seeking without integration',
      'Dismissing simple or conventional wisdom',
    ],
    suggestedWork: [
      'Commit to a contemplative practice for 30 days',
      'Read something that challenges your worldview',
      'Ask bigger questions in your journaling',
      'Find a teacher or mentor in an area of curiosity',
      'Balance seeking with periods of integration',
    ],
    triggers: {
      tarotSuits: ['Wands'],
      tarotMajors: [
        'The Hermit',
        'The Fool',
        'The High Priestess',
        'The Moon',
        'Wheel of Fortune',
      ],
      journalKeywords: [
        'seeking',
        'wondering',
        'curious',
        'meaning',
        'purpose',
        'why',
        'exploring',
        'questioning',
        'truth',
      ],
      dreamMotifs: [
        'journeys',
        'roads',
        'doors',
        'libraries',
        'teachers',
        'mountains',
      ],
      moodTags: ['curious', 'seeking', 'questioning', 'open', 'wondering'],
      transits: [
        'Jupiter aspects',
        'Mercury in Sagittarius',
        'Sun in 9th house',
      ],
    },
  },
  {
    id: 'catalyst',
    name: 'The Catalyst',
    freeSummary:
      'Transformation energy is active—you are an agent of change, both for yourself and others.',
    premiumNarrative: `The Catalyst archetype is moving through you with powerful transformative energy. Like a chemical catalyst that accelerates reactions without being consumed, you are facilitating profound change—in your own life and potentially in the lives of those around you.

This is not comfortable energy. The Catalyst often works through disruption, breaking down what has become stagnant or false to make way for what is more alive and authentic. You may find old structures in your life suddenly feeling intolerable, or you may be the one initiating necessary endings.

The Catalyst carries the energy of Death and rebirth—not literal death, but the death of identities, relationships, beliefs, or ways of being that have outlived their purpose. This archetype asks you to trust the destruction as much as the creation.

What makes this energy catalytic rather than merely chaotic is its purposefulness. You are not destroying for destruction\'s sake; you are clearing the ground for new growth. The seeds of what comes next are already present in what is falling away.

Your cosmic patterns indicate this is a potent time for transformation. Lean into the changes rather than resisting them—the universe is accelerating your evolution.`,
    lightTraits: [
      'Courage to initiate necessary change',
      'Ability to see through illusions',
      'Natural transformative presence',
      'Comfort with intensity and depth',
      "Capacity to hold space for others' transformation",
    ],
    shadowTraits: [
      'Tendency to create unnecessary chaos',
      'Difficulty with stability and routine',
      'Unconscious provocation of others',
      'Resistance to being transformed by others',
      'Impatience with slow, organic change',
    ],
    suggestedWork: [
      'Identify what is ready to die in your life',
      'Practice the art of conscious endings',
      'Work with transformation-supporting crystals like obsidian',
      'Journal about your relationship with change',
      'Balance catalytic energy with grounding practices',
    ],
    triggers: {
      tarotSuits: ['Swords'],
      tarotMajors: ['Death', 'The Tower', 'Judgement', 'The Hanged Man'],
      journalKeywords: [
        'transformation',
        'change',
        'shift',
        'different',
        'breaking',
        'ending',
        'becoming',
        'evolving',
      ],
      dreamMotifs: [
        'fire',
        'destruction',
        'renovation',
        'metamorphosis',
        'volcanoes',
      ],
      moodTags: ['intense', 'transforming', 'raw', 'powerful', 'changing'],
      transits: ['Pluto aspects', 'Uranus transits', 'Eclipse season'],
    },
  },
  {
    id: 'grounded-one',
    name: 'The Grounded One',
    freeSummary:
      'Stability and practical wisdom are your allies now—building foundations that will support future growth.',
    premiumNarrative: `The Grounded One archetype is anchoring you to the earth, bringing practical wisdom and the patience to build something lasting. In a world that often celebrates speed and disruption, this archetype offers the countervailing power of roots, foundations, and steady accumulation.

You may find yourself naturally drawn to matters of the material world: finances, health, home, work routines. These are not distractions from spiritual growth but essential components of it. The Grounded One knows that castles built on sand eventually fall.

This archetype often emerges when life has become too chaotic or unmoored. It brings the medicine of simplicity, routine, and attention to basics. Before you can fly, you must have solid ground to launch from; before you can expand, you need a stable center to expand from.

The Grounded One teaches that there is profound spirituality in the mundane—in tending a garden, maintaining a body, managing resources wisely. These acts of earthly care are themselves sacred practices when done with presence and intention.

Your cosmic patterns suggest this is a powerful time for foundation-building. Investments of time and energy made now will compound over time, creating stability you can rely on for years to come.`,
    lightTraits: [
      'Practical wisdom and common sense',
      'Patience with slow, steady progress',
      'Ability to create stability for self and others',
      'Natural connection to the physical world',
      'Reliability and follow-through',
    ],
    shadowTraits: [
      'Rigidity and resistance to change',
      'Over-attachment to material security',
      'Dismissal of emotional or spiritual needs',
      'Tendency toward excessive caution',
      'Stuckness in comfortable routines',
    ],
    suggestedWork: [
      'Audit your practical foundations (finances, health, home)',
      'Establish one new supportive daily routine',
      'Spend time in nature, literally touching the earth',
      'Work with grounding crystals like hematite or smoky quartz',
      'Practice presence with mundane tasks',
    ],
    triggers: {
      tarotSuits: ['Pentacles'],
      tarotMajors: [
        'The Emperor',
        'The Hierophant',
        'The World',
        'Four of Pentacles',
      ],
      journalKeywords: [
        'stable',
        'grounded',
        'practical',
        'routine',
        'building',
        'foundation',
        'work',
        'home',
        'body',
      ],
      dreamMotifs: ['houses', 'earth', 'trees', 'anchors', 'roots'],
      moodTags: ['grounded', 'stable', 'focused', 'practical', 'determined'],
      transits: ['Saturn aspects', 'Taurus transits', 'Capricorn emphasis'],
    },
  },
  {
    id: 'empath',
    name: 'The Empath',
    freeSummary:
      'Your emotional sensitivity is heightened—feeling deeply and tuning into subtle energies around you.',
    premiumNarrative: `The Empath archetype is fully awake in you, bringing heightened sensitivity to emotions, energies, and the unspoken currents that flow between people. This is both a gift and a responsibility—the capacity to feel what others feel can be overwhelming without proper boundaries.

You may find yourself absorbing emotions from your environment, knowing things you shouldn\'t logically know, or feeling exhausted after time in crowds. The Empath\'s nervous system is finely tuned to pick up signals that others miss entirely.

This archetype often intensifies during times of collective intensity or personal relationship transitions. It brings the medicine of deep compassion and intuitive understanding, but it also requires learning when to close the channels and restore your own energy.

The Empath\'s journey includes learning to distinguish between your emotions and those you\'ve absorbed from others. It requires building energetic hygiene practices and honoring your need for solitude and restoration. Your sensitivity is not a weakness to overcome but a capacity to be consciously developed.

Your cosmic patterns suggest your empathic channels are particularly open now. This is a time to trust your intuitive hits while also protecting your energy field.`,
    lightTraits: [
      "Deep attunement to others' emotions",
      'Natural capacity for compassion',
      'Intuitive understanding of needs',
      'Ability to hold space for pain',
      'Sensitivity to subtle energies',
    ],
    shadowTraits: [
      'Difficulty maintaining boundaries',
      "Tendency to absorb others' emotions",
      'Overwhelm in intense environments',
      'Codependent relationship patterns',
      'Neglecting own needs for others',
    ],
    suggestedWork: [
      'Practice daily energy clearing rituals',
      'Learn to distinguish your feelings from absorbed ones',
      'Establish and maintain firm boundaries',
      'Create regular solitude for restoration',
      'Work with protective crystals like black tourmaline',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: [
        'The High Priestess',
        'The Moon',
        'The Empress',
        'Queen of Cups',
      ],
      journalKeywords: [
        'feeling',
        'sensing',
        'intuition',
        'overwhelm',
        'absorbing',
        'sensitive',
        'emotional',
        'empathy',
      ],
      dreamMotifs: [
        'water',
        'oceans',
        'merging',
        'boundaries dissolving',
        'crowds',
      ],
      moodTags: [
        'sensitive',
        'emotional',
        'overwhelmed',
        'intuitive',
        'absorbing',
      ],
      transits: ['Moon transits', 'Neptune aspects', 'Pisces emphasis'],
    },
  },
  {
    id: 'shadow-dancer',
    name: 'The Shadow Dancer',
    freeSummary:
      "You are being called to face hidden truths and integrate the parts of yourself you've pushed away.",
    premiumNarrative: `The Shadow Dancer archetype is inviting you into the underworld—not to be consumed by darkness, but to retrieve the gold that has been buried there. This is the part of you that is willing to look at what others turn away from, to dance with the shadows rather than flee from them.

Your shadow contains everything you\'ve rejected about yourself: qualities you were taught were bad, emotions you weren\'t allowed to feel, desires you learned to suppress. But the shadow also contains tremendous power and creativity that has been locked away.

The Shadow Dancer\'s work is integration, not elimination. The goal is not to destroy your shadow but to form a conscious relationship with it. When you can own your jealousy, your rage, your selfishness—when you can see these as part of your humanity rather than evidence of your unworthiness—you become whole.

This archetype often activates during psychological pressure or when life circumstances force you to confront what you\'ve been avoiding. It brings the medicine of radical honesty and the understanding that your darkness is not separate from your light.

Your cosmic patterns indicate this is a powerful time for shadow work. What you integrate now will no longer have power over you from the unconscious.`,
    lightTraits: [
      'Courage to face difficult truths',
      'Capacity for psychological depth',
      'Ability to integrate rejected parts',
      'Comfort with complexity and paradox',
      'Non-judgmental self-awareness',
    ],
    shadowTraits: [
      'Tendency to dwell in darkness',
      'Identification with wounds or trauma',
      'Using shadow work to avoid action',
      'Projecting shadow onto others',
      'Romanticizing suffering',
    ],
    suggestedWork: [
      'Begin or deepen a shadow journaling practice',
      'Notice your strongest judgments of others—these point to your shadow',
      'Work with a therapist or guide for deeper exploration',
      'Practice welcoming uncomfortable emotions',
      'Create art from your darkness',
    ],
    triggers: {
      tarotSuits: ['Swords'],
      tarotMajors: [
        'The Devil',
        'The Moon',
        'Death',
        'The Tower',
        'The Hanged Man',
      ],
      journalKeywords: [
        'shadow',
        'hidden',
        'dark',
        'rejected',
        'secret',
        'shame',
        'facing',
        'integrating',
        'truth',
      ],
      dreamMotifs: [
        'darkness',
        'monsters',
        'underground',
        'mirrors',
        'confrontation',
      ],
      moodTags: ['confronting', 'raw', 'honest', 'deep', 'uncomfortable'],
      transits: ['Pluto transits', 'Scorpio emphasis', '8th house transits'],
    },
  },
  {
    id: 'visionary',
    name: 'The Visionary',
    freeSummary:
      "Creative vision and future-seeing are activated—you are glimpsing possibilities that don't yet exist.",
    premiumNarrative: `The Visionary archetype is opening your inner eye to possibilities that haven\'t yet manifested in the physical world. This is the part of you that can see beyond current circumstances to what could be—the creative imagination that bridges present and future.

You may find yourself flooded with ideas, images, or intuitions about what wants to be created. The Visionary doesn\'t just observe the future; it participates in its creation by holding a clear picture of what is possible.

This archetype often awakens during times of creative potential or when the collective needs new direction. It brings the medicine of hope and possibility, the understanding that reality is more malleable than it appears.

The Visionary\'s challenge is grounding their visions in action. Beautiful ideas that never leave the imagination serve no one. Your task is to become a bridge between the realm of possibility and the world of form—to make the invisible visible.

Your cosmic patterns suggest your visionary channels are particularly open now. Pay attention to what you\'re seeing, dreaming, and imagining—these may be glimpses of your creative assignment.`,
    lightTraits: [
      'Vivid creative imagination',
      'Ability to see future possibilities',
      'Natural optimism and hope',
      'Capacity to inspire others with vision',
      'Openness to innovation and change',
    ],
    shadowTraits: [
      'Difficulty with present-moment reality',
      'Frustration with slow manifestation',
      'Tendency toward escapism through fantasy',
      'Impatience with practical details',
      'Overwhelm from too many possibilities',
    ],
    suggestedWork: [
      'Create a vision board or future journal',
      'Practice grounding your visions in specific actions',
      'Share your vision with trusted allies',
      'Balance future-focus with present-moment awareness',
      'Work with third eye-opening practices',
    ],
    triggers: {
      tarotSuits: ['Wands'],
      tarotMajors: ['The Star', 'The Sun', 'The Magician', 'Ace of Wands'],
      journalKeywords: [
        'vision',
        'future',
        'imagine',
        'create',
        'possibility',
        'dream',
        'idea',
        'inspiration',
      ],
      dreamMotifs: ['flying', 'light', 'expansive spaces', 'creation', 'stars'],
      moodTags: ['inspired', 'creative', 'visionary', 'hopeful', 'imaginative'],
      transits: ['Neptune aspects', 'Jupiter transits', 'Aquarius emphasis'],
    },
  },
  {
    id: 'mystic',
    name: 'The Mystic',
    freeSummary:
      'Inner knowing and spiritual intuition are awakening—you are connecting with wisdom beyond the rational mind.',
    premiumNarrative: `The Mystic archetype is drawing you inward toward direct experience of the sacred. This is the part of you that knows truth without being able to explain how you know—the intuitive wisdom that bypasses rational analysis entirely.

You may find yourself drawn to contemplative practices, sensing presences or energies, or receiving guidance through dreams, synchronicities, or sudden knowing. The Mystic\'s way of knowing is experiential rather than intellectual.

This archetype often intensifies during spiritual opening or when life circumstances push you beyond the limits of rational understanding. It brings the medicine of surrender, trust, and connection to something larger than the personal self.

The Mystic\'s path requires developing discernment—learning to distinguish genuine intuition from wishful thinking, spiritual guidance from ego projection. It also requires staying grounded; the most profound mystics are those who can bring their insights back to serve everyday life.

Your cosmic patterns suggest your mystical channels are particularly receptive now. Create space for stillness, meditation, and communion with the sacred.`,
    lightTraits: [
      'Direct experience of spiritual reality',
      'Trust in inner guidance',
      'Capacity for deep stillness',
      'Connection to something greater',
      'Ability to receive wisdom non-rationally',
    ],
    shadowTraits: [
      'Disconnection from practical reality',
      'Spiritual superiority or escapism',
      'Difficulty communicating experiences',
      'Confusion between intuition and fantasy',
      'Neglecting physical world responsibilities',
    ],
    suggestedWork: [
      'Establish a daily contemplative practice',
      'Record dreams and intuitive hits',
      'Study a mystical tradition that calls to you',
      'Balance inner work with outer engagement',
      'Find community with other seekers',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: ['The High Priestess', 'The Hermit', 'The Star', 'The Moon'],
      journalKeywords: [
        'spiritual',
        'knowing',
        'intuition',
        'sacred',
        'divine',
        'meditation',
        'presence',
        'stillness',
      ],
      dreamMotifs: ['temples', 'light', 'guides', 'symbols', 'ascension'],
      moodTags: ['spiritual', 'connected', 'peaceful', 'intuitive', 'mystical'],
      transits: [
        'Neptune transits',
        'Pisces emphasis',
        '12th house activation',
      ],
    },
  },
  {
    id: 'protector',
    name: 'The Protector',
    freeSummary:
      'Guardian energy is active—you are called to establish boundaries and protect what matters.',
    premiumNarrative: `The Protector archetype is awakening your capacity to guard what is sacred, to establish boundaries, and to defend those who cannot defend themselves. This is warrior energy in its most noble form—strength in service of love.

You may find yourself more aware of boundaries—yours and others\'. The Protector knows that love without boundaries becomes enmeshment, and that true protection sometimes means saying difficult no\'s.

This archetype often activates when something precious is under threat, or when you are recovering from violations of your boundaries. It brings the medicine of fierce compassion and the understanding that gentleness and strength are not opposites.

The Protector\'s work includes protecting yourself—your energy, your time, your peace, your body. It\'s not selfish to guard these; it\'s necessary for you to be of service to others. You cannot protect anyone else if you are depleted or overwhelmed.

Your cosmic patterns suggest this is a powerful time to evaluate and strengthen your boundaries. Where are you giving too much? Where are you allowing violations? The Protector asks you to stand guard.`,
    lightTraits: [
      'Strong sense of healthy boundaries',
      'Courage to defend what matters',
      'Loyalty to those you love',
      'Capacity for fierce compassion',
      'Discernment about threats and safety',
    ],
    shadowTraits: [
      'Over-vigilance and hypervigilance',
      'Difficulty trusting or letting guard down',
      'Controlling behavior disguised as protection',
      'Walls instead of boundaries',
      'Exhaustion from constant guarding',
    ],
    suggestedWork: [
      'Audit your current boundaries',
      'Practice saying no without over-explaining',
      'Identify what you are protecting and why',
      'Work with protective crystals and practices',
      'Balance protection with vulnerability',
    ],
    triggers: {
      tarotSuits: ['Swords', 'Wands'],
      tarotMajors: ['Strength', 'The Chariot', 'Justice', 'King of Swords'],
      journalKeywords: [
        'boundary',
        'protect',
        'guard',
        'safe',
        'defend',
        'loyal',
        'strength',
        'fierce',
      ],
      dreamMotifs: ['walls', 'shields', 'guardians', 'fortresses', 'warriors'],
      moodTags: ['protective', 'fierce', 'vigilant', 'strong', 'guarding'],
      transits: ['Mars transits', 'Saturn aspects', 'Aries emphasis'],
    },
  },
  {
    id: 'heart-opener',
    name: 'The Heart Opener',
    freeSummary:
      'Love and connection are calling—you are being invited into deeper intimacy and relational healing.',
    premiumNarrative: `The Heart Opener archetype is expanding your capacity for love, connection, and authentic intimacy. This is the part of you that knows we are not meant to walk alone—that our deepest growth happens in relationship.

You may find your heart more tender than usual, moved by beauty, longing for connection, or called to repair relationships that have been damaged. The Heart Opener knows that vulnerability is not weakness but the prerequisite for true intimacy.

This archetype often intensifies when we are ready for deeper levels of connection or when old relational wounds are ready to heal. It brings the medicine of courage—for opening the heart always involves risk.

The Heart Opener\'s path requires discernment about where to invest your heart energy. Not every connection deserves your full vulnerability. But those that do deserve your willingness to show up fully, to be seen in your imperfection, to love without guarantees.

Your cosmic patterns suggest this is a powerful time for heart expansion. What relationships are calling for more of you? What walls are ready to come down?`,
    lightTraits: [
      'Capacity for deep love and intimacy',
      'Willingness to be vulnerable',
      'Skill at relational repair',
      'Natural warmth and compassion',
      'Courage to love despite past wounds',
    ],
    shadowTraits: [
      'Love addiction or codependency',
      'Over-giving in relationships',
      'Difficulty with healthy detachment',
      'Opening heart to unsafe people',
      'Neglecting self-love for other-love',
    ],
    suggestedWork: [
      'Practice heart-opening meditations',
      'Initiate vulnerable conversations',
      'Examine your patterns in relationships',
      'Balance giving love with receiving it',
      'Work with heart chakra and rose quartz',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: [
        'The Lovers',
        'The Empress',
        'Two of Cups',
        'The Sun',
        'Ace of Cups',
      ],
      journalKeywords: [
        'love',
        'heart',
        'connection',
        'relationship',
        'intimacy',
        'vulnerability',
        'open',
        'together',
      ],
      dreamMotifs: ['hearts', 'embraces', 'reunions', 'weddings', 'roses'],
      moodTags: ['loving', 'open', 'connected', 'tender', 'vulnerable'],
      transits: ['Venus aspects', 'Libra emphasis', '7th house transits'],
    },
  },
  {
    id: 'lunar-weaver',
    name: 'The Lunar Weaver',
    freeSummary:
      'You are attuned to natural rhythms and cycles—weaving your life in harmony with cosmic timing.',
    premiumNarrative: `The Lunar Weaver archetype is atttuning you to the profound wisdom of cycles—the waxing and waning, the seasons within seasons, the natural rhythms that govern all of life. This is the part of you that knows there is a time for everything under heaven.

You may find yourself more sensitive to moon phases, seasonal shifts, or the natural ebb and flow of your own energy. The Lunar Weaver doesn\'t fight these cycles but weaves with them, aligning action with cosmic timing.

This archetype often activates when we have been pushing against natural rhythms—trying to force growth during fallow periods or resting when it\'s time to harvest. It brings the medicine of patience and the understanding that timing is as important as effort.

The Lunar Weaver\'s wisdom includes knowing when to plant intentions, when to nurture growth, when to harvest fruits, and when to let the fields rest. Life is not a linear climb but a spiral dance, and the Weaver moves with grace through all its phases.

Your cosmic patterns suggest this is a powerful time to align with natural cycles. What phase are you in? What does this phase call for?`,
    lightTraits: [
      'Sensitivity to natural cycles and timing',
      'Patience with organic rhythms',
      'Ability to flow with change',
      'Wisdom about when to act and when to wait',
      'Deep connection to lunar energy',
    ],
    shadowTraits: [
      'Using cycles as excuse for inaction',
      'Over-dependence on external timing',
      'Rigidity about following cycles',
      'Disconnection from inner wisdom',
      'Frustration during necessary fallow periods',
    ],
    suggestedWork: [
      'Track your energy through moon cycles',
      'Align intentions with moon phases',
      'Honor fallow periods without judgment',
      'Create rituals for transitions between phases',
      'Study lunar wisdom traditions',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: [
        'The Moon',
        'The High Priestess',
        'Wheel of Fortune',
        'The Star',
      ],
      journalKeywords: [
        'cycle',
        'rhythm',
        'timing',
        'moon',
        'flow',
        'phase',
        'season',
        'patience',
      ],
      dreamMotifs: ['moon', 'tides', 'seasons', 'spirals', 'circles'],
      moodTags: ['cyclical', 'flowing', 'patient', 'attuned', 'rhythmic'],
      transits: ['Moon transits', 'Lunar nodes', 'Cancer emphasis'],
    },
  },
  {
    id: 'alchemist',
    name: 'The Alchemist',
    freeSummary:
      "You are transmuting experience into wisdom—finding gold in the lead of life's challenges.",
    premiumNarrative: `The Alchemist archetype is activating your capacity to transmute experience into wisdom, pain into power, confusion into clarity. Like the ancient alchemists who sought to turn lead into gold, you are working with the prima materia of your life to create something precious.

You may find yourself making meaning from experiences that previously seemed random or senseless. The Alchemist doesn\'t just survive difficulty; it extracts the teaching, the growth, the transformation that was hidden within the challenge.

This archetype often awakens after significant life experience—when enough raw material has accumulated to work with. It brings the medicine of integration and the understanding that nothing in your life has been wasted.

The Alchemist\'s laboratory is your own consciousness. The elements you work with are your experiences, emotions, insights, and imaginings. The gold you create is wisdom—not abstract knowledge, but lived understanding that changes how you move through the world.

Your cosmic patterns suggest this is a powerful time for alchemical work. What experiences are ready to be transmuted? What gold is waiting to be extracted from your lead?`,
    lightTraits: [
      'Ability to find meaning in difficulty',
      'Capacity for integration and synthesis',
      'Natural understanding of transformation',
      'Wisdom born from experience',
      'Ability to help others transmute their pain',
    ],
    shadowTraits: [
      'Premature meaning-making',
      'Intellectualizing instead of feeling',
      'Spiritual bypassing of grief',
      'Pressure to always find the silver lining',
      'Avoiding raw experience in favor of processing',
    ],
    suggestedWork: [
      'Journal about lessons from past challenges',
      'Identify patterns across different life experiences',
      'Share your hard-won wisdom with others',
      'Allow experiences to be complete before extracting meaning',
      'Study the art of integration',
    ],
    triggers: {
      tarotSuits: ['Pentacles', 'Cups'],
      tarotMajors: ['The World', 'Judgement', 'Temperance', 'The Magician'],
      journalKeywords: [
        'meaning',
        'learning',
        'integration',
        'wisdom',
        'understanding',
        'pattern',
        'growth',
        'transmute',
      ],
      dreamMotifs: [
        'laboratories',
        'gold',
        'transformation',
        'synthesis',
        'completion',
      ],
      moodTags: [
        'integrating',
        'wise',
        'understanding',
        'complete',
        'synthesizing',
      ],
      transits: [
        'Saturn return',
        'Jupiter return',
        'Nodal returns',
        'Chiron transits',
      ],
    },
  },
];

export function getArchetypeById(id: string): LunaryArchetype | undefined {
  return LUNARY_ARCHETYPES.find((a) => a.id === id);
}
