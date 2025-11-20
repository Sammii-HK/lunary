import { NextRequest, NextResponse } from 'next/server';
import { generateCosmicCalendar } from '../../../../../../utils/calendar/cosmicCalendarGenerator';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { year, dryRun = false, download = false } = await request.json();

    if (!year || year < 2025 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2025-2100)' },
        { status: 400 },
      );
    }

    console.log(
      `📅 Generating cosmic calendar for ${year}${dryRun ? ' [DRY RUN]' : ''}${download ? ' [DOWNLOAD MODE]' : ''}`,
    );

    // Generate calendar
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

    // If download=true, return the ICS file directly for testing
    if (download) {
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="lunary-cosmic-calendar-${year}.ics"`,
        },
      });
    }

    // Upload to Vercel Blob
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
          'Please set this in your Vercel project settings under Storage > Blob.',
      );
    }

    const blob = await put(blobKey, icsContent, {
      access: 'public',
      contentType: 'text/calendar',
      addRandomSuffix: false,
    });

    console.log(`✅ Calendar uploaded to Blob: ${blob.url}`);

    return NextResponse.json({
      success: true,
      year,
      eventCount: events.length,
      blobUrl: blob.url,
      blobKey,
      fileSize: icsContent.length,
      events: events.slice(0, 20), // Preview first 20 events
    });
  } catch (error: any) {
    console.error('❌ Calendar generation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET endpoint for easy testing via browser
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear() + 1;

    if (!year || year < 2025 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2025-2100). Use ?year=2026' },
        { status: 400 },
      );
    }

    console.log(`📅 Generating cosmic calendar for ${year} (GET request)`);

    // Generate calendar
    const { events, icsContent } = await generateCosmicCalendar(year);

    console.log(`✅ Generated ${events.length} cosmic events for ${year}`);

    // Return the ICS file directly for download
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="lunary-cosmic-calendar-${year}.ics"`,
      },
    });
  } catch (error: any) {
    console.error('❌ Calendar generation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
