import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/(authenticated)/profile/page';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const DynamicComponent = () => null;
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  },
}));

const mockUser = {
  id: 'user-1',
  name: '',
  birthday: '',
  hasBirthChart: false,
  location: { birthLocation: 'Seed City' },
};

jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: mockUser,
    updateProfile: jest.fn(),
    refetch: jest.fn(),
  }),
}));

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => ({
    isAuthenticated: true,
    loading: false,
    user: { id: 'user-1', name: 'Test User' },
    profile: null,
  }),
}));

jest.mock('@/lib/auth-client', () => ({
  betterAuthClient: {
    getSession: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('@/lib/analytics', () => ({
  conversionTracking: {
    birthDataSubmitted: jest.fn(),
    upgradeClicked: jest.fn(),
  },
}));

jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    status: 'trial',
    plan: 'lunary_plus',
    isSubscribed: true,
    isTrialActive: false,
  }),
}));

describe('Profile location suggestions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/location/suggest')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  label: 'Bend, Oregon, United States',
                  latitude: 44.0582,
                  longitude: -121.3153,
                },
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }
      if (url.includes('/api/location/geocode')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ latitude: 44.0582, longitude: -121.3153 }),
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

  it('shows suggestions and updates input value', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProfilePage />);

    const input = await screen.findByPlaceholderText(
      'e.g., London, UK or 51.4769, 0.0005',
    );

    await waitFor(() => {
      expect(input).toHaveValue('Seed City');
    });

    await user.clear(input);
    await user.type(input, 'Bend');

    await act(async () => {
      jest.advanceTimersByTime(450);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/location/suggest'),
        expect.anything(),
      );
    });

    const suggestion = await screen.findByText('Bend, Oregon, United States');
    await user.click(suggestion);

    await waitFor(() => {
      expect(input).toHaveValue('Bend, Oregon, United States');
    });
  });
});
