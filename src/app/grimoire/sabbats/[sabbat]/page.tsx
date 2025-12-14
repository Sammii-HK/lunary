import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../../utils/string';

// Comprehensive sabbat data with detailed information
const sabbatDetails: Record<
  string,
  {
    colors: string[];
    herbs: string[];
    crystals: string[];
    foods: string[];
    symbols: string[];
    deities: string[];
    activities: string[];
    rituals: string[];
    history: string;
    meaning: string;
    howToCelebrate: string[];
  }
> = {
  samhain: {
    colors: ['Black', 'Orange', 'Red', 'Gold', 'Purple'],
    herbs: [
      'Mugwort',
      'Sage',
      'Rosemary',
      'Thyme',
      'Marigold',
      'Chrysanthemum',
    ],
    crystals: [
      'Obsidian',
      'Smoky Quartz',
      'Black Tourmaline',
      'Carnelian',
      'Amber',
    ],
    foods: [
      'Pumpkin',
      'Apples',
      'Pomegranates',
      'Nuts',
      'Mulled Wine',
      'Soul Cakes',
      'Roasted Root Vegetables',
    ],
    symbols: [
      'Jack-o-Lanterns',
      'Skulls',
      'Bones',
      'Cauldrons',
      'Broomsticks',
      'Ancestral Altars',
    ],
    deities: ['The Crone', 'Hecate', 'Cerridwen', 'The Morrigan', 'Ancestors'],
    activities: [
      'Honor ancestors and deceased loved ones',
      'Perform divination and scrying',
      'Create an ancestral altar',
      'Light candles for the dead',
      'Share stories about ancestors',
      'Perform protection rituals',
      'Release what no longer serves',
    ],
    rituals: [
      'Dumb Supper: Set a place at your table for ancestors',
      'Ancestor Communication: Use divination to connect with spirits',
      'Release Ritual: Write down what you want to release and burn it',
      'Protection Spell: Create protection charms for the dark half of the year',
      'Candle Lighting: Light candles for each ancestor you wish to honor',
    ],
    history:
      'Samhain (pronounced "SOW-in" or "SAH-win") is one of the most important sabbats in the Wheel of the Year. It marks the end of the harvest season and the beginning of winter. In ancient Celtic tradition, Samhain was considered the start of the new year. The veil between the worlds of the living and the dead is believed to be at its thinnest during this time, making it an ideal period for honoring ancestors, divination, and communicating with spirits. Many modern Halloween traditions have their roots in Samhain celebrations.',
    meaning:
      'Samhain represents death, transformation, and the thinning of the veil between worlds. It is a time to honor ancestors, release what no longer serves, and prepare for the dark half of the year. This sabbat teaches us about the cycle of death and rebirth, reminding us that endings are necessary for new beginnings. It is a powerful time for divination, shadow work, and connecting with the spiritual realm.',
    howToCelebrate: [
      'Create an ancestral altar with photos, mementos, and offerings',
      'Light candles and say prayers for deceased loved ones',
      'Perform divination to gain insights for the coming year',
      'Host a Dumb Supper where you set places for ancestors',
      'Carve pumpkins or turnips with protective symbols',
      'Perform a release ritual to let go of what no longer serves',
      'Share stories and memories about ancestors',
      'Perform protection spells for the dark months ahead',
    ],
  },
  yule: {
    colors: ['Red', 'Green', 'Gold', 'White', 'Silver'],
    herbs: [
      'Evergreen',
      'Holly',
      'Ivy',
      'Mistletoe',
      'Cinnamon',
      'Cloves',
      'Pine',
    ],
    crystals: [
      'Ruby',
      'Garnet',
      'Emerald',
      'Bloodstone',
      'Clear Quartz',
      'Diamond',
    ],
    foods: [
      'Yule Log Cake',
      'Mulled Wine',
      'Roasted Meats',
      'Nuts',
      'Dried Fruits',
      'Gingerbread',
      'Wassail',
    ],
    symbols: [
      'Yule Log',
      'Evergreen Trees',
      'Wreaths',
      'Candles',
      'Bells',
      'Suns',
    ],
    deities: [
      'The Sun God',
      'The Oak King',
      'Santa Claus (modern)',
      'Odin',
      'Freya',
    ],
    activities: [
      'Decorate with evergreens and lights',
      'Light candles to welcome back the sun',
      'Exchange gifts with loved ones',
      'Sing carols and songs of light',
      'Burn a Yule log',
      'Share a feast with family and friends',
      'Perform sun-welcoming rituals',
    ],
    rituals: [
      'Yule Log Ritual: Burn a log decorated with intentions for the coming year',
      'Sun Welcoming: Light candles at dawn to welcome the returning sun',
      'Gift Exchange: Exchange meaningful gifts with loved ones',
      'Feast Ritual: Share a meal and express gratitude',
      'Candle Lighting: Light 12 candles representing the 12 months ahead',
    ],
    history:
      'Yule (from the Old Norse "jól") is the celebration of the winter solstice, the longest night and shortest day of the year. This sabbat marks the rebirth of the sun and the gradual return of light. In ancient times, people lit fires and candles to encourage the sun to return. Evergreen trees were brought indoors as symbols of life continuing through the dark winter months. Many Christmas traditions, including decorating trees, exchanging gifts, and lighting candles, have their origins in Yule celebrations.',
    meaning:
      'Yule represents hope, renewal, and the return of light. Even in the darkest time of year, we celebrate the promise that light will return. This sabbat teaches us about patience, faith, and finding joy in darkness. It is a time for family, community, and expressing gratitude for the blessings in our lives. Yule reminds us that after every ending comes a new beginning.',
    howToCelebrate: [
      'Decorate your home with evergreens, lights, and candles',
      'Burn a Yule log decorated with your intentions',
      'Light candles at dawn to welcome the returning sun',
      'Exchange gifts with loved ones',
      'Share a feast with family and friends',
      'Sing songs and carols celebrating light',
      'Perform a gratitude ritual',
      'Create a Yule altar with sun symbols and evergreens',
    ],
  },
  imbolc: {
    colors: ['White', 'Yellow', 'Pink', 'Light Green', 'Silver'],
    herbs: ['Snowdrops', 'Daffodils', 'Basil', 'Bay', 'Blackberry', 'Angelica'],
    crystals: ['Amethyst', 'Clear Quartz', 'Garnet', 'Ruby', 'Bloodstone'],
    foods: [
      'Dairy Products',
      'Seeds',
      'Spiced Wine',
      'Baked Goods',
      'Honey',
      'Herbal Teas',
    ],
    symbols: [
      "Brigid's Cross",
      'Candles',
      'Snowdrops',
      'Lambs',
      'Wells',
      'Fires',
    ],
    deities: ['Brigid', 'Brigantia', 'The Maiden', 'Persephone'],
    activities: [
      'Light candles to honor Brigid',
      "Make Brigid's crosses from straw or reeds",
      'Prepare seeds for spring planting',
      'Perform purification rituals',
      'Clean and organize your home',
      'Set intentions for the coming spring',
      'Visit natural springs or wells',
    ],
    rituals: [
      'Candle Lighting: Light candles throughout your home',
      "Brigid's Cross Making: Create crosses to hang for protection",
      'Seed Blessing: Bless seeds for spring planting',
      'Purification Ritual: Cleanse your space and yourself',
      'Spring Preparation: Set intentions for growth and renewal',
    ],
    history:
      'Imbolc (pronounced "IM-bulk" or "IM-bolg") marks the midpoint between winter solstice and spring equinox. It celebrates the first signs of spring and the increasing strength of the sun. This sabbat is strongly associated with the Celtic goddess Brigid, who represents fire, healing, poetry, and smithcraft. In ancient times, people would light fires and candles to honor Brigid and encourage the sun\'s return. Imbolc was also a time for purification and preparing for the agricultural season ahead.',
    meaning:
      'Imbolc represents the first stirrings of spring, new beginnings, and the promise of growth. It is a time of purification, inspiration, and preparing for what is to come. This sabbat teaches us about patience and the gradual nature of change. Even when winter seems endless, spring is quietly preparing to emerge. Imbolc is ideal for setting intentions, beginning new projects, and purifying your life and space.',
    howToCelebrate: [
      'Light candles throughout your home to honor Brigid',
      "Make Brigid's crosses from straw or reeds",
      'Perform a spring cleaning and purification ritual',
      'Bless seeds for spring planting',
      'Set intentions for growth and renewal',
      'Create an altar honoring Brigid',
      'Visit a natural spring or well',
      'Prepare dairy-based foods and share a feast',
    ],
  },
  ostara: {
    colors: ['Pastels', 'Green', 'Yellow', 'Pink', 'Lavender', 'White'],
    herbs: [
      'Daffodils',
      'Violets',
      'Jasmine',
      'Lemon Balm',
      'Iris',
      'Narcissus',
    ],
    crystals: [
      'Rose Quartz',
      'Aquamarine',
      'Jade',
      'Moonstone',
      'Clear Quartz',
    ],
    foods: [
      'Eggs',
      'Honey',
      'Leafy Greens',
      'Seeds',
      'Spring Vegetables',
      'Hot Cross Buns',
    ],
    symbols: ['Eggs', 'Rabbits', 'Flowers', 'Butterflies', 'Nests', 'Seeds'],
    deities: ['Eostre', 'Persephone', 'The Maiden', 'Flora'],
    activities: [
      'Plant seeds and start a garden',
      'Decorate eggs with symbols and colors',
      'Take a nature walk to observe spring growth',
      'Perform balance rituals',
      'Create flower crowns or arrangements',
      'Have an egg hunt or egg rolling',
      'Start new projects and ventures',
    ],
    rituals: [
      'Egg Ritual: Decorate eggs with intentions and bury them in your garden',
      'Seed Planting: Plant seeds while setting intentions for growth',
      'Balance Ritual: Honor the balance of light and dark',
      'Spring Cleaning: Cleanse your space energetically',
      'Flower Offering: Create flower arrangements as offerings',
    ],
    history:
      'Ostara (named after the Germanic goddess Eostre) celebrates the spring equinox, when day and night are equal in length. This sabbat marks the official beginning of spring and is a time of balance, fertility, and new growth. Ancient people celebrated this time with feasts, egg decorating, and rituals to encourage fertility and growth. Many Easter traditions, including eggs, rabbits, and spring flowers, have their origins in Ostara celebrations.',
    meaning:
      'Ostara represents balance, fertility, and new beginnings. It is a time when light and dark are equal, reminding us of the importance of balance in our lives. This sabbat celebrates the return of life, growth, and fertility after the dark winter months. It is ideal for starting new projects, planting seeds (both literal and metaphorical), and embracing the energy of renewal and growth.',
    howToCelebrate: [
      'Decorate eggs with symbols, colors, and intentions',
      'Plant seeds in your garden or in pots',
      'Take a nature walk to observe spring growth',
      'Create flower arrangements and flower crowns',
      'Perform rituals honoring balance and new beginnings',
      'Start new projects and ventures',
      'Have a spring feast with seasonal foods',
      'Create an altar with spring symbols and pastel colors',
    ],
  },
  beltane: {
    colors: ['Red', 'Pink', 'Green', 'White', 'Yellow', 'Gold'],
    herbs: ['Hawthorn', 'Rose', 'Lilac', 'Primrose', 'Bluebells', 'Mint'],
    crystals: [
      'Rose Quartz',
      'Emerald',
      'Carnelian',
      'Rhodochrosite',
      'Garnet',
    ],
    foods: [
      'Honey',
      'Strawberries',
      'Dairy Products',
      'Oatcakes',
      'Wine',
      'May Wine',
    ],
    symbols: ['Maypole', 'Flowers', 'Ribbons', 'Fires', 'Crowns', 'Garlands'],
    deities: ['The Green Man', 'Flora', 'Pan', 'Aphrodite', 'Freya'],
    activities: [
      'Dance around a maypole',
      'Jump over Beltane fires',
      'Gather flowers and create garlands',
      'Perform fertility rituals',
      'Celebrate love and passion',
      'Spend time in nature',
      'Have a bonfire celebration',
    ],
    rituals: [
      'Maypole Dance: Dance around a maypole to celebrate fertility',
      'Fire Jumping: Jump over a Beltane fire for purification and blessing',
      'Flower Crown Making: Create crowns from fresh flowers',
      'Love Ritual: Perform rituals for love, passion, and relationships',
      'Fertility Blessing: Bless yourself, your garden, or your projects',
    ],
    history:
      'Beltane (pronounced "BEL-tain" or "BEEL-tinnuh") marks the peak of spring and the beginning of summer. This sabbat celebrates fertility, passion, and the abundance of life. In ancient times, people would light bonfires and drive their cattle between them for purification and blessing. Maypoles were erected and decorated with flowers and ribbons, and people would dance around them to encourage fertility. Beltane was a time of great celebration, feasting, and honoring the life force.',
    meaning:
      'Beltane represents fertility, passion, abundance, and the peak of life force. It is a time to celebrate love, creativity, and the joy of being alive. This sabbat teaches us about the power of passion, the importance of celebrating life, and the connection between love and creation. It is ideal for fertility work, love spells, creative projects, and celebrating the abundance in your life.',
    howToCelebrate: [
      'Dance around a maypole decorated with ribbons and flowers',
      'Jump over a Beltane fire for purification and blessing',
      'Gather flowers and create garlands and crowns',
      'Perform rituals for love, passion, and fertility',
      'Have a bonfire celebration with friends',
      'Spend time in nature connecting with the life force',
      'Share a feast with seasonal foods',
      'Create an altar with flowers, candles, and fertility symbols',
    ],
  },
  litha: {
    colors: ['Gold', 'Yellow', 'Orange', 'Red', 'Green', 'White'],
    herbs: [
      "St. John's Wort",
      'Chamomile',
      'Lavender',
      'Mugwort',
      'Rose',
      'Oak',
    ],
    crystals: [
      'Sunstone',
      'Citrine',
      "Tiger's Eye",
      'Amber',
      'Carnelian',
      'Ruby',
    ],
    foods: [
      'Honey',
      'Fresh Fruits',
      'Vegetables',
      'Herbal Teas',
      'Mead',
      'Berries',
    ],
    symbols: [
      'Sun Wheels',
      'Oak Trees',
      'Fire',
      'Flowers',
      'Solar Symbols',
      'Bonfires',
    ],
    deities: ['The Sun God', 'Apollo', 'Ra', 'Lugh', 'Baldur'],
    activities: [
      'Watch the sunrise and sunset',
      'Have a bonfire celebration',
      'Gather herbs for magical use',
      'Perform sun rituals',
      'Spend time outdoors in nature',
      'Create sun wheels and solar symbols',
      'Share a midsummer feast',
    ],
    rituals: [
      'Sunrise Ritual: Greet the sun at dawn',
      'Bonfire Celebration: Light a fire and celebrate the peak of summer',
      'Herb Gathering: Collect herbs at their peak power',
      'Solar Charging: Charge crystals and tools in sunlight',
      'Gratitude Ritual: Express gratitude for the abundance in your life',
    ],
    history:
      'Litha (also known as Midsummer or the Summer Solstice) marks the longest day and shortest night of the year. This is the peak of summer, when the sun is at its strongest. In ancient times, people would light bonfires, stay up all night, and celebrate the power of the sun. Herbs gathered on this day were believed to be especially powerful. Many cultures celebrated this time with feasts, dancing, and rituals to honor the sun and ensure a good harvest.',
    meaning:
      'Litha represents the peak of light, power, and abundance. It is a time to celebrate the fullness of life, the strength of the sun, and the abundance of summer. This sabbat teaches us about reaching our peak, celebrating our achievements, and harnessing the power of light. It is ideal for solar magic, charging tools and crystals, gathering herbs, and celebrating the abundance in your life.',
    howToCelebrate: [
      'Watch the sunrise and sunset on the longest day',
      'Have a bonfire celebration with friends',
      'Gather herbs at their peak power for magical use',
      'Perform sun rituals and solar magic',
      'Charge crystals and tools in sunlight',
      'Spend time outdoors connecting with nature',
      'Share a midsummer feast with fresh fruits and vegetables',
      'Create sun wheels and solar symbols for your altar',
    ],
  },
  lammas: {
    colors: ['Gold', 'Yellow', 'Orange', 'Brown', 'Green'],
    herbs: ['Wheat', 'Corn', 'Barley', 'Sunflower', 'Mint', 'Goldenrod'],
    crystals: ['Citrine', 'Peridot', "Tiger's Eye", 'Amber', 'Topaz'],
    foods: ['Bread', 'Corn', 'Grains', 'Berries', 'Apples', 'Honey', 'Beer'],
    symbols: [
      'Corn Dollies',
      'Wheat Sheaves',
      'Sickles',
      'Loaves of Bread',
      'Harvest Baskets',
    ],
    deities: ['Lugh', 'Demeter', 'Ceres', 'The Corn Mother'],
    activities: [
      'Bake bread and share it',
      'Gather the first harvest',
      'Create corn dollies',
      'Perform gratitude rituals',
      'Share food with others',
      'Honor the harvest',
      'Prepare for the coming autumn',
    ],
    rituals: [
      'Bread Baking: Bake bread and share it as an offering',
      'First Harvest: Gather and bless the first fruits',
      'Corn Dolly Making: Create corn dollies to preserve the harvest spirit',
      'Gratitude Ritual: Express gratitude for the harvest and abundance',
      'Sharing Ritual: Share food with others in your community',
    ],
    history:
      'Lammas (also known as Lughnasadh, pronounced "LOO-nah-sah") is the first of three harvest festivals. It celebrates the grain harvest and the first fruits of the year. In ancient times, people would bake bread from the first grain harvest and share it with their community. The name "Lammas" comes from "loaf mass," referring to the tradition of blessing loaves of bread. This sabbat honors the god Lugh and celebrates the fruits of our labor.',
    meaning:
      'Lammas represents the first harvest, gratitude, and the fruits of our labor. It is a time to celebrate what we have accomplished, express gratitude for abundance, and prepare for the coming autumn. This sabbat teaches us about the cycle of work and reward, the importance of sharing, and honoring the gifts we receive. It is ideal for gratitude rituals, sharing with others, and celebrating achievements.',
    howToCelebrate: [
      'Bake bread from scratch and share it with others',
      'Gather and bless the first harvest from your garden',
      'Create corn dollies to preserve the harvest spirit',
      'Perform gratitude rituals for abundance',
      'Share a harvest feast with friends and family',
      'Honor the work you have done and the rewards you have received',
      'Prepare preserves and store food for winter',
      'Create an altar with grains, bread, and harvest symbols',
    ],
  },
  mabon: {
    colors: ['Red', 'Orange', 'Yellow', 'Brown', 'Gold', 'Maroon'],
    herbs: ['Mums', 'Marigolds', 'Sage', 'Rue', 'Yarrow', 'Hops'],
    crystals: ['Amber', 'Citrine', "Tiger's Eye", 'Sapphire', 'Lapis Lazuli'],
    foods: [
      'Apples',
      'Pumpkins',
      'Squash',
      'Grapes',
      'Wine',
      'Nuts',
      'Root Vegetables',
    ],
    symbols: [
      'Cornucopias',
      'Apples',
      'Grapes',
      'Acorns',
      'Leaves',
      'Harvest Baskets',
    ],
    deities: ['Persephone', 'Demeter', 'The Crone', 'Mabon'],
    activities: [
      'Gather the second harvest',
      'Go apple picking',
      'Create cornucopias',
      'Perform balance rituals',
      'Express gratitude',
      'Prepare for winter',
      'Share a harvest feast',
    ],
    rituals: [
      'Harvest Ritual: Gather and bless the second harvest',
      'Balance Ritual: Honor the balance of light and dark',
      "Gratitude Ritual: Express gratitude for the year's blessings",
      'Apple Ritual: Use apples in divination or ritual',
      'Feast Ritual: Share a harvest feast with loved ones',
    ],
    history:
      'Mabon (pronounced "MAH-bon" or "MAY-bon") celebrates the autumn equinox, when day and night are equal in length. This is the second harvest festival, focusing on fruits, vegetables, and the completion of the harvest season. In ancient times, people would gather the remaining harvest, prepare for winter, and celebrate the balance between light and dark. This sabbat marks the transition from summer to autumn and prepares us for the dark half of the year.',
    meaning:
      'Mabon represents balance, gratitude, and the second harvest. It is a time to celebrate what we have accomplished, express gratitude for abundance, and prepare for the coming darkness. This sabbat teaches us about balance, the importance of gratitude, and the cycle of giving and receiving. It is ideal for gratitude rituals, balance work, and preparing for the introspective winter months.',
    howToCelebrate: [
      'Gather the second harvest from your garden',
      'Go apple picking or visit a farm',
      'Create cornucopias filled with harvest foods',
      'Perform rituals honoring balance and gratitude',
      'Share a harvest feast with seasonal foods',
      "Express gratitude for the year's blessings",
      'Prepare preserves and store food for winter',
      'Create an altar with autumn colors, fruits, and harvest symbols',
    ],
  },
};

// Helper to find sabbat by slug
function findSabbatBySlug(slug: string) {
  return wheelOfTheYearSabbats.find(
    (sabbat) => stringToKebabCase(sabbat.name) === slug.toLowerCase(),
  );
}

// Generate all sabbat slugs
function getAllSabbatSlugs() {
  return wheelOfTheYearSabbats.map((sabbat) => stringToKebabCase(sabbat.name));
}

export async function generateStaticParams() {
  return getAllSabbatSlugs().map((slug) => ({
    sabbat: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sabbat: string }>;
}): Promise<Metadata> {
  const { sabbat } = await params;
  const sabbatData = findSabbatBySlug(sabbat);

  if (!sabbatData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const sabbatKey = stringToKebabCase(sabbatData.name);
  const details = sabbatDetails[sabbatKey];
  const title = `${sabbatData.name} Sabbat: Complete Celebration Guide - Lunary`;
  const description = `${sabbatData.description} Learn how to celebrate ${sabbatData.name} with rituals, correspondences, foods, and traditions. Complete guide to honoring this sacred time in the Wheel of the Year.`;

  return {
    title,
    description,
    keywords: [
      `${sabbatData.name} sabbat`,
      `${sabbatData.name} celebration`,
      `${sabbatData.name} rituals`,
      `${sabbatData.name} meaning`,
      'wheel of the year',
      'sabbat guide',
      stringToKebabCase(sabbatData.name),
      ...(details?.colors || []),
      ...(details?.herbs || []),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/sabbats/${stringToKebabCase(sabbatData.name)}`,
    },
  };
}

export default async function SabbatPage({
  params,
}: {
  params: Promise<{ sabbat: string }>;
}) {
  const { sabbat } = await params;
  const sabbatData = findSabbatBySlug(sabbat);

  if (!sabbatData) {
    notFound();
  }

  const sabbatKey = stringToKebabCase(sabbatData.name);
  const details = sabbatDetails[sabbatKey];

  if (!details) {
    notFound();
  }

  const meaning = `${sabbatData.description}

${details.meaning}

${details.history}`;

  const howToWorkWith = details.howToCelebrate.map(
    (item, index) => `${index + 1}. ${item}`,
  );

  const ritualsList = details.rituals.map((ritual) => ritual);

  return (
    <SEOContentTemplate
      title={`${sabbatData.name} Sabbat: Complete Celebration Guide - Lunary`}
      h1={`${sabbatData.name} Sabbat`}
      description={`${sabbatData.description} Learn how to celebrate ${sabbatData.name} with rituals, correspondences, foods, and traditions. Complete guide to honoring this sacred time.`}
      keywords={[
        `${sabbatData.name} sabbat`,
        `${sabbatData.name} celebration`,
        `${sabbatData.name} rituals`,
        `${sabbatData.name} meaning`,
        'wheel of the year',
        'sabbat guide',
        stringToKebabCase(sabbatData.name),
      ]}
      canonicalUrl={`https://lunary.app/grimoire/sabbats/${stringToKebabCase(sabbatData.name)}`}
      intro={`${sabbatData.name} is one of the eight sabbats in the Wheel of the Year, marking an important transition point in the natural and spiritual cycles. This comprehensive guide covers everything you need to know to celebrate ${sabbatData.name} authentically, including its history, meaning, correspondences, rituals, foods, and traditions.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      rituals={ritualsList}
      emotionalThemes={details.activities}
      faqs={[
        {
          question: `When is ${sabbatData.name} celebrated?`,
          answer: `${sabbatData.name} is celebrated on ${sabbatData.date}. The exact date may vary slightly each year for solstices and equinoxes, but many practitioners celebrate on the traditional date or the nearest weekend.`,
        },
        {
          question: `How do I celebrate ${sabbatData.name} if I'm solitary?`,
          answer: `Solitary celebrations can be powerful! Create a simple ritual, prepare seasonal foods, decorate your altar with ${details.colors.join(', ').toLowerCase()} colors and ${details.symbols.slice(0, 3).join(', ').toLowerCase()}, perform spellwork aligned with the sabbat's energy, and reflect on the season's meaning. Even small celebrations honor the Wheel of the Year.`,
        },
        {
          question: `What are the correspondences for ${sabbatData.name}?`,
          answer: `${sabbatData.name} correspondences include colors: ${details.colors.join(', ')}, herbs: ${details.herbs.slice(0, 4).join(', ')}, crystals: ${details.crystals.slice(0, 4).join(', ')}, and foods: ${details.foods.slice(0, 4).join(', ')}. Working with these correspondences enhances your celebration and magical work.`,
        },
        {
          question: `What deities are associated with ${sabbatData.name}?`,
          answer: `${sabbatData.name} is associated with ${details.deities.join(', ')}. You can honor these deities in your celebrations through offerings, prayers, and rituals.`,
        },
      ]}
      tables={[
        {
          title: `${sabbatData.name} Correspondences`,
          headers: ['Category', 'Items'],
          rows: [
            ['Colors', details.colors.join(', ')],
            ['Herbs', details.herbs.join(', ')],
            ['Crystals', details.crystals.join(', ')],
            ['Foods', details.foods.join(', ')],
            ['Symbols', details.symbols.join(', ')],
            ['Deities', details.deities.join(', ')],
          ],
        },
      ]}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
        {
          label: sabbatData.name,
          href: `/grimoire/sabbats/${stringToKebabCase(sabbatData.name)}`,
        },
      ]}
      internalLinks={[
        { text: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
        { text: 'Magical Correspondences', href: '/grimoire/correspondences' },
        { text: 'Moon Rituals', href: '/grimoire/moon-rituals' },
      ]}
    />
  );
}
