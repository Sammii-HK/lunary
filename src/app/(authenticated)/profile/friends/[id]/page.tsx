'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Users,
  Star,
  Sparkles,
  Calendar,
  CircleDot,
  Sun,
  Moon,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import {
  zodiacSymbol,
  bodiesSymbols,
  astroPointSymbols,
} from '@/constants/symbols';
import { ShareSynastry } from '@/components/share/ShareSynastry';
import { getSynastryArchetype } from '@/utils/astrology/synastry-archetype';
import { useUser } from '@/context/UserContext';
import { BirthChart } from '@/components/BirthChart';
import type { BirthChartData } from '../../../../../../utils/astrology/birthChart';

function extractBigThree(chart?: BirthChartData[]) {
  if (!chart) return undefined;
  const sun = chart.find((p) => p.body === 'Sun')?.sign;
  const moon = chart.find((p) => p.body === 'Moon')?.sign;
  const rising = chart.find((p) => p.body === 'Ascendant')?.sign;
  if (!sun && !moon && !rising) return undefined;
  return { sun, moon, rising };
}

type FriendProfile = {
  id: string;
  friendId: string;
  name: string;
  avatar?: string;
  sunSign?: string;
  relationshipType?: string;
  hasBirthChart: boolean;
  synastry?: SynastryData;
  birthChart?: BirthChartData[];
};

type SynastryAspect = {
  person1Planet: string;
  person2Planet: string;
  aspectType: string;
  orb: number;
  isHarmonious: boolean;
};

type SynastryData = {
  compatibilityScore: number;
  summary: string;
  aspects: SynastryAspect[];
  elementBalance: {
    fire: { person1: number; person2: number; combined: number };
    earth: { person1: number; person2: number; combined: number };
    air: { person1: number; person2: number; combined: number };
    water: { person1: number; person2: number; combined: number };
    compatibility: string;
  };
  modalityBalance: {
    cardinal: { person1: number; person2: number; combined: number };
    fixed: { person1: number; person2: number; combined: number };
    mutable: { person1: number; person2: number; combined: number };
    compatibility: string;
  };
};

type FriendTab = 'overview' | 'synastry' | 'chart' | 'timing';

const RELATIONSHIP_ICONS: Record<string, typeof Heart> = {
  partner: Heart,
  friend: Users,
  family: Star,
  other: Sparkles,
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '\u260C',
  opposition: '\u260D',
  trine: '\u25B3',
  square: '\u25A1',
  sextile: '\u26B9',
  quincunx: '\u26BB',
};

const PLANET_ORDER = [
  'Sun',
  'Moon',
  'Ascendant',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'North Node',
  'Chiron',
];

export default function FriendProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const friendId = params.id as string;

  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FriendTab>('overview');

  useEffect(() => {
    async function fetchFriend() {
      try {
        const response = await fetch(`/api/friends/${friendId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load friend profile');
        }

        const data = await response.json();
        setFriend(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchFriend();
  }, [friendId]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary' />
        <p className='text-zinc-400'>Loading friend profile...</p>
      </div>
    );
  }

  if (error || !friend) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-red-400'>{error || 'Friend not found'}</p>
        <Button onClick={() => router.back()} variant='outline'>
          Go Back
        </Button>
      </div>
    );
  }

  const RelationshipIcon =
    RELATIONSHIP_ICONS[friend.relationshipType || 'friend'] || Users;

  return (
    <div
      className='flex flex-col items-center gap-6 p-4 h-fit mb-16'
      data-testid='friend-profile-page'
    >
      {/* Header */}
      <div className='w-full max-w-3xl'>
        <button
          onClick={() => router.push('/profile?tab=circle')}
          className='flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4'
          data-testid='back-to-circle'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Circle
        </button>

        <div
          className='flex items-center gap-4'
          data-testid='friend-profile-header'
        >
          <div
            className='w-16 h-16 rounded-full bg-gradient-to-br from-lunary-primary to-lunary-highlight flex items-center justify-center'
            data-testid='friend-avatar'
          >
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.name}
                className='w-full h-full rounded-full object-cover'
              />
            ) : (
              <RelationshipIcon className='w-8 h-8 text-white' />
            )}
          </div>
          <div>
            <Heading as='h1' variant='h2'>
              {friend.name}
            </Heading>
            <p className='text-zinc-400 flex items-center gap-2'>
              {friend.sunSign && (
                <>
                  <span className='font-astro'>
                    {zodiacSymbol[
                      friend.sunSign.toLowerCase() as keyof typeof zodiacSymbol
                    ] || friend.sunSign}
                  </span>
                  <span>{friend.sunSign}</span>
                  <span className='text-zinc-600'>•</span>
                </>
              )}
              <span className='capitalize'>
                {friend.relationshipType || 'Friend'}
              </span>
            </p>
          </div>
          {friend.synastry && (
            <div
              className='ml-auto flex items-center gap-4'
              data-testid='compatibility-score-header'
            >
              <div className='text-center'>
                <div
                  className='text-3xl font-bold text-lunary-accent-200'
                  data-testid='compatibility-score'
                >
                  {friend.synastry.compatibilityScore}%
                </div>
                <div className='text-xs text-zinc-400'>Compatible</div>
              </div>
              <ShareSynastry
                userName={user?.name?.split(' ')[0]}
                friendName={friend.name}
                compatibilityScore={friend.synastry.compatibilityScore}
                summary={friend.synastry.summary}
                harmoniousAspects={
                  friend.synastry.aspects?.filter((a) => a.isHarmonious).length
                }
                challengingAspects={
                  friend.synastry.aspects?.filter((a) => !a.isHarmonious).length
                }
                person1BigThree={extractBigThree(
                  user?.birthChart as BirthChartData[] | undefined,
                )}
                person2BigThree={extractBigThree(friend.birthChart)}
                topAspects={friend.synastry.aspects?.slice(0, 3).map((a) => ({
                  person1Planet: a.person1Planet,
                  person2Planet: a.person2Planet,
                  aspectType: a.aspectType,
                  isHarmonious: a.isHarmonious,
                }))}
                elementBalance={{
                  fire: friend.synastry.elementBalance.fire.combined,
                  earth: friend.synastry.elementBalance.earth.combined,
                  air: friend.synastry.elementBalance.air.combined,
                  water: friend.synastry.elementBalance.water.combined,
                }}
                archetype={getSynastryArchetype(
                  extractBigThree(
                    user?.birthChart as BirthChartData[] | undefined,
                  )?.sun,
                  extractBigThree(friend.birthChart)?.sun,
                )}
                buttonVariant='small'
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='w-full max-w-3xl'>
        <div
          className='flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50'
          data-testid='friend-profile-tabs'
        >
          {[
            { id: 'overview', label: 'Overview', icon: CircleDot },
            { id: 'synastry', label: 'Synastry', icon: Sparkles },
            { id: 'chart', label: 'Their Chart', icon: Sun },
            { id: 'timing', label: 'Timing', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FriendTab)}
              data-testid={`tab-${tab.id}`}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              <span className='hidden sm:inline'>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className='w-full max-w-3xl'>
        {activeTab === 'overview' && (
          <OverviewTab
            friend={friend}
            onViewSynastry={() => setActiveTab('synastry')}
          />
        )}
        {activeTab === 'synastry' && <SynastryTab synastry={friend.synastry} />}
        {activeTab === 'chart' && (
          <ChartTab birthChart={friend.birthChart} name={friend.name} />
        )}
        {activeTab === 'timing' && <TimingTab friend={friend} />}
      </div>
    </div>
  );
}

function OverviewTab({
  friend,
  onViewSynastry,
}: {
  friend: FriendProfile;
  onViewSynastry: () => void;
}) {
  const keyPlacements = friend.birthChart
    ?.filter((p) =>
      ['Sun', 'Moon', 'Ascendant', 'Venus', 'Mars'].includes(p.body),
    )
    .sort(
      (a, b) => PLANET_ORDER.indexOf(a.body) - PLANET_ORDER.indexOf(b.body),
    );

  return (
    <div className='space-y-6' data-testid='overview-tab-content'>
      {/* Compatibility Card */}
      {friend.synastry && (
        <div
          className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
          data-testid='overview-compatibility'
        >
          <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
            Compatibility Overview
          </h3>
          <div className='flex items-center gap-6'>
            <div className='text-center'>
              <div className='text-4xl font-bold text-lunary-accent-200'>
                {friend.synastry.compatibilityScore}%
              </div>
              <div className='text-xs text-zinc-400'>Match</div>
            </div>
            <div className='flex-1'>
              <div className='h-3 bg-zinc-700 rounded-full overflow-hidden mb-3'>
                <div
                  className='h-full bg-gradient-to-r from-lunary-primary to-lunary-highlight'
                  style={{ width: `${friend.synastry.compatibilityScore}%` }}
                />
              </div>
              <p className='text-sm text-zinc-300'>{friend.synastry.summary}</p>
            </div>
          </div>
          <Button
            onClick={onViewSynastry}
            variant='outline'
            size='sm'
            className='mt-4 gap-1.5'
            data-testid='view-full-synastry'
          >
            <Sparkles className='w-4 h-4' />
            View Full Synastry
          </Button>
        </div>
      )}

      {/* Key Placements */}
      {keyPlacements && keyPlacements.length > 0 && (
        <div
          className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
          data-testid='key-placements'
        >
          <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
            {friend.name}&apos;s Key Placements
          </h3>
          <div
            className='grid grid-cols-2 sm:grid-cols-3 gap-3'
            data-testid='key-placements-grid'
          >
            {keyPlacements.map((placement) => (
              <div
                key={placement.body}
                className='rounded-lg bg-zinc-800/50 p-3 text-center'
              >
                <div className='text-2xl font-astro text-lunary-accent-200 mb-1'>
                  {zodiacSymbol[
                    placement.sign.toLowerCase() as keyof typeof zodiacSymbol
                  ] || placement.sign}
                </div>
                <div className='text-sm font-medium text-white'>
                  {placement.body}
                </div>
                <div className='text-xs text-zinc-400'>
                  {placement.sign} {placement.degree}°{placement.minute}&apos;
                  {placement.retrograde && (
                    <span className='text-lunary-error-300'> ℞</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!friend.hasBirthChart && (
        <div className='rounded-xl border-2 border-dashed border-zinc-700 p-6 text-center'>
          <Moon className='w-10 h-10 mx-auto text-zinc-600 mb-3' />
          <h3 className='font-medium text-zinc-300 mb-1'>
            Birth Chart Not Available
          </h3>
          <p className='text-sm text-zinc-500'>
            {friend.name} hasn&apos;t added their birth details yet
          </p>
        </div>
      )}
    </div>
  );
}

function SynastryTab({ synastry }: { synastry?: SynastryData }) {
  const [showAllAspects, setShowAllAspects] = useState(false);

  if (!synastry) {
    return (
      <div
        className='rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center'
        data-testid='synastry-unavailable'
      >
        <Sparkles className='w-10 h-10 mx-auto text-zinc-600 mb-3' />
        <h3 className='font-medium text-zinc-300 mb-1'>
          Synastry Not Available
        </h3>
        <p className='text-sm text-zinc-500'>
          Both you and your friend need birth charts for synastry analysis
        </p>
      </div>
    );
  }

  const harmoniousAspects = synastry.aspects.filter((a) => a.isHarmonious);
  const challengingAspects = synastry.aspects.filter((a) => !a.isHarmonious);

  return (
    <div className='space-y-6' data-testid='synastry-tab-content'>
      {/* Score */}
      <div
        className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
        data-testid='synastry-score-section'
      >
        <div className='flex items-center gap-6'>
          <div className='text-center'>
            <div
              className='text-4xl font-bold text-lunary-accent-200'
              data-testid='synastry-compatibility-score'
            >
              {synastry.compatibilityScore}%
            </div>
            <div className='text-xs text-zinc-400'>Compatibility</div>
          </div>
          <div className='flex-1'>
            <div className='h-3 bg-zinc-700 rounded-full overflow-hidden mb-3'>
              <div
                className='h-full bg-gradient-to-r from-lunary-primary to-lunary-highlight'
                style={{ width: `${synastry.compatibilityScore}%` }}
              />
            </div>
            <p className='text-sm text-zinc-300'>{synastry.summary}</p>
          </div>
        </div>
      </div>

      {/* Element Balance */}
      <div
        className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
        data-testid='synastry-element-balance'
      >
        <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
          Element Balance
        </h3>
        <div
          className='grid grid-cols-4 gap-3'
          data-testid='element-balance-grid'
        >
          {(['fire', 'earth', 'air', 'water'] as const).map((element) => {
            const data = synastry.elementBalance[element];
            const colors: Record<string, string> = {
              fire: 'from-red-500 to-orange-500',
              earth: 'from-green-600 to-emerald-500',
              air: 'from-sky-400 to-blue-400',
              water: 'from-blue-500 to-indigo-500',
            };
            return (
              <div
                key={element}
                className='rounded-lg bg-zinc-800/50 p-3 text-center'
              >
                <div
                  className={`text-2xl font-bold bg-gradient-to-r ${colors[element]} bg-clip-text text-transparent`}
                >
                  {data.combined}
                </div>
                <div className='text-xs text-zinc-400 capitalize'>
                  {element}
                </div>
                <div className='text-[10px] text-zinc-500 mt-1'>
                  You: {data.person1} / Them: {data.person2}
                </div>
              </div>
            );
          })}
        </div>
        <p className='text-xs text-zinc-500 mt-3'>
          Elements:{' '}
          <span
            className={
              synastry.elementBalance.compatibility === 'complementary'
                ? 'text-green-400'
                : synastry.elementBalance.compatibility === 'challenging'
                  ? 'text-lunary-error-300'
                  : 'text-zinc-300'
            }
          >
            {synastry.elementBalance.compatibility}
          </span>
        </p>
      </div>

      {/* Modality Balance */}
      <div
        className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
        data-testid='synastry-modality-balance'
      >
        <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
          Modality Balance
        </h3>
        <div
          className='grid grid-cols-3 gap-3'
          data-testid='modality-balance-grid'
        >
          {(['cardinal', 'fixed', 'mutable'] as const).map((modality) => {
            const data = synastry.modalityBalance[modality];
            return (
              <div
                key={modality}
                className='rounded-lg bg-zinc-800/50 p-3 text-center'
              >
                <div className='text-2xl font-bold text-zinc-200'>
                  {data.combined}
                </div>
                <div className='text-xs text-zinc-400 capitalize'>
                  {modality}
                </div>
                <div className='text-[10px] text-zinc-500 mt-1'>
                  You: {data.person1} / Them: {data.person2}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aspects */}
      <div
        className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
        data-testid='synastry-aspects-section'
      >
        <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
          Aspects ({synastry.aspects.length})
        </h3>

        <div className='grid sm:grid-cols-2 gap-4 mb-4'>
          <div className='space-y-2' data-testid='harmonious-aspects'>
            <h4 className='text-xs font-medium text-green-400 flex items-center gap-1'>
              <TrendingUp className='w-3 h-3' />
              Harmonious ({harmoniousAspects.length})
            </h4>
            {harmoniousAspects
              .slice(0, showAllAspects ? undefined : 5)
              .map((aspect, i) => (
                <AspectRow key={i} aspect={aspect} />
              ))}
          </div>
          <div className='space-y-2' data-testid='challenging-aspects'>
            <h4 className='text-xs font-medium text-lunary-error-300 flex items-center gap-1'>
              <Sparkles className='w-3 h-3' />
              Challenging ({challengingAspects.length})
            </h4>
            {challengingAspects
              .slice(0, showAllAspects ? undefined : 5)
              .map((aspect, i) => (
                <AspectRow key={i} aspect={aspect} />
              ))}
          </div>
        </div>

        {synastry.aspects.length > 10 && (
          <Button
            onClick={() => setShowAllAspects(!showAllAspects)}
            variant='outline'
            size='sm'
            data-testid='toggle-all-aspects'
          >
            {showAllAspects ? 'Show Less' : 'Show All Aspects'}
          </Button>
        )}
      </div>
    </div>
  );
}

function AspectRow({ aspect }: { aspect: SynastryAspect }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
        aspect.isHarmonious
          ? 'bg-green-900/20 text-green-300'
          : 'bg-amber-900/20 text-amber-300'
      }`}
    >
      <span className='font-mono text-sm'>
        {ASPECT_SYMBOLS[aspect.aspectType] || '\u25CF'}
      </span>
      <span className='flex-1'>
        Your {aspect.person1Planet} {aspect.aspectType} their{' '}
        {aspect.person2Planet}
      </span>
      <span className='text-zinc-500'>{aspect.orb.toFixed(1)}°</span>
    </div>
  );
}

function ChartTab({
  birthChart,
  name,
}: {
  birthChart?: BirthChartData[];
  name: string;
}) {
  const [showWheel, setShowWheel] = useState(true);

  if (!birthChart || birthChart.length === 0) {
    return (
      <div className='rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center'>
        <Sun className='w-10 h-10 mx-auto text-zinc-600 mb-3' />
        <h3 className='font-medium text-zinc-300 mb-1'>Chart Not Available</h3>
        <p className='text-sm text-zinc-500'>
          {name} hasn&apos;t added their birth details yet
        </p>
      </div>
    );
  }

  const sortedPlacements = [...birthChart].sort(
    (a, b) => PLANET_ORDER.indexOf(a.body) - PLANET_ORDER.indexOf(b.body),
  );

  const personalPlanets = sortedPlacements.filter((p) =>
    ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars'].includes(p.body),
  );
  const socialPlanets = sortedPlacements.filter((p) =>
    ['Jupiter', 'Saturn'].includes(p.body),
  );
  const outerPlanets = sortedPlacements.filter((p) =>
    ['Uranus', 'Neptune', 'Pluto'].includes(p.body),
  );
  const points = sortedPlacements.filter((p) =>
    ['North Node', 'South Node', 'Chiron', 'Midheaven', 'Descendant'].includes(
      p.body,
    ),
  );

  return (
    <div className='space-y-6' data-testid='chart-tab-content'>
      {/* View Toggle */}
      <div className='flex justify-center'>
        <div
          className='flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50'
          data-testid='chart-view-toggle'
        >
          <button
            onClick={() => setShowWheel(true)}
            data-testid='chart-wheel-button'
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              showWheel
                ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Chart Wheel
          </button>
          <button
            onClick={() => setShowWheel(false)}
            data-testid='placements-list-button'
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              !showWheel
                ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Placements List
          </button>
        </div>
      </div>

      {showWheel ? (
        <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-4'>
          <BirthChart
            birthChart={birthChart}
            userName={name}
            showAspects={false}
          />
        </div>
      ) : (
        <>
          {personalPlanets.length > 0 && (
            <PlacementSection
              title='Personal Planets'
              placements={personalPlanets}
            />
          )}
          {socialPlanets.length > 0 && (
            <PlacementSection
              title='Social Planets'
              placements={socialPlanets}
            />
          )}
          {outerPlanets.length > 0 && (
            <PlacementSection title='Outer Planets' placements={outerPlanets} />
          )}
          {points.length > 0 && (
            <PlacementSection title='Points & Asteroids' placements={points} />
          )}
        </>
      )}
    </div>
  );
}

function getBodySymbol(body: string): string {
  const key = body
    .toLowerCase()
    .replace(/\s+/g, '') as keyof typeof bodiesSymbols;
  if (bodiesSymbols[key]) return bodiesSymbols[key];
  const pointKey = key as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pointKey]) return astroPointSymbols[pointKey];
  return body.charAt(0);
}

function PlacementSection({
  title,
  placements,
}: {
  title: string;
  placements: BirthChartData[];
}) {
  return (
    <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'>
      <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
        {title}
      </h3>
      <div className='space-y-2'>
        {placements.map((placement) => (
          <div
            key={placement.body}
            className='flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0'
          >
            <div className='w-8 text-xl font-astro text-lunary-accent-300 text-center'>
              {getBodySymbol(placement.body)}
            </div>
            <div className='w-20 text-sm font-medium text-white'>
              {placement.body}
            </div>
            <div className='text-xl font-astro text-zinc-400'>
              {zodiacSymbol[
                placement.sign.toLowerCase() as keyof typeof zodiacSymbol
              ] || ''}
            </div>
            <div className='flex-1 text-sm text-zinc-300'>
              {placement.sign} {placement.degree}°{placement.minute}&apos;
              {placement.retrograde && (
                <span className='ml-1 text-lunary-error-300'>℞</span>
              )}
            </div>
            {placement.house && (
              <div className='text-xs text-zinc-500'>
                House {placement.house}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type TimingWindow = {
  date: string;
  endDate?: string;
  dateFormatted: string;
  quality: 'great' | 'good' | 'neutral' | 'challenging';
  reason: string;
  transitingPlanet: string;
  aspectType: string;
  affectedPlanets: string[];
};

type CosmicEvent = {
  date: string;
  dateFormatted: string;
  event: string;
  impact: string;
  type: 'lunar_phase' | 'planet_transit' | 'retrograde';
};

function TimingTab({ friend }: { friend: FriendProfile }) {
  const [timingWindows, setTimingWindows] = useState<TimingWindow[]>([]);
  const [sharedEvents, setSharedEvents] = useState<CosmicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTiming() {
      try {
        const response = await fetch(`/api/friends/${friend.id}/timing`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to load timing data');
        }

        const data = await response.json();
        setTimingWindows(data.timingWindows || []);
        setSharedEvents(data.sharedEvents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timing');
      } finally {
        setLoading(false);
      }
    }

    if (friend.hasBirthChart) {
      fetchTiming();
    } else {
      setLoading(false);
    }
  }, [friend.id, friend.hasBirthChart]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[200px] gap-4'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-lunary-primary' />
        <p className='text-sm text-zinc-400'>Calculating cosmic timing...</p>
      </div>
    );
  }

  if (!friend.hasBirthChart) {
    return (
      <div className='rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center'>
        <Calendar className='w-10 h-10 mx-auto text-zinc-600 mb-3' />
        <h3 className='font-medium text-zinc-300 mb-1'>
          Timing Analysis Unavailable
        </h3>
        <p className='text-sm text-zinc-500'>
          {friend.name} needs to add their birth details for timing analysis
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center'>
        <Calendar className='w-10 h-10 mx-auto text-zinc-600 mb-3' />
        <h3 className='font-medium text-zinc-300 mb-1'>{error}</h3>
        <p className='text-sm text-zinc-500'>
          Both you and {friend.name} need complete birth charts
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6' data-testid='timing-tab-content'>
      <div
        className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
        data-testid='timing-windows'
      >
        <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
          Best Times to Connect
        </h3>
        <p className='text-sm text-zinc-400 mb-4'>
          Based on both your transits, here are optimal times for connection.
        </p>

        {timingWindows.length > 0 ? (
          <div className='space-y-3'>
            {timingWindows.map((timing, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  timing.quality === 'great'
                    ? 'bg-lunary-success-900/20 border border-lunary-success-800/30'
                    : timing.quality === 'challenging'
                      ? 'bg-lunary-rose-900/20 border border-lunary-rose-800/30'
                      : timing.quality === 'good'
                        ? 'bg-lunary-secondary-900/20 border border-lunary-secondary-800/30'
                        : 'bg-zinc-800/50'
                }`}
              >
                {timing.quality === 'great' && (
                  <Sparkles className='w-5 h-5 text-lunary-success-400' />
                )}
                {timing.quality === 'good' && (
                  <Calendar className='w-5 h-5 text-lunary-secondary-400' />
                )}
                {timing.quality === 'challenging' && (
                  <Clock className='w-5 h-5 text-lunary-rose-400' />
                )}
                {timing.quality === 'neutral' && (
                  <Calendar className='w-5 h-5 text-zinc-400' />
                )}
                <div className='flex-1'>
                  <div className='text-sm font-medium text-white'>
                    {timing.dateFormatted}
                  </div>
                  <div className='text-xs text-zinc-400'>{timing.reason}</div>
                </div>
                {timing.quality === 'great' && (
                  <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-success-800/50 text-lunary-success-300'>
                    Great Window
                  </span>
                )}
                {timing.quality === 'good' && (
                  <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-secondary-800/50 text-lunary-secondary-300'>
                    Good
                  </span>
                )}
                {timing.quality === 'challenging' && (
                  <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-rose-800/50 text-lunary-rose-300'>
                    Wait on This
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-zinc-500 text-center py-4'>
            No optimal timing windows found in the next 30 days
          </p>
        )}
      </div>

      <div
        className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5'
        data-testid='shared-cosmic-events'
      >
        <h3 className='text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4'>
          Shared Cosmic Events
        </h3>
        {sharedEvents.length > 0 ? (
          <div className='space-y-3'>
            {sharedEvents.map((event, i) => (
              <div
                key={i}
                className='flex items-start gap-3 p-3 rounded-lg bg-lunary-accent-900/20 border border-lunary-accent-800/30'
              >
                <Moon className='w-5 h-5 text-lunary-accent-400 mt-0.5' />
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <div className='text-sm font-medium text-white'>
                      {event.event}
                    </div>
                    <div className='text-xs text-zinc-500'>
                      {event.dateFormatted}
                    </div>
                  </div>
                  <div className='text-xs text-zinc-400'>{event.impact}</div>
                </div>
                <span className='text-xs px-2 py-0.5 rounded-full bg-lunary-accent-800/50 text-lunary-accent-300'>
                  Shared Event
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-zinc-500 text-center py-4'>
            No shared cosmic events in the next 30 days
          </p>
        )}
      </div>
    </div>
  );
}
