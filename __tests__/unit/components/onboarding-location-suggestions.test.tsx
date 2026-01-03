import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '@/components/OnboardingFlow';

jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: { id: 'user-1', birthday: '' },
    refetch: jest.fn(),
    loading: false,
  }),
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

describe('OnboardingFlow location suggestions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/location/suggest')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  label: 'Reims, Grand Est, France',
                  latitude: 49.2583,
                  longitude: 4.0317,
                },
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
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
    jest.useRealTimers();
    (global.fetch as jest.Mock).mockReset();
  });

  it('shows suggestions and allows selection', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<OnboardingFlow forceOpen previewMode previewStep='birthday' />);

    await user.click(
      screen.getByRole('button', {
        name: /Optional: add birth time & location for accuracy/i,
      }),
    );

    const input = screen.getByPlaceholderText('City, Country or coordinates');
    await user.type(input, 'Reims');

    await act(async () => {
      jest.advanceTimersByTime(450);
    });

    const suggestion = await screen.findByText('Reims, Grand Est, France');
    await user.click(suggestion);

    expect(input).toHaveValue('Reims, Grand Est, France');
  });
});
