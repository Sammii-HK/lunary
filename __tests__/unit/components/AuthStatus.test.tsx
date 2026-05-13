import { render, screen, waitFor } from '@testing-library/react';
import {
  AuthStatusProvider,
  clearRecentAuthHandoff,
  hasRecentAuthHandoff,
  invalidateAuthCache,
  markRecentAuthHandoff,
  useAuthStatus,
} from '@/components/AuthStatus';
import { betterAuthClient } from '@/lib/auth-client';

jest.mock('@/lib/auth-client', () => ({
  betterAuthClient: {
    getSession: jest.fn(),
  },
}));

function AuthProbe() {
  const auth = useAuthStatus();

  return (
    <div data-testid='auth-status'>
      {auth.loading
        ? 'loading'
        : auth.isAuthenticated
          ? auth.user?.email || 'authenticated'
          : 'guest'}
    </div>
  );
}

describe('AuthStatus handoff handling', () => {
  const getSessionMock = betterAuthClient.getSession as jest.Mock;

  beforeEach(() => {
    invalidateAuthCache();
    clearRecentAuthHandoff();
    window.sessionStorage.clear();
    getSessionMock.mockReset();
  });

  it('stores and clears the recent auth handoff marker', () => {
    expect(hasRecentAuthHandoff()).toBe(false);

    markRecentAuthHandoff();

    expect(hasRecentAuthHandoff()).toBe(true);

    clearRecentAuthHandoff();

    expect(hasRecentAuthHandoff()).toBe(false);
  });

  it('keeps retrying after a recent auth handoff until session becomes visible', async () => {
    getSessionMock
      .mockResolvedValueOnce({ data: { user: null } })
      .mockResolvedValueOnce({ data: { user: null } })
      .mockResolvedValueOnce({ data: { user: null } })
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: 'sammii@example.com',
            name: 'Sammii',
          },
        },
      });

    markRecentAuthHandoff();

    render(
      <AuthStatusProvider>
        <AuthProbe />
      </AuthStatusProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'sammii@example.com',
        );
      },
      { timeout: 5000 },
    );

    expect(getSessionMock).toHaveBeenCalledTimes(4);
    expect(hasRecentAuthHandoff()).toBe(false);
  });
});
