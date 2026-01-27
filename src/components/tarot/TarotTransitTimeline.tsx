'use client';

import React, { useEffect, useState } from 'react';
import type { BirthChartPlacement } from '@/context/UserContext';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import type { TransitAspect } from '@/features/horoscope/transitDetails';
import type { AstroChartInformation } from '../../../utils/astrology/astrology';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { generateTarotTransitConnection } from '@/lib/tarot/generate-transit-connection';
import type { TransitInsight } from '@/lib/tarot/generate-transit-connection';

dayjs.extend(relativeTime);

interface TarotTransitTimelineProps {
  // Saved transits from when the card was pulled
  historicalTransits?: TransitAspect[] | null;
  historicalTimestamp?: string | null;

  // Current user data for calculating current transits
  birthChart?: BirthChartPlacement[];
  currentTransits?: AstroChartInformation[];

  // Card name for context
  cardName?: string;

  // Weekly mode - show day-by-day evolution
  weeklyMode?: boolean;
}

const formatAspectName = (aspectType: string): string => {
  const names: Record<string, string> = {
    conjunction: 'conjunct',
    sextile: 'sextile',
    trine: 'trine',
    square: 'square',
    opposition: 'opposite',
  };
  return names[aspectType.toLowerCase()] || aspectType;
};

const getAspectColor = (aspectType: string): string => {
  const colors: Record<string, string> = {
    conjunction: 'text-lunary-primary-300',
    trine: 'text-emerald-400',
    sextile: 'text-lunary-accent-300',
    square: 'text-amber-400',
    opposition: 'text-rose-400',
  };
  return colors[aspectType.toLowerCase()] || 'text-zinc-400';
};

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

function TransitList({
  transits,
  title,
  timestamp,
  icon: Icon,
  insights,
}: {
  transits: TransitAspect[];
  title: string;
  timestamp?: string;
  icon?: React.ComponentType<{ className?: string }>;
  insights?: Array<{ insight: string; relevance: string }>;
}) {
  const [openAccordion, setOpenAccordion] = useState<number>(0);

  if (transits.length === 0) {
    return null;
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        {Icon && <Icon className='w-4 h-4 text-lunary-accent-300' />}
        <h4 className='text-sm font-medium text-lunary-accent-200'>{title}</h4>
        {timestamp && (
          <span className='text-xs text-zinc-500'>
            {dayjs(timestamp).fromNow()}
          </span>
        )}
      </div>

      <div className='space-y-2'>
        {transits.slice(0, 5).map((transit, idx) => {
          const orbRounded = Math.round(transit.orbDegrees * 10) / 10;
          const insight = insights?.[idx];
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
                <div className='flex-1'>
                  <div className='flex items-baseline gap-1.5'>
                    <span className='text-lunary-primary-200 font-medium'>
                      {transit.transitPlanet}
                    </span>
                    <span className={getAspectColor(transit.aspectType)}>
                      {formatAspectName(transit.aspectType)}
                    </span>
                    <span className='text-zinc-400'>
                      your {transit.natalPlanet}
                    </span>
                  </div>
                  <div className='text-xs text-zinc-600 mt-1'>
                    {renderDegreeWithSymbol(transit.transitDegree)}{' '}
                    {getAspectSymbol(transit.aspectType)}{' '}
                    {renderDegreeWithSymbol(transit.natalDegree)} ({orbRounded}°
                    orb)
                  </div>
                </div>
                {insight &&
                  (isOpen ? (
                    <ChevronUp className='w-4 h-4 text-zinc-400 flex-shrink-0 ml-2' />
                  ) : (
                    <ChevronDown className='w-4 h-4 text-zinc-400 flex-shrink-0 ml-2' />
                  ))}
              </button>
              {insight && isOpen && (
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
    </div>
  );
}

export function TarotTransitTimeline({
  historicalTransits,
  historicalTimestamp,
  birthChart,
  currentTransits: currentTransitsData,
  cardName,
  weeklyMode = false,
}: TarotTransitTimelineProps) {
  const [currentTransits, setCurrentTransits] = useState<
    TransitAspect[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [currentInsights, setCurrentInsights] = useState<TransitInsight[]>([]);
  const [historicalInsights, setHistoricalInsights] = useState<
    TransitInsight[]
  >([]);
  const [activeTab, setActiveTab] = useState<'current' | 'historical'>(
    'current',
  );

  useEffect(() => {
    async function processTransits() {
      if (!birthChart || !currentTransitsData) {
        setLoading(false);
        return;
      }

      try {
        const aspects = calculateTransitAspects(
          birthChart as any,
          currentTransitsData as any,
        );
        setCurrentTransits(aspects);

        // Generate insights for current transits if we have a card name
        if (cardName && aspects.length > 0) {
          const birthChartSnapshot = {
            date: '',
            time: '12:00',
            lat: 0,
            lon: 0,
            placements: birthChart.map((p: any) => ({
              planet: p.planet || p.body,
              sign: p.sign,
              house: p.house,
              degree: p.degree,
            })),
          };

          const connection = await generateTarotTransitConnection(
            cardName,
            birthChartSnapshot,
            aspects,
          );

          if (connection?.perTransitInsights) {
            setCurrentInsights(connection.perTransitInsights);
          }
        }

        // Generate insights for historical transits if available
        if (cardName && historicalTransits && historicalTransits.length > 0) {
          const birthChartSnapshot = {
            date: '',
            time: '12:00',
            lat: 0,
            lon: 0,
            placements: birthChart.map((p: any) => ({
              planet: p.planet || p.body,
              sign: p.sign,
              house: p.house,
              degree: p.degree,
            })),
          };

          const connection = await generateTarotTransitConnection(
            cardName,
            birthChartSnapshot,
            historicalTransits as TransitAspect[],
          );

          if (connection?.perTransitInsights) {
            setHistoricalInsights(connection.perTransitInsights);
          }
        }
      } catch (err) {
        console.error('Failed to calculate current transits:', err);
      } finally {
        setLoading(false);
      }
    }

    processTransits();
  }, [birthChart, currentTransitsData, cardName, historicalTransits]);

  // Don't show if we have no data
  if (!historicalTransits && !currentTransits) {
    return null;
  }

  // Weekly mode - show day-by-day evolution
  if (weeklyMode && cardName && historicalTransits) {
    return (
      <div className='mt-6 rounded-lg border border-lunary-primary-800/30 bg-lunary-primary-950/20 p-4'>
        <h3 className='text-sm font-medium text-lunary-accent-200 mb-4'>
          How {cardName} Evolves This Week
        </h3>
        <p className='text-xs text-zinc-400 mb-4'>
          The transits shift daily, creating different flavors of this card's
          message throughout the week.
        </p>

        <div className='space-y-6'>
          {/* Historical transits when pulled */}
          {historicalTransits && historicalTimestamp && (
            <TransitList
              transits={historicalTransits}
              title='When Drawn'
              timestamp={historicalTimestamp}
              icon={Calendar}
              insights={historicalInsights}
            />
          )}

          {/* Current transits */}
          {currentTransits && (
            <TransitList
              transits={currentTransits}
              title='Right Now'
              icon={Clock}
              insights={currentInsights}
            />
          )}
        </div>

        {historicalTransits && currentTransits && (
          <p className='text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-800'>
            Notice how the aspects have shifted since you drew this card. The
            core message remains, but the cosmic weather colors how you
            experience it today.
          </p>
        )}
      </div>
    );
  }

  // Standard display with tabs for spread modal
  return (
    <div className='mt-6'>
      {/* Tab navigation */}
      <div className='flex gap-2 mb-4 border-b border-zinc-800'>
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'current'
              ? 'border-lunary-primary-400 text-lunary-primary-200'
              : 'border-transparent text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <div className='flex items-center gap-2'>
            <Clock className='w-4 h-4' />
            Current Transits
          </div>
        </button>
        {historicalTransits && historicalTimestamp && (
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'historical'
                ? 'border-lunary-primary-400 text-lunary-primary-200'
                : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              When Pulled
              {historicalTimestamp && (
                <span className='text-xs opacity-70'>
                  ({dayjs(historicalTimestamp).fromNow()})
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'current' && (
        <>
          {loading ? (
            <div className='rounded-lg border border-zinc-800/30 bg-zinc-900/30 p-4'>
              <div className='flex items-center gap-2 text-xs text-zinc-500'>
                <div className='w-3 h-3 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin' />
                <span>Calculating current transits...</span>
              </div>
            </div>
          ) : currentTransits ? (
            <div className='rounded-lg border border-lunary-primary-800/30 bg-lunary-primary-950/20 p-4'>
              <TransitList
                transits={currentTransits}
                title='Right Now'
                icon={Clock}
                insights={currentInsights}
              />
            </div>
          ) : (
            <div className='rounded-lg border border-zinc-800/30 bg-zinc-900/30 p-4'>
              <p className='text-sm text-zinc-400'>
                No current transit data available.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'historical' && historicalTransits && (
        <div className='rounded-lg border border-zinc-800/30 bg-zinc-900/30 p-4'>
          <TransitList
            transits={historicalTransits}
            title='When Drawn'
            timestamp={historicalTimestamp || undefined}
            icon={Calendar}
            insights={historicalInsights}
          />
        </div>
      )}

      {/* Comparison note */}
      {historicalTransits && currentTransits && (
        <p className='text-xs text-zinc-500 mt-4'>
          Switch between tabs to compare how the cosmic weather has shifted
          since you pulled this spread.
        </p>
      )}
    </div>
  );
}
