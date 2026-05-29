/**
 * @jest-environment jsdom
 *
 * VITAL OP #11 - Activation: StreakBanner come-back-tomorrow hook (#274).
 *
 * The activation work added a "next milestone" line to the StreakBanner
 * (src/components/StreakBanner.tsx) so the daily check-in becomes something to
 * protect. The line is derived purely from the already-fetched streak (no extra
 * request) via getNextMilestone / getDaysUntilNextMilestone, and the whole
 * banner renders nothing at streak 0 (or before data loads).
 *
 * This file pins:
 *   1. The pure milestone derivation across the real STREAK_MILESTONES ladder.
 *   2. The exact come-back-tomorrow copy (1 day vs N days, and at-max -> none).
 *   3. The component renders null at streak 0 and renders the milestone line
 *      only when showNextMilestone is set. fetch is mocked.
 *
 * No network, no DB.
 */
import { render, screen, waitFor } from '@testing-library/react';
import {
  STREAK_MILESTONES,
  getNextMilestone,
  getDaysUntilNextMilestone,
} from '@/lib/notifications/streak-notifications';
import { StreakBanner } from '@/components/StreakBanner';

/**
 * Mirror of the StreakBanner milestoneHook derivation so the copy contract is
 * pinned independently of rendering. Source: src/components/StreakBanner.tsx.
 */
function milestoneHook(currentStreak: number, showNextMilestone: boolean) {
  const nextMilestone = getNextMilestone(currentStreak);
  const daysToNextMilestone = getDaysUntilNextMilestone(currentStreak);
  return showNextMilestone &&
    nextMilestone !== null &&
    daysToNextMilestone !== null
    ? daysToNextMilestone === 1
      ? `Check in tomorrow to reach your ${nextMilestone}-day milestone.`
      : `${daysToNextMilestone} more days to your ${nextMilestone}-day milestone.`
    : null;
}

describe('VITAL #11 next-milestone derivation (pure)', () => {
  it('picks the first ladder rung strictly greater than the current streak', () => {
    expect(getNextMilestone(1)).toBe(7);
    expect(getNextMilestone(7)).toBe(14); // exactly on a rung -> next one
    expect(getNextMilestone(8)).toBe(14);
    expect(getNextMilestone(30)).toBe(50);
  });

  it('returns null once the streak is at or past the final milestone', () => {
    const max = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
    expect(getNextMilestone(max)).toBeNull();
    expect(getNextMilestone(max + 10)).toBeNull();
  });

  it('days-until is the gap to the next rung, null at max', () => {
    expect(getDaysUntilNextMilestone(1)).toBe(6); // 7 - 1
    expect(getDaysUntilNextMilestone(6)).toBe(1); // 7 - 6 -> "tomorrow"
    expect(getDaysUntilNextMilestone(13)).toBe(1); // 14 - 13
    const max = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
    expect(getDaysUntilNextMilestone(max)).toBeNull();
  });
});

describe('VITAL #11 come-back-tomorrow copy', () => {
  it('says "tomorrow" when exactly one day from the next milestone', () => {
    expect(milestoneHook(6, true)).toBe(
      'Check in tomorrow to reach your 7-day milestone.',
    );
  });

  it('counts down the remaining days when more than one', () => {
    expect(milestoneHook(1, true)).toBe('6 more days to your 7-day milestone.');
  });

  it('is null when showNextMilestone is off', () => {
    expect(milestoneHook(6, false)).toBeNull();
  });

  it('is null at the final milestone (nothing left to chase)', () => {
    const max = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
    expect(milestoneHook(max, true)).toBeNull();
  });
});

describe('VITAL #11 StreakBanner renders nothing at streak 0', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders null when the API reports a zero streak', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        streak: { current: 0, longest: 0, lastCheckIn: null },
      }),
    });

    const { container } = render(
      <StreakBanner location='horoscope' showNextMilestone />,
    );

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());
    // Streak 0 -> the whole banner is null.
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/day streak/i)).not.toBeInTheDocument();
  });

  it('renders null when the streak fetch fails (no crash, no empty banner)', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });

    const { container } = render(
      <StreakBanner location='horoscope' showNextMilestone />,
    );

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});

describe('VITAL #11 StreakBanner surfaces the milestone line for an active streak', () => {
  beforeEach(() => jest.clearAllMocks());

  // Checked in TODAY -> not at risk, so the milestone (gain) line shows rather
  // than the at-risk (loss) line. Computed dynamically so the test is stable on
  // any run date.
  const todayISO = new Date().toISOString().split('T')[0];

  it('shows the streak count and the next-milestone hook when enabled', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        streak: { current: 6, longest: 6, lastCheckIn: todayISO },
      }),
    });

    render(<StreakBanner location='horoscope' showNextMilestone />);

    // 6-day streak -> one day from the 7-day milestone.
    expect(await screen.findByText('6')).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Check in tomorrow to reach your 7-day milestone.',
      ),
    ).toBeInTheDocument();
  });

  it('omits the milestone hook when showNextMilestone is not set', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        streak: { current: 6, longest: 6, lastCheckIn: todayISO },
      }),
    });

    render(<StreakBanner location='horoscope' />);

    expect(await screen.findByText('6')).toBeInTheDocument();
    expect(screen.queryByText(/milestone\./i)).not.toBeInTheDocument();
  });
});
