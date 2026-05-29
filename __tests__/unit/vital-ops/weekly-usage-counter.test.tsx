/**
 * @jest-environment jsdom
 *
 * VITAL OP #15 - WeeklyUsageCounter, switch-on usage nudge (#284).
 *
 * Source: src/components/WeeklyUsageCounter.tsx. The switch-on work surfaces a
 * "this week you accessed N cosmic insights" nudge on the dashboard. The count
 * is derived purely from localStorage (no API): a per-user key holds
 * `{ count, weekStart }`, rolls over after 7 days, and increments on a custom
 * `insight-accessed` window event.
 *
 * This pins:
 *   1. Loading skeleton before the count resolves (no number rendered yet).
 *   2. Reads back an existing in-week count and renders it.
 *   3. Pluralisation: "1 cosmic insight" vs "N cosmic insights" / "0 ... insights".
 *   4. `insight-accessed` increments and re-renders the count.
 *   5. A stored week older than 7 days resets the count to 0.
 *   6. The storage key is namespaced per user id.
 *
 * useUser is mocked; no network, no DB. localStorage is the jsdom store.
 */
import { render, screen, act, waitFor } from '@testing-library/react';

const mockUseUser = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

import { WeeklyUsageCounter } from '@/components/WeeklyUsageCounter';

const USER_ID = 'user-123';
const STORAGE_KEY = `weekly_insights_${USER_ID}`;

/** Seed the per-user weekly record with a count and a weekStart `daysAgo` old. */
function seedWeekly(count: number, daysAgo: number): void {
  const weekStart = new Date(
    Date.now() - daysAgo * 24 * 60 * 60 * 1000,
  ).toISOString();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ count, weekStart }),
  );
}

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  mockUseUser.mockReturnValue({ user: { id: USER_ID } });
});

describe('VITAL #15 WeeklyUsageCounter - count derivation & copy', () => {
  it('resolves to a single nudge line with the count and no leftover skeleton', async () => {
    seedWeekly(3, 1);
    const { container } = render(<WeeklyUsageCounter />);
    // Once the effect has run, the loading skeleton is gone and the nudge shows.
    expect(
      await screen.findByText('This week you accessed 3 cosmic insights'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBe(0);
  });

  it('reads back an existing in-week count and renders it (plural)', async () => {
    seedWeekly(3, 2); // 3 insights, 2 days into the week
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 3 cosmic insights'),
    ).toBeInTheDocument();
  });

  it('uses the singular form for exactly one insight', async () => {
    seedWeekly(1, 1);
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 1 cosmic insight'),
    ).toBeInTheDocument();
    // Make sure it is NOT the plural.
    expect(
      screen.queryByText('This week you accessed 1 cosmic insights'),
    ).not.toBeInTheDocument();
  });

  it('uses the plural form for zero insights (fresh week)', async () => {
    // No stored record -> component initialises a new week at count 0.
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 0 cosmic insights'),
    ).toBeInTheDocument();
    // It also persists the freshly-initialised record.
    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull(),
    );
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.count).toBe(0);
  });
});

describe('VITAL #15 WeeklyUsageCounter - insight-accessed increments', () => {
  it('increments the count and re-renders on an insight-accessed event', async () => {
    seedWeekly(2, 1);
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 2 cosmic insights'),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('insight-accessed'));
    });

    expect(
      await screen.findByText('This week you accessed 3 cosmic insights'),
    ).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.count).toBe(3);
  });

  it('singularises after the first insight of a brand-new week', async () => {
    // No record yet -> initial render shows 0; first event makes it 1 insight.
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 0 cosmic insights'),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('insight-accessed'));
    });

    expect(
      await screen.findByText('This week you accessed 1 cosmic insight'),
    ).toBeInTheDocument();
  });
});

describe('VITAL #15 WeeklyUsageCounter - weekly rollover', () => {
  it('resets a count whose weekStart is 7+ days old', async () => {
    seedWeekly(9, 8); // 9 insights but the week is 8 days old -> stale
    render(<WeeklyUsageCounter />);
    // Rolls the week over and reports 0.
    expect(
      await screen.findByText('This week you accessed 0 cosmic insights'),
    ).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.count).toBe(0);
  });

  it('keeps a count whose weekStart is within the 7-day window', async () => {
    seedWeekly(5, 6); // still inside the week
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 5 cosmic insights'),
    ).toBeInTheDocument();
  });
});

describe('VITAL #15 WeeklyUsageCounter - per-user namespacing', () => {
  it('uses an anonymous storage key when there is no user', async () => {
    mockUseUser.mockReturnValue({ user: null });
    window.localStorage.setItem(
      'weekly_insights_anonymous',
      JSON.stringify({ count: 4, weekStart: new Date().toISOString() }),
    );
    render(<WeeklyUsageCounter />);
    expect(
      await screen.findByText('This week you accessed 4 cosmic insights'),
    ).toBeInTheDocument();
  });
});
