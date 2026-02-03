import { render, screen, fireEvent } from '@testing-library/react';

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = '/grimoire/zodiac/aries';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

// Mock useAuthStatus
const mockUseAuthStatus = jest.fn();

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => mockUseAuthStatus(),
}));

// Mock useModal
jest.mock('@/hooks/useModal', () => ({
  useModal: jest.fn(),
}));

// Mock analytics
const mockTrackCtaClick = jest.fn();
const mockTrackCtaImpression = jest.fn();

jest.mock('@/lib/analytics', () => ({
  trackCtaClick: (...args: unknown[]) => mockTrackCtaClick(...args),
  trackCtaImpression: (...args: unknown[]) => mockTrackCtaImpression(...args),
}));

// Mock AuthComponent
jest.mock('@/components/Auth', () => ({
  AuthComponent: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid='auth-component'>
      <button onClick={onSuccess}>Mock Sign In</button>
    </div>
  ),
}));

// Import after mocks
import { InlineContextualNudge } from '@/components/grimoire/InlineContextualNudge';
import type { ContextualNudge } from '@/lib/grimoire/getContextualNudge';

const mockNudge: ContextualNudge = {
  headline: 'Unlock your personalized insights',
  subline: 'See how Aries energy shows up in your chart',
  buttonLabel: 'View Your Chart',
  inlineCopy: 'See where Aries shows up in your chart',
  href: '/app/chart',
  action: 'authOrLink',
  hub: 'zodiac',
  exampleType: 'zodiac_sign',
  exampleText: 'Aries',
  ctaVariant: 'personalized',
  ctaHeadline: 'Your Aries Placements',
  ctaSubline: 'Discover your chart',
};

describe('InlineContextualNudge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStatus.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  });

  describe('Variant Rendering', () => {
    it('renders nothing for control variant', () => {
      const { container } = render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='control' />,
      );

      // Control should render nothing visible (no buttons, no text)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(container.textContent).toBe('');
    });

    it('renders minimal variant as underlined text link', () => {
      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='minimal' />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(
        'See where Aries shows up in your chart',
      );
      expect(button).toHaveClass('underline');
    });

    it('renders sparkles variant with icon and chevron', () => {
      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='sparkles' />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(
        'See where Aries shows up in your chart',
      );

      // Check for flex layout with icons
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
    });

    it('renders card variant with background styling', () => {
      render(<InlineContextualNudge nudge={mockNudge} serverVariant='card' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(
        'See where Aries shows up in your chart',
      );

      // Card variant has background and border
      expect(button).toHaveClass('rounded-lg');
      expect(button).toHaveClass('border');
    });

    it('defaults to sparkles when no serverVariant provided', () => {
      render(<InlineContextualNudge nudge={mockNudge} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks impression on mount with variant info', () => {
      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='sparkles' />,
      );

      expect(mockTrackCtaImpression).toHaveBeenCalledTimes(1);
      expect(mockTrackCtaImpression).toHaveBeenCalledWith(
        expect.objectContaining({
          hub: 'zodiac',
          ctaId: 'inline_contextual_nudge',
          location: 'seo_inline_post_tldr',
          label: 'See where Aries shows up in your chart',
          href: '/app/chart',
          abTest: 'inline_cta',
          abVariant: 'sparkles',
          inlineStyle: 'sparkles',
        }),
      );
    });

    it('tracks impression even for control variant', () => {
      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='control' />,
      );

      expect(mockTrackCtaImpression).toHaveBeenCalledTimes(1);
      expect(mockTrackCtaImpression).toHaveBeenCalledWith(
        expect.objectContaining({
          abVariant: 'control',
          inlineStyle: 'control',
        }),
      );
    });

    it('tracks click with variant info', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        user: { id: '123' },
        loading: false,
      });

      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='minimal' />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockTrackCtaClick).toHaveBeenCalledWith(
        expect.objectContaining({
          hub: 'zodiac',
          ctaId: 'inline_contextual_nudge',
          abTest: 'inline_cta',
          abVariant: 'minimal',
          inlineStyle: 'minimal',
        }),
      );
    });

    it('uses custom location when provided', () => {
      render(
        <InlineContextualNudge
          nudge={mockNudge}
          location='custom_location'
          serverVariant='sparkles'
        />,
      );

      expect(mockTrackCtaImpression).toHaveBeenCalledWith(
        expect.objectContaining({
          location: 'custom_location',
        }),
      );
    });
  });

  describe('Click Behavior', () => {
    it('navigates directly when authenticated', () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: true,
        user: { id: '123' },
        loading: false,
      });

      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='sparkles' />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/app/chart');
    });

    it('shows auth modal when not authenticated', async () => {
      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
      });

      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='sparkles' />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should not navigate immediately
      expect(mockPush).not.toHaveBeenCalled();

      // Auth modal should appear
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });

    it('navigates directly for link action regardless of auth', () => {
      const linkNudge: ContextualNudge = {
        ...mockNudge,
        action: 'link',
      };

      mockUseAuthStatus.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
      });

      render(
        <InlineContextualNudge nudge={linkNudge} serverVariant='sparkles' />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/app/chart');
    });
  });

  describe('Copy Fallback', () => {
    it('uses inlineCopy when available', () => {
      render(
        <InlineContextualNudge nudge={mockNudge} serverVariant='sparkles' />,
      );

      expect(
        screen.getByText('See where Aries shows up in your chart'),
      ).toBeInTheDocument();
    });

    it('falls back to headline when no inlineCopy', () => {
      const nudgeWithoutInlineCopy: ContextualNudge = {
        ...mockNudge,
        inlineCopy: undefined,
      };

      render(
        <InlineContextualNudge
          nudge={nudgeWithoutInlineCopy}
          serverVariant='sparkles'
        />,
      );

      expect(
        screen.getByText('Unlock your personalized insights'),
      ).toBeInTheDocument();
    });
  });
});
