/**
 * Tests for Friend Profile Page - ChartTab component
 * Tests the birth chart wheel rendering and placements list toggle
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-friend-id' }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock UserContext
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  }),
}));

// Mock BirthChart component
jest.mock('@/components/BirthChart', () => ({
  BirthChart: ({
    birthChart,
    userName,
  }: {
    birthChart: any[];
    userName: string;
  }) => (
    <div data-testid='birth-chart-wheel'>
      <span>Birth Chart for {userName}</span>
      <span>Planets: {birthChart.length}</span>
    </div>
  ),
}));

// Mock ShareSynastry component
jest.mock('@/components/share/ShareSynastry', () => ({
  ShareSynastry: () => <button data-testid='share-synastry'>Share</button>,
}));

// Sample birth chart data matching BirthChartData type
const mockBirthChart = [
  {
    body: 'Sun',
    sign: 'Aries',
    degree: 15,
    minute: 30,
    retrograde: false,
    house: 1,
    eclipticLongitude: 15.5,
  },
  {
    body: 'Moon',
    sign: 'Cancer',
    degree: 22,
    minute: 45,
    retrograde: false,
    house: 4,
    eclipticLongitude: 112.75,
  },
  {
    body: 'Ascendant',
    sign: 'Leo',
    degree: 5,
    minute: 10,
    retrograde: false,
    house: 1,
    eclipticLongitude: 125.17,
  },
  {
    body: 'Mercury',
    sign: 'Pisces',
    degree: 28,
    minute: 15,
    retrograde: true,
    house: 8,
    eclipticLongitude: 358.25,
  },
  {
    body: 'Venus',
    sign: 'Taurus',
    degree: 10,
    minute: 0,
    retrograde: false,
    house: 10,
    eclipticLongitude: 40.0,
  },
  {
    body: 'Mars',
    sign: 'Scorpio',
    degree: 18,
    minute: 30,
    retrograde: false,
    house: 4,
    eclipticLongitude: 228.5,
  },
  {
    body: 'Jupiter',
    sign: 'Sagittarius',
    degree: 5,
    minute: 20,
    retrograde: false,
    house: 5,
    eclipticLongitude: 245.33,
  },
  {
    body: 'Saturn',
    sign: 'Capricorn',
    degree: 12,
    minute: 45,
    retrograde: true,
    house: 6,
    eclipticLongitude: 282.75,
  },
];

const mockFriendData = {
  id: 'connection-123',
  friendId: 'friend-456',
  name: 'Jane Doe',
  avatar: null,
  sunSign: 'Aries',
  relationshipType: 'friend',
  hasBirthChart: true,
  birthChart: mockBirthChart,
  synastry: {
    compatibilityScore: 78,
    summary: 'A harmonious connection with room for growth',
    aspects: [
      {
        person1Planet: 'Sun',
        person2Planet: 'Moon',
        aspectType: 'trine',
        orb: 2.5,
        isHarmonious: true,
      },
    ],
    elementBalance: {
      fire: { person1: 3, person2: 2, combined: 5 },
      earth: { person1: 2, person2: 3, combined: 5 },
      air: { person1: 2, person2: 2, combined: 4 },
      water: { person1: 3, person2: 3, combined: 6 },
      compatibility: 'balanced',
    },
    modalityBalance: {
      cardinal: { person1: 3, person2: 2, combined: 5 },
      fixed: { person1: 3, person2: 4, combined: 7 },
      mutable: { person1: 4, person2: 4, combined: 8 },
      compatibility: 'complementary',
    },
  },
};

// Import the component after mocks
import FriendProfilePage from '@/app/(authenticated)/profile/friends/[id]/page';

describe('FriendProfilePage - ChartTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<FriendProfilePage />);

    expect(screen.getByText(/loading friend profile/i)).toBeInTheDocument();
  });

  it('renders friend profile after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('displays zodiac symbol with font-astro class next to friend name', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Find the zodiac symbol span with font-astro class
    const zodiacSymbolSpan = document.querySelector('.font-astro');
    expect(zodiacSymbolSpan).toBeInTheDocument();
  });

  it('shows Chart tab and can switch to it', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Find and click the Chart tab
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    // Should show the chart wheel by default
    await waitFor(() => {
      expect(screen.getByTestId('birth-chart-wheel')).toBeInTheDocument();
    });
  });

  it('shows Chart Wheel view by default in Chart tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Chart tab
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    // Check Chart Wheel button is active (has the active class styling)
    const chartWheelButton = screen.getByRole('button', {
      name: /chart wheel/i,
    });
    expect(chartWheelButton).toHaveClass('bg-lunary-primary-900/50');
  });

  it('can toggle between Chart Wheel and Placements List views', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Chart tab
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    // Should show birth chart wheel initially
    expect(screen.getByTestId('birth-chart-wheel')).toBeInTheDocument();

    // Click on Placements List
    const placementsListButton = screen.getByRole('button', {
      name: /placements list/i,
    });
    await user.click(placementsListButton);

    // Birth chart wheel should be hidden, placements should show
    expect(screen.queryByTestId('birth-chart-wheel')).not.toBeInTheDocument();
    expect(screen.getByText(/personal planets/i)).toBeInTheDocument();
  });

  it('displays placements with font-astro class for symbols', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Chart tab
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    // Switch to Placements List view
    const placementsListButton = screen.getByRole('button', {
      name: /placements list/i,
    });
    await user.click(placementsListButton);

    // Check that font-astro class is used for planet symbols
    const fontAstroElements = document.querySelectorAll('.font-astro');
    expect(fontAstroElements.length).toBeGreaterThan(0);
  });

  it('shows retrograde indicator for retrograde planets', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Chart tab and switch to list view
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    const placementsListButton = screen.getByRole('button', {
      name: /placements list/i,
    });
    await user.click(placementsListButton);

    // Mercury and Saturn are retrograde in our mock data
    // Look for brand red-colored retrograde indicators (using lunary-error-300)
    const retrogradeIndicators = document.querySelectorAll(
      '.text-lunary-error-300',
    );
    expect(retrogradeIndicators.length).toBeGreaterThan(0);
  });

  it('shows "Chart Not Available" when friend has no birth chart', async () => {
    const friendWithoutChart = {
      ...mockFriendData,
      hasBirthChart: false,
      birthChart: undefined,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(friendWithoutChart),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Chart tab
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    expect(screen.getByText(/chart not available/i)).toBeInTheDocument();
  });

  it('passes correct props to BirthChart component', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    const user = userEvent.setup();
    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Chart tab
    const chartTab = screen.getByRole('button', { name: /their chart/i });
    await user.click(chartTab);

    // Check that BirthChart received correct props via our mock
    expect(screen.getByText('Birth Chart for Jane Doe')).toBeInTheDocument();
    expect(
      screen.getByText(`Planets: ${mockBirthChart.length}`),
    ).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});

describe('FriendProfilePage - Overview Tab Key Placements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('displays key placements with font-astro symbols on overview tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFriendData),
    });

    render(<FriendProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Overview tab is shown by default
    expect(screen.getByText(/key placements/i)).toBeInTheDocument();

    // Check font-astro class is used
    const fontAstroElements = document.querySelectorAll('.font-astro');
    expect(fontAstroElements.length).toBeGreaterThan(0);
  });
});
