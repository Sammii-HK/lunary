export interface LunaryArchetype {
  id: string;
  name: string;
  shortSummary: string;
  longSummary: string;
  lightTraits: string[];
  shadowTraits: string[];
  suggestedWork: string[];
  triggers: {
    tarotSuits?: string[];
    tarotMajors?: string[];
    journalingThemes?: string[];
    dreamMotifs?: string[];
    transits?: string[];
    lifeThemes?: string[];
  };
}

export const LUNARY_ARCHETYPES: Record<string, LunaryArchetype> = {
  the_restorer: {
    id: 'the_restorer',
    name: 'The Restorer',
    shortSummary:
      'You are in a season of deep healing and emotional reconstruction, rebuilding from within.',
    longSummary: `The Restorer archetype is emerging strongly in your patterns right now. This is a profound invitation to tend to the parts of yourself that have been wounded, neglected, or simply need attention after a period of intensity.

The Restorer does not rush. They understand that true healing happens in layers, that emotional reconstruction is patient work. You may find yourself drawn to rest, to solitude, to practices that feel nurturing rather than productive. Honor these impulses—they are not weaknesses but wisdom.

This archetype often emerges after loss, transition, or periods of depletion. It signals that your psyche is ready to repair what was broken and strengthen what remains. The Restorer's gift is resilience—not the kind that pushes through, but the kind that knows when to pause, repair, and emerge renewed.

Pay attention to what needs tending. Your body may be asking for gentler care. Old emotional wounds may surface for acknowledgment. Relationships may need repair. The Restorer reminds you that you have the capacity to heal—not by ignoring pain, but by meeting it with compassion.`,
    lightTraits: [
      'Deep capacity for self-healing',
      'Natural resilience and recovery',
      'Ability to hold space for pain',
      'Patience with the healing process',
      'Gift for emotional repair',
    ],
    shadowTraits: [
      'Over-identifying with wounds',
      'Resistance to moving forward',
      'Martyrdom around suffering',
      'Avoiding joy to stay in healing mode',
      "Becoming depleted by others' healing",
    ],
    suggestedWork: [
      'Practice daily self-compassion rituals',
      'Journal about what is ready to be released',
      'Create space for genuine rest, not distraction',
      'Work with rose quartz or other heart-healing stones',
      'Allow yourself to receive care from others',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: ['The Star', 'The Empress', 'Four of Swords'],
      journalingThemes: [
        'healing',
        'recovery',
        'rest',
        'exhaustion',
        'wounds',
        'hurt',
      ],
      dreamMotifs: ['hospitals', 'water', 'gardens', 'wounds healing', 'rest'],
      transits: ['Neptune', 'Chiron', 'Moon'],
      lifeThemes: ['healing_the_heart', 'release'],
    },
  },

  the_seeker: {
    id: 'the_seeker',
    name: 'The Seeker',
    shortSummary:
      'A powerful curiosity is driving you inward, searching for meaning and purpose.',
    longSummary: `The Seeker archetype is alive in you now—that restless, curious part of your soul that knows there is more to discover. You are being called to explore, to question, to venture into territories both inner and outer that you have not yet mapped.

The Seeker is never satisfied with surface answers. They want to understand why—why they feel what they feel, why life unfolds as it does, why they are here. This is not anxious questioning but sacred curiosity. You are in a phase of active exploration, and the questions you ask now will shape the answers you eventually find.

This archetype often emerges during transitions, when old certainties have dissolved and new understanding is needed. The Seeker knows that getting lost is sometimes part of finding the way. They trust the search itself, even when the destination is unclear.

Your patterns suggest you are ready to go deeper. This might mean exploring new spiritual practices, asking harder questions about your life direction, or simply being willing to not know while you discover. The Seeker's gift is that the journey itself becomes the teaching.`,
    lightTraits: [
      'Insatiable curiosity',
      'Comfort with not knowing',
      'Courage to question',
      'Openness to new perspectives',
      'Dedication to personal truth',
    ],
    shadowTraits: [
      'Chronic restlessness',
      'Never feeling satisfied',
      'Avoiding commitment to keep seeking',
      'Spiritual bypassing',
      'Getting lost in questions without integration',
    ],
    suggestedWork: [
      'Create a "questions I\'m living" journal',
      'Explore one new practice or teaching',
      'Sit with questions without rushing to answers',
      'Map your inner landscape through meditation',
      'Trust the search as its own reward',
    ],
    triggers: {
      tarotSuits: ['Wands', 'Major Arcana'],
      tarotMajors: ['The Hermit', 'The Fool', 'Page of Wands', 'Two of Wands'],
      journalingThemes: [
        'purpose',
        'meaning',
        'searching',
        'questions',
        'curiosity',
        'exploring',
      ],
      dreamMotifs: [
        'journeys',
        'paths',
        'doors',
        'searching',
        'unknown places',
      ],
      transits: ['Jupiter', 'Sagittarius', 'Uranus'],
      lifeThemes: ['identity_expansion', 'spiritual_awakening'],
    },
  },

  the_catalyst: {
    id: 'the_catalyst',
    name: 'The Catalyst',
    shortSummary:
      'You are an agent of transformation right now, activating change in yourself and around you.',
    longSummary: `The Catalyst archetype is surging through your patterns. You are not just experiencing change—you are becoming an agent of it. Something in you has ignited, and you may find that your presence, your decisions, your very energy is setting things in motion.

The Catalyst is a powerful and sometimes uncomfortable archetype. They do not maintain the status quo. They shake things loose, accelerate what was stagnant, and create momentum where there was none. If you have felt restless, impatient, or driven to act, this is the Catalyst stirring.

This archetype often emerges when transformation is overdue—when life has been too static, when growth has stalled, when you or your circumstances need a push. The Catalyst provides that push, whether through bold action, difficult conversations, or simply refusing to accept what no longer serves.

The key is to work with this energy consciously. Unconscious catalyzation can create unnecessary chaos. But directed with intention, the Catalyst's fire can transform your life and inspire change in others. You are in a phase of activation—use it wisely.`,
    lightTraits: [
      'Ability to initiate transformation',
      'Courage to disrupt stagnation',
      'Natural momentum and drive',
      'Inspiring change in others',
      'Fearlessness about new beginnings',
    ],
    shadowTraits: [
      'Creating chaos for its own sake',
      'Impatience with process',
      'Burning bridges unnecessarily',
      'Restlessness that avoids depth',
      'Disrupting others without consent',
    ],
    suggestedWork: [
      'Channel activation energy into specific goals',
      'Ask: What transformation am I truly called to?',
      'Practice discernment about where to catalyze',
      'Ground your fire with earth practices',
      'Journal about what you are ready to ignite',
    ],
    triggers: {
      tarotSuits: ['Wands'],
      tarotMajors: ['The Tower', 'Death', 'The Chariot', 'Ace of Wands'],
      journalingThemes: [
        'change',
        'action',
        'restless',
        'momentum',
        'transformation',
        'fire',
      ],
      dreamMotifs: ['fire', 'explosions', 'racing', 'urgency', 'volcanoes'],
      transits: ['Mars', 'Aries', 'Pluto', 'Uranus'],
      lifeThemes: ['creative_rebirth', 'transformation'],
    },
  },

  the_grounded_one: {
    id: 'the_grounded_one',
    name: 'The Grounded One',
    shortSummary:
      'You are being called to stability and strong foundations, building slowly and deliberately.',
    longSummary: `The Grounded One is emerging in your patterns now. This archetype represents the deep wisdom of foundations—the understanding that lasting growth requires stable roots. You are in a phase of building, stabilizing, and honoring the practical realities of life.

The Grounded One does not chase the dramatic or the urgent. They know that real results come from consistent, patient effort. If you have been feeling drawn to organize, to plan, to tend to material realities like finances, health, or home, this archetype is guiding you.

This energy often emerges when life has been too scattered, too abstract, or too unstable. The Grounded One says: come back to earth. Take care of the basics. Build something that will last. There is wisdom in the mundane, and the practical is also sacred.

Your patterns suggest you are ready to commit to something solid. This might be a daily practice, a long-term goal, a health routine, or simply a more grounded way of moving through your days. The Grounded One reminds you that stability is not stagnation—it is the foundation from which all other growth becomes possible.`,
    lightTraits: [
      'Practical wisdom',
      'Patience for long-term building',
      'Ability to create stability',
      'Groundedness under pressure',
      'Appreciation for the material world',
    ],
    shadowTraits: [
      'Rigidity and resistance to change',
      'Over-focus on security',
      'Dismissing the spiritual or emotional',
      'Becoming stuck in routine',
      'Fear-based attachment to material',
    ],
    suggestedWork: [
      'Create or refine a sustainable daily routine',
      "Tend to one practical area you've been avoiding",
      'Spend time in nature, touching the earth',
      'Work with grounding stones like black tourmaline',
      'Journal about what you are building long-term',
    ],
    triggers: {
      tarotSuits: ['Pentacles'],
      tarotMajors: [
        'The Emperor',
        'The Hierophant',
        'Four of Pentacles',
        'Ten of Pentacles',
      ],
      journalingThemes: [
        'stability',
        'routine',
        'practical',
        'building',
        'security',
        'home',
      ],
      dreamMotifs: ['houses', 'earth', 'stones', 'trees', 'foundations'],
      transits: ['Saturn', 'Taurus', 'Capricorn'],
      lifeThemes: ['grounding_stability'],
    },
  },

  the_empath: {
    id: 'the_empath',
    name: 'The Empath',
    shortSummary:
      'Your capacity for deep feeling and intuitive attunement is heightened and seeking expression.',
    longSummary: `The Empath archetype is alive in your patterns. You are in a phase of heightened sensitivity—to your own emotions, to others\' feelings, and to the subtle energies around you. This is a gift, though it can also feel overwhelming if not properly tended.

The Empath feels deeply and widely. They sense what others cannot articulate, pick up on undercurrents in rooms, and often know things before they can be explained. Your recent patterns suggest this attunement is especially active now. Pay attention to what you are sensing—there is wisdom in your sensitivity.

This archetype often emerges when emotional information is needed, when relationships require deeper understanding, or when your own inner world is asking to be felt more fully. The Empath does not numb or distract—they turn toward feeling with courage and presence.

The key is to balance receptivity with boundaries. Without protection, the Empath absorbs too much and becomes depleted. With proper care, they become channels for profound understanding and healing. Your patterns call you to honor your sensitivity while learning to discern what is yours and what belongs to others.`,
    lightTraits: [
      'Deep emotional intelligence',
      'Intuitive understanding of others',
      'Capacity for compassion',
      'Sensitivity as wisdom',
      'Natural healing presence',
    ],
    shadowTraits: [
      "Absorbing others' emotions",
      "Losing self in others' pain",
      'Difficulty with boundaries',
      'Overwhelm and emotional flooding',
      'Codependent patterns',
    ],
    suggestedWork: [
      'Practice energetic clearing daily',
      'Establish clear emotional boundaries',
      "Journal: What am I feeling that isn't mine?",
      'Create solitude for emotional processing',
      'Honor your sensitivity as a gift, not a burden',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: [
        'The High Priestess',
        'Queen of Cups',
        'The Moon',
        'Six of Cups',
      ],
      journalingThemes: [
        'feeling',
        'sensitive',
        'overwhelmed',
        'absorbing',
        "others' emotions",
      ],
      dreamMotifs: ['water', 'crowds', 'feeling others', 'merging', 'oceans'],
      transits: ['Moon', 'Neptune', 'Cancer', 'Pisces'],
      lifeThemes: ['connection_belonging', 'healing_the_heart'],
    },
  },

  the_shadow_dancer: {
    id: 'the_shadow_dancer',
    name: 'The Shadow Dancer',
    shortSummary:
      'You are being called to face hidden truths and integrate the parts of yourself you have disowned.',
    longSummary: `The Shadow Dancer archetype is emerging powerfully in your patterns. This is the part of you that is unafraid to look at what others avoid, to venture into the darker corners of the psyche, and to find gold in the shadow. You are in a phase of psychological honesty and integration.

The Shadow Dancer knows that what we hide from ourselves does not disappear—it shapes us from the unconscious. They work with the parts we have repressed, denied, or been ashamed of. If you have been confronting uncomfortable truths, facing old wounds, or feeling the pull to go deeper psychologically, this archetype is guiding you.

This is often intense work, but the Shadow Dancer moves through it with a kind of fierce grace. They know that integration, not elimination, is the path to wholeness. The parts of yourself you have rejected hold power—and reclaiming them is how you become more fully you.

Your patterns suggest you are ready for this depth. This might mean looking at patterns you have avoided, acknowledging parts of yourself you have disowned, or simply sitting with discomfort instead of fleeing it. The Shadow Dancer dances with the dark because they know the light needs it.`,
    lightTraits: [
      'Psychological courage',
      'Comfort with the unconscious',
      'Ability to integrate opposites',
      'Honesty about the whole self',
      'Transforming shadow into strength',
    ],
    shadowTraits: [
      'Romanticizing darkness',
      'Getting lost in shadow work',
      'Using depth as avoidance of life',
      'Projecting shadow onto others',
      'Intensity addiction',
    ],
    suggestedWork: [
      'Journal about what you have been avoiding',
      'Work with a therapist or shadow work guide',
      'Practice: What quality in others triggers me?',
      'Create ritual space for integration work',
      'Balance shadow work with lightness and play',
    ],
    triggers: {
      tarotSuits: ['Major Arcana', 'Swords'],
      tarotMajors: [
        'The Devil',
        'The Tower',
        'The Moon',
        'Death',
        'Eight of Swords',
      ],
      journalingThemes: [
        'shadow',
        'fear',
        'hidden',
        'repressed',
        'facing',
        'dark',
      ],
      dreamMotifs: [
        'shadows',
        'darkness',
        'underground',
        'monsters',
        'hidden rooms',
      ],
      transits: ['Pluto', 'Scorpio', 'Saturn'],
      lifeThemes: ['shadow_integration', 'transformation'],
    },
  },

  the_visionary: {
    id: 'the_visionary',
    name: 'The Visionary',
    shortSummary:
      'Your imagination and creative sight are activated, seeing possibilities others cannot yet perceive.',
    longSummary: `The Visionary archetype is alive in your patterns right now. You are seeing beyond the present moment—into what could be, what wants to emerge, what the future might hold. This is the creative, imaginative part of your psyche that envisions before it creates.

The Visionary does not just dream—they see. They perceive patterns, possibilities, and potentials that are invisible to more literal minds. If you have been flooded with ideas, feeling inspired about future projects, or sensing where things are headed before others do, this archetype is guiding you.

This energy often emerges when new creation is needed, when your life is ready for a vision to organize around, or when you are being prepared to bring something new into the world. The Visionary receives the download; the rest of the work is manifestation.

Your patterns suggest your visionary capacity is especially active. Honor what you are seeing, even if it seems impractical or far away. Write it down. Sketch it. Speak it aloud. The Visionary's gift is sight—but the vision only becomes real when it is shared and acted upon.`,
    lightTraits: [
      'Creative imagination',
      'Ability to see possibilities',
      'Inspiration that moves others',
      'Connection to the future',
      'Receiving visionary downloads',
    ],
    shadowTraits: [
      'Disconnection from present reality',
      'Difficulty with practical manifestation',
      'Overwhelming others with vision',
      "Frustration when others can't see",
      'Escapism through fantasy',
    ],
    suggestedWork: [
      'Capture visions in journal, art, or voice notes',
      'Share one vision with a trusted person',
      'Balance visioning with grounded action steps',
      'Practice: What small step brings the vision closer?',
      'Trust your creative sight as a gift',
    ],
    triggers: {
      tarotSuits: ['Wands'],
      tarotMajors: [
        'The Star',
        'The World',
        'Ace of Wands',
        'Three of Wands',
        'Page of Wands',
      ],
      journalingThemes: [
        'vision',
        'future',
        'creative',
        'ideas',
        'inspiration',
        'imagining',
      ],
      dreamMotifs: ['flying', 'seeing far', 'future scenes', 'light', 'stars'],
      transits: ['Uranus', 'Aquarius', 'Neptune', 'Jupiter'],
      lifeThemes: ['creative_rebirth', 'identity_expansion'],
    },
  },

  the_mystic: {
    id: 'the_mystic',
    name: 'The Mystic',
    shortSummary:
      'Your spiritual intuition is deepening, connecting you to inner knowing and sacred dimensions.',
    longSummary: `The Mystic archetype is emerging in your patterns. This is the part of you that senses the sacred, that knows beyond logic, that touches the spiritual dimensions of existence. You are in a phase of deepening connection to your inner knowing and the mysteries of life.

The Mystic does not need proof—they have direct experience. They feel the presence of something greater, sense the interconnection of all things, and trust the wisdom that arises from stillness. If you have been drawn to meditation, feeling more spiritually attuned, or experiencing meaningful synchronicities, this archetype is guiding you.

This energy often emerges when the soul is hungry for depth, when material life feels insufficient, or when you are being prepared for a more spiritually aligned path. The Mystic answers the call to go inward, to commune with what cannot be seen.

Your patterns suggest your mystical capacities are awakening or deepening. This is an invitation to prioritize your spiritual practice, to trust your intuition even when it defies logic, and to allow space for the sacred in your daily life. The Mystic knows that the invisible world is as real as the visible one.`,
    lightTraits: [
      'Deep spiritual connection',
      'Trust in inner knowing',
      'Comfort with mystery',
      'Contemplative presence',
      'Access to non-ordinary awareness',
    ],
    shadowTraits: [
      'Spiritual bypassing',
      'Disconnection from body and earth',
      'Superiority about spiritual insight',
      'Escapism through transcendence',
      'Difficulty with practical matters',
    ],
    suggestedWork: [
      'Establish or deepen daily spiritual practice',
      'Trust intuitive hits, then verify',
      'Journal about mystical experiences',
      'Balance transcendence with embodiment',
      'Find or create sacred space in your home',
    ],
    triggers: {
      tarotSuits: ['Cups', 'Major Arcana'],
      tarotMajors: [
        'The High Priestess',
        'The Hermit',
        'The Star',
        'The Moon',
        'Four of Cups',
      ],
      journalingThemes: [
        'spiritual',
        'intuition',
        'sacred',
        'meditation',
        'divine',
        'mystical',
      ],
      dreamMotifs: [
        'temples',
        'light beings',
        'sacred spaces',
        'visions',
        'transcendence',
      ],
      transits: ['Neptune', 'Pisces', 'Jupiter', 'North Node'],
      lifeThemes: ['spiritual_awakening', 'intuition'],
    },
  },

  the_protector: {
    id: 'the_protector',
    name: 'The Protector',
    shortSummary:
      'You are being called to establish boundaries and guard what is sacred to you.',
    longSummary: `The Protector archetype is emerging in your patterns. This is the part of you that guards, defends, and maintains the boundaries that keep what matters safe. You are in a phase of learning to protect—yourself, your energy, your loved ones, your values.

The Protector is fierce but not aggressive. They know that protection is a form of love, that boundaries are sacred, and that some things require guarding. If you have been feeling the need to set limits, defend your time, or shield yourself from draining influences, this archetype is guiding you.

This energy often emerges when boundaries have been weak, when you have given too much, or when something precious needs defending. The Protector rises when protection is needed—not from paranoia, but from wisdom about what deserves your energy and what does not.

Your patterns suggest you are learning about healthy protection. This might mean saying no more often, creating energetic shields, distancing from toxic influences, or simply honoring your limits. The Protector reminds you that you cannot pour from an empty cup, and that guarding your wellbeing is not selfish but necessary.`,
    lightTraits: [
      'Strong healthy boundaries',
      'Fierce loyalty to what matters',
      'Ability to say no with love',
      'Energetic self-protection',
      'Guardian presence for others',
    ],
    shadowTraits: [
      'Over-protection becoming isolation',
      'Walls instead of boundaries',
      'Hypervigilance and defensiveness',
      'Controlling behavior',
      'Seeing threats where none exist',
    ],
    suggestedWork: [
      'Practice saying no without over-explaining',
      'Create an energetic protection ritual',
      'Journal: What am I being called to protect?',
      'Distinguish between walls and boundaries',
      'Work with protective stones like black tourmaline',
    ],
    triggers: {
      tarotSuits: ['Swords', 'Pentacles'],
      tarotMajors: [
        'The Emperor',
        'Strength',
        'Nine of Wands',
        'King of Swords',
      ],
      journalingThemes: [
        'boundaries',
        'protection',
        'overwhelmed',
        'too much',
        'guarding',
      ],
      dreamMotifs: [
        'shields',
        'walls',
        'guarding',
        'protecting others',
        'fortresses',
      ],
      transits: ['Saturn', 'Mars', 'Capricorn'],
      lifeThemes: ['grounding_stability', 'truth_seeking'],
    },
  },

  the_heart_opener: {
    id: 'the_heart_opener',
    name: 'The Heart Opener',
    shortSummary:
      'You are being called to vulnerability and deeper connection, opening what has been guarded.',
    longSummary: `The Heart Opener archetype is emerging in your patterns. This is the part of you that leads with the heart, that risks vulnerability, that believes love is worth the possibility of pain. You are in a phase of opening—to connection, to intimacy, to the fullness of relational life.

The Heart Opener is brave in a different way than the warrior. Their courage is the courage to be seen, to love without guarantees, to stay open when it would be easier to close. If you have been feeling drawn toward deeper connection, healing relationship patterns, or simply allowing yourself to feel more, this archetype is guiding you.

This energy often emerges when the heart has been guarded too long, when isolation has cost too much, or when life is calling you toward love in its many forms. The Heart Opener answers by slowly, bravely, opening what has been closed.

Your patterns suggest you are ready for more heart-centered living. This might mean initiating difficult but healing conversations, allowing yourself to be truly seen, or simply practicing receiving love without deflecting it. The Heart Opener knows that the open heart, though vulnerable, is the source of life's deepest gifts.`,
    lightTraits: [
      'Courage to be vulnerable',
      'Capacity for deep connection',
      'Leading with the heart',
      'Healing through love',
      'Inspiring openness in others',
    ],
    shadowTraits: [
      'Over-sharing without discernment',
      'Vulnerability as manipulation',
      'Ignoring red flags for connection',
      "Dependency on others' love",
      'Losing self in relationships',
    ],
    suggestedWork: [
      'Practice small vulnerabilities with safe people',
      'Journal: Where is my heart asking to open?',
      'Balance openness with discernment',
      'Heal one relationship pattern consciously',
      'Work with heart-opening practices like loving-kindness',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: [
        'The Lovers',
        'Two of Cups',
        'Three of Cups',
        'Ten of Cups',
        'The Empress',
      ],
      journalingThemes: [
        'love',
        'connection',
        'vulnerability',
        'relationships',
        'opening',
        'heart',
      ],
      dreamMotifs: [
        'hearts',
        'embraces',
        'reunions',
        'opening doors',
        'gardens',
      ],
      transits: ['Venus', 'Libra', 'Neptune', 'Moon'],
      lifeThemes: ['connection_belonging', 'healing_the_heart'],
    },
  },

  the_lunar_weaver: {
    id: 'the_lunar_weaver',
    name: 'The Lunar Weaver',
    shortSummary:
      'You are attuned to cycles and rhythms, weaving your life in harmony with lunar and natural timing.',
    longSummary: `The Lunar Weaver archetype is alive in your patterns. This is the part of you that understands life moves in cycles—that there are times to plant and times to harvest, times to act and times to rest. You are in a phase of deep attunement to rhythm and timing.

The Lunar Weaver does not fight the tides. They observe the moon, note the seasons, and align their actions with the greater rhythms of nature. If you have been feeling more connected to lunar cycles, noticing how your energy waxes and wanes, or sensing the importance of timing, this archetype is guiding you.

This energy often emerges when you have been working against natural rhythms, when burnout comes from ignoring the need for rest, or when life is teaching you about patience and proper timing. The Lunar Weaver remembers that not all seasons are for harvest—some are for planting, some for tending, some for lying fallow.

Your patterns suggest you are learning to weave with the moon. This might mean tracking lunar phases, honoring your energy cycles, or simply paying attention to when different activities feel supported or forced. The Lunar Weaver knows that right timing is as important as right action.`,
    lightTraits: [
      'Attunement to natural rhythms',
      'Wisdom about timing',
      'Honoring cycles of rest and action',
      'Connection to lunar energy',
      'Patience with natural unfolding',
    ],
    shadowTraits: [
      'Using cycles as excuse for inaction',
      'Rigidity about timing',
      'Disconnection from personal rhythm',
      'Over-reliance on external timing',
      'Losing agency to cycles',
    ],
    suggestedWork: [
      'Begin or deepen moon phase tracking',
      'Notice your personal energy cycles',
      'Align one goal with lunar timing',
      'Create new moon intention rituals',
      'Journal about what season you are in',
    ],
    triggers: {
      tarotSuits: ['Cups', 'Major Arcana'],
      tarotMajors: [
        'The Moon',
        'The High Priestess',
        'Wheel of Fortune',
        'Two of Pentacles',
      ],
      journalingThemes: [
        'cycles',
        'timing',
        'moon',
        'seasons',
        'rhythm',
        'flow',
      ],
      dreamMotifs: ['moon', 'tides', 'seasons changing', 'spinning', 'weaving'],
      transits: ['Moon', 'Cancer', 'Neptune'],
      lifeThemes: ['spiritual_awakening', 'intuition'],
    },
  },

  the_alchemist: {
    id: 'the_alchemist',
    name: 'The Alchemist',
    shortSummary:
      "You are in a process of transformation, turning life's raw material into golden wisdom.",
    longSummary: `The Alchemist archetype is emerging powerfully in your patterns. This is the part of you that transforms—that takes pain and makes meaning, that finds gold in the rubble, that understands that everything can be fuel for growth. You are in a profound phase of integration and meaning-making.

The Alchemist does not waste experience. They see that every challenge, every wound, every strange twist of fate contains the potential for transformation. If you have been finding meaning in difficulty, integrating disparate parts of your experience, or sensing that everything is connected, this archetype is guiding you.

This energy often emerges when life has provided rich but raw material—experiences that need to be processed, integrated, and understood. The Alchemist takes what is base and makes it precious, not by denial but by deep engagement and transmutation.

Your patterns suggest you are in an alchemical phase. This might mean actively working to find meaning in challenges, integrating lessons from multiple areas of life, or recognizing how your struggles are becoming your strengths. The Alchemist reminds you that you have the power to transform anything—if you are willing to work with it consciously.`,
    lightTraits: [
      'Ability to find meaning in everything',
      'Transforming pain into wisdom',
      'Integration of opposites',
      'Making gold from base material',
      'Deep processing capacity',
    ],
    shadowTraits: [
      'Forced positivity about pain',
      'Intellectualizing instead of feeling',
      'Avoiding grief by rushing to meaning',
      'Superiority about transformation',
      'Never letting anything be simple',
    ],
    suggestedWork: [
      'Journal: What am I currently transforming?',
      'Practice both feeling AND meaning-making',
      'Look for the integration point between opposites',
      'Honor raw experience before alchemizing it',
      'Trust your capacity to transform difficulty',
    ],
    triggers: {
      tarotSuits: ['Major Arcana'],
      tarotMajors: [
        'Temperance',
        'The World',
        'Death',
        'The Magician',
        'Judgement',
      ],
      journalingThemes: [
        'meaning',
        'integration',
        'growth',
        'transformation',
        'lessons',
        'wisdom',
      ],
      dreamMotifs: [
        'mixing',
        'gold',
        'laboratories',
        'transformations',
        'merging',
      ],
      transits: ['Pluto', 'Scorpio', 'Saturn', 'Jupiter'],
      lifeThemes: ['transformation', 'growth', 'shadow_integration'],
    },
  },
};

interface DetectionInput {
  journalMoods?: string[];
  journalThemes?: string[];
  tarotSuits?: string[];
  tarotCards?: string[];
  dreamKeywords?: string[];
  activeTransits?: string[];
  lifeThemes?: string[];
}

function calculateArchetypeScore(
  archetype: LunaryArchetype,
  input: DetectionInput,
): number {
  let score = 0;
  const triggers = archetype.triggers;

  if (triggers.journalingThemes && input.journalThemes) {
    input.journalThemes.forEach((theme) => {
      if (
        triggers.journalingThemes!.some((t) =>
          theme.toLowerCase().includes(t.toLowerCase()),
        )
      ) {
        score += 3;
      }
    });
  }

  if (triggers.journalingThemes && input.journalMoods) {
    input.journalMoods.forEach((mood) => {
      if (
        triggers.journalingThemes!.some((t) =>
          mood.toLowerCase().includes(t.toLowerCase()),
        )
      ) {
        score += 2;
      }
    });
  }

  if (triggers.tarotSuits && input.tarotSuits) {
    input.tarotSuits.forEach((suit) => {
      if (triggers.tarotSuits!.includes(suit)) {
        score += 2;
      }
    });
  }

  if (triggers.tarotMajors && input.tarotCards) {
    input.tarotCards.forEach((card) => {
      if (
        triggers.tarotMajors!.some((m) =>
          card.toLowerCase().includes(m.toLowerCase()),
        )
      ) {
        score += 3;
      }
    });
  }

  if (triggers.dreamMotifs && input.dreamKeywords) {
    input.dreamKeywords.forEach((keyword) => {
      if (
        triggers.dreamMotifs!.some((m) =>
          keyword.toLowerCase().includes(m.toLowerCase()),
        )
      ) {
        score += 2.5;
      }
    });
  }

  if (triggers.transits && input.activeTransits) {
    input.activeTransits.forEach((transit) => {
      if (
        triggers.transits!.some((t) =>
          transit.toLowerCase().includes(t.toLowerCase()),
        )
      ) {
        score += 2;
      }
    });
  }

  if (triggers.lifeThemes && input.lifeThemes) {
    input.lifeThemes.forEach((theme) => {
      if (triggers.lifeThemes!.includes(theme)) {
        score += 4;
      }
    });
  }

  return score;
}

export function detectPrimaryArchetype(
  input: DetectionInput,
): LunaryArchetype | null {
  const scores: Array<{ archetype: LunaryArchetype; score: number }> = [];

  Object.values(LUNARY_ARCHETYPES).forEach((archetype) => {
    const score = calculateArchetypeScore(archetype, input);
    if (score > 0) {
      scores.push({ archetype, score });
    }
  });

  if (scores.length === 0) {
    return null;
  }

  scores.sort((a, b) => b.score - a.score);
  return scores[0].archetype;
}

export function getArchetypeById(id: string): LunaryArchetype | null {
  return LUNARY_ARCHETYPES[id] || null;
}

export function getAllArchetypes(): LunaryArchetype[] {
  return Object.values(LUNARY_ARCHETYPES);
}
