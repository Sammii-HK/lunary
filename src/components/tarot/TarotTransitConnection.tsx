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
import { Collapse } from '@/components/ui/Collapse';

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
  onReadMore?: () => void;
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
  onReadMore,
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

        // Generate current transit insights. Overview cards show only the
        // tightest aspect; full card sheets keep the broader list.
        const calculatedCurrentAspects = calculateTransitAspects(
          birthChart as any,
          currentTransits as any,
        );
        const currentAspects =
          variant === 'compact'
            ? [...calculatedCurrentAspects]
                .sort(
                  (a: any, b: any) =>
                    (a.orbDegrees ?? Number.POSITIVE_INFINITY) -
                    (b.orbDegrees ?? Number.POSITIVE_INFINITY),
                )
                .slice(0, 1)
            : calculatedCurrentAspects;

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
    variant,
  ]);

  if (loading) {
    return (
      <div className='mt-4 pt-4 border-t border-stroke-subtle'>
        <div className='flex items-center gap-2 text-xs text-content-muted'>
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
      <div className='mt-4 pt-4 border-t border-stroke-subtle'>
        <p className='text-xs text-content-brand-accent leading-relaxed'>
          {currentConnection?.compact}
        </p>
        {onReadMore && (
          <button
            type='button'
            onClick={onReadMore}
            className='mt-2 text-xs font-medium text-content-brand transition-colors hover:text-content-secondary'
          >
            Click to read more
          </button>
        )}
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
    <div className='space-y-2 mt-2'>
      {insights.slice(0, 3).map((insight, idx) => {
        const isOpen = openAccordion === idx;
        return (
          <div
            key={idx}
            className='rounded-md border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden'
          >
            <button
              onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
              className='w-full flex items-center justify-between p-3 text-left hover:bg-surface-elevated/50 transition-colors'
            >
              <div className='flex flex-col gap-1 flex-1'>
                <div className='flex items-center gap-2 justify-between'>
                  <span className='text-xs font-medium text-content-secondary'>
                    {insight.transit.transitPlanet} {insight.transit.aspectType}{' '}
                    {insight.transit.natalPlanet}
                  </span>
                  <span className='text-xs text-content-brand-accent mr-2'>
                    {insight.relevance}
                  </span>
                </div>
                <p className='text-xs text-content-muted'>
                  {renderDegreeWithSymbol(insight.transit.transitDegree)}{' '}
                  {getAspectSymbol(insight.transit.aspectType)}{' '}
                  {renderDegreeWithSymbol(insight.transit.natalDegree)} (
                  {Math.round(insight.transit.orbDegrees * 10) / 10}° orb)
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className='w-4 h-4 text-content-muted flex-shrink-0' />
              ) : (
                <ChevronDown className='w-4 h-4 text-content-muted flex-shrink-0' />
              )}
            </button>
            <Collapse isOpen={isOpen}>
              <div className='px-3 pb-3 pt-0 border-t border-stroke-subtle/50'>
                <p className='text-xs text-content-secondary leading-relaxed mt-2'>
                  {insight.insight}
                </p>
              </div>
            </Collapse>
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
      <div>
        {/* Tab navigation */}
        <div className='flex gap-2 mb-4 border-b border-stroke-subtle'>
          <button
            onClick={() => {
              setActiveTab('current');
              setOpenAccordion(0); // Reset to first item
            }}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'current'
                ? 'border-lunary-primary-400 text-content-secondary'
                : 'border-transparent text-content-muted hover:text-content-secondary'
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
                ? 'border-lunary-primary-400 text-content-secondary'
                : 'border-transparent text-content-muted hover:text-content-secondary'
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
        <p className='text-xs text-content-muted mt-4 pt-4 border-t border-stroke-subtle'>
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
    return renderInsights(currentConnection.perTransitInsights);
  }

  // Fallback to paragraph format if no per-transit insights
  return (
    <p className='text-sm text-content-secondary leading-relaxed'>
      {currentConnection?.inDepth}
    </p>
  );
}
