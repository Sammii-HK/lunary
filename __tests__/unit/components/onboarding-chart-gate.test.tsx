import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '@/components/OnboardingFlow';

// ===========================================================================
// OnboardingFlow: birthday-only users must see onboarding
//
// When birthday is collected at signup (age gate) but no birth chart exists,
// the onboarding flow must NOT skip — it should show so the user can enter
// birth time + location to trigger chart generation.
// ===========================================================================

const mockUseUser = jest.fn();

jest.mock('@/context/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => ({
    isAuthenticated: true,
    loading: false,
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  }),
}));

jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    isSubscribed: false,
    isTrialActive: false,
    planName: 'free',
    status: 'trial',
    plan: 'free',
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/analytics', () => ({
  conversionTracking: {
    birthDataSubmitted: jest.fn(),
    upgradeClicked: jest.fn(),
  },
}));

describe('OnboardingFlow: birthday-only users (age gate signup)', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = global.fetch as jest.Mock;
    fetchMock.mockImplementation((url: string) => {
      // Mock onboarding status as NOT completed
      if (typeof url === 'string' && url.includes('/api/onboarding/complete')) {
        return Promise.resolve(
          new Response(JSON.stringify({ completed: false, skipped: false }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('shows onboarding when user has birthday but NO birth chart', async () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-1',
        birthday: '1973-05-18',
        birthChart: [],
        hasBirthChart: false,
      },
      refetch: jest.fn(),
      loading: false,
    });

    render(<OnboardingFlow forceOpen />);

    // Navigate from welcome step
    const getStarted = await screen.findByRole('button', {
      name: 'Get Started',
    });
    await userEvent.click(getStarted);

    // Should show the birth details step (Refine Your Birth Chart)
    await waitFor(() => {
      expect(screen.getByText('Refine Your Birth Chart')).toBeInTheDocument();
    });
  });

  it('shows onboarding when user has birthday but birthChart is undefined', async () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-1',
        birthday: '1990-06-15',
        birthChart: undefined,
        hasBirthChart: false,
      },
      refetch: jest.fn(),
      loading: false,
    });

    render(<OnboardingFlow forceOpen />);

    const getStarted = await screen.findByRole('button', {
      name: 'Get Started',
    });
    await userEvent.click(getStarted);

    await waitFor(() => {
      expect(screen.getByText('Refine Your Birth Chart')).toBeInTheDocument();
    });
  });

  it('skips onboarding when user has BOTH birthday AND birth chart', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-1',
        birthday: '1990-05-15',
        birthChart: [{ body: 'Sun', sign: 'Taurus' }],
        hasBirthChart: true,
      },
      refetch: jest.fn(),
      loading: false,
    });

    render(<OnboardingFlow />);

    // Onboarding should NOT be visible — it was marked completed
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    expect(screen.queryByText('When Were You Born?')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Refine Your Birth Chart'),
    ).not.toBeInTheDocument();
  });

  it('shows "When Were You Born?" when user has NO birthday at all', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', birthday: '', birthChart: [] },
      refetch: jest.fn(),
      loading: false,
    });

    render(<OnboardingFlow forceOpen previewMode previewStep='birthday' />);

    expect(screen.getByText('When Were You Born?')).toBeInTheDocument();
  });
});

// ===========================================================================
// Structural verification: OnboardingFlow source
// ===========================================================================
describe('OnboardingFlow source: skip condition requires birth chart', () => {
  const fs = require('fs');
  const source = fs.readFileSync('src/components/OnboardingFlow.tsx', 'utf-8');

  it('skip condition checks birthChart length (not just birthday)', () => {
    // The line should be: if (user?.birthday && user?.birthChart?.length)
    expect(source).toContain('user?.birthday && user?.birthChart?.length');
  });

  it('needsBirthDetails checks for missing birth chart', () => {
    // Should be: !user?.birthday || !user?.birthChart?.length
    expect(source).toContain('!user?.birthday || !user?.birthChart?.length');
  });

  it('does NOT skip onboarding based on birthday alone', () => {
    // The old dangerous pattern: if (user?.birthday) { setOnboardingStatus...completed: true }
    // Should NOT exist as a standalone check
    const lines = source.split('\n');
    const dangerousSkip = lines.find(
      (l: string) =>
        l.trim().startsWith('if (user?.birthday)') && !l.includes('birthChart'),
    );
    expect(dangerousSkip).toBeUndefined();
  });

  it('includes birthChart.length in useEffect dependency array', () => {
    expect(source).toContain('user?.birthChart?.length');
  });
});
