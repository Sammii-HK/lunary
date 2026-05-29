/**
 * @jest-environment jsdom
 *
 * TrialValueReveal — the one-time, dismissible, inline value-narration card
 * shown on the first personalised horoscope or tarot view during an active
 * trial (src/components/TrialValueReveal.tsx).
 *
 * Pins the three things that make it safe and measurable:
 *   1. Show-once: renders on the first eligible view, persists a shared
 *      localStorage flag, and never renders again (same surface or the other
 *      one). Dismiss also persists the flag and hides the card.
 *   2. Eligibility gate: nothing renders without an active trial AND birth data.
 *   3. Instrumentation: `personalized_value_revealed` fires exactly once on the
 *      first display (not on re-mounts, not when already seen), and the CTA
 *      fires `trackCtaClick`. On native iOS the web checkout CTA is suppressed.
 *
 * No network, no DB.
 */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TrialValueReveal } from '@/components/TrialValueReveal';

const mockSubscription = jest.fn();
const mockUser = jest.fn();
const mockIsNativeIOS = jest.fn();
const mockPersonalizedValueRevealed = jest.fn();
const mockTrackCtaClick = jest.fn();

jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => mockSubscription(),
}));

jest.mock('@/context/UserContext', () => ({
  useUser: () => mockUser(),
}));

jest.mock('@/hooks/useNativePlatform', () => ({
  useIsNativeIOS: () => mockIsNativeIOS(),
}));

jest.mock('@/lib/demo-mode', () => ({
  isInDemoMode: () => false,
}));

jest.mock('@/lib/analytics', () => ({
  conversionTracking: {
    personalizedValueRevealed: (...args: unknown[]) =>
      mockPersonalizedValueRevealed(...args),
  },
  trackCtaClick: (...args: unknown[]) => mockTrackCtaClick(...args),
}));

const SEEN_KEY = 'lunary.trialValueRevealSeen';

function setActiveTrial(daysRemaining = 5) {
  mockSubscription.mockReturnValue({
    isTrialActive: true,
    trialDaysRemaining: daysRemaining,
  });
  mockUser.mockReturnValue({
    user: { id: 'user-123', birthday: '1990-06-01' },
  });
  mockIsNativeIOS.mockReturnValue(false);
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  setActiveTrial();
});

afterEach(() => {
  cleanup();
});

describe('TrialValueReveal eligibility gate', () => {
  it('renders nothing when the trial is not active', () => {
    mockSubscription.mockReturnValue({
      isTrialActive: false,
      trialDaysRemaining: 0,
    });
    const { container } = render(<TrialValueReveal surface='horoscope' />);
    expect(container).toBeEmptyDOMElement();
    expect(mockPersonalizedValueRevealed).not.toHaveBeenCalled();
  });

  it('renders nothing when the user has no birth data', () => {
    mockUser.mockReturnValue({ user: { id: 'user-123' } });
    const { container } = render(<TrialValueReveal surface='horoscope' />);
    expect(container).toBeEmptyDOMElement();
    expect(mockPersonalizedValueRevealed).not.toHaveBeenCalled();
  });
});

describe('TrialValueReveal first display + instrumentation', () => {
  it('shows the generic-vs-personalised contrast and the days-left copy', () => {
    render(<TrialValueReveal surface='horoscope' />);
    expect(screen.getByTestId('trial-value-reveal')).toBeInTheDocument();
    expect(
      screen.getByText(/This reading is mapped to your chart/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/generic Sun-sign reading/i)).toBeInTheDocument();
    expect(screen.getByText(/5 days left in your trial/i)).toBeInTheDocument();
  });

  it('fires personalized_value_revealed exactly once on first display', () => {
    render(<TrialValueReveal surface='horoscope' />);
    expect(mockPersonalizedValueRevealed).toHaveBeenCalledTimes(1);
    expect(mockPersonalizedValueRevealed).toHaveBeenCalledWith(
      'user-123',
      'horoscope',
      5,
    );
  });

  it('persists the shared one-time flag on first display', () => {
    render(<TrialValueReveal surface='horoscope' />);
    expect(window.localStorage.getItem(SEEN_KEY)).toBe('1');
  });

  it('uses singular day copy when one day remains', () => {
    setActiveTrial(1);
    render(<TrialValueReveal surface='tarot' />);
    expect(screen.getByText(/1 day left in your trial/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/1 days left in your trial/i),
    ).not.toBeInTheDocument();
  });
});

describe('TrialValueReveal show-once across surfaces', () => {
  it('renders nothing when the flag is already set (seen on the other surface)', () => {
    window.localStorage.setItem(SEEN_KEY, '1');
    const { container } = render(<TrialValueReveal surface='tarot' />);
    expect(container).toBeEmptyDOMElement();
    expect(mockPersonalizedValueRevealed).not.toHaveBeenCalled();
  });

  it('does not re-show or re-fire on a later horoscope view after a tarot view', () => {
    // First view on tarot: shows + fires + persists.
    const first = render(<TrialValueReveal surface='tarot' />);
    expect(first.getByTestId('trial-value-reveal')).toBeInTheDocument();
    expect(mockPersonalizedValueRevealed).toHaveBeenCalledTimes(1);
    first.unmount();

    // Later view on horoscope: flag is set, so nothing renders and no new event.
    const second = render(<TrialValueReveal surface='horoscope' />);
    expect(second.container).toBeEmptyDOMElement();
    expect(mockPersonalizedValueRevealed).toHaveBeenCalledTimes(1);
  });
});

describe('TrialValueReveal dismissal', () => {
  it('hides the card, persists the flag, and stays hidden on remount', () => {
    const { unmount } = render(<TrialValueReveal surface='horoscope' />);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByTestId('trial-value-reveal')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(SEEN_KEY)).toBe('1');
    unmount();

    const { container } = render(<TrialValueReveal surface='horoscope' />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('TrialValueReveal CTA + iOS gating', () => {
  it('fires trackCtaClick with the trial_value_reveal id on web CTA click', () => {
    render(<TrialValueReveal surface='horoscope' />);
    fireEvent.click(screen.getByText(/Keep personalised readings/i));
    expect(mockTrackCtaClick).toHaveBeenCalledTimes(1);
    expect(mockTrackCtaClick).toHaveBeenCalledWith(
      expect.objectContaining({
        ctaId: 'trial_value_reveal',
        location: 'horoscope',
        href: '/pricing?nav=app',
      }),
    );
  });

  it('suppresses the web checkout CTA on native iOS but still shows the card', () => {
    mockIsNativeIOS.mockReturnValue(true);
    render(<TrialValueReveal surface='tarot' />);
    expect(screen.getByTestId('trial-value-reveal')).toBeInTheDocument();
    expect(
      screen.queryByText(/Keep personalised readings/i),
    ).not.toBeInTheDocument();
    // The value moment is still measured on iOS.
    expect(mockPersonalizedValueRevealed).toHaveBeenCalledTimes(1);
  });
});
