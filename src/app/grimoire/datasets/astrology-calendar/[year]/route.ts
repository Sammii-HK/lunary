import { notFound } from 'next/navigation';
import {
  buildAstrologyCalendarDataset,
  isSupportedAstrologyCalendarYear,
} from '@/lib/seo/astrology-calendar-dataset';

export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year: yearParam } = await params;
  const match = yearParam.match(/^(\d{4})\.json$/);

  if (!match) {
    notFound();
  }

  const year = Number(match[1]);

  if (!isSupportedAstrologyCalendarYear(year)) {
    notFound();
  }

  const dataset = await buildAstrologyCalendarDataset(year);

  return Response.json(dataset, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
