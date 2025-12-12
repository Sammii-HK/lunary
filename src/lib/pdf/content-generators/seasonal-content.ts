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
      items: ["St. John's Wort", 'Lavender', 'Chamomile', 'Sunflower'],
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
          "Keep a piece of the ash or save the candle for next year's lighting.",
        ],
      },
    ],
    // Add more sabbats...
  };

  return (
    ritualTemplates[sabbat.name] ||
    sabbat.rituals.map((ritual) => ({
      title: ritual,
      timing: `During ${sabbat.name}`,
      description: `A traditional ${sabbat.name} ritual practice.`,
      activities: [
        'Create sacred space according to your tradition.',
        'Set your intentions for this sabbat.',
        'Perform the ritual with presence and focus.',
        'Close with gratitude and grounding.',
      ],
    }))
  );
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
