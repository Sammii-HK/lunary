'use client';

import { useEffect, useState } from 'react';
import type { BirthChartPlacement } from '@/context/UserContext';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import { generateTarotTransitConnection } from '@/lib/tarot/generate-transit-connection';
import type { AstroChartInformation } from '../../../utils/astrology/astrology';
import { ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import type { TransitAspect } from '@/features/horoscope/transitDetails';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface TarotTransitConnectionProps {
  cardName: string;
  birthChart: BirthChartPlacement[] | undefined;
  userBirthday: string | undefined;
  currentTransits: AstroChartInformation[];
  variant?: 'compact' | 'inDepth';

  // Historical transits from when card/spread was pulled
  historicalTransits?: TransitAspect[] | null;
  historicalTimestamp?: string | null;

  // Reading creation timestamp (used if historicalTransits not available)
  readingCreatedAt?: string | null;

  // User's birth location for accurate transit calculations
  userBirthLocation?: string | null;
}

export function TarotTransitConnection({
  cardName,
  birthChart,
  userBirthday,
  currentTransits,
  variant = 'inDepth',
  historicalTransits,
  historicalTimestamp,
  readingCreatedAt,
  userBirthLocation,
}: TarotTransitConnectionProps) {
  const [currentConnection, setCurrentConnection] = useState<{
    compact: string;
    inDepth: string;
    perTransitInsights?: Array<{
      transit: any;
      insight: string;
      relevance: string;
    }>;
  } | null>(null);
  const [historicalConnection, setHistoricalConnection] = useState<{
    compact: string;
    inDepth: string;
    perTransitInsights?: Array<{
      transit: any;
      insight: string;
      relevance: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'current' | 'historical'>(
    'current',
  );

  useEffect(() => {
    async function processTransits() {
      if (
        !birthChart ||
        !birthChart.length ||
        !userBirthday ||
        !cardName ||
        !currentTransits?.length
      ) {
        setCurrentConnection(null);
        setHistoricalConnection(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Convert birth chart to snapshot format
        const birthChartSnapshot = {
          date: userBirthday,
          time: '12:00',
          lat: 0,
          lon: 0,
          placements: birthChart.map((p: any) => ({
            planet: p.planet,
            sign: p.sign,
            house: p.house,
            degree: p.degree,
          })),
        };

        // Generate current transit insights
        const currentAspects = calculateTransitAspects(
          birthChart as any,
          currentTransits as any,
        );

        if (currentAspects.length > 0) {
          const currentResult = await generateTarotTransitConnection(
            cardName,
            birthChartSnapshot,
            currentAspects,
          );
          setCurrentConnection(currentResult);
        } else {
          setCurrentConnection(null);
        }

        // Generate historical transit insights
        let historicalAspects: TransitAspect[] | null = null;

        if (historicalTransits && historicalTransits.length > 0) {
          // Use saved historical transits if available
          historicalAspects = historicalTransits;
        } else if (readingCreatedAt || historicalTimestamp) {
          // Calculate historical transits from timestamp if not saved
          try {
            const { getAstrologicalChart } =
              await import('../../../utils/astrology/astrology');
            const { Observer } = await import('astronomy-engine');
            const { parseLocationToCoordinates } =
              await import('../../../utils/astrology/birthChart');
            const timestamp = historicalTimestamp || readingCreatedAt;
            if (timestamp) {
              const historicalDate = new Date(timestamp);

              // Use user's birth location if available
              let observer: typeof Observer.prototype;
              if (userBirthLocation) {
                const coords =
                  await parseLocationToCoordinates(userBirthLocation);
                if (coords) {
                  observer = new Observer(coords.latitude, coords.longitude, 0);
                } else {
                  observer = new Observer(51.4769, 0.0005, 0); // Default fallback
                }
              } else {
                observer = new Observer(51.4769, 0.0005, 0); // Default fallback
              }

              const historicalTransitData = getAstrologicalChart(
                historicalDate,
                observer,
              );
              historicalAspects = calculateTransitAspects(
                birthChart as any,
                historicalTransitData as any,
              );
            }
          } catch (err) {
            console.error('Failed to calculate historical transits:', err);
          }
        }

        if (historicalAspects && historicalAspects.length > 0) {
          const historicalResult = await generateTarotTransitConnection(
            cardName,
            birthChartSnapshot,
            historicalAspects,
          );
          setHistoricalConnection(historicalResult);
        } else {
          setHistoricalConnection(null);
        }
      } catch (err) {
        console.error('Failed to generate transit connection:', err);
        setCurrentConnection(null);
        setHistoricalConnection(null);
      } finally {
        setLoading(false);
      }
    }

    processTransits();
  }, [
    cardName,
    birthChart,
    userBirthday,
    currentTransits,
    historicalTransits,
    historicalTimestamp,
    readingCreatedAt,
    userBirthLocation,
  ]);

  if (loading) {
    return (
      <div className='mt-4 pt-4 border-t border-zinc-800'>
        <div className='flex items-center gap-2 text-xs text-zinc-500'>
          <div className='w-3 h-3 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin' />
          <span>Calculating chart connections...</span>
        </div>
      </div>
    );
  }

  if (!currentConnection && !historicalConnection) {
    return null;
  }

  // Compact variant - only show current connection
  if (variant === 'compact') {
    return (
      <div className='mt-4 pt-4 border-t border-zinc-800'>
        <p className='text-xs text-lunary-accent-300 leading-relaxed'>
          {currentConnection?.compact}
        </p>
      </div>
    );
  }

  // Aspect symbols mapping
  const getAspectSymbol = (aspectType: string): string => {
    const symbols: Record<string, string> = {
      conjunction: '☌',
      opposition: '☍',
      trine: '△',
      square: '□',
      sextile: '⚹',
    };
    return symbols[aspectType.toLowerCase()] || '·';
  };

  // Helper to render degree with Astromicon zodiac symbol
  const renderDegreeWithSymbol = (degreeStr: string) => {
    // Extract zodiac symbol (last character after space)
    const parts = degreeStr.trim();
    const lastChar = parts.charAt(parts.length - 1);
    const degreeText = parts.slice(0, -1).trim();

    return (
      <>
        {degreeText} <span className='font-astro'>{lastChar}</span>
      </>
    );
  };

  // Helper function to render accordion insights
  const renderInsights = (
    insights: Array<{ transit: any; insight: string; relevance: string }>,
  ) => (
    <div className='space-y-2'>
      {insights.slice(0, 3).map((insight, idx) => {
        const isOpen = openAccordion === idx;
        return (
          <div
            key={idx}
            className='rounded-md border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'
          >
            <button
              onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
              className='w-full flex items-center justify-between p-3 text-left hover:bg-zinc-900/50 transition-colors'
            >
              <div className='flex flex-col gap-1 flex-1'>
                <div className='flex items-center gap-2 justify-between'>
                  <span className='text-xs font-medium text-lunary-primary-200'>
                    {insight.transit.transitPlanet} {insight.transit.aspectType}{' '}
                    {insight.transit.natalPlanet}
                  </span>
                  <span className='text-xs text-lunary-accent-300 mr-2'>
                    {insight.relevance}
                  </span>
                </div>
                <p className='text-xs text-zinc-600'>
                  {renderDegreeWithSymbol(insight.transit.transitDegree)}{' '}
                  {getAspectSymbol(insight.transit.aspectType)}{' '}
                  {renderDegreeWithSymbol(insight.transit.natalDegree)} (
                  {Math.round(insight.transit.orbDegrees * 10) / 10}° orb)
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className='w-4 h-4 text-zinc-400 flex-shrink-0' />
              ) : (
                <ChevronDown className='w-4 h-4 text-zinc-400 flex-shrink-0' />
              )}
            </button>
            {isOpen && (
              <div className='px-3 pb-3 pt-0 border-t border-zinc-800/50'>
                <p className='text-xs text-zinc-300 leading-relaxed mt-2'>
                  {insight.insight}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Determine the display timestamp for "When Pulled"
  const displayTimestamp = historicalTimestamp || readingCreatedAt;

  // If we have both current and historical, show tabs
  if (currentConnection && historicalConnection) {
    return (
      <div className='rounded-lg border border-lunary-primary-800/30 bg-lunary-primary-950/20 p-4'>
        <h4 className='text-sm font-medium text-lunary-accent-200 mb-4'>
          In Your Chart
        </h4>

        {/* Tab navigation */}
        <div className='flex gap-2 mb-4 border-b border-zinc-800'>
          <button
            onClick={() => {
              setActiveTab('current');
              setOpenAccordion(0); // Reset to first item
            }}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'current'
                ? 'border-lunary-primary-400 text-lunary-primary-200'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Clock className='w-3 h-3' />
              Right Now
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('historical');
              setOpenAccordion(0); // Reset to first item
            }}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'historical'
                ? 'border-lunary-primary-400 text-lunary-primary-200'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Calendar className='w-3 h-3' />
              When Pulled
              {displayTimestamp && (
                <span className='text-xs opacity-70'>
                  ({dayjs(displayTimestamp).fromNow()})
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'current' &&
          currentConnection.perTransitInsights &&
          renderInsights(currentConnection.perTransitInsights)}

        {activeTab === 'historical' &&
          historicalConnection.perTransitInsights &&
          renderInsights(historicalConnection.perTransitInsights)}

        {/* Comparison note */}
        <p className='text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-800'>
          Compare how the cosmic weather has shifted since you pulled this
          reading.
        </p>
      </div>
    );
  }

  // If only current connection, show it without tabs
  if (
    currentConnection?.perTransitInsights &&
    currentConnection.perTransitInsights.length > 0
  ) {
    return (
      <div className='rounded-lg border border-lunary-primary-800/30 bg-lunary-primary-950/20 p-4'>
        <h4 className='text-sm font-medium text-lunary-accent-200 mb-3'>
          In Your Chart Today
        </h4>
        {renderInsights(currentConnection.perTransitInsights)}
      </div>
    );
  }

  // Fallback to paragraph format if no per-transit insights
  return (
    <div className='rounded-lg border border-lunary-primary-800/30 bg-lunary-primary-950/20 p-4'>
      <h4 className='text-sm font-medium text-lunary-accent-200 mb-3'>
        In Your Chart Today
      </h4>
      <p className='text-sm text-zinc-300 leading-relaxed'>
        {currentConnection?.inDepth}
      </p>
    </div>
  );
}
