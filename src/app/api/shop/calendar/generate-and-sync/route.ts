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
  // Create Stripe product
  const product = await stripe.products.create({
    name: calendarData.name,
    description: calendarData.description,
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

  return {
    product,
    price,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { year, dryRun = false, autoPublish = false } = await request.json();

    if (!year || year < 2025 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2025-2100)' },
        { status: 400 },
      );
    }

    console.log(
      `📅 Generating and syncing cosmic calendar for ${year}${dryRun ? ' [DRY RUN]' : ''}`,
    );

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

    // 2. Upload to Vercel Blob
    const blobKey = `cosmic-calendars/${year}-cosmic-calendar.ics`;
    const blob = await put(blobKey, icsContent, {
      access: 'public',
      contentType: 'text/calendar',
      addRandomSuffix: false,
    });

    console.log(`✅ Calendar uploaded to Blob: ${blob.url}`);

    // 3. Create Stripe product
    const sku = `calendar-${year}`;
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
    return NextResponse.json(
      {
        error: 'Failed to generate and sync calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
