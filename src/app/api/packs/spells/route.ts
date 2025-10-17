import { NextRequest, NextResponse } from 'next/server';
import { crystalDatabase, getCrystalsByCategory, getCrystalsByIntention } from '../../../../constants/grimoire/crystals';
import { spellDatabase, getSpellsByCategory } from '../../../../constants/grimoire/spells';
import { wiccanWeek } from '../../../../constants/weekDays';
import { wheelOfTheYearSabbats } from '../../../../constants/sabbats';
import { generatePackNaming, generatePricing, PackMetadata, PACK_SERIES } from '../../../../../utils/grimoire/packNaming';

export const dynamic = 'force-dynamic';

// Generate spell packs based on category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'protection'; // protection, love, prosperity, healing, courage, etc.
    const format = searchParams.get('format') || 'json'; // json or pdf
    const includeRituals = searchParams.get('rituals') === 'true';

    // Validate category
    const validCategories = ['protection', 'love', 'prosperity', 'healing', 'courage', 'moon', 'banishing', 'cleansing'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Valid options: ' + validCategories.join(', ') },
        { status: 400 }
      );
    }

    // Generate spell pack content using grimoire database
    const spellPack = generateGrimoirePack(category, includeRituals);
    
    // Add metadata for shop
    const packWithMetadata = {
      ...spellPack,
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: {
        price: category === 'moon' ? '£1.99' : '£2.49',
        bundleGroup: 'Grimoire Series',
        subscriptionEligible: true,
        difficulty: 'beginner-intermediate',
        estimatedTime: '15-45 minutes per practice'
      }
    };

    if (format === 'pdf') {
      // For PDF generation, we'd need to implement PDF creation
      // For now, return structured data that could be converted to PDF
      return NextResponse.json({
        ...packWithMetadata,
        downloadFormat: 'pdf',
        note: 'PDF generation coming soon - this is structured data ready for PDF conversion'
      });
    }

    return NextResponse.json(packWithMetadata);

  } catch (error) {
    console.error('Spell pack generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate spell pack',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate comprehensive pack using grimoire database
async function generateGrimoirePack(category: string, includeRituals: boolean = false) {
  // Get spells from grimoire database
  const categorySpells = getSpellsByCategory(category);
  
  // Get crystals from grimoire database
  const crystalCategory = getCrystalCategoryName(category);
  const categoryCrystals = getCrystalsByCategory(crystalCategory);
  const intentionCrystals = getCrystalsByIntention(category);
  
  // Combine and deduplicate crystals
  const allCrystals = [...categoryCrystals, ...intentionCrystals]
    .filter((crystal, index, self) => 
      index === self.findIndex(c => c.id === crystal.id)
    )
    .slice(0, 8);

  // Generate correspondences
  const correspondences = getGrimoireCorrespondences(category);
  
  // Generate timing recommendations
  const timing = getOptimalTiming(category);
  
  // Generate herbs list
  const herbs = correspondences.herbs.map((herb: string) => ({
    name: herb,
    properties: getHerbProperties(herb, category),
    uses: getHerbUses(herb, category)
  }));

  // Generate proper naming and metadata
  const packMetadata: PackMetadata = {
    category,
    difficulty: 'intermediate',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    contentCount: {
      spells: categorySpells.length,
      crystals: allCrystals.length,
      herbs: herbs.length,
      rituals: includeRituals ? 1 : 0
    }
  };

  const naming = generatePackNaming(packMetadata);
  const seriesKey = determineSeriesKey(category);
  const pricing = generatePricing(seriesKey, naming.edition);

  return {
    // Proper naming system
    id: `pack-${naming.sku.toLowerCase()}`,
    title: naming.title,
    subtitle: naming.subtitle,
    fullName: naming.fullName,
    shortName: naming.shortName,
    series: naming.series,
    volume: naming.volume,
    edition: naming.edition,
    sku: naming.sku,
    slug: naming.slug,
    
    // Legacy fields for compatibility
    category: category,
    description: getCategoryDescription(category),
    
    // Core content from grimoire
    spells: categorySpells.map(spell => ({
      id: spell.id,
      title: spell.title,
      purpose: spell.purpose,
      difficulty: spell.difficulty,
      duration: spell.duration,
      materials: spell.materials,
      steps: spell.steps,
      correspondences: spell.correspondences,
      timing: spell.timing
    })),
    
    crystals: allCrystals.map(crystal => ({
      name: crystal.name,
      properties: crystal.properties.join(', '),
      chakra: crystal.chakras.join(', '),
      element: crystal.elements.join(', '),
      intentions: crystal.intentions,
      colors: crystal.colors,
      usage: `Use during ${category} work or place on altar for enhanced energy`,
      workingWith: crystal.workingWith
    })),
    
    correspondences: correspondences,
    timing: timing,
    herbs: herbs,
    
    ...(includeRituals && { rituals: generateRituals(category) }),
    
    ethics: [
      'Always consider the ethical implications of your magical work',
      'Respect free will - avoid manipulative magic',
      'Work for the highest good of all involved',
      'Take responsibility for your magical actions',
      'Practice with respect for nature and all beings'
    ],
    
    howToUse: [
      'Study the correspondences to understand the energy patterns',
      'Choose spells and crystals that resonate with your specific need',
      'Follow timing recommendations for optimal results',
      'Prepare your space and materials mindfully',
      'Work with focused intention and clear purpose',
      'Record your experiences and results in your grimoire',
      'Practice regularly to build your magical skills'
    ],
    
    // Pricing and shop metadata
    pricing: {
      amount: pricing,
      currency: 'USD',
      compareAtPrice: Math.round(pricing * 1.3) // Show original higher price
    },
    
    // Shop categorization
    shopMetadata: {
      category: 'Digital Grimoire Packs',
      subcategory: naming.series,
      tags: [
        category,
        naming.series.toLowerCase().replace(/\s+/g, '-'),
        naming.volume.toLowerCase().replace(/\s+/g, '-'),
        `${categorySpells.length}-spells`,
        `${allCrystals.length}-crystals`
      ],
      searchKeywords: [
        category,
        'grimoire',
        'spells',
        'crystals',
        'magic',
        'witchcraft',
        naming.series.toLowerCase(),
        ...correspondences.intentions
      ]
    }
  };
}

function getCrystalCategoryName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'protection': 'Protection & Grounding',
    'love': 'Love & Heart Healing',
    'prosperity': 'Manifestation & Abundance',
    'healing': 'Healing & Wellness',
    'cleansing': 'Healing & Wellness',
    'divination': 'Spiritual & Intuitive',
    'manifestation': 'Manifestation & Abundance',
    'banishing': 'Protection & Grounding'
  };
  return categoryMap[category] || 'Protection & Grounding';
}

function getGrimoireCorrespondences(category: string) {
  const correspondences: { [key: string]: any } = {
    protection: {
      colors: ['Black', 'White', 'Silver', 'Dark Blue', 'Red'],
      herbs: ['Sage', 'Rosemary', 'Basil', 'Salt', 'Bay Leaves', 'Rue'],
      elements: ['Earth', 'Fire'],
      planets: ['Mars', 'Saturn', 'Sun'],
      days: ['Tuesday', 'Saturday', 'Sunday'],
      moonPhases: ['Waning Moon', 'New Moon'],
      numbers: [1, 3, 7, 9],
      intentions: ['protection', 'banishing', 'shielding', 'warding']
    },
    love: {
      colors: ['Pink', 'Red', 'Green', 'Rose', 'Copper'],
      herbs: ['Rose', 'Jasmine', 'Lavender', 'Cinnamon', 'Vanilla'],
      elements: ['Water', 'Earth'],
      planets: ['Venus', 'Moon'],
      days: ['Friday', 'Monday'],
      moonPhases: ['Waxing Moon', 'Full Moon'],
      numbers: [2, 6, 7],
      intentions: ['love', 'romance', 'self-love', 'relationships']
    },
    prosperity: {
      colors: ['Green', 'Gold', 'Silver', 'Brown', 'Yellow'],
      herbs: ['Basil', 'Cinnamon', 'Bay Leaves', 'Mint', 'Clover'],
      elements: ['Earth', 'Fire'],
      planets: ['Jupiter', 'Sun', 'Venus'],
      days: ['Thursday', 'Sunday', 'Friday'],
      moonPhases: ['New Moon', 'Waxing Moon'],
      numbers: [3, 8, 9],
      intentions: ['abundance', 'wealth', 'success', 'manifestation']
    },
    healing: {
      colors: ['Blue', 'Green', 'White', 'Light Blue', 'Violet'],
      herbs: ['Eucalyptus', 'Chamomile', 'Lavender', 'Aloe', 'Calendula'],
      elements: ['Water', 'Earth', 'Air'],
      planets: ['Sun', 'Moon', 'Mercury'],
      days: ['Sunday', 'Monday', 'Wednesday'],
      moonPhases: ['Full Moon', 'Waxing Moon'],
      numbers: [4, 6, 9],
      intentions: ['healing', 'wellness', 'restoration', 'balance']
    }
  };
  
  return correspondences[category] || correspondences.protection;
}

function getCategoryDescription(category: string): string {
  const descriptions = {
    protection: 'Essential practices for creating energetic shields, cleansing spaces, and maintaining spiritual boundaries using time-honored grimoire wisdom.',
    love: 'Heart-opening practices for self-love, relationships, and attracting loving connections, drawn from traditional love magic.',
    prosperity: 'Abundance magic to attract wealth, opportunities, and material success through focused intention and natural correspondences.',
    healing: 'Restorative practices for physical, emotional, and spiritual healing using crystal and herbal wisdom.',
    cleansing: 'Purification rituals for clearing negative energy from spaces, objects, and self using traditional methods.',
    divination: 'Practices for enhancing psychic abilities and gaining insight through crystal and herbal allies.',
    manifestation: 'Powerful techniques for bringing desires and goals into reality using natural magical correspondences.',
    banishing: 'Traditional methods for removing negative influences, breaking bad habits, and clearing obstacles.'
  };
  
  return descriptions[category as keyof typeof descriptions] || 'A collection of focused magical practices from grimoire traditions.';
}

function getOptimalTiming(category: string) {
  const correspondences = getGrimoireCorrespondences(category);
  
  return {
    bestDays: correspondences.days,
    planetaryHour: `${correspondences.planets[0]} hour for enhanced power`,
    moonPhase: correspondences.moonPhases[0] || 'Any phase with clear intention',
    seasonalNote: getSeasonalRecommendation(category)
  };
}

function getSeasonalRecommendation(category: string): string {
  const currentMonth = new Date().getMonth();
  const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];
  const currentSeason = seasons[currentMonth];
  
  const seasonalNotes: { [key: string]: { [key: string]: string } } = {
    protection: {
      'Spring': 'Spring energy supports new protective barriers and fresh starts',
      'Summer': 'Solar energy enhances protective shields and strength',
      'Autumn': 'Harvest season perfect for banishing and clearing',
      'Winter': 'Introspective energy ideal for deep protection work'
    },
    love: {
      'Spring': 'New growth energy perfect for attracting new love',
      'Summer': 'Passionate solar energy enhances romantic connections',
      'Autumn': 'Harvest energy brings relationships to fruition',
      'Winter': 'Reflective time for self-love and inner healing'
    }
  };
  
  return seasonalNotes[category]?.[currentSeason] || `${currentSeason} energy supports this work naturally`;
}

function getHerbProperties(herb: string, category: string): string {
  const herbProperties: { [key: string]: string } = {
    'Sage': 'Purification, wisdom, protection, cleansing negative energy',
    'Rosemary': 'Memory, protection, love, mental clarity, remembrance',
    'Basil': 'Prosperity, love, protection, happiness, abundance',
    'Bay Leaves': 'Success, protection, psychic powers, wishes, divination',
    'Cinnamon': 'Success, healing, power, love, prosperity, protection',
    'Lavender': 'Love, protection, sleep, peace, happiness, purification',
    'Rose': 'Love, psychic powers, healing, love divination, luck, protection',
    'Jasmine': 'Love, money, prophetic dreams, spiritual love'
  };
  
  return herbProperties[herb] || `Powerful herb for ${category} work`;
}

function getHerbUses(herb: string, category: string): string[] {
  return [
    'Add to spell bags and charm pouches',
    'Burn as incense during rituals',
    'Use in ritual baths',
    'Sprinkle around sacred space',
    'Infuse in oils for anointing'
  ];
}

function generateRituals(category: string) {
  return [
    {
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Circle Ritual`,
      description: `A complete ceremonial approach to ${category} work using grimoire traditions`,
      duration: '45-60 minutes',
      participants: '1 or group',
      materials: ['Altar setup', 'Candles', 'Incense', 'Ritual tools', 'Crystals', 'Herbs'],
      preparation: [
        'Cleanse and consecrate your space',
        'Set up altar with appropriate correspondences',
        'Gather all materials mindfully',
        'Center yourself through meditation'
      ],
      steps: [
        'Cast protective circle using traditional methods',
        'Call upon the four elements and their guardians',
        'State your intention clearly and with conviction',
        'Work with chosen spells, crystals, and herbs',
        'Raise and direct energy toward your goal',
        'Thank all energies and entities involved',
        'Close circle and ground excess energy'
      ]
    }
  ];
}

function determineSeriesKey(category: string): keyof typeof PACK_SERIES {
  const seriesMapping: { [key: string]: keyof typeof PACK_SERIES } = {
    'protection': 'essential-grimoire',
    'love': 'essential-grimoire',
    'prosperity': 'essential-grimoire',
    'healing': 'essential-grimoire',
    'cleansing': 'daily-practice',
    'divination': 'advanced-workings',
    'manifestation': 'essential-grimoire',
    'banishing': 'advanced-workings',
    'moon': 'lunar-wisdom',
    'crystals': 'crystal-mastery',
    'seasonal': 'seasonal-magic'
  };
  
  return seriesMapping[category] || 'essential-grimoire';
}
