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
import { Sparkles, Moon, Star, Home } from 'lucide-react';
import { ensureDescendantInChart } from '@/utils/astrology/birth-chart-analysis';

const BirthChartPage = () => {
  const { user, loading } = useUser();
  const subscription = useSubscription();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAspects, setShowAspects] = useState(false);
  const [aspectFilter, setAspectFilter] = useState<
    'all' | 'harmonious' | 'challenging'
  >('all');
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [clockwise, setClockwise] = useState(false);
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const originalBirthChartData = user?.birthChart || null;
  const birthChartData = useMemo(() => {
    if (!originalBirthChartData) return null;
    return ensureDescendantInChart(originalBirthChartData);
  }, [originalBirthChartData]);

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
          <p className='text-zinc-400'>Loading your birth chart...</p>
        </div>
      </div>
    );
  }

  // Check subscription access first
  if (!hasChartAccess) {
    return (
      <div className='h-full space-y-6 p-4 overflow-auto'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center max-w-lg px-4'>
            <h1 className='text-3xl font-bold text-white mb-6'>
              Your Birth Chart Awaits
            </h1>
            <div className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 rounded-lg p-6 border border-lunary-primary-700 mb-6'>
              <p className='text-zinc-300 mb-4'>
                Sign up for a free account and unlock your complete cosmic
                blueprint with our comprehensive birth chart. We calculate 24+
                celestial bodies including all planets, asteroids, nodes, and
                sensitive points for the most detailed astrological analysis.
              </p>
              <ul className='text-sm text-zinc-400 space-y-2 mb-6 text-left'>
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
          <h1 className='text-2xl font-bold text-white mb-4'>
            Your Birth Chart
          </h1>
          <p className='text-zinc-300 mb-6'>
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
          <h1 className='text-2xl font-bold text-white mb-4'>
            Generating Birth Chart
          </h1>
          <p className='text-zinc-300 mb-6'>
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
      <div className='flex w-full flex-col gap-4 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto p-4 mb-16'>
        {/* Internal Links for SEO */}
        <nav className='p-4 bg-zinc-900/50 rounded-lg border border-zinc-800'>
          <p className='text-sm text-zinc-400 mb-3'>
            Learn more about your cosmic blueprint:
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/birth-chart'
              className='text-xs px-3 py-1.5 bg-lunary-primary-900/30 text-lunary-primary-300 border border-lunary-primary-700/50 rounded-full hover:bg-lunary-primary-900/50 transition-colors'
            >
              Birth Chart Guide
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='text-xs px-3 py-1.5 bg-lunary-accent-900/30 text-lunary-accent-300 border border-lunary-accent-700/50 rounded-full hover:bg-lunary-accent-900/50 transition-colors'
            >
              Planet Meanings
            </Link>
            <Link
              href='/grimoire/houses'
              className='text-xs px-3 py-1.5 bg-lunary-secondary-900/30 text-lunary-secondary-300 border border-lunary-secondary-700/50 rounded-full hover:bg-lunary-secondary-900/50 transition-colors'
            >
              The 12 Houses
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='text-xs px-3 py-1.5 bg-lunary-rose-900/30 text-lunary-rose-300 border border-lunary-rose-700/50 rounded-full hover:bg-lunary-rose-900/50 transition-colors'
            >
              Zodiac Signs
            </Link>
            {birthChartData && (
              <div className='flex flex-col items-center gap-3'>
                <ShareBirthChart
                  birthChart={birthChartData}
                  userName={userName}
                  userBirthday={userBirthday}
                />
              </div>
            )}
          </div>
        </nav>

        <div className='flex flex-col items-center gap-3'>
          <ChartControls
            showAspects={showAspects}
            onToggleAspects={() => setShowAspects(!showAspects)}
            aspectFilter={aspectFilter}
            onAspectFilterChange={setAspectFilter}
            showAsteroids={showAsteroids}
            onToggleAsteroids={() => setShowAsteroids(!showAsteroids)}
            clockwise={clockwise}
            onToggleClockwise={() => setClockwise(!clockwise)}
          />

          <div data-testid='chart-visualization'>
            <BirthChart
              birthChart={birthChartData}
              userName={userName}
              birthDate={userBirthday}
              showAspects={showAspects}
              aspectFilter={aspectFilter}
              showAsteroids={showAsteroids}
              clockwise={clockwise}
            />
          </div>
        </div>

        {birthChartData && (
          <div className='flex flex-col items-center gap-3'>
            <ShareBirthChart
              birthChart={birthChartData}
              userName={userName}
              userBirthday={userBirthday}
            />
          </div>
        )}

        {/* Planetary Interpretations */}
        {birthChartData && (
          <div data-testid='planets-list'>
            <BirthChartShowcase birthChart={birthChartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthChartPage;
