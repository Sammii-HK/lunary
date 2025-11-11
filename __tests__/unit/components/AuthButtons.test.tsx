import { render, screen, waitFor } from '@testing-library/react';
import { AuthButtons } from '@/components/AuthButtons';

const mockGetSession = jest.fn(() => Promise.resolve({ user: null }));
const mockSignOut = jest.fn(() => Promise.resolve());
const mockUseAccount = jest.fn(() => ({ me: null }));

jest.mock('@/lib/auth-client', () => ({
  betterAuthClient: {
    getSession: (...args: any[]) => mockGetSession(...args),
    signOut: (...args: any[]) => mockSignOut(...args),
  },
}));

jest.mock('jazz-tools/react', () => ({
  useAccount: (...args: any[]) => mockUseAccount(...args),
}));

describe('AuthButtons Component', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ user: null });
    mockUseAccount.mockReturnValue({ me: null });
  });

  it('should render sign in button when not authenticated', async () => {
    render(<AuthButtons />);

    await waitFor(
      () => {
        const signInButton =
          screen.queryByText(/sign in/i) ||
          screen.queryByText(/create profile/i) ||
          screen.queryByText(/start free trial/i);
        expect(signInButton).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('should handle authenticated state', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '123', email: 'test@example.com', name: 'Test User' },
    });
    mockUseAccount.mockReturnValue({ me: { profile: { name: 'Test User' } } });

    render(<AuthButtons />);

    await waitFor(
      () => {
        const welcomeText = screen.queryByText(/welcome back/i);
        expect(welcomeText).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
