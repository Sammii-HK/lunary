import { render, screen } from '@testing-library/react';
import { TransitScrubber } from '@/components/charts/TransitScrubber';
import type { BirthChartData } from 'utils/astrology/birthChart';

const mockHasAccess = jest.fn();

jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    hasAccess: mockHasAccess,
  }),
}));

jest.mock('@/components/charts/CosmicBackdrop', () => ({
  CosmicBackdrop: () => <g data-testid='cosmic-backdrop' />,
}));

jest.mock('@/components/charts/ExactHitStrip', () => ({
  ExactHitStrip: () => <div data-testid='exact-hit-strip' />,
}));

jest.mock('@/components/charts/ProgressedRing', () => ({
  ProgressedRing: () => <g data-testid='progressed-ring' />,
}));

jest.mock('@/components/charts/PlanetBottomSheet', () => ({
  PlanetBottomSheet: () => null,
}));

jest.mock('@/components/charts/useEphemerisRange', () => {
  const TRANSIT_BODIES = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];

  const snapshot = (time: number) => ({
    time,
    longitudes: Object.fromEntries(
      TRANSIT_BODIES.map((body, index) => [body, index * 30]),
    ),
    retrograde: Object.fromEntries(TRANSIT_BODIES.map((body) => [body, false])),
  });

  const range = {
    start: 0,
    stepMs: 86_400_000,
    snapshots: [snapshot(0), snapshot(86_400_000)],
  };

  return {
    TRANSIT_BODIES,
    useEphemerisRange: () => ({ range, progress: 1 }),
    sampleEphemeris: () => snapshot(0),
  };
});

const birthChart = [
  {
    body: 'Sun',
    sign: 'Aries',
    degree: 0,
    minute: 0,
    eclipticLongitude: 0,
    retrograde: false,
  },
  {
    body: 'Moon',
    sign: 'Taurus',
    degree: 0,
    minute: 0,
    eclipticLongitude: 30,
    retrograde: false,
  },
  {
    body: 'Mercury',
    sign: 'Gemini',
    degree: 0,
    minute: 0,
    eclipticLongitude: 60,
    retrograde: false,
  },
  {
    body: 'Venus',
    sign: 'Cancer',
    degree: 0,
    minute: 0,
    eclipticLongitude: 90,
    retrograde: false,
  },
  {
    body: 'Mars',
    sign: 'Leo',
    degree: 0,
    minute: 0,
    eclipticLongitude: 120,
    retrograde: false,
  },
  {
    body: 'Jupiter',
    sign: 'Virgo',
    degree: 0,
    minute: 0,
    eclipticLongitude: 150,
    retrograde: false,
  },
  {
    body: 'Saturn',
    sign: 'Libra',
    degree: 0,
    minute: 0,
    eclipticLongitude: 180,
    retrograde: false,
  },
  {
    body: 'Uranus',
    sign: 'Scorpio',
    degree: 0,
    minute: 0,
    eclipticLongitude: 210,
    retrograde: false,
  },
  {
    body: 'Neptune',
    sign: 'Sagittarius',
    degree: 0,
    minute: 0,
    eclipticLongitude: 240,
    retrograde: false,
  },
  {
    body: 'Pluto',
    sign: 'Capricorn',
    degree: 0,
    minute: 0,
    eclipticLongitude: 270,
    retrograde: false,
  },
  {
    body: 'Ascendant',
    sign: 'Aries',
    degree: 0,
    minute: 0,
    eclipticLongitude: 0,
    retrograde: false,
  },
] satisfies BirthChartData[];

describe('TransitScrubber access gating', () => {
  beforeEach(() => {
    mockHasAccess.mockReset();
  });

  it('locks timeline controls for free users', () => {
    mockHasAccess.mockReturnValue(false);

    render(<TransitScrubber birthChart={birthChart} />);

    expect(screen.getByText('Plus unlocks time travel')).toBeInTheDocument();
    expect(screen.getByLabelText('Play')).toBeDisabled();
    expect(screen.getByLabelText('Previous day')).toBeDisabled();
    expect(screen.getByLabelText('Next day')).toBeDisabled();
    expect(screen.getByText(/Free view shows today/i)).toBeInTheDocument();
    expect(mockHasAccess).toHaveBeenCalledWith('personalized_transit_readings');
  });

  it('enables timeline controls for paid users', () => {
    mockHasAccess.mockReturnValue(true);

    render(<TransitScrubber birthChart={birthChart} />);

    expect(
      screen.queryByText('Plus unlocks time travel'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Play')).toBeEnabled();
    expect(screen.getByLabelText('Previous day')).toBeEnabled();
    expect(screen.getByLabelText('Next day')).toBeEnabled();
  });
});
