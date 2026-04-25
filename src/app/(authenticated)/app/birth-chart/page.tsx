'use client';

import { useUser } from '@/context/UserContext';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { useSubscription } from '../../../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../../../utils/pricing';
import Link from 'next/link';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
import { useEffect, useMemo, useState } from 'react';
import { ShareBirthChart } from '@/components/ShareBirthChart';
import { ChartControls } from '@/components/ChartControls';
import { BirthChart } from '@/components/BirthChart';
import { BirthChartShowcase } from '@/components/birth-chart-sections/BirthChartShowcase';
import { ReferralShareCTA } from '@/components/referrals/ReferralShareCTA';
import { ChartModeToggle } from '@/components/ChartModeToggle';
import { NextImportantDatesStrip } from '@/components/charts/NextImportantDatesStrip';
import { Sparkles, Moon, Star, Home } from 'lucide-react';
import { ensureDescendantInChart } from '@/utils/astrology/birth-chart-analysis';
import {
  assignHousesToBodies,
  assignWholeSignHousesToBodies,
} from '@utils/astrology/houseAssignments';
import {
  convertToSidereal,
  type ZodiacSystem,
} from '@utils/astrology/zodiacSystems';
import { useProgressedChart } from '@/hooks/useProgressedChart';
import { useDashaTimeline } from '@/hooks/useDashaTimeline';
import { DashaTimeline } from '@/components/DashaTimeline';
import type { HouseCusp } from '@utils/astrology/houseSystems';

type HouseSystem =
  | 'placidus'
  | 'whole-sign'
  | 'koch'
  | 'porphyry'
  | 'alcabitius';

// Rate-limit house system switches for free users (3 per day)
const FREE_TIER_DAILY_LIMIT = 3;
const SWITCH_LOG_KEY = 'chart-house-switches';

function getFreeTierSwitchesRemaining(): number {
  try {
    const raw = localStorage.getItem(SWITCH_LOG_KEY);
    if (!raw) return FREE_TIER_DAILY_LIMIT;
    const log: number[] = JSON.parse(raw);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentSwitches = log.filter((ts) => ts > oneDayAgo);
    return Math.max(0, FREE_TIER_DAILY_LIMIT - recentSwitches.length);
  } catch {
    return FREE_TIER_DAILY_LIMIT;
  }
}

function recordHouseSwitch(): void {
  try {
    const raw = localStorage.getItem(SWITCH_LOG_KEY);
    const log: number[] = raw ? JSON.parse(raw) : [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = log.filter((ts) => ts > oneDayAgo);
    recent.push(Date.now());
    localStorage.setItem(SWITCH_LOG_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

const BirthChartPage = () => {
  const { user, loading } = useUser();
  const subscription = useSubscription();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAspects, setShowAspects] = useState(false);
  const [aspectFilter, setAspectFilter] = useState<
    'all' | 'harmonious' | 'challenging'
  >('all');
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [clockwise, setClockwise] = useState(false);
  const [showSymbols, setShowSymbols] = useState(true);
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('whole-sign');
  const [zodiacSystem, setZodiacSystem] = useState<ZodiacSystem>('tropical');
  const [houses, setHouses] = useState<HouseCusp[] | null>(null);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [showHouseSystemPicker, setShowHouseSystemPicker] = useState(false);
  const [switchesRemaining, setSwitchesRemaining] = useState(
    FREE_TIER_DAILY_LIMIT,
  );
  const [chartMode, setChartMode] = useState<'natal' | 'progressed'>('natal');
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const originalBirthChartData = user?.birthChart || null;
  const birthChartData = useMemo(() => {
    if (!originalBirthChartData) return null;
    return ensureDescendantInChart(originalBirthChartData);
  }, [originalBirthChartData]);

  const {
    progressedChart,
    currentAge,
    loading: progressionLoading,
  } = useProgressedChart(userBirthday, birthChartData || undefined);

  // Extract Moon position from birth chart for dasha calculations
  const moonPosition = useMemo(() => {
    if (!birthChartData) return undefined;
    const moonData = birthChartData.find((body) => body.body === 'Moon');
    if (!moonData) return undefined;
    return convertToSidereal(moonData.eclipticLongitude);
  }, [birthChartData]);

  const dashaMoonDegree =
    zodiacSystem === 'sidereal' ? moonPosition : undefined;

  // Fetch dasha timeline
  const {
    currentDasha,
    upcomingPeriods,
    loading: dashaLoading,
  } = useDashaTimeline(userBirthday, dashaMoonDegree);

  // Determine which chart to display based on mode
  const displayChart = useMemo(() => {
    if (chartMode === 'progressed' && progressedChart.length > 0) {
      return progressedChart;
    }
    return birthChartData;
  }, [chartMode, progressedChart, birthChartData]);

  const displayChartWithHouses = useMemo(() => {
    if (!displayChart) return null;
    if (houseSystem === 'whole-sign') {
      return assignWholeSignHousesToBodies(displayChart, zodiacSystem);
    }
    if (!houses || houses.length === 0) return displayChart;
    return assignHousesToBodies(displayChart, houses);
  }, [displayChart, houses, houseSystem, zodiacSystem]);

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  useEffect(() => {
    setHasMounted(true);
    // Load preferences from localStorage and user profile
    const savedShowSymbols = localStorage.getItem('chart-symbols');
    if (savedShowSymbols !== null) {
      setShowSymbols(savedShowSymbols === 'true');
    }

    const savedClockwise = localStorage.getItem('chart-clockwise');
    if (savedClockwise !== null) {
      setClockwise(savedClockwise === 'true');
    }

    // Load house system from user profile or localStorage
    const validSystems = [
      'placidus',
      'whole-sign',
      'koch',
      'porphyry',
      'alcabitius',
    ];
    if (
      user?.birthChartHouseSystem &&
      validSystems.includes(user.birthChartHouseSystem)
    ) {
      setHouseSystem(user.birthChartHouseSystem as HouseSystem);
    } else {
      const savedHouseSystem = localStorage.getItem('chart-house-system');
      if (savedHouseSystem && validSystems.includes(savedHouseSystem)) {
        setHouseSystem(savedHouseSystem as HouseSystem);
      } else {
        // First time viewing chart — no house system chosen yet
        setShowHouseSystemPicker(true);
      }
    }

    // Load free-tier switch count
    setSwitchesRemaining(getFreeTierSwitchesRemaining());

    // Load zodiac system from localStorage
    const savedZodiacSystem = localStorage.getItem('chart-zodiac-system');
    if (
      savedZodiacSystem &&
      ['tropical', 'sidereal', 'equatorial'].includes(savedZodiacSystem)
    ) {
      setZodiacSystem(savedZodiacSystem as ZodiacSystem);
    }
  }, [user?.birthChartHouseSystem]);

  // Save clockwise to localStorage so the wheel direction preserves across refresh
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('chart-clockwise', String(clockwise));
    }
  }, [clockwise, hasMounted]);

  // Save showSymbols to localStorage
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('chart-symbols', String(showSymbols));
    }
  }, [showSymbols, hasMounted]);

  // Save houseSystem to localStorage and database, and fetch houses
  useEffect(() => {
    if (hasMounted && user?.id) {
      localStorage.setItem('chart-house-system', houseSystem);
      // Save to database
      fetch('/api/profile/birth-chart-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseSystem }),
      }).catch((err) => console.error('Failed to save house system:', err));
    }
  }, [houseSystem, hasMounted, user?.id]);

  // Save zodiacSystem to localStorage
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('chart-zodiac-system', zodiacSystem);
    }
  }, [zodiacSystem, hasMounted]);

  // Fetch all 5 house systems once on page load
  // Cache in localStorage and in-memory to avoid repeated API calls
  useEffect(() => {
    if (!hasMounted || !user?.id) return;

    const cacheKey = `houseSystems_${user.id}`;
    const inMemoryCache = new Map<string, HouseCusp[]>();

    // Check localStorage
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const allSystems = JSON.parse(cached);
        // Populate in-memory cache from localStorage
        Object.entries(allSystems).forEach(([system, houses]) => {
          inMemoryCache.set(system, houses as HouseCusp[]);
        });
        // Set initial houses for current system
        setHouses(allSystems[houseSystem] || null);
        return;
      } catch (err) {
        console.error('Failed to parse cached houses:', err);
        localStorage.removeItem(cacheKey);
      }
    }

    // Not in localStorage, fetch all systems (1 API call)
    setLoadingHouses(true);
    fetch('/api/profile/birth-chart/houses')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch houses');
        return res.json();
      })
      .then((allSystems: Record<string, HouseCusp[]>) => {
        // Cache in localStorage for future visits
        localStorage.setItem(cacheKey, JSON.stringify(allSystems));
        // Set houses for current system
        setHouses(allSystems[houseSystem] || null);
        setLoadingHouses(false);
      })
      .catch((err) => {
        console.error('Failed to fetch houses:', err);
        setLoadingHouses(false);
      });
  }, [hasMounted, user?.id, houseSystem]);

  // When user changes house system, get from cache and recalculate house assignments
  useEffect(() => {
    if (!hasMounted || !user?.id || !birthChartData) return;

    const cacheKey = `houseSystems_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const allSystems = JSON.parse(cached);
        const newHouses = allSystems[houseSystem];
        if (newHouses) {
          setHouses(newHouses);
          // Recalculate which house each body is in for the new house system
          // This updates the display with correct house assignments
        }
      } catch (err) {
        console.error('Failed to get houses from cache:', err);
      }
    }
  }, [houseSystem, hasMounted, user?.id, birthChartData]);

  useEffect(() => {
    if (hasChartAccess && user?.hasBirthChart && user?.id) {
      conversionTracking.birthChartViewed(user.id, subscription.plan);
    }
  }, [hasChartAccess, user?.hasBirthChart, user?.id, subscription.plan]);

  const shouldShowLoading = loading || !hasMounted;

  if (shouldShowLoading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-content-muted'>Loading your birth chart...</p>
        </div>
      </div>
    );
  }

  // Check subscription access first
  if (!hasChartAccess) {
    return (
      <div className='h-full space-y-4 p-4 overflow-auto'>
        <div className='flex items-center justify-center min-h-[50vh]'>
          <div className='text-center max-w-lg px-4'>
            <h1 className='text-xl font-bold text-content-primary mb-4'>
              Your Birth Chart Awaits
            </h1>
            <div className='bg-gradient-to-r from-layer-base/30 to-lunary-rose-900/30 rounded-lg p-4 border border-lunary-primary-700 mb-4'>
              <p className='text-content-secondary mb-4'>
                Sign up and unlock your complete cosmic blueprint with our
                comprehensive birth chart. We calculate 24+ celestial bodies
                including all planets, asteroids, nodes, and sensitive points
                for the most detailed astrological analysis.
              </p>
              <ul className='text-sm text-content-muted space-y-2 mb-6 text-left'>
                <li className='flex items-start gap-2'>
                  <Sparkles className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-primary' />
                  <span>
                    All 10 planets + 8 asteroids (Ceres, Pallas, Juno, Vesta,
                    Hygiea, Pholus, Psyche, Eros)
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <Moon className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-secondary' />
                  <span>
                    Sun, Moon, Rising + Chiron, Lilith, North & South Nodes
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <Star className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-accent' />
                  <span>Complete aspects, dignities, and pattern analysis</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Home className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-highlight' />
                  <span>12 house placements with detailed interpretations</span>
                </li>
              </ul>
            </div>
            <SmartTrialButton feature='birth_chart' size='lg' />
          </div>
        </div>
        <UpgradePrompt
          variant='card'
          featureName='birth_chart'
          title='Unlock Your Complete Birth Chart'
          description='Get 24+ celestial bodies including all planets, 8 major asteroids, Chiron, Lilith, Nodes, houses, aspects, and personalized insights based on your exact birth time'
          className='max-w-2xl mx-auto'
        />
      </div>
    );
  }

  if (!userBirthday) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center max-w-md px-4'>
          <h1 className='text-2xl font-bold text-content-primary mb-4'>
            Your Birth Chart
          </h1>
          <p className='text-content-secondary mb-6'>
            To generate your personalized birth chart, you need to provide your
            birthday on your profile.
          </p>
          <Link
            href='/profile'
            className='inline-block bg-lunary-primary hover:bg-lunary-primary-400 text-white py-2 px-6 rounded-md transition-colors'
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // Note: Even if birth chart exists, user still can't access it without subscription
  // This preserves data for users who had trial/paid but keeps paywall intact
  if (!user?.hasBirthChart || !birthChartData) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center max-w-md px-4'>
          <h1 className='text-2xl font-bold text-content-primary mb-4'>
            Generating Birth Chart
          </h1>
          <p className='text-content-secondary mb-6'>
            Your birth chart is being calculated based on your birthday. Please
            refresh the page in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className='inline-block bg-lunary-primary hover:bg-lunary-primary-400 text-white py-2 px-6 rounded-md transition-colors'
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-auto' data-testid='birth-chart-page'>
      {/* First-time house system picker */}
      {showHouseSystemPicker && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='bg-surface-elevated border border-stroke-subtle rounded-2xl p-6 max-w-md w-full space-y-4'>
            <h2 className='text-lg font-semibold text-content-primary text-center'>
              Choose your house system
            </h2>
            <p className='text-sm text-content-secondary text-center'>
              This determines how the 12 houses are divided in your chart. Most
              Western astrologers use Placidus or Whole Sign. You can always
              change this later.
            </p>
            <div className='grid grid-cols-1 gap-2'>
              {[
                {
                  id: 'placidus' as HouseSystem,
                  name: 'Placidus',
                  desc: 'Most popular in Western astrology. Unequal houses based on time.',
                },
                {
                  id: 'whole-sign' as HouseSystem,
                  name: 'Whole Sign',
                  desc: 'Each sign = one house. Simple and traditional.',
                },
                {
                  id: 'koch' as HouseSystem,
                  name: 'Koch',
                  desc: 'Similar to Placidus with different math. Popular in Europe.',
                },
                {
                  id: 'porphyry' as HouseSystem,
                  name: 'Porphyry',
                  desc: 'Quadrant trisection. Works at all latitudes.',
                },
                {
                  id: 'alcabitius' as HouseSystem,
                  name: 'Alcabitius',
                  desc: 'Medieval system using diurnal arcs.',
                },
              ].map(({ id, name, desc }) => (
                <button
                  key={id}
                  onClick={() => {
                    setHouseSystem(id);
                    setShowHouseSystemPicker(false);
                  }}
                  className='flex flex-col items-start p-3 rounded-lg border border-stroke-subtle hover:border-lunary-primary-500 hover:bg-lunary-primary-900/20 transition-colors text-left'
                >
                  <span className='font-medium text-content-primary text-sm'>
                    {name}
                  </span>
                  <span className='text-xs text-content-muted'>{desc}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowHouseSystemPicker(false)}
              className='w-full text-xs text-content-muted hover:text-content-secondary transition-colors pt-2'
            >
              Skip for now (defaults to Whole Sign)
            </button>
          </div>
        </div>
      )}

      <div className='flex w-full flex-col gap-4 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto p-4 mb-16'>
        {/* Internal Links for SEO */}
        <nav className='p-4 bg-surface-elevated/50 rounded-lg border border-stroke-subtle'>
          <p className='text-sm text-content-muted mb-3'>
            Learn more about your cosmic blueprint:
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/birth-chart'
              className='text-xs px-3 py-1.5 bg-layer-base/30 text-content-brand border border-lunary-primary-700/50 rounded-full hover:bg-layer-base/50 transition-colors'
            >
              Birth Chart Guide
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='text-xs px-3 py-1.5 bg-layer-base/30 text-content-brand-accent border border-lunary-accent-700/50 rounded-full hover:bg-layer-base/50 transition-colors'
            >
              Planet Meanings
            </Link>
            <Link
              href='/grimoire/houses'
              className='text-xs px-3 py-1.5 bg-layer-base/30 text-content-brand-secondary border border-lunary-secondary-700/50 rounded-full hover:bg-layer-base/50 transition-colors'
            >
              The 12 Houses
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='text-xs px-3 py-1.5 bg-layer-base/30 text-lunary-rose-300 border border-lunary-rose-700/50 rounded-full hover:bg-layer-base/50 transition-colors'
            >
              Zodiac Signs
            </Link>
            {birthChartData && (
              <div className='flex flex-col items-center gap-3'>
                <ShareBirthChart
                  birthChart={birthChartData}
                  userName={userName}
                  userBirthday={userBirthday}
                  houseSystem={houseSystem}
                />
              </div>
            )}
          </div>
        </nav>

        <div className='flex flex-col items-center gap-3'>
          <ChartModeToggle
            mode={chartMode}
            onModeChange={setChartMode}
            currentAge={currentAge}
          />

          {chartMode === 'progressed' && progressionLoading && (
            <div className='text-center text-sm text-content-muted'>
              Loading progressed chart...
            </div>
          )}

          <ChartControls
            showAspects={showAspects}
            onToggleAspects={() => setShowAspects(!showAspects)}
            aspectFilter={aspectFilter}
            onAspectFilterChange={setAspectFilter}
            showAsteroids={showAsteroids}
            onToggleAsteroids={() => setShowAsteroids(!showAsteroids)}
            showPoints={showPoints}
            onTogglePoints={() => setShowPoints(!showPoints)}
            clockwise={clockwise}
            onToggleClockwise={() => setClockwise(!clockwise)}
            houseSystem={houseSystem}
            onHouseSystemChange={(system) => {
              const isPaid = ['active', 'trial', 'trialing'].includes(
                subscription.status,
              );
              if (!isPaid) {
                recordHouseSwitch();
                setSwitchesRemaining(getFreeTierSwitchesRemaining());
              }
              setHouseSystem(system);
            }}
            zodiacSystem={zodiacSystem}
            onZodiacSystemChange={setZodiacSystem}
            isFreeTier={
              !['active', 'trial', 'trialing'].includes(subscription.status)
            }
            freeTierSwitchesRemaining={switchesRemaining}
          />

          {displayChartWithHouses && chartMode === 'natal' && (
            <NextImportantDatesStrip birthChart={displayChartWithHouses} />
          )}

          <div data-testid='chart-visualization'>
            {displayChartWithHouses && (
              <BirthChart
                birthChart={displayChartWithHouses}
                houses={houses || undefined}
                userName={userName}
                birthDate={userBirthday}
                showAspects={showAspects}
                aspectFilter={aspectFilter}
                showAsteroids={showAsteroids}
                showPoints={showPoints}
                clockwise={clockwise}
                showSymbols={showSymbols}
                onToggleSymbols={() => setShowSymbols(!showSymbols)}
                houseSystem={houseSystem}
                zodiacSystem={zodiacSystem}
              />
            )}
          </div>
        </div>

        {birthChartData && (
          <div className='flex flex-col items-center gap-3'>
            <ShareBirthChart
              birthChart={birthChartData}
              userName={userName}
              userBirthday={userBirthday}
              houseSystem={houseSystem}
            />
          </div>
        )}

        {/* Planetary Interpretations */}
        {displayChartWithHouses && (
          <div data-testid='planets-list'>
            <BirthChartShowcase
              birthChart={displayChartWithHouses}
              zodiacSystem={zodiacSystem}
              houses={houses || undefined}
            />
            {chartMode === 'progressed' && currentAge > 0 && (
              <div className='mt-6 p-4 bg-surface-elevated/30 rounded-lg border border-stroke-subtle text-sm text-content-secondary'>
                <p className='mb-2 font-medium text-content-primary'>
                  Secondary Progressions at Age {currentAge}
                </p>
                <p>
                  These are your progressed chart positions calculated from{' '}
                  {currentAge} days after your birth date. The progressed chart
                  shows how your astrological chart evolves over time, with each
                  day after birth representing one year of life.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Vedic Dasha Timeline - only show for sidereal zodiac */}
        {zodiacSystem === 'sidereal' && moonPosition !== undefined && (
          <div className='mt-8 pt-8 border-t border-stroke-subtle'>
            <div className='mb-4'>
              <h2 className='text-lg font-semibold text-content-primary mb-2'>
                Vimshottari Dasha
              </h2>
              <p className='text-sm text-content-secondary'>
                Your Vedic planetary period cycle. The Vimshottari Dasha is a
                120-year cycle of planetary influence calculated from your natal
                Moon position.
              </p>
            </div>
            <DashaTimeline
              currentDasha={currentDasha}
              upcomingPeriods={upcomingPeriods}
              loading={dashaLoading}
            />
          </div>
        )}

        <ReferralShareCTA message="Know someone who'd love their birth chart? They get 30 days of Pro free when they join." />
      </div>
    </div>
  );
};

export default BirthChartPage;
