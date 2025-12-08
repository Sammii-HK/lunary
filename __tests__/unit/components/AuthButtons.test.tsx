import { render, screen } from '@testing-library/react';

// Mock the useAuthStatus hook directly
const mockUseAuthStatus = jest.fn();

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => mockUseAuthStatus(),
}));

// Mock SignOutButton to avoid auth-client import issues
jest.mock('@/components/SignOutButton', () => ({
  SignOutButton: ({ variant }: { variant?: string }) => (
    <button data-testid='sign-out-button'>Sign Out</button>
  ),
}));

// Import after mocks
import { AuthButtons } from '@/components/AuthButtons';

describe('AuthButtons Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    render(<AuthButtons />);

    // Should show loading skeleton
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render sign in button when not authenticated', () => {
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(<AuthButtons />);

    // Component shows "Start Free Trial" when not authenticated
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('should handle authenticated state', () => {
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: true,
      user: { id: '123', email: 'test@example.com', name: 'Test User' },
      loading: false,
    });

    render(<AuthButtons />);

    // Component shows "Welcome back, {name}!"
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  it('should render navbar variant when authenticated', () => {
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: true,
      user: { id: '123', email: 'test@example.com', name: 'Test User' },
      loading: false,
    });

    render(<AuthButtons variant='navbar' />);

    // Navbar variant shows wave emoji and name
    expect(screen.getByText(/👋 Test User/)).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should render navbar variant when not authenticated', () => {
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(<AuthButtons variant='navbar' />);

    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });
});
