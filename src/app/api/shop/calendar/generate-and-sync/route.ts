import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateCosmicCalendar } from '../../../../../../utils/calendar/cosmicCalendarGenerator';
import { put } from '@vercel/blob';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const runtime = 'nodejs';

async function createStripeProduct(calendarData: {
  name: string;
  description: string;
  blobUrl: string;
  year: number;
  price: number;
  sku: string;
}) {
  const stripe = getStripe();

  // Generate OG image URL with calendar emoji
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const imageUrl = `${baseUrl}/api/shop/og?category=calendar&name=${encodeURIComponent(calendarData.name)}&items=0`;

  // Create Stripe product
  const product = await stripe.products.create({
    name: calendarData.name,
    description: calendarData.description,
    images: [imageUrl],
    metadata: {
      category: 'calendar',
      packId: calendarData.sku,
      year: calendarData.year.toString(),
      blobUrl: calendarData.blobUrl,
      fileFormat: 'ICS',
      fileType: 'calendar',
    },
  });

  // Create price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: calendarData.price,
    currency: 'usd',
    metadata: {
      packId: calendarData.sku,
      year: calendarData.year.toString(),
    },
  });

  // Set default_price on product so it shows up in shop listings
  const updatedProduct = await stripe.products.update(product.id, {
    default_price: price.id,
  });

  return {
    product: updatedProduct,
    price,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let year: number | undefined;
  let dryRun = false;
  let autoPublish = false;

  try {
    const body = await request.json();
    year = body.year;
    dryRun = body.dryRun || false;
    autoPublish = body.autoPublish || false;

    if (!year || year < 2025 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2025-2100)' },
        { status: 400 },
      );
    }

    console.log(
      `📅 Generating and syncing cosmic calendar for ${year}${dryRun ? ' [DRY RUN]' : ''}`,
    );

    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'calendar_creation',
      activityCategory: 'shop',
      status: 'pending',
      message: `Calendar generation started for ${year}`,
      metadata: { year, dryRun, autoPublish },
    });

    // 1. Generate calendar
    const { events, icsContent } = await generateCosmicCalendar(year);
    console.log(`✅ Generated ${events.length} cosmic events for ${year}`);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        year,
        eventCount: events.length,
        preview: events.slice(0, 10),
        icsSize: icsContent.length,
      });
    }

    // Check for duplicate calendar before creating
    const sku = `calendar-${year}`;
    const stripe = getStripe();
    const existingProducts = await stripe.products.search({
      query: `metadata['packId']:'${sku}' OR metadata['sku']:'${sku}' OR metadata['year']:'${year}' AND metadata['category']:'calendar'`,
      limit: 1,
    });

    if (existingProducts.data.length > 0) {
      const existing = existingProducts.data[0];
      console.log(
        `⚠️ Calendar already exists for ${year} (Product ID: ${existing.id})`,
      );
      return NextResponse.json({
        success: false,
        error: 'Calendar already exists',
        message: `A calendar for ${year} already exists in Stripe`,
        existingProduct: {
          id: existing.id,
          name: existing.name,
          year: year,
        },
      });
    }

    // 2. Upload to Vercel Blob
    const blobKey = `cosmic-calendars/${year}-cosmic-calendar.ics`;

    // Check for blob token - Vercel Blob requires BLOB_READ_WRITE_TOKEN
    // It should be automatically available in Vercel, but we check for clarity
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_TOKEN ||
      process.env.BLOB_TOKEN;

    if (!blobToken) {
      console.error('❌ Blob token not found. Available env vars:', {
        hasBlobReadWriteToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        hasVercelBlobToken: !!process.env.VERCEL_BLOB_TOKEN,
        hasBlobToken: !!process.env.BLOB_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      });
      throw new Error(
        'BLOB_READ_WRITE_TOKEN environment variable is required for calendar uploads. ' +
          'Please set this in your Vercel project settings under Storage > Blob. ' +
          'For local development, get the token from your Vercel project dashboard: ' +
          'https://vercel.com/[your-project]/settings/storage',
      );
    }

    const blob = await put(blobKey, icsContent, {
      access: 'public',
      contentType: 'text/calendar',
      addRandomSuffix: false,
    });

    console.log(`✅ Calendar uploaded to Blob: ${blob.url}`);

    // 3. Create Stripe product
    const calendarData = {
      name: `Cosmic Calendar ${year} - iCal & Google Calendar`,
      description: `Complete cosmic calendar for ${year} with all moon phases, planetary retrogrades, sign ingresses, and major cosmic events. Compatible with Apple Calendar (iCal), Google Calendar, Outlook, and all major calendar apps. Import once and sync across all your devices.`,
      blobUrl: blob.url,
      year,
      price: 699, // $6.99 - undercutting CHANI's £7 (~$9)
      sku,
    };

    console.log('💳 Creating Stripe product...');
    const stripeProduct = await createStripeProduct(calendarData);

    console.log(
      `✅ Calendar created and synced: ${sku}${dryRun ? ' [DRY RUN]' : ''}`,
    );

    const executionTime = Date.now() - startTime;
    await logActivity({
      activityType: 'calendar_creation',
      activityCategory: 'shop',
      status: 'success',
      message: `Calendar for ${year} created and synced`,
      metadata: {
        year,
        sku,
        eventCount: events.length,
        stripeProductId: stripeProduct.product.id,
        stripePriceId: stripeProduct.price.id,
      },
      executionTimeMs: executionTime,
    });

    return NextResponse.json({
      success: true,
      message: `Calendar "${calendarData.name}" created and synced to Stripe`,
      calendar: {
        ...calendarData,
        eventCount: events.length,
        fileSize: icsContent.length,
        stripeProductId: stripeProduct.product.id,
        stripePriceId: stripeProduct.price.id,
        isPublished: autoPublish,
      },
      stripe: {
        productId: stripeProduct.product.id,
        priceId: stripeProduct.price.id,
      },
    });
  } catch (error: any) {
    console.error('❌ Calendar generation and sync failed:', error);
    const executionTime = Date.now() - startTime;
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'calendar_creation',
      activityCategory: 'shop',
      status: 'failed',
      message: `Calendar generation failed for ${year || 'unknown year'}`,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    // Send urgent Discord notification for failure
    try {
      const { sendDiscordAdminNotification } = await import('@/lib/discord');
      await sendDiscordAdminNotification({
        title: '🚨 Calendar Creation Failed',
        message: `Failed to generate calendar for ${year || 'unknown year'}`,
        priority: 'emergency',
        category: 'urgent',
        fields: [
          {
            name: 'Year',
            value: year ? year.toString() : 'unknown',
            inline: true,
          },
          {
            name: 'Error',
            value: (error instanceof Error
              ? error.message
              : 'Unknown error'
            ).substring(0, 500),
            inline: false,
          },
          {
            name: 'Execution Time',
            value: `${executionTime}ms`,
            inline: true,
          },
        ],
        dedupeKey: `calendar-failed-${year || 'unknown'}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
    }

    return NextResponse.json(
      {
        error: 'Failed to generate and sync calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
