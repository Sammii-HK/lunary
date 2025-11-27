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

  // BANISHING SPELLS
  {
    id: 'cord-cutting-ritual',
    title: 'Cord Cutting Ritual',
    category: 'banishing',
    type: 'ritual',
    difficulty: 'intermediate',
    timing: {
      moonPhase: ['Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
      timeOfDay: 'midnight',
      season: 'any',
    },
    duration: '30 minutes',
    ingredients: [
      {
        name: 'Black candle',
        amount: '2',
        purpose: 'Representing yourself and the person/situation',
      },
      {
        name: 'Black cord or string',
        amount: '12 inches',
        purpose: 'Representing the energetic connection to cut',
        substitutes: ['Black ribbon', 'Black yarn'],
      },
      {
        name: 'Scissors or athame',
        amount: '1',
        purpose: 'Cutting the cord',
      },
    ],
    tools: ['Fireproof dish', 'Salt for circle'],
    preparation: [
      'Cast a protective circle with salt',
      'Ground yourself and set clear intention',
      'Identify exactly what connection you wish to sever',
    ],
    steps: [
      'Place candles about 6 inches apart',
      'Tie one end of cord around each candle',
      'Light both candles',
      'Focus on the connection you wish to release',
      'Say: "I release all cords that bind me to [name/situation]. I reclaim my energy and set us both free."',
      'Cut the cord in the center with scissors',
      'Let candles burn down completely',
      'Bury or dispose of cord remnants away from your home',
    ],
    purpose: 'Severs unhealthy energetic attachments to people or situations',
    description:
      'A powerful ritual for releasing toxic relationships, past trauma bonds, or unhealthy attachments that drain your energy.',
    correspondences: {
      elements: ['Fire', 'Spirit'],
      colors: ['Black', 'White'],
      crystals: ['Obsidian', 'Black Tourmaline', 'Smoky Quartz'],
      planets: ['Saturn', 'Pluto'],
      zodiac: ['Scorpio', 'Capricorn'],
    },
    safety: [
      'Only cut cords with those you truly wish to release',
      'This severs the unhealthy connection, not love or good memories',
      'Ground thoroughly after this intense work',
    ],
  },

  {
    id: 'freezer-spell',
    title: 'Freezer Binding Spell',
    category: 'banishing',
    type: 'spell',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Waning Crescent', 'New Moon'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '10 minutes',
    ingredients: [
      {
        name: 'Small piece of paper',
        amount: '1',
        purpose: 'Writing the name or situation',
      },
      {
        name: 'Small container with lid',
        amount: '1',
        purpose: 'Containing the spell',
        substitutes: ['Plastic bag', 'Ice cube tray'],
      },
      {
        name: 'Water',
        amount: 'Enough to fill container',
        purpose: 'Freezing and binding the energy',
      },
    ],
    tools: ['Pen', 'Freezer'],
    preparation: [
      'Cleanse your space',
      'Focus clearly on what you wish to stop or freeze',
    ],
    steps: [
      'Write the name or situation on the paper',
      'Fold paper away from you three times',
      'Place in container and fill with water',
      'Say: "I freeze you out, I freeze you still. You cannot harm me against my will."',
      'Place container in the back of your freezer',
      'Leave indefinitely or until situation resolves',
    ],
    purpose: 'Stops someone from causing harm or freezes a difficult situation',
    description:
      "A simple folk magic spell that freezes someone's harmful actions or stops a situation from escalating.",
    correspondences: {
      elements: ['Water'],
      colors: ['Black', 'Blue'],
      planets: ['Saturn'],
    },
    safety: [
      'Use only for protection, not revenge',
      "Do not use to control others' free will",
      'Dispose of properly when no longer needed',
    ],
  },

  {
    id: 'mirror-return-to-sender',
    title: 'Mirror Return to Sender Spell',
    category: 'banishing',
    type: 'spell',
    difficulty: 'intermediate',
    timing: {
      moonPhase: ['Full Moon', 'Waning Gibbous'],
      timeOfDay: 'midnight',
      season: 'any',
    },
    duration: '20 minutes',
    ingredients: [
      {
        name: 'Small mirror',
        amount: '1',
        purpose: 'Reflecting negative energy back',
      },
      {
        name: 'Black candle',
        amount: '1',
        purpose: 'Protection and banishing',
      },
      {
        name: 'Salt',
        amount: '1 tablespoon',
        purpose: 'Purification and barrier',
      },
    ],
    tools: ['Black cloth to wrap mirror'],
    preparation: [
      'Cleanse the mirror with salt water',
      'Set protective boundaries around yourself',
    ],
    steps: [
      'Light the black candle',
      'Hold the mirror facing outward',
      'Sprinkle salt around the mirror',
      'Say: "Mirror bright, mirror true, send back all that\'s sent to me by you. No harm to me shall come to stay, all negativity is sent away."',
      'Wrap mirror in black cloth',
      'Place near front door or window facing outward',
    ],
    purpose:
      'Returns negative energy, curses, or ill wishes back to their sender',
    description:
      'A defensive spell that creates an energetic mirror, bouncing any negative intentions back to their source.',
    correspondences: {
      elements: ['Spirit', 'Water'],
      colors: ['Black', 'Silver'],
      crystals: ['Mirror', 'Obsidian', 'Hematite'],
      planets: ['Saturn', 'Moon'],
    },
    safety: [
      'This is defensive magic, not offensive',
      'Only use when you genuinely feel attacked',
      'The energy returned is what was sent - nothing more',
    ],
  },

  // MORE LOVE SPELLS
  {
    id: 'honey-jar-sweetening',
    title: 'Honey Jar Sweetening Spell',
    category: 'love',
    type: 'spell',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Waxing Crescent', 'Waxing Gibbous', 'Full Moon'],
      planetaryDay: ['Friday'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '15 minutes',
    ingredients: [
      {
        name: 'Small jar of honey',
        amount: '1',
        purpose: 'Sweetening the relationship or situation',
      },
      {
        name: 'Paper with name/petition',
        amount: '1',
        purpose: 'Focusing the intention',
      },
      {
        name: 'Pink candle',
        amount: '1',
        purpose: 'Love and affection',
      },
    ],
    tools: ['Pen'],
    preparation: [
      'Write your petition clearly',
      'Focus on sweetening, not controlling',
    ],
    steps: [
      "Write your name and the other person's name on paper",
      'Fold paper toward you three times',
      'Open honey jar and push paper into honey',
      'Taste some honey and say: "As this honey is sweet to me, so shall [name] be sweet to me."',
      'Close jar and place pink candle on top',
      'Light candle and let it burn down',
      'Repeat weekly until relationship sweetens',
    ],
    purpose:
      'Sweetens a relationship or makes someone more favorable toward you',
    description:
      'A traditional Hoodoo spell for improving relationships, reconciliation, or making someone think kindly of you.',
    correspondences: {
      elements: ['Water', 'Earth'],
      colors: ['Pink', 'Gold'],
      planets: ['Venus'],
      zodiac: ['Taurus', 'Libra'],
    },
    safety: [
      'Never use to force love or control someone',
      'Focus on existing relationships, not obsession',
      'Respect free will always',
    ],
  },

  {
    id: 'pink-candle-attraction',
    title: 'Pink Candle Love Attraction',
    category: 'love',
    type: 'candle_magic',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waxing Crescent', 'Full Moon'],
      planetaryDay: ['Friday'],
      timeOfDay: 'dusk',
      season: 'any',
    },
    duration: '20 minutes',
    ingredients: [
      {
        name: 'Pink candle',
        amount: '1',
        purpose: 'Love and attraction energy',
      },
      {
        name: 'Rose oil',
        amount: 'Few drops',
        purpose: 'Enhancing love vibration',
        substitutes: ['Jasmine oil', 'Ylang ylang'],
      },
      {
        name: 'Rose petals',
        amount: 'Handful',
        purpose: 'Love correspondences',
      },
    ],
    tools: ['Candle holder', 'Matches'],
    preparation: [
      'Anoint candle with rose oil from middle outward',
      'Focus on the love you wish to attract',
    ],
    steps: [
      'Create circle of rose petals around candle',
      'Light candle',
      'Visualize yourself surrounded by loving energy',
      'Say: "Love flows to me easily and freely. I am worthy of deep, true love."',
      'Meditate on receiving love for 10 minutes',
      "Let candle burn safely or snuff (don't blow out)",
    ],
    purpose: 'Attracts new love or strengthens romantic feelings',
    description:
      'A gentle spell to open yourself to love and attract romantic opportunities.',
    correspondences: {
      elements: ['Fire', 'Water'],
      colors: ['Pink', 'Red'],
      crystals: ['Rose Quartz', 'Rhodonite'],
      herbs: ['Rose', 'Jasmine', 'Lavender'],
      planets: ['Venus'],
    },
    safety: [
      'Focus on attracting love in general, not a specific person',
      'Be open to love appearing unexpectedly',
    ],
  },

  // MORE PROSPERITY SPELLS
  {
    id: 'money-bowl',
    title: 'Money Bowl Abundance Spell',
    category: 'prosperity',
    type: 'spell',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Waxing Crescent', 'Full Moon'],
      planetaryDay: ['Thursday', 'Sunday'],
      timeOfDay: 'noon',
      season: 'any',
    },
    duration: '20 minutes',
    ingredients: [
      {
        name: 'Green or gold bowl',
        amount: '1',
        purpose: 'Container for abundance energy',
      },
      {
        name: 'Coins',
        amount: 'Various denominations',
        purpose: 'Attracting more money',
      },
      {
        name: 'Cinnamon sticks',
        amount: '3',
        purpose: 'Fast manifestation',
      },
      {
        name: 'Bay leaves',
        amount: '3',
        purpose: 'Success and wishes',
      },
      {
        name: 'Citrine crystal',
        amount: '1',
        purpose: 'Abundance and manifestation',
        substitutes: ['Pyrite', 'Green Aventurine'],
      },
    ],
    tools: ['Green candle (optional)'],
    preparation: [
      'Cleanse bowl with salt water',
      'Gather coins from your wallet or around your home',
    ],
    steps: [
      'Place citrine in center of bowl',
      'Arrange coins around the crystal',
      'Add cinnamon sticks and bay leaves',
      'Hold hands over bowl and say: "Money flows to me from expected and unexpected sources. I am a magnet for abundance."',
      'Place bowl in wealth corner of home (far left from entrance)',
      'Add coins to bowl whenever you receive money',
    ],
    purpose: 'Creates a continuous flow of money and abundance',
    description:
      'A living spell that grows stronger as you add to it, creating a magnetic pull for financial abundance.',
    correspondences: {
      elements: ['Earth'],
      colors: ['Green', 'Gold'],
      crystals: ['Citrine', 'Pyrite', 'Green Aventurine'],
      herbs: ['Cinnamon', 'Bay', 'Basil'],
      planets: ['Jupiter', 'Sun'],
    },
    safety: [
      'Focus on abundance, not greed',
      'Take practical action alongside magic',
      'Refresh herbs monthly',
    ],
  },

  {
    id: 'bay-leaf-wish',
    title: 'Bay Leaf Wish Burning',
    category: 'manifestation',
    type: 'spell',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon', 'Full Moon'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '5 minutes',
    ingredients: [
      {
        name: 'Dried bay leaf',
        amount: '1',
        purpose: 'Carrying wishes to the universe',
      },
      {
        name: 'Pen or marker',
        amount: '1',
        purpose: 'Writing your wish',
      },
    ],
    tools: ['Fireproof dish', 'Lighter'],
    preparation: [
      'Get clear on your specific wish',
      'Use a fully dried bay leaf',
    ],
    steps: [
      'Write your wish on the bay leaf',
      'Hold it and visualize your wish coming true',
      'Say: "As this leaf burns, my wish takes flight. Bring my desire into the light."',
      'Burn the leaf in the fireproof dish',
      'Release attachment to the outcome',
    ],
    purpose: 'Sends wishes and intentions to the universe for manifestation',
    description:
      'A simple, powerful spell for manifesting wishes. The smoke carries your intentions upward.',
    correspondences: {
      elements: ['Fire', 'Air'],
      colors: ['Green', 'Gold'],
      planets: ['Sun', 'Jupiter'],
    },
    safety: [
      'Always use fireproof container',
      'Keep water nearby',
      'Ensure leaf is fully extinguished',
    ],
  },

  // MORE CLEANSING
  {
    id: 'salt-water-aura-cleanse',
    title: 'Salt Water Aura Cleansing',
    category: 'cleansing',
    type: 'ritual',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Waning Crescent', 'New Moon'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '15 minutes',
    ingredients: [
      {
        name: 'Sea salt',
        amount: '2 tablespoons',
        purpose: 'Purification',
      },
      {
        name: 'Water',
        amount: '1 bowl',
        purpose: 'Cleansing element',
      },
      {
        name: 'White candle',
        amount: '1',
        purpose: 'Divine light',
      },
    ],
    tools: ['Bowl', 'Towel'],
    preparation: [
      'Dissolve salt in water',
      'Light white candle for purification',
    ],
    steps: [
      'Dip fingers in salt water',
      'Starting at crown, lightly flick water around your aura',
      'Work down to feet, focusing on releasing negativity',
      'Say: "Salt and water, cleanse me clear. Remove all that does not serve me here."',
      'Pat dry with towel',
      'Dispose of water down the drain',
    ],
    purpose: 'Cleanses the aura of negative energy and attachments',
    description:
      'A quick, effective way to clear your energetic field of accumulated negativity.',
    correspondences: {
      elements: ['Water', 'Earth'],
      colors: ['White', 'Blue'],
      crystals: ['Selenite', 'Clear Quartz'],
      planets: ['Moon'],
    },
    safety: ['Avoid eyes and open wounds', 'Use on skin only, not internally'],
  },

  {
    id: 'egg-cleanse',
    title: 'Egg Cleansing (Limpia)',
    category: 'cleansing',
    type: 'ritual',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Waning Crescent', 'New Moon'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '20 minutes',
    ingredients: [
      {
        name: 'Raw egg',
        amount: '1',
        purpose: 'Absorbing negative energy',
      },
      {
        name: 'Glass of water',
        amount: '1',
        purpose: 'Reading the cleansing results',
      },
      {
        name: 'Salt',
        amount: '1 pinch',
        purpose: 'Added purification',
      },
    ],
    tools: ['White cloth or towel'],
    preparation: [
      'Bring egg to room temperature',
      'Set intention for cleansing',
    ],
    steps: [
      'Hold egg and say a prayer or intention for cleansing',
      'Starting at head, roll egg over entire body',
      'Focus on areas that feel heavy or blocked',
      'Crack egg into glass of water',
      'Add pinch of salt',
      'Read the patterns (bubbles = negative energy released)',
      'Dispose of egg water in toilet - flush immediately',
    ],
    purpose: 'Removes negative energy, evil eye, and spiritual blockages',
    description:
      'A traditional Mexican/Latin American cleansing ritual that uses an egg to absorb negativity.',
    correspondences: {
      elements: ['Earth', 'Water'],
      colors: ['White'],
      planets: ['Moon'],
    },
    safety: [
      'Never eat the egg after cleansing',
      'Dispose of immediately after reading',
      'Wash hands thoroughly after',
    ],
  },

  // MORE DIVINATION
  {
    id: 'moon-water-scrying',
    title: 'Moon Water Scrying',
    category: 'divination',
    type: 'ritual',
    difficulty: 'intermediate',
    timing: {
      moonPhase: ['Full Moon'],
      timeOfDay: 'midnight',
      season: 'any',
    },
    duration: '30 minutes',
    ingredients: [
      {
        name: 'Moon water',
        amount: '1 bowl',
        purpose: 'Charged water for visions',
      },
      {
        name: 'Black bowl or dark surface',
        amount: '1',
        purpose: 'Scrying surface',
      },
      {
        name: 'White or silver candle',
        amount: '1',
        purpose: 'Illumination',
      },
    ],
    tools: ['Quiet, dark space'],
    preparation: [
      'Charge water under the full moon overnight',
      'Create dark, quiet space for scrying',
    ],
    steps: [
      'Pour moon water into black bowl',
      'Light candle behind you (not in view)',
      'Gaze softly at water surface',
      'Let your eyes relax and go slightly out of focus',
      'Ask your question silently',
      'Observe any images, symbols, or impressions',
      'Record what you see in a journal',
    ],
    purpose: 'Receives visions and answers through water scrying',
    description:
      'An ancient divination technique using the reflective surface of moon-charged water.',
    correspondences: {
      elements: ['Water'],
      colors: ['Silver', 'Black', 'White'],
      crystals: ['Moonstone', 'Labradorite'],
      planets: ['Moon'],
    },
    safety: [
      'Ground before and after scrying',
      'Set time limits (15-20 min max)',
      "Don't force visions",
    ],
  },

  {
    id: 'pendulum-divination',
    title: 'Pendulum Yes/No Divination',
    category: 'divination',
    type: 'ritual',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Full Moon', 'Waxing Gibbous'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '10-15 minutes',
    ingredients: [
      {
        name: 'Pendulum',
        amount: '1',
        purpose: 'Divination tool',
        substitutes: ['Necklace with pendant', 'Ring on string'],
      },
    ],
    tools: ['Flat surface', 'Pendulum board (optional)'],
    preparation: [
      'Cleanse pendulum with sage or moonlight',
      'Calibrate by asking "Show me yes" and "Show me no"',
    ],
    steps: [
      'Hold pendulum chain between thumb and forefinger',
      'Rest elbow on table for stability',
      'Let pendulum hang still',
      'Ask a yes/no question clearly',
      "Observe the pendulum's movement",
      'Thank the pendulum after each session',
    ],
    purpose: 'Receives clear yes/no answers from higher guidance',
    description:
      'A simple divination method for receiving guidance on specific questions.',
    correspondences: {
      elements: ['Spirit', 'Air'],
      colors: ['Clear', 'Purple'],
      crystals: ['Clear Quartz', 'Amethyst'],
      planets: ['Moon', 'Mercury'],
    },
    safety: [
      "Don't ask about health or legal matters",
      "Don't make major decisions solely on pendulum",
      'Check your own bias before asking',
    ],
  },

  // MORE MANIFESTATION
  {
    id: 'new-moon-intention-setting',
    title: 'New Moon Intention Setting Ritual',
    category: 'manifestation',
    type: 'ritual',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['New Moon'],
      timeOfDay: 'dusk',
      season: 'any',
    },
    duration: '30 minutes',
    ingredients: [
      {
        name: 'White candle',
        amount: '1',
        purpose: 'New beginnings',
      },
      {
        name: 'Journal or paper',
        amount: '1',
        purpose: 'Writing intentions',
      },
      {
        name: 'Clear quartz',
        amount: '1',
        purpose: 'Amplifying intentions',
      },
    ],
    tools: ['Pen'],
    preparation: [
      'Review what you want to manifest this lunar cycle',
      'Cleanse your space',
    ],
    steps: [
      'Light white candle',
      'Hold clear quartz and breathe deeply',
      'Write 3-5 specific intentions for the lunar cycle',
      'Read each intention aloud',
      'Say: "As the moon grows, so do these intentions. I plant these seeds under the dark moon."',
      'Place paper under candle until it burns down',
      'Keep intentions visible throughout the month',
    ],
    purpose:
      'Plants seeds of intention at the most potent time for new beginnings',
    description:
      'The new moon is the perfect time to set intentions for what you want to grow and manifest.',
    correspondences: {
      elements: ['Spirit'],
      colors: ['White', 'Silver', 'Black'],
      crystals: ['Clear Quartz', 'Moonstone'],
      planets: ['Moon'],
    },
    safety: [
      'Be specific but not attached',
      "Focus on what you want, not what you don't want",
      'Review intentions at full moon',
    ],
  },

  {
    id: 'candle-manifestation',
    title: 'Seven Day Candle Manifestation',
    category: 'manifestation',
    type: 'candle_magic',
    difficulty: 'intermediate',
    timing: {
      moonPhase: ['New Moon', 'Waxing Crescent'],
      timeOfDay: 'same time daily',
      season: 'any',
    },
    duration: '7 days (15 min/day)',
    ingredients: [
      {
        name: 'Seven day candle (glass-enclosed)',
        amount: '1',
        purpose: 'Sustained manifestation energy',
      },
      {
        name: 'Appropriate oil for intention',
        amount: 'Few drops',
        purpose: 'Charging the candle',
      },
      {
        name: 'Herbs matching intention',
        amount: '1 tablespoon',
        purpose: 'Adding power to spell',
      },
    ],
    tools: ['Pin or nail for carving'],
    preparation: [
      'Choose candle color for your intention',
      'Carve symbols or words into wax',
      'Anoint with oil',
    ],
    steps: [
      'Dress candle with oil and roll in herbs',
      'Light at the same time each day',
      'Spend 10-15 minutes visualizing your goal',
      'Speak your intention aloud each day',
      'Let candle burn continuously if safe, or burn for 1 hour daily',
      'When candle finishes, bury remains or dispose in running water',
    ],
    purpose:
      'Creates sustained magical energy over seven days for major manifestations',
    description:
      'A prolonged spell that builds power over a week, ideal for significant goals.',
    correspondences: {
      elements: ['Fire'],
      colors: ['Varies by intention'],
      planets: ['Sun', 'Jupiter'],
    },
    safety: [
      'Never leave burning candle unattended',
      'Use glass-enclosed candles for safety',
      'Keep away from flammable materials',
    ],
  },

  // MORE HEALING
  {
    id: 'chakra-balancing-meditation',
    title: 'Seven Chakra Balancing Ritual',
    category: 'healing',
    type: 'ritual',
    difficulty: 'intermediate',
    timing: {
      moonPhase: ['Full Moon', 'New Moon'],
      timeOfDay: 'dawn',
      season: 'any',
    },
    duration: '45 minutes',
    ingredients: [
      {
        name: 'Seven colored candles',
        amount: '1 of each color',
        purpose: 'Representing each chakra',
      },
      {
        name: 'Corresponding crystals',
        amount: '7',
        purpose: 'Chakra healing',
      },
    ],
    tools: ['Yoga mat or comfortable space', 'Relaxing music (optional)'],
    preparation: [
      'Arrange candles in a line or circle',
      'Gather crystals for each chakra',
    ],
    steps: [
      'Light candles from root (red) to crown (violet)',
      'Lie down comfortably',
      'Place each crystal on its corresponding chakra',
      'Breathe deeply and visualize each chakra spinning brightly',
      'Spend 3-5 minutes on each chakra, moving from root to crown',
      'Visualize all chakras aligned and balanced',
      'Remove crystals and rest for 5 minutes',
    ],
    purpose: 'Balances and aligns all seven chakras for holistic wellbeing',
    description:
      'A comprehensive energy healing ritual that addresses all major energy centers.',
    correspondences: {
      elements: ['All elements'],
      colors: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'],
      crystals: ['Various - one per chakra'],
      planets: ['All planets'],
    },
    safety: [
      'Move slowly and gently',
      'Stay hydrated',
      'Ground after the ritual',
    ],
  },

  {
    id: 'anxiety-relief-spell',
    title: 'Anxiety Relief Calming Spell',
    category: 'healing',
    type: 'spell',
    difficulty: 'beginner',
    timing: {
      moonPhase: ['Waning Gibbous', 'Last Quarter'],
      timeOfDay: 'any',
      season: 'any',
    },
    duration: '15 minutes',
    ingredients: [
      {
        name: 'Lavender',
        amount: '1 tablespoon dried',
        purpose: 'Calming and peace',
      },
      {
        name: 'Chamomile',
        amount: '1 tablespoon dried',
        purpose: 'Soothing anxiety',
      },
      {
        name: 'Blue candle',
        amount: '1',
        purpose: 'Peace and tranquility',
      },
      {
        name: 'Amethyst',
        amount: '1',
        purpose: 'Calming energy',
      },
    ],
    tools: ['Small pouch or sachet'],
    preparation: ['Find a quiet, comfortable space', 'Take three deep breaths'],
    steps: [
      'Light blue candle',
      'Hold amethyst and breathe deeply',
      'Mix lavender and chamomile in pouch',
      'Hold pouch to heart and say: "Calm surrounds me, peace within. Anxiety fades, serenity begins."',
      "Inhale the herbs' scent",
      'Carry pouch with you or place under pillow',
    ],
    purpose: 'Reduces anxiety and promotes inner calm',
    description:
      'A soothing spell to ease anxiety and bring peace to an overwhelmed mind.',
    correspondences: {
      elements: ['Water', 'Air'],
      colors: ['Blue', 'Lavender'],
      crystals: ['Amethyst', 'Blue Lace Agate', 'Lepidolite'],
      herbs: ['Lavender', 'Chamomile', 'Valerian'],
      planets: ['Moon', 'Neptune'],
    },
    safety: [
      'Not a replacement for professional mental health care',
      'Use alongside other coping strategies',
    ],
  },
];

// Moon Phase specific spell recommendations
export const moonSpells = {
  'New Moon': [
    'salt-circle-protection',
    'rose-quartz-self-love',
    'basil-prosperity-jar',
    'sage-space-cleansing',
    'new-moon-intention-setting',
    'bay-leaf-wish',
    'pink-candle-attraction',
  ],
  'Waxing Crescent': [
    'basil-prosperity-jar',
    'rose-quartz-self-love',
    'salt-circle-protection',
    'honey-jar-sweetening',
    'money-bowl',
    'candle-manifestation',
  ],
  'First Quarter': [
    'basil-prosperity-jar',
    'money-bowl',
    'candle-manifestation',
  ],
  'Waxing Gibbous': [
    'basil-prosperity-jar',
    'beltane-fertility-blessing',
    'honey-jar-sweetening',
    'pendulum-divination',
  ],
  'Full Moon': [
    'lavender-healing-bath',
    'rose-quartz-self-love',
    'salt-circle-protection',
    'beltane-fertility-blessing',
    'moon-water-scrying',
    'mirror-return-to-sender',
    'chakra-balancing-meditation',
  ],
  'Waning Gibbous': [
    'lavender-healing-bath',
    'cord-cutting-ritual',
    'anxiety-relief-spell',
  ],
  'Last Quarter': [
    'black-tourmaline-shield',
    'sage-space-cleansing',
    'cord-cutting-ritual',
    'freezer-spell',
  ],
  'Waning Crescent': [
    'black-tourmaline-shield',
    'sage-space-cleansing',
    'samhain-ancestor-connection',
    'egg-cleanse',
    'salt-water-aura-cleanse',
    'freezer-spell',
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
