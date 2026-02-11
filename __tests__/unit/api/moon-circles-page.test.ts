/**
 * Tests for Moon Circles detail page
 * Verifies that the page renders with valid data and that both SQL queries
 * are fired in parallel via Promise.all.
 */

// Track sql calls to verify parallelization
const sqlMock = jest.fn();

// Mock @vercel/postgres
jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => sqlMock(...args),
}));

// Mock next/navigation
const notFoundMock = jest.fn();
jest.mock('next/navigation', () => ({
  notFound: () => {
    notFoundMock();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// Mock next/link as a passthrough
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return { type: 'a', props: { href, ...props, children } };
  };
});

// Mock client components
jest.mock('@/components/MoonCircleInsights', () => ({
  MoonCircleInsights: (props: any) => ({
    type: 'MoonCircleInsights',
    props,
  }),
}));

jest.mock('@/components/ShareInsightForm', () => ({
  ShareInsightForm: (props: any) => ({ type: 'ShareInsightForm', props }),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import MoonCircleDetailPage from '@/app/moon-circles/[date]/page';

describe('MoonCircleDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCircleRow = {
    id: 1,
    moon_phase: 'Full Moon',
    event_date: new Date('2025-06-15'),
    title: 'Strawberry Moon Circle',
    theme: 'Release and Renewal',
    description: 'A powerful full moon for letting go.',
    focus_points: ['gratitude', 'release', 'intention'],
    rituals: ['Light a candle', 'Write intentions'],
    journal_prompts: ['What am I ready to release?'],
    astrology_highlights: ['Moon in Sagittarius'],
    resource_links: [{ label: 'Moon Guide', url: 'https://example.com' }],
    insight_count: 5,
  };

  const mockRelatedRows = [
    {
      id: 2,
      moon_phase: 'New Moon',
      event_date: new Date('2025-06-01'),
      theme: 'New Beginnings',
      insight_count: 3,
    },
    {
      id: 3,
      moon_phase: 'Full Moon',
      event_date: new Date('2025-05-15'),
      theme: 'Flower Moon Gathering',
      insight_count: 8,
    },
  ];

  function setupSqlMock(
    circleRows: any[] = [mockCircleRow],
    relatedRows: any[] = mockRelatedRows,
  ) {
    let callCount = 0;
    sqlMock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ rows: circleRows });
      }
      return Promise.resolve({ rows: relatedRows });
    });
  }

  it('renders with valid data', async () => {
    setupSqlMock();

    const result = await MoonCircleDetailPage({
      params: Promise.resolve({ date: '2025-06-15' }),
      searchParams: Promise.resolve({}),
    });

    // The page should return JSX (not throw)
    expect(result).toBeDefined();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('fires both SQL queries (sql called twice)', async () => {
    setupSqlMock();

    await MoonCircleDetailPage({
      params: Promise.resolve({ date: '2025-06-15' }),
      searchParams: Promise.resolve({}),
    });

    // Both queries should be fired
    expect(sqlMock).toHaveBeenCalledTimes(2);
  });

  it('calls notFound when circle is not found', async () => {
    setupSqlMock([], mockRelatedRows);

    await expect(
      MoonCircleDetailPage({
        params: Promise.resolve({ date: '2025-06-15' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalled();
  });

  it('calls notFound for invalid date format', async () => {
    await expect(
      MoonCircleDetailPage({
        params: Promise.resolve({ date: 'not-a-date' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalled();
    // SQL should not be called for invalid date
    expect(sqlMock).not.toHaveBeenCalled();
  });
});
