import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '@/components/OnboardingFlow';

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

describe('OnboardingFlow birthday pre-fill', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('shows "When Were You Born?" when user has no birthday', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', birthday: '' },
      refetch: jest.fn(),
      loading: false,
    });

    render(<OnboardingFlow forceOpen previewMode previewStep='birthday' />);

    expect(screen.getByText('When Were You Born?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your birthday lets us calculate your birth chart and personalise your daily guidance.',
      ),
    ).toBeInTheDocument();
  });

  it('shows "Refine Your Birth Chart" when user already has a birthday', async () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', birthday: '1993-09-06' },
      refetch: jest.fn(),
      loading: false,
    });

    // Cannot use previewMode here because hasBirthdayFromSignup requires !previewMode
    render(<OnboardingFlow forceOpen />);

    // Navigate from welcome to birthday step
    const getStarted = screen.getByRole('button', { name: 'Get Started' });
    await userEvent.click(getStarted);

    expect(screen.getByText('Refine Your Birth Chart')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add your birth time and location for a more accurate chart.',
      ),
    ).toBeInTheDocument();
  });

  it('auto-expands time and location when user has a birthday from signup', async () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', birthday: '1993-09-06' },
      refetch: jest.fn(),
      loading: false,
    });

    render(<OnboardingFlow forceOpen />);

    // Navigate from welcome to birthday step
    const getStarted = screen.getByRole('button', { name: 'Get Started' });
    await userEvent.click(getStarted);

    // The optional details section should be auto-expanded when birthday exists
    expect(screen.getByText('Birth Time (optional)')).toBeInTheDocument();
    expect(screen.getByText('Birth Location (optional)')).toBeInTheDocument();
  });
});
