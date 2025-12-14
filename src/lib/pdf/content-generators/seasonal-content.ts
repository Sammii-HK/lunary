/**
 * Seasonal Pack Content Generator
 *
 * Generates rich PDF content for seasonal/sabbat packs.
 */

import {
  PdfSeasonalPack,
  PdfSeasonalRitual,
  PdfCorrespondence,
} from '../schema';
import { wheelOfTheYearSabbats, Sabbat } from '@/constants/sabbats';

const SABBAT_CORRESPONDENCES: Record<string, PdfCorrespondence[]> = {
  Samhain: [
    { type: 'Colours', items: ['Black', 'Orange', 'Purple', 'Silver', 'Gold'] },
    {
      type: 'Crystals',
      items: ['Obsidian', 'Smoky Quartz', 'Black Tourmaline', 'Amethyst'],
    },
    {
      type: 'Herbs',
      items: ['Mugwort', 'Rosemary', 'Sage', 'Apple', 'Pumpkin'],
    },
    {
      type: 'Themes',
      items: ['Ancestor honouring', 'Divination', 'Shadow work', 'Release'],
    },
  ],
  Yule: [
    { type: 'Colours', items: ['Red', 'Green', 'Gold', 'White', 'Silver'] },
    {
      type: 'Crystals',
      items: ['Clear Quartz', 'Garnet', 'Ruby', 'Bloodstone'],
    },
    { type: 'Herbs', items: ['Holly', 'Ivy', 'Mistletoe', 'Pine', 'Cedar'] },
    {
      type: 'Themes',
      items: ['Rebirth', 'Hope', 'Rest', 'Reflection', 'Light returning'],
    },
  ],
  Imbolc: [
    { type: 'Colours', items: ['White', 'Pink', 'Light Blue', 'Yellow'] },
    {
      type: 'Crystals',
      items: ['Amethyst', 'Moonstone', 'Clear Quartz', 'Turquoise'],
    },
    { type: 'Herbs', items: ['Snowdrop', 'Rowan', 'Chamomile', 'Bay'] },
    {
      type: 'Themes',
      items: ['Purification', 'New beginnings', 'Creativity', 'Brigid'],
    },
  ],
  Ostara: [
    { type: 'Colours', items: ['Pastel Pink', 'Green', 'Yellow', 'Lavender'] },
    {
      type: 'Crystals',
      items: ['Rose Quartz', 'Aquamarine', 'Moonstone', 'Jasper'],
    },
    { type: 'Herbs', items: ['Daffodil', 'Violet', 'Jasmine', 'Honeysuckle'] },
    { type: 'Themes', items: ['Balance', 'Fertility', 'Growth', 'New life'] },
  ],
  Beltane: [
    { type: 'Colours', items: ['Red', 'White', 'Green', 'Pink'] },
    {
      type: 'Crystals',
      items: ['Emerald', 'Rose Quartz', 'Malachite', 'Carnelian'],
    },
    {
      type: 'Herbs',
      items: ['Hawthorn', 'Rose', 'Lily of the Valley', 'Birch'],
    },
    { type: 'Themes', items: ['Passion', 'Fertility', 'Union', 'Joy', 'Fire'] },
  ],
  Litha: [
    { type: 'Colours', items: ['Gold', 'Yellow', 'Orange', 'Green'] },
    { type: 'Crystals', items: ['Citrine', 'Sunstone', 'Tigers Eye', 'Amber'] },
    {
      type: 'Herbs',
      items: ["St. John\'s Wort", 'Lavender', 'Chamomile', 'Sunflower'],
    },
    {
      type: 'Themes',
      items: ['Power', 'Abundance', 'Solar peak', 'Achievement'],
    },
  ],
  Lammas: [
    { type: 'Colours', items: ['Gold', 'Orange', 'Brown', 'Green'] },
    {
      type: 'Crystals',
      items: ['Citrine', 'Peridot', 'Carnelian', 'Tigers Eye'],
    },
    { type: 'Herbs', items: ['Wheat', 'Corn', 'Sunflower', 'Hops'] },
    {
      type: 'Themes',
      items: ['First harvest', 'Gratitude', 'Sacrifice', 'Abundance'],
    },
  ],
  Mabon: [
    {
      type: 'Colours',
      items: ['Orange', 'Brown', 'Gold', 'Deep Red', 'Purple'],
    },
    {
      type: 'Crystals',
      items: ['Amber', 'Citrine', 'Sapphire', 'Lapis Lazuli'],
    },
    { type: 'Herbs', items: ['Apple', 'Sage', 'Marigold', 'Thistle'] },
    {
      type: 'Themes',
      items: ['Balance', 'Second harvest', 'Gratitude', 'Preparation'],
    },
  ],
};

function generateSabbatRituals(sabbat: Sabbat): PdfSeasonalRitual[] {
  // Detailed ritual templates for Samhain and Yule (keep these as they're more detailed)
  const ritualTemplates: Record<string, PdfSeasonalRitual[]> = {
    Samhain: [
      {
        title: 'Ancestor Altar Ritual',
        timing: 'Samhain Eve or during the three-day veil thinning period',
        description:
          'Create a sacred space to honour those who have passed before you. This ritual strengthens your connection to ancestral wisdom and offers a meaningful moment of remembrance.',
        activities: [
          'Choose a small table, shelf, or dedicated corner to serve as your altar.',
          'Gather photos, mementos, or written names of the ancestors you wish to honour.',
          'Light a white or black candle to act as a beacon for their presence.',
          'Place offerings of food or drink that your ancestors would have enjoyed.',
          'Sit quietly with the altar, speaking to your ancestors if it feels right.',
          'When you feel complete, thank them for their guidance and gently close the ritual.',
        ],
      },
      {
        title: 'Releasing the Old Year',
        timing: 'Samhain evening, as the sun sets',
        description:
          'Samhain marks the Celtic new year. This ritual supports you in releasing what no longer serves you, creating space for new growth in the coming cycle.',
        activities: [
          'Write down what you are ready to release on small pieces of paper.',
          'Light a fire or place a candle safely in a fireproof container.',
          'Read each item aloud, acknowledging the role it has played in your life.',
          'Safely burn each paper while visualising the energy transforming.',
          'Once cooled, scatter the ashes outside or bury them in the earth.',
          'Close by stating an intention for what you wish to welcome in.',
        ],
      },
      {
        title: 'Divination Night',
        timing: 'Samhain, when the veil is thinnest',
        description:
          'Samhain is considered the most powerful night of the year for divination. The thinning veil allows clearer messages to pass between realms.',
        activities: [
          'Cleanse your divination tools with smoke, moonlight, or sound.',
          'Create sacred space by lighting candles and placing protective crystals nearby.',
          'Ask open-ended questions about the year ahead, remaining receptive to answers.',
          'Use tarot cards, oracle decks, scrying, or a pendulum—whatever feels natural.',
          'Record all messages and impressions in your journal as they arise.',
          'Close the session by thanking any spirits or guides who offered insight.',
        ],
      },
    ],
    Yule: [
      {
        title: 'Welcoming the Sun Ritual',
        timing: 'Yule morning, as the sun rises',
        description:
          'On the longest night, we celebrate the return of the light. This dawn ritual welcomes the reborn sun and sets intentions for the lengthening days ahead.',
        activities: [
          'Wake before sunrise and find a place where you can witness the dawn.',
          'Light a candle to symbolise your own inner light.',
          'As the sun appears, speak words of welcome and gratitude.',
          'Set an intention for what you wish to grow as the light returns.',
          'Keep your candle burning throughout the day if safely possible.',
        ],
      },
      {
        title: 'Yule Log Blessing',
        timing: 'Yule Eve',
        description:
          'The Yule log is a traditional symbol of warmth, protection, and the returning light. This ritual blesses your log (or candle) for the season.',
        activities: [
          'Choose a log, decorated candle, or Yule log cake to represent the tradition.',
          'Carve or write intentions for the coming year onto the log.',
          'Anoint with essential oils of pine, cinnamon, or orange.',
          'Light the log or candle with words of blessing.',
          "Keep a piece of the ash or save the candle for next year\'s lighting.",
        ],
      },
    ],
  };

  // Use detailed templates if available, otherwise convert string rituals from JSON
  if (ritualTemplates[sabbat.name]) {
    return ritualTemplates[sabbat.name];
  }

  // Convert string rituals from sabbat.rituals into proper format
  if (sabbat.rituals && sabbat.rituals.length > 0) {
    return sabbat.rituals.map((ritualString, index) => {
      // Extract title from ritual string (usually the first part before parentheses or colon)
      const titleMatch = ritualString.match(/^([^(:]+)/);
      const title = titleMatch
        ? titleMatch[1].trim()
        : `${sabbat.name} Ritual ${index + 1}`;

      // Generate meaningful activities based on the ritual name and sabbat themes
      const activities = generateRitualActivities(ritualString, sabbat);

      return {
        title,
        timing: `During ${sabbat.name}`,
        description: `${ritualString}. This ritual aligns with ${sabbat.name}'s themes of ${sabbat.keywords.slice(0, 2).join(' and ').toLowerCase()}.`,
        activities,
      };
    });
  }

  // Fallback if no rituals are available
  return [
    {
      title: `${sabbat.name} Celebration`,
      timing: `During ${sabbat.name}`,
      description: `A traditional ${sabbat.name} ritual practice honoring the themes of ${sabbat.keywords.slice(0, 2).join(' and ').toLowerCase()}.`,
      activities: [
        'Create sacred space according to your tradition.',
        'Set your intentions for this sabbat.',
        'Perform the ritual with presence and focus.',
        'Close with gratitude and grounding.',
      ],
    },
  ];
}

function generateRitualActivities(
  ritualString: string,
  sabbat: Sabbat,
): string[] {
  const activities: string[] = [];
  const ritualLower = ritualString.toLowerCase();

  // Bread/Baking rituals
  if (ritualLower.includes('bread') || ritualLower.includes('baking')) {
    activities.push('Gather your bread-making ingredients with intention.');
    activities.push(
      `As you knead the dough, focus on gratitude for ${sabbat.name}'s harvest.`,
    );
    activities.push(
      `Shape the bread into a meaningful form (sun, wheat sheaf, or ${sabbat.symbols[0]?.toLowerCase() || 'sacred symbol'}).`,
    );
    activities.push(
      `While the bread bakes, create a ${sabbat.name} altar with ${sabbat.colors[0]?.toLowerCase() || 'gold'} candles and ${sabbat.herbs.slice(0, 2).join(' and ')}.`,
    );
    activities.push(
      'When the bread is ready, break it with words of blessing and gratitude.',
    );
    activities.push(
      'Share the bread with others or offer a piece to the earth.',
    );
    activities.push('Pour a libation (cider, wine, or water) as an offering.');
    return activities;
  }

  // Seed/Planting rituals
  if (
    ritualLower.includes('seed') ||
    ritualLower.includes('planting') ||
    ritualLower.includes('plant')
  ) {
    activities.push('Gather seeds that represent your intentions for growth.');
    activities.push(
      `Bless the seeds with ${sabbat.herbs[0]?.toLowerCase() || 'sacred'} water or smoke.`,
    );
    activities.push('Hold each seed and speak your intention into it.');
    activities.push(
      `Plant the seeds in soil, visualising them growing into your desired outcomes.`,
    );
    activities.push(
      `Water them with intention, saying: "As these seeds grow, so too does my ${sabbat.keywords[0]?.toLowerCase() || 'intention'}."`,
    );
    activities.push(
      'Place the planted seeds on your altar or in a sacred space.',
    );
    return activities;
  }

  // Candle/Blessing rituals
  if (
    ritualLower.includes('candle') ||
    ritualLower.includes('blessing') ||
    ritualLower.includes('dedication')
  ) {
    activities.push(
      `Choose ${sabbat.colors.slice(0, 2).join(' and ').toLowerCase()} candles for this ritual.`,
    );
    activities.push(
      'Cleanse the candles with smoke or by passing them through incense.',
    );
    activities.push(
      `Carve or write your intentions onto the candles using a pin or blessed tool.`,
    );
    activities.push(
      `Anoint the candles with essential oils or ${sabbat.herbs[0]?.toLowerCase() || 'sacred'} oil.`,
    );
    activities.push(
      'Light the candles one by one, speaking your intentions aloud.',
    );
    activities.push(
      `Allow the candles to burn safely, visualising your ${sabbat.keywords[0]?.toLowerCase() || 'intentions'} manifesting.`,
    );
    return activities;
  }

  // Fire rituals
  if (
    ritualLower.includes('fire') ||
    ritualLower.includes('bonfire') ||
    ritualLower.includes('flame')
  ) {
    activities.push(
      'Prepare a safe fire space (outdoor fire pit, cauldron, or large candle).',
    );
    activities.push(
      'Gather materials for the fire: kindling, wood, or a large candle.',
    );
    activities.push(
      `Write what you wish to release or transform on small pieces of paper using ${sabbat.colors[0]?.toLowerCase() || 'appropriate'} ink.`,
    );
    activities.push('Light the fire with words of intention and gratitude.');
    activities.push('Safely burn each paper, watching the energy transform.');
    if (sabbat.name === 'Beltane') {
      activities.push(
        'Jump over the fire (safely) or pass items through the flame for blessing.',
      );
    }
    activities.push(
      'When the fire has cooled, scatter the ashes or bury them in the earth.',
    );
    return activities;
  }

  // Feast/Food rituals
  if (
    ritualLower.includes('feast') ||
    ritualLower.includes('dumb supper') ||
    ritualLower.includes('meal') ||
    ritualLower.includes('food')
  ) {
    activities.push(
      `Prepare traditional ${sabbat.name} foods: ${sabbat.foods.slice(0, 3).join(', ')}.`,
    );
    activities.push(
      'Set a place at your table for ancestors, spirits, or deities.',
    );
    activities.push(
      `Decorate your table with ${sabbat.colors[0]?.toLowerCase() || 'seasonal'} candles and ${sabbat.herbs[0]?.toLowerCase() || 'sacred'} herbs.`,
    );
    activities.push('Before eating, offer a blessing or prayer of gratitude.');
    activities.push(
      'Share the meal with intention, honouring the nourishment provided.',
    );
    if (ritualLower.includes('dumb supper')) {
      activities.push(
        'Eat in silence, allowing space for communication with the departed.',
      );
    }
    activities.push(
      'Leave a portion of food as an offering before clearing the table.',
    );
    return activities;
  }

  // Meditation/Reflection rituals
  if (
    ritualLower.includes('meditation') ||
    ritualLower.includes('reflection') ||
    ritualLower.includes('communication')
  ) {
    activities.push('Find a quiet space where you will not be disturbed.');
    activities.push(
      `Light a ${sabbat.colors[0]?.toLowerCase() || 'white'} candle and place ${sabbat.crystals[0] || 'protective crystals'} nearby.`,
    );
    activities.push('Enter a meditative state through deep breathing.');
    activities.push(
      `Focus on the themes of ${sabbat.name}: ${sabbat.keywords.slice(0, 3).join(', ')}.`,
    );
    if (
      ritualLower.includes('ancestor') ||
      ritualLower.includes('communication')
    ) {
      activities.push(
        'Open your heart to receive messages from ancestors or guides.',
      );
      activities.push(
        'Remain receptive to any impressions, feelings, or words that arise.',
      );
    }
    activities.push(
      'When complete, journal about your experience and any insights received.',
    );
    return activities;
  }

  // Spell/Magic rituals
  if (
    ritualLower.includes('spell') ||
    ritualLower.includes('magic') ||
    ritualLower.includes('manifestation')
  ) {
    activities.push('Gather your ritual tools and correspondences.');
    activities.push(
      `Set up your altar with ${sabbat.colors.slice(0, 2).join(' and ').toLowerCase()} candles.`,
    );
    activities.push(
      `Place ${sabbat.crystals.slice(0, 2).join(' and ')} crystals and ${sabbat.herbs.slice(0, 2).join(' and ')} on your altar.`,
    );
    activities.push('Cast a circle of protection around your space.');
    activities.push('State your intention clearly and with conviction.');
    activities.push(
      'Perform the spellwork with focused intention and visualisation.',
    );
    activities.push('Close the circle and ground your energy.');
    return activities;
  }

  // Altar/Honor rituals
  if (
    ritualLower.includes('altar') ||
    ritualLower.includes('honor') ||
    ritualLower.includes('honour')
  ) {
    activities.push(`Choose a dedicated space for your ${sabbat.name} altar.`);
    activities.push(
      `Set up the altar with ${sabbat.colors.slice(0, 2).join(' and ').toLowerCase()} candles.`,
    );
    activities.push(
      `Place ${sabbat.crystals.slice(0, 2).join(' and ')} crystals on your altar.`,
    );
    activities.push(
      `Add ${sabbat.herbs.slice(0, 2).join(' and ')} and symbols of ${sabbat.name}.`,
    );
    if (ritualLower.includes('ancestor')) {
      activities.push(
        'Place photos, mementos, or written names of ancestors you wish to honour.',
      );
    }
    activities.push(
      'Light candles and speak words of intention or invocation.',
    );
    activities.push('Spend time in quiet contemplation at the altar.');
    return activities;
  }

  // Offering rituals
  if (
    ritualLower.includes('offering') ||
    ritualLower.includes('offering first') ||
    ritualLower.includes('libation')
  ) {
    activities.push(
      `Gather offerings: ${sabbat.foods.slice(0, 2).join(', ')}, or other items sacred to ${sabbat.name}.`,
    );
    activities.push('Prepare a sacred space outdoors or on your altar.');
    activities.push(
      'Hold each offering and infuse it with gratitude and intention.',
    );
    activities.push('Place or pour the offerings with words of thanks.');
    activities.push(
      'Leave the offerings in place, allowing nature or spirits to receive them.',
    );
    activities.push('Spend a moment in gratitude before leaving the space.');
    return activities;
  }

  // Invocation rituals
  if (ritualLower.includes('invocation') || ritualLower.includes('invoke')) {
    activities.push(
      `Create a sacred space with ${sabbat.colors[0]?.toLowerCase() || 'appropriate'} candles.`,
    );
    activities.push(
      `Place representations of ${sabbat.deities[0] || 'the divine'} on your altar.`,
    );
    activities.push(
      'Light incense or burn herbs sacred to this deity or energy.',
    );
    activities.push(
      'Speak the invocation aloud, calling upon the energy you seek.',
    );
    activities.push(
      'Spend time in communion, listening for guidance or presence.',
    );
    activities.push('Thank the energy or deity before closing the ritual.');
    return activities;
  }

  // Purification rituals
  if (
    ritualLower.includes('purification') ||
    ritualLower.includes('cleansing')
  ) {
    activities.push(
      'Gather cleansing tools: sage, palo santo, salt water, or incense.',
    );
    activities.push(
      'Begin by cleansing your space, moving clockwise around the area.',
    );
    activities.push(
      `Use ${sabbat.herbs[0]?.toLowerCase() || 'sacred'} smoke or water to purify yourself.`,
    );
    activities.push(
      'Visualise old energy releasing and new, fresh energy entering.',
    );
    activities.push('Speak words of release and renewal.');
    activities.push(
      'Complete the cleansing by grounding and setting new intentions.',
    );
    return activities;
  }

  // Gratitude ceremonies
  if (
    ritualLower.includes('gratitude') ||
    ritualLower.includes('thanksgiving')
  ) {
    activities.push(
      'Create a gratitude list or gather items that represent your blessings.',
    );
    activities.push(
      `Set up a ${sabbat.name} altar with ${sabbat.colors[0]?.toLowerCase() || 'gold'} candles.`,
    );
    activities.push(
      'Read each item of gratitude aloud, feeling the appreciation in your heart.',
    );
    activities.push('Place items or written gratitudes on your altar.');
    activities.push('Spend time in reflection on all you have received.');
    activities.push(
      'Close with a prayer or affirmation of continued abundance.',
    );
    return activities;
  }

  // Generic fallback for unrecognised ritual types
  activities.push('Create sacred space by cleansing and setting intentions.');
  activities.push(
    `Set up an altar with ${sabbat.colors.slice(0, 2).join(' and ').toLowerCase()} candles.`,
  );
  activities.push(
    `Place ${sabbat.crystals.slice(0, 2).join(' and ')} crystals on your altar.`,
  );
  activities.push(
    `Use ${sabbat.herbs.slice(0, 2).join(' and ')} in your ritual.`,
  );
  activities.push('Perform the ritual with presence and focused intention.');
  activities.push('Journal about your experience and any insights received.');
  activities.push('Close your ritual with gratitude and grounding.');

  return activities;
}

export function generateSeasonalPackContent(
  sabbatName: string,
): PdfSeasonalPack {
  const sabbat = wheelOfTheYearSabbats.find((s) => s.name === sabbatName);

  if (!sabbat) {
    throw new Error(`Sabbat not found: ${sabbatName}`);
  }

  return {
    type: 'seasonal',
    slug: `${sabbatName.toLowerCase()}-seasonal-pack`,
    title: sabbat.name,
    subtitle: `Celebrating ${sabbat.name}`,
    sabbatDate: sabbat.date || '',
    theme: sabbat.keywords.slice(0, 3).join(', '),
    moodText: `${sabbat.name} marks a sacred turning on the Wheel of the Year. This pack guides you through meaningful rituals, correspondences, and practices to honour this liminal time.`,
    perfectFor: [
      `Those celebrating ${sabbat.name} alone or with their circle.`,
      'Deepening your connection to the Wheel of the Year.',
      `Working with ${sabbat.keywords.slice(0, 2).join(' and ')} themes.`,
    ],
    introText: `${sabbat.name} is a time of ${sabbat.keywords.slice(0, 3).join(', ')}. As the wheel turns to this point, we are invited to pause, reflect, and align ourselves with the rhythms of the earth. These rituals help you honour this sacred time.`,
    rituals: generateSabbatRituals(sabbat),
    correspondences: SABBAT_CORRESPONDENCES[sabbat.name] || [],
    closingText: `Thank you for celebrating ${sabbat.name} with Lunary. As the wheel continues to turn, may you find yourself ever more in rhythm with the earth's cycles and the wisdom they offer.`,
    optionalAffirmation: `I honour the turning wheel. I am connected to the earth, the seasons, and the endless cycle of death and rebirth.`,
  };
}
