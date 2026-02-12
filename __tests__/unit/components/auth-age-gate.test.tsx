import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSignUp = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@/lib/auth-client', () => ({
  betterAuthClient: {
    signUp: { email: (...args: unknown[]) => mockSignUp(...args) },
    signIn: { email: (...args: unknown[]) => mockSignIn(...args) },
  },
}));

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    refreshAuth: jest.fn(),
  }),
  invalidateAuthCache: jest.fn(),
}));

jest.mock('@/components/SignOutButton', () => ({
  SignOutButton: () => null,
}));

jest.mock('@/lib/analytics', () => ({
  conversionTracking: {
    signup: jest.fn(),
  },
}));

jest.mock('@/lib/attribution', () => ({
  getStoredAttribution: () => null,
  getAttributionForTracking: () => ({}),
}));

jest.mock('@/lib/posthog-client', () => ({
  captureEvent: jest.fn(),
}));

import { AuthComponent } from '@/components/Auth';

const setNavigatorLanguage = (language: string) => {
  Object.defineProperty(navigator, 'language', {
    value: language,
    configurable: true,
  });
};

/** Clear and type into a field to avoid stale cached form data accumulating */
async function clearAndType(element: HTMLElement, text: string): Promise<void> {
  await userEvent.clear(element);
  await userEvent.type(element, text);
}

describe('Auth age gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setNavigatorLanguage('en-US');
  });

  it('shows birthday field on signup form', () => {
    render(<AuthComponent defaultToSignUp />);

    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(
      screen.getByText('Used to create your birth chart'),
    ).toBeInTheDocument();
  });

  it('does not show birthday field on sign-in form', () => {
    render(<AuthComponent />);

    expect(screen.queryByText('Birthday')).not.toBeInTheDocument();
  });

  it('shows error when birthday is missing on signup', async () => {
    render(<AuthComponent defaultToSignUp />);

    await clearAndType(
      screen.getByPlaceholderText('Enter your name'),
      'Test User',
    );
    await clearAndType(
      screen.getByPlaceholderText('Enter your email'),
      'test@example.com',
    );
    await clearAndType(
      screen.getByPlaceholderText('Enter your password'),
      'password123',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(
        screen.getByText('Date of birth is required to create your account.'),
      ).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error when user is under 16', async () => {
    render(<AuthComponent defaultToSignUp />);

    await clearAndType(
      screen.getByPlaceholderText('Enter your name'),
      'Test User',
    );
    await clearAndType(
      screen.getByPlaceholderText('Enter your email'),
      'test@example.com',
    );
    await clearAndType(
      screen.getByPlaceholderText('Enter your password'),
      'password123',
    );

    // Enter a birthday that makes the user 14 (MM/DD/YYYY for en-US)
    const now = new Date();
    const birthYear = now.getFullYear() - 14;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    await clearAndType(
      screen.getByPlaceholderText('MM/DD/YYYY'),
      `${month}${day}${birthYear}`,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(
        screen.getByText('You must be at least 16 years old to use Lunary.'),
      ).toBeInTheDocument();
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('allows signup when user is 16 or older', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'test@example.com' },
      },
      error: null,
    });

    render(<AuthComponent defaultToSignUp />);

    await clearAndType(
      screen.getByPlaceholderText('Enter your name'),
      'Test User',
    );
    await clearAndType(
      screen.getByPlaceholderText('Enter your email'),
      'test@example.com',
    );
    await clearAndType(
      screen.getByPlaceholderText('Enter your password'),
      'password123',
    );

    // Enter a birthday making the user 30+
    await clearAndType(screen.getByPlaceholderText('MM/DD/YYYY'), '01011990');

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });
});
