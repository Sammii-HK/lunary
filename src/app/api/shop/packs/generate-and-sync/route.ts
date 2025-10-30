import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { put } from '@vercel/blob';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';
import { generatePackNaming } from '../../../../../../utils/grimoire/packNaming';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

// Generate grimoire pack and automatically sync to Stripe as SSOT
export async function POST(request: NextRequest) {
  try {
    const {
      category,
      includeRituals = false,
      customNaming = {},
      autoPublish = false,
    } = await request.json();

    console.log(`🏭 Generating and syncing ${category} pack to Stripe...`);

    // 1. Generate the grimoire pack with proper naming
    const packData = await generateGrimoirePackWithNaming(
      category,
      includeRituals,
      customNaming,
    );

    // 2. Generate PDF from pack content
    console.log('📄 Generating PDF from pack content...');
    const pdfBuffer = await generatePDFFromPack(packData);

    // 3. Upload PDF to Vercel Blob (private access)
    console.log('☁️ Uploading PDF to Vercel Blob...');
    const packId = packData.id || crypto.randomBytes(16).toString('hex');
    const fileName = `${packData.sku || packData.slug || category}_${packId}.pdf`;
    const blobKey = `shop/packs/${category}/${fileName}`;

    const { url: blobUrl } = await put(blobKey, Buffer.from(pdfBuffer), {
      access: 'public', // Public but accessed via secure download tokens
      addRandomSuffix: false,
      contentType: 'application/pdf',
    });

    const fileSize = pdfBuffer.byteLength;

    // 4. Update pack with Blob URL and file info
    const packWithBlob = {
      ...packData,
      downloadUrl: blobUrl,
      blobKey,
      fileSize,
      fileFormat: 'PDF',
    };

    // 5. Create Stripe product as SSOT (with Blob URL in metadata)
    console.log('💳 Creating Stripe product as SSOT...');
    const stripeProduct = await createStripeProduct(packWithBlob);

    // 6. Update pack with Stripe IDs
    const finalPack = {
      ...packWithBlob,
      stripeProductId: stripeProduct.product.id,
      stripePriceId: stripeProduct.price.id,
      stripeUrl: stripeProduct.url,
      isPublished: autoPublish,
      syncedAt: new Date().toISOString(),
    };

    console.log(`✅ Pack created and synced: ${finalPack.sku}`);

    return NextResponse.json({
      success: true,
      message: `Pack "${finalPack.fullName}" created and synced to Stripe`,
      pack: finalPack,
      stripe: {
        productId: stripeProduct.product.id,
        priceId: stripeProduct.price.id,
        url: stripeProduct.url,
      },
    });
  } catch (error) {
    console.error('Pack generation and sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate and sync pack',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Enhanced pack generation with naming
async function generateGrimoirePackWithNaming(
  category: string,
  includeRituals: boolean,
  customNaming: any,
) {
  // Generate base pack using existing function
  const basePack = await generateGrimoirePack(category, includeRituals);

  // Override with custom naming if provided
  if (customNaming.title) basePack.title = customNaming.title;
  if (customNaming.subtitle) basePack.subtitle = customNaming.subtitle;
  if (customNaming.specialEvent) {
    // Regenerate naming with special event
    const metadata = {
      category,
      difficulty: 'intermediate' as const,
      year: new Date().getFullYear(),
      specialEvent: customNaming.specialEvent,
      contentCount: {
        spells: basePack.spells?.length || 0,
        crystals: basePack.crystals?.length || 0,
        herbs: basePack.herbs?.length || 0,
        rituals: includeRituals ? 1 : 0,
      },
    };

    // Static import instead of dynamic import
    // const { generatePackNaming } = await import('../../../../../utils/grimoire/packNaming');
    const newNaming = generatePackNaming(metadata);

    Object.assign(basePack, {
      title: newNaming.title,
      subtitle: newNaming.subtitle,
      fullName: newNaming.fullName,
      series: newNaming.series,
      volume: newNaming.volume,
      edition: newNaming.edition,
      sku: newNaming.sku,
      slug: newNaming.slug,
    });
  }

  return basePack;
}

// Create Stripe product with comprehensive metadata
async function createStripeProduct(packData: any) {
  console.log(`🛍️ Creating Stripe product: ${packData.fullName}`);

  // Create comprehensive Stripe product
  const product = await stripe.products.create({
    name: packData.fullName,
    description: packData.description,
    images: [], // Could add pack preview images
    metadata: {
      // Pack identification
      packId: packData.id,
      sku: packData.sku,
      slug: packData.slug,

      // Blob storage (SSOT for file location)
      blobUrl: packData.downloadUrl,
      blobKey: packData.blobKey,
      fileSize: packData.fileSize?.toString() || '0',
      fileFormat: packData.fileFormat || 'PDF',

      // Series and volume info
      series: packData.series,
      volume: packData.volume,
      edition: packData.edition,

      // Content metadata
      category: packData.category,
      spellCount: packData.spells?.length?.toString() || '0',
      crystalCount: packData.crystals?.length?.toString() || '0',
      herbCount: packData.herbs?.length?.toString() || '0',
      ritualCount: packData.rituals?.length?.toString() || '0',

      // Timing and correspondences
      bestDays: JSON.stringify(packData.timing?.bestDays || []),
      moonPhase: packData.timing?.moonPhase || '',
      planetaryHour: packData.timing?.planetaryHour || '',
      elements: JSON.stringify(packData.correspondences?.elements || []),

      // Shop metadata
      difficulty: packData.shopMetadata?.difficulty || 'intermediate',
      estimatedTime: packData.shopMetadata?.estimatedTime || '15-45 minutes',
      tags: JSON.stringify(packData.shopMetadata?.tags || []),
      searchKeywords: JSON.stringify(
        packData.shopMetadata?.searchKeywords || [],
      ),

      // Generation metadata
      grimoireType: 'grimoire-pack',
      generatedAt: new Date().toISOString(),
      contentHash: generateContentHash(packData),
    },
    active: true,
  });

  // Create Stripe price with proper metadata
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: packData.pricing?.amount || 249,
    currency: 'usd',
    metadata: {
      packId: packData.id,
      sku: packData.sku,
      series: packData.series,
      edition: packData.edition,
      compareAtPrice: packData.pricing?.compareAtPrice?.toString() || '',
    },
  });

  // Generate Stripe buy link
  const paymentLinks = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      packId: packData.id,
      sku: packData.sku,
    },
  });

  console.log(`✅ Stripe product created: ${product.id}`);
  console.log(`💰 Stripe price created: ${price.id}`);
  console.log(`🔗 Payment link created: ${paymentLinks.id}`);

  return {
    product,
    price,
    paymentLink: paymentLinks,
    url: paymentLinks.url,
  };
}

function generateContentHash(pack: any): string {
  const contentString = JSON.stringify({
    spells: pack.spells?.map((s: any) => s.id || s.title),
    crystals: pack.crystals?.map((c: any) => c.name),
    herbs: pack.herbs?.map((h: any) => h.name),
    correspondences: pack.correspondences,
  });

  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

// Generate pack by calling the API to avoid circular dependency
async function generateGrimoirePack(category: string, includeRituals: boolean) {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : 'http://localhost:3000';
  const response = await fetch(
    `${baseUrl}/api/packs/spells?category=${category}&rituals=${includeRituals}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to generate pack: ${response.status}`);
  }

  return await response.json();
}

// Generate PDF from pack data
async function generatePDFFromPack(packData: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add title page
  let page = pdfDoc.addPage([612, 792]); // Standard letter size
  const { width, height } = page.getSize();

  // Title
  const title = packData.fullName || packData.title || 'Grimoire Pack';
  page.drawText(title, {
    x: 50,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Subtitle
  if (packData.subtitle) {
    page.drawText(packData.subtitle, {
      x: 50,
      y: height - 140,
      size: 16,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // Description
  if (packData.description) {
    const descLines = packData.description.split('\n');
    let yPos = height - 180;
    for (const line of descLines.slice(0, 5)) {
      // Limit to 5 lines on title page
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: width - 100,
      });
      yPos -= 18;
    }
  }

  // Add spells
  let yPosition = height - 300;
  if (packData.spells && packData.spells.length > 0) {
    for (const spell of packData.spells) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      page.drawText(spell.title || spell.name, {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 25;

      if (spell.description || spell.information) {
        const content = spell.description || spell.information || '';
        const lines = content.split('\n');
        for (const line of lines.slice(0, 10)) {
          // Limit lines per spell
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
      }
      yPosition -= 20;
    }
  }

  // Add crystals
  if (packData.crystals && packData.crystals.length > 0) {
    if (yPosition < 150) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }

    page.drawText('Crystals', {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 30;

    for (const crystal of packData.crystals) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      page.drawText(crystal.name, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 20;

      if (crystal.properties || crystal.information) {
        const content = crystal.properties || crystal.information || '';
        const lines = content.split('\n');
        for (const line of lines.slice(0, 5)) {
          if (yPosition < 50) {
            page = pdfDoc.addPage([612, 792]);
            yPosition = height - 50;
          }
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
            maxWidth: width - 100,
          });
          yPosition -= 16;
        }
      }
      yPosition -= 15;
    }
  }

  return pdfDoc.save();
}
