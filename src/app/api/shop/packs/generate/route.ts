import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';

// Using Node.js runtime for better compatibility with pdf-lib
// export const runtime = 'edge';

function generateRandomId(): string {
  return crypto.randomBytes(16).toString('hex');
}

interface GeneratePackRequest {
  category:
    | 'moon_phases'
    | 'crystals'
    | 'spells'
    | 'tarot'
    | 'astrology'
    | 'seasonal';
  subcategory?: string;
  name: string;
  description: string;
  price: number; // in cents
  dateRange?: string;
  year?: number;
  month?: number;
  quarter?: number;
}

interface PackContent {
  title: string;
  subtitle?: string;
  description: string;
  items: PackItem[];
}

interface PackItem {
  date?: string;
  title: string;
  content: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePackRequest = await request.json();

    if (!body.category || !body.name || !body.description || !body.price) {
      return NextResponse.json(
        {
          error: 'Missing required fields: category, name, description, price',
        },
        { status: 400 },
      );
    }

    console.log(`🎯 Generating pack: ${body.name} (${body.category})`);

    // Generate pack content based on category
    const packContent = await generatePackContent(body);

    // Generate OG image for the pack
    const packImageUrl = await generatePackImage(body, packContent);

    // Generate PDF content
    const pdfBuffer = await generatePackPDF(packContent);

    // Upload PDF to Vercel Blob
    const packId = generateRandomId();
    const fileName = `${body.category}_${body.subcategory || 'general'}_${packId}.pdf`;
    const blobKey = `shop/packs/${body.category}/${fileName}`;

    const { url: downloadUrl } = await put(blobKey, Buffer.from(pdfBuffer), {
      access: 'public', // Will implement secure access via our download API
      addRandomSuffix: false,
    });

    // Calculate file size
    const fileSize = pdfBuffer.byteLength;

    const packData = {
      id: packId,
      name: body.name,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      price: body.price,
      imageUrl: packImageUrl,
      downloadUrl,
      fileSize,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        dateRange: body.dateRange,
        format: 'PDF',
        itemCount: packContent.items.length,
      },
    };

    console.log(`✅ Pack generated successfully: ${packData.name}`);
    console.log(`📦 File size: ${Math.round(fileSize / 1024)}KB`);
    console.log(`📊 Items: ${packContent.items.length}`);

    return NextResponse.json({
      success: true,
      pack: packData,
      preview: {
        itemCount: packContent.items.length,
        sampleItems: packContent.items.slice(0, 3),
      },
    });
  } catch (error: any) {
    console.error('❌ Pack generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate pack' },
      { status: 500 },
    );
  }
}

async function generatePackContent(
  request: GeneratePackRequest,
): Promise<PackContent> {
  const {
    category,
    subcategory,
    name,
    description,
    year,
    month,
    quarter,
    dateRange,
  } = request;

  switch (category) {
    case 'moon_phases':
      return generateMoonPhasePack(name, description, {
        year,
        month,
        quarter,
        dateRange,
      });
    case 'crystals':
      return generateCrystalPack(name, description, { subcategory });
    case 'spells':
      return generateSpellPack(name, description, { subcategory });
    case 'tarot':
      return generateTarotPack(name, description, { subcategory });
    case 'astrology':
      return generateAstrologyPack(name, description, {
        year,
        month,
        dateRange,
      });
    case 'seasonal':
      return generateSeasonalPack(name, description, { year, subcategory });
    default:
      throw new Error(`Unsupported category: ${category}`);
  }
}

async function generateMoonPhasePack(
  name: string,
  description: string,
  options: {
    year?: number;
    month?: number;
    quarter?: number;
    dateRange?: string;
  },
): Promise<PackContent> {
  const { year = new Date().getFullYear(), month, quarter } = options;

  const items: PackItem[] = [];
  let startDate: Date;
  let endDate: Date;

  if (month) {
    // Monthly pack
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
  } else if (quarter) {
    // Quarterly pack
    const quarterStartMonth = (quarter - 1) * 3;
    startDate = new Date(year, quarterStartMonth, 1);
    endDate = new Date(year, quarterStartMonth + 3, 0);
  } else {
    // Yearly pack
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
  }

  // Generate moon phase data for the date range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Fetch moon phase data for each day
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      // Use existing cosmic API to get moon phase data
      const response = await fetch(
        `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
      );
      if (response.ok) {
        const cosmicData = await response.json();

        // Check if this day has a significant moon phase
        if (
          cosmicData.primaryEvent?.type === 'moon' &&
          cosmicData.primaryEvent?.priority >= 10
        ) {
          items.push({
            date: dateStr,
            title: cosmicData.primaryEvent.name,
            content: `${cosmicData.primaryEvent.energy}\n\n${cosmicData.highlights?.join('\n\n') || ''}`,
            imageUrl: `${baseUrl}/api/og/cosmic/${dateStr}`,
            metadata: {
              moonPhase: cosmicData.primaryEvent.name,
              energy: cosmicData.primaryEvent.energy,
              constellation: cosmicData.moonConstellation,
            },
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch data for ${currentDate.toISOString()}`);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // If no significant phases found, generate some general moon content
  if (items.length === 0) {
    const phases = ['New Moon', 'First Quarter', 'Full Moon', 'Third Quarter'];
    phases.forEach((phase, index) => {
      items.push({
        title: phase,
        content: `Experience the powerful energy of the ${phase}. This lunar phase brings unique opportunities for manifestation, reflection, and spiritual growth.`,
        metadata: { phase, energy: 'Transformative' },
      });
    });
  }

  return {
    title: name,
    subtitle: `Moon Phase Guide ${year}`,
    description,
    items,
  };
}

async function generateCrystalPack(
  name: string,
  description: string,
  options: { subcategory?: string },
): Promise<PackContent> {
  const crystals = [
    {
      name: 'Amethyst',
      properties: 'Spiritual protection, intuition, clarity',
      chakra: 'Crown',
    },
    {
      name: 'Rose Quartz',
      properties: 'Unconditional love, emotional healing',
      chakra: 'Heart',
    },
    {
      name: 'Clear Quartz',
      properties: 'Amplification, clarity, healing',
      chakra: 'All',
    },
    {
      name: 'Black Tourmaline',
      properties: 'Protection, grounding, EMF shielding',
      chakra: 'Root',
    },
    {
      name: 'Citrine',
      properties: 'Abundance, joy, manifestation',
      chakra: 'Solar Plexus',
    },
    {
      name: 'Labradorite',
      properties: 'Magic, transformation, psychic abilities',
      chakra: 'Third Eye',
    },
    {
      name: 'Selenite',
      properties: 'Cleansing, high vibration, angelic connection',
      chakra: 'Crown',
    },
    {
      name: 'Carnelian',
      properties: 'Creativity, courage, motivation',
      chakra: 'Sacral',
    },
  ];

  const items = crystals.map((crystal) => ({
    title: crystal.name,
    content: `Properties: ${crystal.properties}\nChakra: ${crystal.chakra}\n\nUse this powerful crystal ally to enhance your spiritual practice and bring balance to your energy field.`,
    metadata: {
      properties: crystal.properties,
      chakra: crystal.chakra,
      category: 'crystal',
    },
  }));

  return {
    title: name,
    subtitle: 'Crystal Healing Guide',
    description,
    items,
  };
}

async function generateSpellPack(
  name: string,
  description: string,
  options: { subcategory?: string },
): Promise<PackContent> {
  const spells = [
    {
      name: 'Protection Circle',
      intent: 'Protection',
      ingredients: 'Salt, white candle, sage',
    },
    {
      name: 'Abundance Ritual',
      intent: 'Prosperity',
      ingredients: 'Green candle, cinnamon, bay leaves',
    },
    {
      name: 'Love Drawing',
      intent: 'Love',
      ingredients: 'Rose petals, pink candle, honey',
    },
    {
      name: 'Clarity Spell',
      intent: 'Wisdom',
      ingredients: 'Purple candle, amethyst, lavender',
    },
    {
      name: 'Healing Light',
      intent: 'Health',
      ingredients: 'Blue candle, eucalyptus, clear quartz',
    },
  ];

  const items = spells.map((spell) => ({
    title: spell.name,
    content: `Intent: ${spell.intent}\nIngredients: ${spell.ingredients}\n\nThis sacred ritual helps align your energy with your highest good and manifests positive change in your life.`,
    metadata: {
      intent: spell.intent,
      ingredients: spell.ingredients,
      category: 'spell',
    },
  }));

  return {
    title: name,
    subtitle: 'Sacred Rituals & Spells',
    description,
    items,
  };
}

async function generateTarotPack(
  name: string,
  description: string,
  options: { subcategory?: string },
): Promise<PackContent> {
  const cards = [
    {
      name: 'The Fool',
      meaning: 'New beginnings, innocence, adventure',
      arcana: 'Major',
    },
    {
      name: 'The Magician',
      meaning: 'Manifestation, willpower, desire',
      arcana: 'Major',
    },
    {
      name: 'The High Priestess',
      meaning: 'Intuition, mystery, subconscious',
      arcana: 'Major',
    },
    {
      name: 'The Empress',
      meaning: 'Fertility, femininity, beauty',
      arcana: 'Major',
    },
    {
      name: 'The Emperor',
      meaning: 'Authority, structure, control',
      arcana: 'Major',
    },
  ];

  const items = cards.map((card) => ({
    title: card.name,
    content: `Meaning: ${card.meaning}\nArcana: ${card.arcana}\n\nThis card carries deep wisdom and guidance for your spiritual journey.`,
    metadata: {
      meaning: card.meaning,
      arcana: card.arcana,
      category: 'tarot',
    },
  }));

  return {
    title: name,
    subtitle: 'Tarot Wisdom Guide',
    description,
    items,
  };
}

async function generateAstrologyPack(
  name: string,
  description: string,
  options: { year?: number; month?: number; dateRange?: string },
): Promise<PackContent> {
  const { year = new Date().getFullYear() } = options;

  const items = [
    {
      title: 'Planetary Transits',
      content: `Major planetary movements and their influence throughout ${year}`,
      metadata: { category: 'transits' },
    },
    {
      title: 'Mercury Retrogrades',
      content: 'Timing and guidance for Mercury retrograde periods',
      metadata: { category: 'retrogrades' },
    },
    {
      title: 'Eclipse Seasons',
      content: 'Solar and lunar eclipses and their transformative power',
      metadata: { category: 'eclipses' },
    },
  ];

  return {
    title: name,
    subtitle: `Astrological Guide ${year}`,
    description,
    items,
  };
}

async function generateSeasonalPack(
  name: string,
  description: string,
  options: { year?: number; subcategory?: string },
): Promise<PackContent> {
  const seasons = [
    {
      name: 'Spring Equinox',
      energy: 'Renewal and growth',
      date: 'March 20-21',
    },
    {
      name: 'Summer Solstice',
      energy: 'Peak power and manifestation',
      date: 'June 20-21',
    },
    {
      name: 'Autumn Equinox',
      energy: 'Harvest and gratitude',
      date: 'September 22-23',
    },
    {
      name: 'Winter Solstice',
      energy: 'Inner reflection and renewal',
      date: 'December 21-22',
    },
  ];

  const items = seasons.map((season) => ({
    title: season.name,
    content: `Energy: ${season.energy}\nDate: ${season.date}\n\nConnect with the natural rhythms of the Earth and align your spiritual practice with seasonal energies.`,
    metadata: {
      energy: season.energy,
      date: season.date,
      category: 'seasonal',
    },
  }));

  return {
    title: name,
    subtitle: 'Seasonal Wisdom Guide',
    description,
    items,
  };
}

async function generatePackImage(
  request: GeneratePackRequest,
  content: PackContent,
): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Generate a custom OG image for the pack
    const imageUrl = `${baseUrl}/api/shop/og?category=${request.category}&name=${encodeURIComponent(request.name)}&items=${content.items.length}`;

    return imageUrl;
  } catch (error) {
    console.warn('Failed to generate pack image:', error);
    return '';
  }
}

async function generatePackPDF(content: PackContent): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add title page
  let page = pdfDoc.addPage([612, 792]); // Standard letter size
  const { width, height } = page.getSize();

  // Title
  page.drawText(content.title, {
    x: 50,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Subtitle
  if (content.subtitle) {
    page.drawText(content.subtitle, {
      x: 50,
      y: height - 140,
      size: 16,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Description
  page.drawText(content.description, {
    x: 50,
    y: height - 180,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
    maxWidth: width - 100,
  });

  // Add items
  let yPosition = height - 250;

  for (const item of content.items) {
    // Check if we need a new page
    if (yPosition < 100) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }

    // Item title
    page.drawText(item.title, {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 25;

    // Item date (if available)
    if (item.date) {
      page.drawText(`Date: ${item.date}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 20;
    }

    // Item content
    const lines = item.content.split('\n');
    for (const line of lines) {
      if (yPosition < 50) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: width - 100,
      });
      yPosition -= 18;
    }

    yPosition -= 20; // Extra space between items
  }

  return pdfDoc.save();
}
