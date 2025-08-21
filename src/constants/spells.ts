import { MoonPhaseLabels } from '../../utils/moon/moonPhases';

export interface Spell {
  id: string;
  title: string;
  category:
    | 'protection'
    | 'love'
    | 'prosperity'
    | 'healing'
    | 'cleansing'
    | 'divination'
    | 'manifestation'
    | 'banishing';
  type:
    | 'spell'
    | 'ritual'
    | 'charm'
    | 'potion'
    | 'candle_magic'
    | 'herb_magic'
    | 'crystal_magic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timing: {
    moonPhase?: MoonPhaseLabels[];
    sabbat?: string[];
    planetaryDay?: string[];
    timeOfDay?: 'dawn' | 'noon' | 'dusk' | 'midnight' | 'any';
    season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
  };
  duration: string;
  ingredients: {
    name: string;
    amount?: string;
    purpose: string;
    substitutes?: string[];
  }[];
  tools: string[];
  preparation: string[];
  steps: string[];
  purpose: string;
  description: string;
  correspondences: {
    elements?: string[];
    colors?: string[];
    crystals?: string[];
    herbs?: string[];
    planets?: string[];
    zodiac?: string[];
  };
  safety: string[];
  variations?: string[];
  history?: string;
}

export const spellCategories = {
  protection: {
    name: 'Protection',
    description:
      'Spells and rituals for creating shields, barriers, and safeguards',
    icon: '🛡️',
  },
  love: {
    name: 'Love & Relationships',
    description:
      'Workings for self-love, attracting love, and strengthening bonds',
    icon: '💖',
  },
  prosperity: {
    name: 'Prosperity & Abundance',
    description:
      'Spells for financial success, career advancement, and abundance',
    icon: '💰',
  },
  healing: {
    name: 'Healing & Wellness',
    description: 'Rituals for physical, emotional, and spiritual healing',
    icon: '🌿',
  },
  cleansing: {
    name: 'Cleansing & Purification',
    description: 'Clearing negative energy from spaces, objects, and self',
    icon: '✨',
  },
  divination: {
    name: 'Divination & Wisdom',
    description: 'Enhancing psychic abilities and gaining insight',
    icon: '🔮',
  },
  manifestation: {
    name: 'Manifestation',
    description: 'Bringing desires and goals into reality',
    icon: '🌟',
  },
  banishing: {
    name: 'Banishing & Release',
    description: 'Removing unwanted influences and letting go',
    icon: '🌙',
  },
};

export const spells: Spell[] = [
  // PROTECTION SPELLS
  {
    id: 'salt-circle-protection',
    title: 'Salt Circle Protection',
    category: 'protection',
    type: 'ritual',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waxing Crescent', 'Full Moon'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '15-20 minutes',
    ingredients: [
      {
        name: 'Sea salt or kosher salt',
        amount: '1 cup',
        purpose: 'Creating protective barrier',
        substitutes: ['Himalayan pink salt', 'Black salt'],
      },
      {
        name: 'White candle',
        amount: '1',
        purpose: 'Divine light and protection',
        substitutes: ['Beeswax candle', 'LED candle if fire not permitted'],
      },
    ],
    tools: ['Lighter or matches', 'Small bowl for salt'],
    preparation: [
      'Cleanse your space with sage or palo santo',
      'Set clear intention for protection',
      'Ground and center yourself through deep breathing',
    ],
    steps: [
      'Light the white candle and place it in the center of your space',
      'Beginning in the North, slowly pour salt in a clockwise circle around yourself',
      'As you pour, visualize white light emanating from the salt, creating an impenetrable barrier',
      'Complete the circle and stand in the center',
      'Hold your hands up and say: "By salt and flame, by earth and light, I call protection to me this night. No harm may pass this sacred space, only love and light may enter this place."',
      'Sit quietly for 5-10 minutes, feeling the protective energy around you',
      'When finished, thank the elements and carefully collect the salt for disposal in running water',
    ],
    purpose:
      'Creates a powerful protective barrier around the practitioner or space',
    description:
      "A foundational protection ritual using salt's natural purifying properties to create a sacred, protected space. This ancient practice has been used across cultures for millennia.",
    correspondences: {
      elements: ['Earth', 'Fire'],
      colors: ['White', 'Silver'],
      crystals: ['Clear Quartz', 'Black Tourmaline', 'Hematite'],
      planets: ['Moon', 'Saturn'],
    },
    safety: [
      'Use only food-grade salt',
      'Never leave candles unattended',
      'Be mindful of pets who might try to eat salt',
      'Dispose of used salt in running water, not in household plants',
    ],
    variations: [
      'Add protective herbs like rosemary or sage to the salt',
      'Use black salt for banishing negative energy',
      'Create permanent protection by placing salt in corners of home',
    ],
    history:
      'Salt has been considered sacred and protective since ancient times. Romans paid soldiers in salt (salary), and it appears in protective rituals across Celtic, Hoodoo, and Mediterranean traditions.',
  },

  {
    id: 'black-tourmaline-shield',
    title: 'Black Tourmaline Energy Shield',
    category: 'protection',
    type: 'crystal_magic',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waning Crescent'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '10-15 minutes daily',
    ingredients: [
      {
        name: 'Black Tourmaline',
        amount: '1 piece',
        purpose: 'Absorbing negative energy and creating protective field',
        substitutes: ['Hematite', 'Obsidian', 'Smoky Quartz'],
      },
      {
        name: 'Sea salt',
        amount: '2 tablespoons',
        purpose: 'Cleansing and charging the crystal',
      },
    ],
    tools: ['Small bowl', 'Soft cloth'],
    preparation: [
      'Cleanse the tourmaline in salt water for 24 hours',
      'Dry with soft cloth and hold in dominant hand',
      'Set intention for protection while holding the stone',
    ],
    steps: [
      'Hold the black tourmaline in your dominant hand',
      'Close your eyes and feel its grounding energy',
      'Visualize roots growing from your feet into the earth',
      'See a black protective shield surrounding your entire aura',
      'Program the stone by saying: "Black tourmaline, stone of night, surround me with protective light. Shield me from all harm and ill, bend negative energy to your will."',
      'Carry the stone with you or place it in your living space',
      'Cleanse weekly by placing on sea salt overnight',
    ],
    purpose:
      'Creates a personal energy shield that deflects negative energy and psychic attacks',
    description:
      'Black tourmaline is known as the premier protection stone in crystal healing. It creates an energetic boundary that transmutes negative energy into positive.',
    correspondences: {
      elements: ['Earth'],
      colors: ['Black'],
      crystals: ['Black Tourmaline', 'Hematite', 'Obsidian'],
      planets: ['Saturn', 'Pluto'],
      zodiac: ['Capricorn', 'Scorpio'],
    },
    safety: [
      'Cleanse stone regularly as it absorbs negative energy',
      'Some people find black tourmaline too intense - start with small pieces',
      'Do not use damaged or cracked stones for protection work',
    ],
    history:
      'Black tourmaline has been used for protection since ancient times. Brazilian shamans used it to protect against demons, and it was traditionally used by magicians as a scrying stone.',
  },

  // LOVE SPELLS
  {
    id: 'rose-quartz-self-love',
    title: 'Rose Quartz Self-Love Ritual',
    category: 'love',
    type: 'crystal_magic',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waxing Crescent', 'Full Moon'],
      planetaryDay: ['Friday', 'Venus'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '20-30 minutes',
    ingredients: [
      {
        name: 'Rose Quartz',
        amount: '1 piece',
        purpose: 'Opening heart chakra and promoting self-love',
        substitutes: ['Green Aventurine', 'Rhodonite'],
      },
      {
        name: 'Pink or white candle',
        amount: '1',
        purpose: 'Representing love and divine feminine energy',
      },
      {
        name: 'Rose petals',
        amount: 'Handful',
        purpose: 'Love vibration and heart opening',
        substitutes: ['Lavender', 'Jasmine petals'],
      },
      {
        name: 'Mirror',
        amount: '1 small',
        purpose: 'Self-reflection and acceptance',
      },
    ],
    tools: ['Soft cloth', 'Small bowl'],
    preparation: [
      'Take a cleansing bath with rose petals or rose oil',
      'Dress in comfortable clothes in pink, white, or green',
      'Create sacred space in front of mirror',
      'Cleanse rose quartz with rose water or moonlight',
    ],
    steps: [
      'Light the pink candle and place it safely near the mirror',
      'Hold rose quartz over your heart and breathe deeply',
      'Look into your own eyes in the mirror with compassion',
      'Place rose petals around the mirror and candle',
      'Hold the rose quartz and say: "I am worthy of love, I am worthy of care. The love I seek begins with love I share. With rose quartz pure and candle bright, I fill my heart with loving light."',
      'Spend 10 minutes looking at yourself with love, focusing on positive qualities',
      'Thank yourself for the gift of self-love',
      'Keep rose quartz near your bed or carry with you',
    ],
    purpose:
      'Develops unconditional self-love and opens the heart to receive love from others',
    description:
      "Self-love is the foundation of all healthy relationships. This ritual uses rose quartz's gentle energy to heal heart wounds and build genuine self-acceptance.",
    correspondences: {
      elements: ['Water', 'Earth'],
      colors: ['Pink', 'Green', 'White'],
      crystals: ['Rose Quartz', 'Green Aventurine', 'Rhodonite'],
      herbs: ['Rose', 'Lavender', 'Jasmine'],
      planets: ['Venus', 'Moon'],
      zodiac: ['Taurus', 'Libra', 'Cancer'],
    },
    safety: [
      'This is about self-love, not attracting specific people',
      'Work through any resistance to self-love gently',
      'Never leave candles unattended',
    ],
    variations: [
      'Add rose essential oil to pulse points',
      'Write love letters to yourself',
      'Practice daily affirmations with the rose quartz',
    ],
    history:
      'Rose quartz has been called the "Love Stone" since ancient times. Romans and Egyptians believed it could prevent aging and promote love. The mirror work comes from modern self-love practices.',
  },

  // PROSPERITY SPELLS
  {
    id: 'basil-prosperity-jar',
    title: 'Basil Prosperity Jar Spell',
    category: 'prosperity',
    type: 'herb_magic',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waxing Crescent', 'Waxing Gibbous'],
      planetaryDay: ['Thursday', 'Sunday'],
      timeOfDay: 'noon',
      season: 'any',
    },
    duration: '30 minutes',
    ingredients: [
      {
        name: 'Fresh basil leaves',
        amount: '1/4 cup',
        purpose: 'Attracting wealth and prosperity',
        substitutes: ['Dried basil', 'Mint leaves'],
      },
      {
        name: 'Bay leaves',
        amount: '3 pieces',
        purpose: 'Success and achievement in goals',
      },
      {
        name: 'Cinnamon stick',
        amount: '1',
        purpose: 'Fast manifestation and abundance',
      },
      {
        name: 'Green candle',
        amount: '1',
        purpose: 'Money and growth energy',
      },
      {
        name: 'Small jar with lid',
        amount: '1',
        purpose: 'Containing and focusing the spell energy',
      },
      {
        name: 'Coin or paper money',
        amount: '1',
        purpose: 'Magnetic focus for abundance',
      },
    ],
    tools: ['Pen with green ink', 'Small paper'],
    preparation: [
      'Cleanse jar with salt water and dry completely',
      'Write your specific financial goal on small paper with green ink',
      'Gather all ingredients during daylight hours for best energy',
    ],
    steps: [
      'Light the green candle and place jar in front of it',
      'Hold each ingredient and charge it with your intention for prosperity',
      'Place the coin in the bottom of the jar',
      'Add basil leaves while saying: "Basil green, abundance bring, let prosperity to me sing"',
      'Add bay leaves while saying: "Success and wealth, now come to me, as I will it, so mote it be"',
      'Break cinnamon stick into pieces and add while saying: "Cinnamon sweet, make abundance fleet"',
      'Fold your written goal and place it on top',
      'Seal the jar and hold it in both hands',
      'Visualize your goal achieved while saying: "Herbs of plenty, hear my call, bring abundance, great and small. This jar contains my deepest need, let prosperity grow like seed."',
      "Place jar in a prominent place where you'll see it daily",
      'Shake gently each morning while visualizing your goal',
    ],
    purpose:
      'Attracts financial abundance and prosperity through herbal correspondence and focused intention',
    description:
      'This traditional prosperity spell combines powerful money-drawing herbs in a contained spell that works continuously. Basil has been used for wealth magic across many cultures.',
    correspondences: {
      elements: ['Earth', 'Fire'],
      colors: ['Green', 'Gold', 'Brown'],
      crystals: ['Citrine', 'Pyrite', 'Green Aventurine'],
      herbs: ['Basil', 'Bay', 'Cinnamon', 'Mint'],
      planets: ['Jupiter', 'Sun', 'Venus'],
      zodiac: ['Taurus', 'Virgo', 'Capricorn'],
    },
    safety: [
      'Focus on ethical wealth attraction, not taking from others',
      'Be specific about your financial goals',
      'Take practical action alongside magical work',
      'Replace herbs monthly for fresh energy',
    ],
    variations: [
      'Add citrine crystal for extra manifestation power',
      'Use during Jupiter hour for maximum effect',
      'Add personal items like business cards for career success',
    ],
    history:
      'Basil has been sacred to wealth deities like Lakshmi in Hindu tradition and was used by Roman merchants for prosperity. Jar spells come from American folk magic traditions.',
  },

  // HEALING SPELLS
  {
    id: 'lavender-healing-bath',
    title: 'Lavender Healing Bath Ritual',
    category: 'healing',
    type: 'herb_magic',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Full Moon', 'Waning Gibbous'],
      timeOfDay: 'dusk',
      season: 'any',
    },
    duration: '45 minutes',
    ingredients: [
      {
        name: 'Dried lavender',
        amount: '1/2 cup',
        purpose: 'Relaxation and emotional healing',
        substitutes: ['Chamomile', 'Rose petals'],
      },
      {
        name: 'Epsom salt',
        amount: '1 cup',
        purpose: 'Physical tension relief and purification',
      },
      {
        name: 'Eucalyptus leaves',
        amount: '1/4 cup',
        purpose: 'Respiratory healing and mental clarity',
        substitutes: ['Peppermint', 'Rosemary'],
      },
      {
        name: 'Clear quartz',
        amount: '1 piece',
        purpose: 'Amplifying healing energy',
        substitutes: ['Amethyst', 'Rose Quartz'],
      },
    ],
    tools: ['Muslin bag or cheesecloth', 'White candle'],
    preparation: [
      'Clean bathtub thoroughly with natural cleaners',
      'Set intention for what needs healing in your life',
      'Prepare herbal sachet by tying herbs in muslin bag',
    ],
    steps: [
      'Draw a warm (not hot) bath',
      'Light white candle for healing energy',
      'Add Epsom salt to running water',
      'Hang herbal sachet under the faucet so water runs through it',
      'Place clear quartz at foot of tub',
      'Before entering, hold hands over water and say: "Waters of healing, herbs of earth, cleanse my body, renew my worth. Lavender calm and eucalyptus clear, wash away all pain and fear."',
      'Soak for 20-30 minutes, visualizing healing light surrounding you',
      'Focus on releasing what no longer serves your highest good',
      'When finished, let water drain while you remain in tub, visualizing pain/illness flowing away',
      'Rinse with cool water to seal the healing',
    ],
    purpose:
      'Promotes physical, emotional, and spiritual healing through herbal medicine and water therapy',
    description:
      "Combines aromatherapy, crystal healing, and water magic for holistic wellness. Lavender's healing properties are enhanced by ritual intention.",
    correspondences: {
      elements: ['Water', 'Earth'],
      colors: ['Purple', 'White', 'Blue'],
      crystals: ['Clear Quartz', 'Amethyst', 'Rose Quartz'],
      herbs: ['Lavender', 'Eucalyptus', 'Chamomile'],
      planets: ['Moon', 'Neptune'],
      zodiac: ['Cancer', 'Pisces', 'Virgo'],
    },
    safety: [
      'Test water temperature to prevent burns',
      'Check for herb allergies before use',
      'Limit bath time to prevent dehydration',
      'This ritual supports but does not replace medical care',
      'Remove crystals before draining to prevent loss',
    ],
    variations: [
      'Add healing essential oils like tea tree or frankincense',
      'Include healing intentions written on biodegradable paper',
      'Use different herbs for specific ailments',
    ],
    history:
      'Ritual bathing for healing dates to ancient Egyptian, Greek, and Roman traditions. Lavender has been used medicinally for over 2,500 years across Mediterranean cultures.',
  },

  // CLEANSING SPELLS
  {
    id: 'sage-space-cleansing',
    title: 'Sacred Sage Space Cleansing',
    category: 'cleansing',
    type: 'herb_magic',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waning Crescent'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '20-30 minutes',
    ingredients: [
      {
        name: 'White sage bundle',
        amount: '1',
        purpose: 'Clearing negative energy and purification',
        substitutes: ['Palo Santo', 'Cedar', 'Rosemary bundle'],
      },
      {
        name: 'Abalone shell or fireproof bowl',
        amount: '1',
        purpose: 'Safe burning vessel representing water element',
      },
      {
        name: 'Feather',
        amount: '1',
        purpose: 'Directing smoke and representing air element',
        substitutes: ['Fan', 'Your hand'],
      },
    ],
    tools: ['Lighter or matches', 'Sand for shell'],
    preparation: [
      'Open windows and doors for negative energy to exit',
      'Set clear intention for what you want to clear',
      'Start from the front door and work clockwise through space',
    ],
    steps: [
      'Light the sage bundle, let it catch fire briefly, then blow out flame to create smoke',
      'Hold shell underneath to catch any falling embers',
      'Begin at front door, waving smoke with feather while saying: "Sacred smoke, clear this space, remove all negative energy from this place. Only love and light remain, let peace and harmony here reign."',
      'Move clockwise through each room, paying special attention to corners, closets, and areas that feel heavy',
      'Cleanse doorways and windows by waving smoke around frames',
      'For personal cleansing, start at feet and move smoke up your body to crown',
      'End where you began, offering gratitude to the plant spirit',
      'Extinguish sage by pressing into sand in shell',
      'Feel the lighter, clearer energy in your space',
    ],
    purpose:
      'Removes negative energy, spiritual debris, and stagnant vibrations from spaces and people',
    description:
      'A traditional Native American practice for spiritual purification. Sage smoke carries prayers and clears energetic imprints.',
    correspondences: {
      elements: ['Air', 'Fire', 'Earth'],
      colors: ['White', 'Silver', 'Green'],
      crystals: ['Selenite', 'Clear Quartz', 'Black Tourmaline'],
      herbs: ['White Sage', 'Cedar', 'Sweetgrass'],
      planets: ['Moon', 'Saturn'],
    },
    safety: [
      'Use ethically sourced sage - many areas face over-harvesting',
      'Never leave burning sage unattended',
      'Ensure proper ventilation to prevent smoke inhalation',
      'Be respectful of the sacred nature of this practice',
      'Check fire regulations in your area',
    ],
    variations: [
      'Use sound (bells, singing bowls) alongside smoke',
      'Add prayers or mantras specific to your tradition',
      'Follow with blessing herbs like sweetgrass or copal',
    ],
    history:
      'Sage cleansing is sacred to many Native American tribes and has been practiced for thousands of years. Always approach with respect and cultural sensitivity.',
  },

  // SABBAT-SPECIFIC SPELLS
  {
    id: 'samhain-ancestor-connection',
    title: 'Samhain Ancestor Connection Ritual',
    category: 'divination',
    type: 'ritual',
    difficulty: 'intermediate',
    timing: {
      sabbat: ['Samhain'],
      moonPhase: ['New Moon', 'Waning Crescent'],
      timeOfDay: 'midnight',
      season: 'autumn',
    },
    duration: '60 minutes',
    ingredients: [
      {
        name: 'Black candle',
        amount: '1',
        purpose: 'Honoring the ancestors and the veil between worlds',
      },
      {
        name: 'White candle',
        amount: '1',
        purpose: 'Protection and divine light',
      },
      {
        name: 'Photos of deceased loved ones',
        amount: 'As many as desired',
        purpose: 'Creating connection with specific ancestors',
      },
      {
        name: 'Offerings',
        amount: 'Small portions',
        purpose: 'Honoring ancestors with their favorite foods/drinks',
        substitutes: ['Bread', 'Wine', 'Apples', 'Nuts'],
      },
      {
        name: 'Rosemary',
        amount: '1 sprig',
        purpose: 'Remembrance and protection',
      },
      {
        name: 'Mugwort',
        amount: '1 tablespoon',
        purpose: 'Enhancing psychic abilities and dream work',
        substitutes: ['Lavender', 'Jasmine'],
      },
    ],
    tools: [
      'Altar cloth (black or deep purple)',
      'Journal and pen',
      'Divination tool (optional)',
    ],
    preparation: [
      'Create ancestor altar with photos and meaningful objects',
      'Fast for 3-6 hours before ritual for spiritual clarity',
      'Meditate on ancestors you wish to connect with',
    ],
    steps: [
      'Set up altar with black cloth, placing photos in center',
      'Light white candle first for protection, then black candle for ancestors',
      'Place offerings before photos while saying names of deceased loved ones',
      'Burn mugwort as incense for psychic enhancement',
      'Hold rosemary and say: "Ancestors wise, beyond the veil, on Samhain night when boundaries fail, I call to you with love and light, share your wisdom on this night."',
      'Sit quietly and open yourself to ancestral messages through meditation',
      'Pay attention to thoughts, feelings, or sensations that arise',
      'Ask specific questions and listen for guidance',
      'Journal any messages, images, or insights received',
      'Thank your ancestors before extinguishing candles',
      'Leave offerings overnight, then dispose respectfully in nature',
    ],
    purpose:
      'Connects with ancestral wisdom and receives guidance from those who have passed on',
    description:
      'Samhain (Halloween) is when the veil between worlds is thinnest, making it the ideal time for ancestor communication and receiving their guidance.',
    correspondences: {
      elements: ['Air', 'Spirit'],
      colors: ['Black', 'Orange', 'Deep Purple'],
      crystals: ['Obsidian', 'Labradorite', 'Amethyst'],
      herbs: ['Mugwort', 'Rosemary', 'Sage', 'Apple'],
      planets: ['Pluto', 'Saturn', 'Moon'],
      zodiac: ['Scorpio', 'Capricorn'],
    },
    safety: [
      'Protect yourself with white light before beginning',
      'Only communicate with ancestors, not random spirits',
      'Ground thoroughly after ritual',
      'If you feel uncomfortable, end ritual immediately',
      'This work can be emotionally intense - prepare for healing',
    ],
    variations: [
      'Include divination tools like tarot or scrying',
      'Create ancestor shrine to maintain year-round',
      'Write letters to deceased loved ones and burn them',
    ],
    history:
      'Samhain is an ancient Celtic festival marking the end of harvest and beginning of winter. Ancestor veneration has been practiced across all cultures throughout history.',
  },

  {
    id: 'beltane-fertility-blessing',
    title: 'Beltane Fertility and Abundance Blessing',
    category: 'manifestation',
    type: 'ritual',
    difficulty: 'intermediate',
    timing: {
      sabbat: ['Beltane'],
      moonPhase: ['Waxing Gibbous', 'Full Moon'],
      timeOfDay: 'dawn',
      season: 'spring',
    },
    duration: '45 minutes',
    ingredients: [
      {
        name: 'Fresh flowers',
        amount: 'Large bouquet',
        purpose: 'Celebrating life force and fertility',
        substitutes: ['Silk flowers if allergic'],
      },
      {
        name: 'Red candle',
        amount: '1',
        purpose: 'Passion and life force energy',
      },
      {
        name: 'Green candle',
        amount: '1',
        purpose: 'Growth and abundance',
      },
      {
        name: 'Seeds',
        amount: 'Small packet',
        purpose: 'Manifestation and growth potential',
        substitutes: ['Flower seeds', 'Herb seeds', 'Sunflower seeds'],
      },
      {
        name: 'Honey',
        amount: '1 tablespoon',
        purpose: 'Sweetness and abundance',
      },
      {
        name: 'Small pot with soil',
        amount: '1',
        purpose: 'Grounding manifestation in physical realm',
      },
    ],
    tools: ['Water for seeds', 'Ribbon (red or green)'],
    preparation: [
      'Gather flowers at dawn for maximum life force',
      'Choose seeds that represent what you want to grow in your life',
      'Create outdoor altar if possible, or near window with sunlight',
    ],
    steps: [
      'Arrange flowers in circle with candles at center',
      'Light red candle while saying: "Fire of passion, flame of life, cut through barriers like a knife"',
      'Light green candle while saying: "Earth\'s abundance, nature\'s grace, bring forth growth in this sacred space"',
      'Hold seeds in palms and charge with your intentions for growth',
      'Plant seeds in pot while visualizing your goals growing and flourishing',
      'Water seeds with blessed water while saying: "Seeds of change, seeds of light, grow my dreams both day and night"',
      'Drizzle honey over soil as offering to earth spirits',
      'Tie ribbon around pot and place where it will receive sunlight',
      'Dance or move joyfully around your flower circle to raise energy',
      "End by eating some honey and sharing gratitude for life's abundance",
    ],
    purpose:
      'Celebrates fertility, creativity, and manifests new growth in all areas of life',
    description:
      'Beltane is the festival of fertility and life force. This ritual harnesses the powerful creative energy of spring to manifest desires and celebrate abundance.',
    correspondences: {
      elements: ['Fire', 'Earth'],
      colors: ['Red', 'Green', 'Yellow', 'White'],
      crystals: ['Carnelian', 'Rose Quartz', 'Green Aventurine'],
      herbs: ['Rose', 'Hawthorn', 'Rowan', 'Primrose'],
      planets: ['Venus', 'Mars', 'Sun'],
      zodiac: ['Taurus', 'Aries'],
    },
    safety: [
      'This celebrates all forms of fertility, not just physical',
      'Focus on creating rather than forcing',
      'Tend to your planted seeds as representation of tending your goals',
      'Be careful with fire if celebrating outdoors',
    ],
    variations: [
      'Create flower crowns for the celebration',
      'Include Maypole dancing if with a group',
      'Make flower water for blessing throughout the year',
    ],
    history:
      'Beltane is an ancient Celtic fire festival celebrating the peak of spring and fertility. Traditions include flower crowns, Maypole dancing, and blessing livestock and crops.',
  },
];

// Moon Phase specific spell recommendations
export const moonSpells = {
  'New Moon': [
    'salt-circle-protection',
    'rose-quartz-self-love',
    'basil-prosperity-jar',
    'sage-space-cleansing',
  ],
  'Waxing Crescent': [
    'basil-prosperity-jar',
    'rose-quartz-self-love',
    'salt-circle-protection',
  ],
  'First Quarter': ['basil-prosperity-jar'],
  'Waxing Gibbous': ['basil-prosperity-jar', 'beltane-fertility-blessing'],
  'Full Moon': [
    'lavender-healing-bath',
    'rose-quartz-self-love',
    'salt-circle-protection',
    'beltane-fertility-blessing',
  ],
  'Waning Gibbous': ['lavender-healing-bath'],
  'Last Quarter': ['black-tourmaline-shield', 'sage-space-cleansing'],
  'Waning Crescent': [
    'black-tourmaline-shield',
    'sage-space-cleansing',
    'samhain-ancestor-connection',
  ],
};

// Sabbat specific spell recommendations
export const sabbatSpells: { [key: string]: string[] } = {
  Samhain: [
    'samhain-ancestor-connection',
    'black-tourmaline-shield',
    'sage-space-cleansing',
  ],
  Yule: ['salt-circle-protection', 'lavender-healing-bath'],
  Imbolc: ['sage-space-cleansing', 'rose-quartz-self-love'],
  Ostara: ['basil-prosperity-jar', 'rose-quartz-self-love'],
  Beltane: ['beltane-fertility-blessing', 'rose-quartz-self-love'],
  Litha: ['lavender-healing-bath', 'basil-prosperity-jar'],
  Lammas: ['basil-prosperity-jar'],
  Mabon: ['lavender-healing-bath', 'sage-space-cleansing'],
};

export const getSpellById = (id: string): Spell | undefined => {
  return spells.find((spell) => spell.id === id);
};

export const getSpellsByCategory = (category: string): Spell[] => {
  return spells.filter((spell) => spell.category === category);
};

export const getSpellsByMoonPhase = (moonPhase: MoonPhaseLabels): Spell[] => {
  const spellIds = moonSpells[moonPhase] || [];
  return spellIds.map((id) => getSpellById(id)).filter(Boolean) as Spell[];
};

export const getSpellsBySabbat = (sabbat: string): Spell[] => {
  const spellIds = sabbatSpells[sabbat] || [];
  return spellIds.map((id) => getSpellById(id)).filter(Boolean) as Spell[];
};

export const getRecommendedSpells = (
  moonPhase: MoonPhaseLabels,
  currentSabbat?: string,
): Spell[] => {
  const moonRecommended = getSpellsByMoonPhase(moonPhase);
  const sabbatRecommended = currentSabbat
    ? getSpellsBySabbat(currentSabbat)
    : [];

  // Combine and deduplicate
  const combined = [...moonRecommended, ...sabbatRecommended];
  return combined.filter(
    (spell, index, self) => index === self.findIndex((s) => s.id === spell.id),
  );
};
