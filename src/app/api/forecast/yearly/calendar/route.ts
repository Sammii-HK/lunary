import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/ai/auth';
import { sql } from '@vercel/postgres';
import {
  hasFeatureAccess,
  normalizePlanType,
  FEATURE_ACCESS,
} from '../../../../../../utils/pricing';
import { YearlyForecast, generateYearlyForecast } from '@/lib/forecast/yearly';

type YearlyForecastRow = {
  forecast: YearlyForecast;
  expires_at: Date | null;
};

async function getCachedYearlyForecast(
  year: number,
): Promise<YearlyForecast | null> {
  try {
    const result = await sql<YearlyForecastRow>`
      SELECT forecast, expires_at
      FROM yearly_forecasts
      WHERE year = ${year}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    if (!row.forecast) {
      return null;
    }

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return null;
    }

    return row.forecast;
  } catch (error: any) {
    if (error.code === '42P01') {
      console.error(
        `[forecast/yearly/calendar] yearly_forecasts table missing (code: 42P01) - run setup-db to create it. Error: ${error.message}`,
      );
    }
    return null;
  }
}

function formatDateForICS(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z');
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}T120000Z`;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function getAspectColorICS(aspect: string): string {
  const aspectLower = aspect.toLowerCase();
  if (aspectLower.includes('conjunction')) {
    return '#60A5FA'; // blue-400
  } else if (aspectLower.includes('trine')) {
    return '#4ADE80'; // green-400
  } else if (aspectLower.includes('opposition')) {
    return '#F87171'; // red-400
  } else if (aspectLower.includes('square')) {
    return '#FB923C'; // orange-400
  } else if (aspectLower.includes('sextile')) {
    return '#A78BFA'; // purple-400
  }
  return '#71717A'; // zinc-500 default
}

function getEventColorICS(
  type: 'eclipse' | 'retrograde' | 'aspect' | 'transit',
  aspect?: string,
): string {
  if (type === 'eclipse') {
    return '#C084FC'; // purple-400
  } else if (type === 'retrograde') {
    return '#FBBF24'; // amber-400
  } else if (type === 'aspect' || type === 'transit') {
    return aspect ? getAspectColorICS(aspect) : '#71717A';
  }
  return '#71717A';
}

function generateICSFromForecast(
  forecast: YearlyForecast,
  generatedAt: Date,
): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Lunary//Yearly Forecast Calendar//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push(`X-WR-CALNAME:Lunary ${forecast.year} Cosmic Forecast Calendar`);
  lines.push(
    `X-WR-CALDESC:Your personalized ${forecast.year} cosmic forecast with major transits, retrogrades, eclipses, and key aspects. Compatible with Apple Calendar (iCal), Google Calendar, Outlook, and all major calendar apps.`,
  );
  lines.push('X-WR-TIMEZONE:UTC');

  let eventCount = 0;

  forecast.eclipses.forEach((eclipse) => {
    const startDate = formatDateForICS(eclipse.startDate);
    const endDate = formatDateForICS(eclipse.endDate || eclipse.startDate);
    const endDateTime = new Date(eclipse.endDate || eclipse.startDate);
    endDateTime.setHours(23, 59, 59, 999);
    const endDateICS = formatDateForICS(
      endDateTime.toISOString().split('T')[0],
    );

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:eclipse-${eclipse.date}@lunary.app`);
    lines.push(`DTSTART;VALUE=DATE:${startDate.split('T')[0]}`);
    lines.push(`DTEND;VALUE=DATE:${endDateICS.split('T')[0]}`);
    lines.push(
      `DTSTAMP:${formatDateForICS(generatedAt.toISOString().split('T')[0])}`,
    );
    lines.push(
      `SUMMARY:${escapeICS(`${eclipse.type === 'solar' ? 'Solar' : 'Lunar'} Eclipse in ${eclipse.sign}`)}`,
    );
    lines.push(`DESCRIPTION:${escapeICS(eclipse.description)}`);
    lines.push('LOCATION:Earth');
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push('CATEGORIES:Eclipse');
    lines.push(`COLOR:${getEventColorICS('eclipse')}`);
    lines.push('END:VEVENT');
    eventCount++;
  });

  forecast.retrogrades.forEach((retrograde) => {
    const startDate = formatDateForICS(retrograde.startDate);
    const endDate = retrograde.endDate
      ? formatDateForICS(retrograde.endDate)
      : formatDateForICS(
          new Date(forecast.year, 11, 31).toISOString().split('T')[0],
        );

    lines.push('BEGIN:VEVENT');
    lines.push(
      `UID:retrograde-${retrograde.startDate}-${retrograde.planet}@lunary.app`,
    );
    lines.push(`DTSTART;VALUE=DATE:${startDate.split('T')[0]}`);
    lines.push(`DTEND;VALUE=DATE:${endDate.split('T')[0]}`);
    lines.push(
      `DTSTAMP:${formatDateForICS(generatedAt.toISOString().split('T')[0])}`,
    );
    lines.push(`SUMMARY:${escapeICS(`${retrograde.planet} Retrograde`)}`);
    lines.push(`DESCRIPTION:${escapeICS(retrograde.description)}`);
    lines.push('LOCATION:Earth');
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push('CATEGORIES:Retrograde');
    lines.push(`COLOR:${getEventColorICS('retrograde')}`);
    lines.push('END:VEVENT');
    eventCount++;
  });

  forecast.keyAspects.forEach((aspect) => {
    const startDate = formatDateForICS(aspect.startDate);
    const endDate = aspect.endDate
      ? formatDateForICS(aspect.endDate)
      : formatDateForICS(
          new Date(forecast.year, 11, 31).toISOString().split('T')[0],
        );

    lines.push('BEGIN:VEVENT');
    lines.push(
      `UID:aspect-${aspect.startDate}-${aspect.aspect}-${aspect.planets.join('-')}@lunary.app`,
    );
    lines.push(`DTSTART;VALUE=DATE:${startDate.split('T')[0]}`);
    lines.push(`DTEND;VALUE=DATE:${endDate.split('T')[0]}`);
    lines.push(
      `DTSTAMP:${formatDateForICS(generatedAt.toISOString().split('T')[0])}`,
    );
    lines.push(
      `SUMMARY:${escapeICS(`${aspect.planets.join(' ')} ${aspect.aspect}`)}`,
    );
    lines.push(`DESCRIPTION:${escapeICS(aspect.description)}`);
    lines.push('LOCATION:Earth');
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push(`CATEGORIES:Aspect`);
    lines.push(`COLOR:${getEventColorICS('aspect', aspect.aspect)}`);
    lines.push('END:VEVENT');
    eventCount++;
  });

  forecast.majorTransits.forEach((transit) => {
    const startDate = formatDateForICS(transit.startDate);
    const endDate = transit.endDate
      ? formatDateForICS(transit.endDate)
      : formatDateForICS(
          new Date(forecast.year, 11, 31).toISOString().split('T')[0],
        );

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:transit-${transit.startDate}-${transit.event}@lunary.app`);
    lines.push(`DTSTART;VALUE=DATE:${startDate.split('T')[0]}`);
    lines.push(`DTEND;VALUE=DATE:${endDate.split('T')[0]}`);
    lines.push(
      `DTSTAMP:${formatDateForICS(generatedAt.toISOString().split('T')[0])}`,
    );
    lines.push(`SUMMARY:${escapeICS(`Major ${transit.event}`)}`);
    lines.push(
      `DESCRIPTION:${escapeICS(transit.description + ' - ' + transit.significance)}`,
    );
    lines.push('LOCATION:Earth');
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push('CATEGORIES:Major Transit');
    lines.push(`COLOR:${getEventColorICS('transit', transit.event)}`);
    lines.push('END:VEVENT');
    eventCount++;
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const userPlanRaw = user.plan;

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    if (!year || year < 2020 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2020-2100)' },
        { status: 400 },
      );
    }

    const [subscriptionResult] = await Promise.all([
      sql`
        SELECT plan_type, status
        FROM subscriptions
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `,
    ]);

    const subscription = subscriptionResult.rows[0];
    let planType = normalizePlanType(userPlanRaw);
    let subscriptionStatus: string = 'none';

    if (subscription) {
      planType = normalizePlanType(subscription.plan_type || userPlanRaw);
      subscriptionStatus = subscription.status || 'none';
    } else {
      planType = normalizePlanType(userPlanRaw);
      subscriptionStatus = 'none';
    }

    const normalizedPlan = normalizePlanType(planType);
    const isAnnualPlan = normalizedPlan === 'lunary_plus_ai_annual';
    const statusIsActive =
      subscriptionStatus === 'trial' ||
      subscriptionStatus === 'active' ||
      subscriptionStatus === 'trialing';

    let hasAccess = false;
    if (isAnnualPlan && statusIsActive) {
      hasAccess =
        FEATURE_ACCESS.lunary_plus_ai_annual.includes('yearly_forecast');
    } else {
      hasAccess = hasFeatureAccess(
        subscriptionStatus,
        normalizedPlan,
        'yearly_forecast',
      );
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            'Yearly forecast calendar is available for Lunary+ AI Annual subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    let forecast = await getCachedYearlyForecast(year);
    if (!forecast) {
      forecast = await generateYearlyForecast(year);
    }

    const icsContent = generateICSFromForecast(forecast, new Date());

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="lunary-forecast-calendar-${year}.ics"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate forecast calendar:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please sign in to access forecast calendar' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to generate forecast calendar' },
      { status: 500 },
    );
  }
}
