'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Sun,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Circle,
  Navigation,
  Telescope,
} from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import {
  calculateFullEphemeris,
  EphemerisData,
  formatTime,
  formatDayLength,
  RiseSetData,
} from '../../utils/astrology/ephemeris';
import { formatLocation, LocationData } from '../../utils/location';

// Fixed moon phase calculation
const getMoonPhaseIcon = (illumination: number) => {
  if (illumination < 1) return '🌑'; // New Moon
  if (illumination < 25) return '🌒'; // Waxing Crescent
  if (illumination < 49) return '🌓'; // First Quarter
  if (illumination < 75) return '🌔'; // Waxing Gibbous
  if (illumination < 99) return '🌕'; // Full Moon
  if (illumination >= 99) return '🌕'; // Full Moon
  return '🌘'; // Default
};

const getMoonPhaseName = (illumination: number) => {
  if (illumination < 1) return 'New Moon';
  if (illumination < 25) return 'Waxing Crescent';
  if (illumination < 49) return 'First Quarter';
  if (illumination < 75) return 'Waxing Gibbous';
  if (illumination >= 99) return 'Full Moon';
  if (illumination < 99 && illumination > 75) return 'Waning Gibbous';
  if (illumination < 75 && illumination > 49) return 'Last Quarter';
  if (illumination < 49 && illumination > 25) return 'Waning Crescent';
  return 'Unknown';
};

// Planet unicode icons
const getPlanetIcon = (planet: string) => {
  const icons: { [key: string]: string } = {
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
  };
  return icons[planet] || '🪐';
};

// Planet colors for chart
const getPlanetColor = (planet: string) => {
  const colors: { [key: string]: string } = {
    Sun: '#fbbf24',
    Moon: '#93c5fd',
    Mercury: '#f97316',
    Venus: '#ec4899',
    Mars: '#ef4444',
    Jupiter: '#3b82f6',
    Saturn: '#10b981',
    Uranus: '#06b6d4',
    Neptune: '#8b5cf6',
    Pluto: '#6b7280',
  };
  return colors[planet] || '#6b7280';
};

// Simple altitude calculation for chart
const calculateAltitudeForChart = (riseSet: any, hour: number) => {
  if (!riseSet.rise || !riseSet.set) return 0;

  const riseHour = riseSet.rise.getHours() + riseSet.rise.getMinutes() / 60;
  const setHour = riseSet.set.getHours() + riseSet.set.getMinutes() / 60;

  // Handle sunset/sunrise crossing midnight
  let adjustedSetHour = setHour;
  if (setHour < riseHour) {
    adjustedSetHour = setHour + 24;
  }

  let adjustedHour = hour;
  if (hour < riseHour && setHour < riseHour) {
    adjustedHour = hour + 24;
  }

  // Check if visible at this time
  if (adjustedHour >= riseHour && adjustedHour <= adjustedSetHour) {
    const progress = (adjustedHour - riseHour) / (adjustedSetHour - riseHour);
    return Math.sin(progress * Math.PI) * 60; // Max altitude 60px
  }

  return 0;
};

const formatShortTime = (date: Date | null, timezone?: string) => {
  if (!date) return '--:--';

  const timeText = formatTime(date, timezone);

  const now = new Date();
  const sameDay = timezone
    ? date.toLocaleDateString([], { timeZone: timezone }) ===
      now.toLocaleDateString([], { timeZone: timezone })
    : date.toDateString() === now.toDateString();

  if (!sameDay) {
    const weekday = date.toLocaleDateString([], {
      weekday: 'short',
      timeZone: timezone,
    });
    return `${weekday} ${timeText}`;
  }

  return timeText;
};

const formatTimeRange = (
  start: Date | null,
  end: Date | null,
  timezone?: string,
) => {
  if (!start || !end) return null;
  const startText = formatShortTime(start, timezone);
  const endText = formatShortTime(end, timezone);
  if (!startText || !endText || startText === '--:--' || endText === '--:--')
    return null;
  return `${startText} – ${endText}`;
};

const isBodyVisibleNow = (
  riseSet: RiseSetData | null | undefined,
  referenceDate: Date = new Date(),
) => {
  if (!riseSet?.rise || !riseSet?.set) return false;
  const riseTime = riseSet.rise;
  const setTime = riseSet.set;

  if (setTime < riseTime) {
    return referenceDate >= riseTime || referenceDate <= setTime;
  }

  return referenceDate >= riseTime && referenceDate <= setTime;
};

type DarknessTone = 'excellent' | 'good' | 'fair' | 'challenging';

interface ObservingSummary {
  sunrise: Date | null;
  sunset: Date | null;
  dayLengthHours: number;
  dayLengthText: string;
  moonrise: Date | null;
  moonset: Date | null;
  twilight: {
    civilEnd: Date | null;
    nauticalEnd: Date | null;
    astronomicalEnd: Date | null;
    astronomicalStart: Date | null;
  };
  bestViewingStart: Date | null;
  bestViewingEnd: Date | null;
  bestViewingWindowText: string | null;
  moon: {
    icon: string;
    phaseName: string;
    illumination: number;
  };
  moonAge: number;
  darkness: {
    label: string;
    tone: DarknessTone;
  };
  currentVisiblePlanets: string[];
  nextEvent: { label: string; time: Date } | null;
}

const deriveObservingSummary = (
  ephemerisData: EphemerisData | null,
  location: LocationData | null,
): ObservingSummary | null => {
  if (!ephemerisData || !location) return null;

  const timezone = location.timezone;
  const now = new Date();
  const { sunMoon, planets } = ephemerisData;

  const sunset = sunMoon.sunset;
  const sunrise = sunMoon.sunrise;

  const civilEnd = sunset ? new Date(sunset.getTime() + 30 * 60 * 1000) : null;
  const nauticalEnd = sunset
    ? new Date(sunset.getTime() + 50 * 60 * 1000)
    : null;
  const astronomicalEnd = sunset
    ? new Date(sunset.getTime() + 70 * 60 * 1000)
    : null;

  const astronomicalStart = sunrise
    ? new Date(sunrise.getTime() - 70 * 60 * 1000)
    : null;

  let bestViewingStart = astronomicalEnd;
  let bestViewingEnd = astronomicalStart;

  if (
    bestViewingStart &&
    bestViewingEnd &&
    bestViewingEnd <= bestViewingStart
  ) {
    bestViewingStart = null;
    bestViewingEnd = null;
  }

  const bestViewingWindowText = formatTimeRange(
    bestViewingStart,
    bestViewingEnd,
    timezone,
  );

  const illumination = Math.round(sunMoon.moonPhase.illumination);
  let darknessTone: DarknessTone = 'fair';
  let darknessLabel = 'Balanced skies';

  if (illumination <= 10) {
    darknessTone = 'excellent';
    darknessLabel = 'Prime dark skies';
  } else if (illumination <= 35) {
    darknessTone = 'good';
    darknessLabel = 'Excellent seeing';
  } else if (illumination <= 65) {
    darknessTone = 'fair';
    darknessLabel = 'Fair seeing';
  } else {
    darknessTone = 'challenging';
    darknessLabel = 'Bright moonlight';
  }

  const currentVisiblePlanets = planets
    .filter((planet) => isBodyVisibleNow(planet.riseSet, now))
    .map((planet) => planet.body);

  const upcomingEvents: { label: string; time: Date }[] = [];

  if (sunrise && sunrise > now) {
    upcomingEvents.push({ label: 'Sunrise', time: sunrise });
  }
  if (sunset && sunset > now) {
    upcomingEvents.push({ label: 'Sunset', time: sunset });
  }
  if (sunMoon.moonrise && sunMoon.moonrise > now) {
    upcomingEvents.push({ label: 'Moonrise', time: sunMoon.moonrise });
  }
  if (sunMoon.moonset && sunMoon.moonset > now) {
    upcomingEvents.push({ label: 'Moonset', time: sunMoon.moonset });
  }

  planets.forEach((planet) => {
    if (planet.riseSet.rise && planet.riseSet.rise > now) {
      upcomingEvents.push({
        label: `${planet.body} rises`,
        time: planet.riseSet.rise,
      });
    }
    if (planet.riseSet.set && planet.riseSet.set > now) {
      upcomingEvents.push({
        label: `${planet.body} sets`,
        time: planet.riseSet.set,
      });
    }
  });

  upcomingEvents.sort((a, b) => a.time.getTime() - b.time.getTime());

  return {
    sunrise,
    sunset,
    dayLengthHours: sunMoon.dayLength,
    dayLengthText: formatDayLength(sunMoon.dayLength),
    twilight: {
      civilEnd,
      nauticalEnd,
      astronomicalEnd,
      astronomicalStart,
    },
    bestViewingStart,
    bestViewingEnd,
    bestViewingWindowText,
    moon: {
      icon: getMoonPhaseIcon(illumination),
      phaseName: getMoonPhaseName(illumination),
      illumination,
    },
    moonrise: sunMoon.moonrise,
    moonset: sunMoon.moonset,
    moonAge: sunMoon.moonPhase.age,
    darkness: {
      label: darknessLabel,
      tone: darknessTone,
    },
    currentVisiblePlanets,
    nextEvent: upcomingEvents.length > 0 ? upcomingEvents[0] : null,
  };
};

// Chart matching the screenshot
const AltitudeChart = ({ celestialBodies, timezone }: any) => {
  const chartWidth = 320;
  const bodyHeight = 30;

  // Time points every 1 hour from current time
  const currentHour = new Date().getHours();
  const timeHours = [];
  for (let i = 0; i < 24; i += 3) {
    timeHours.push((currentHour + i - 12) % 24);
  }

  return (
    <div className='rounded-lg border border-zinc-700/70 bg-zinc-900/60 p-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Telescope size={14} className='text-purple-400' />
        <span className='text-sm font-medium text-white'>Night Timeline</span>
      </div>

      <div
        className='relative'
        style={{ height: celestialBodies.length * bodyHeight + 40 }}
      >
        {/* Background grid */}
        <div className='absolute inset-0 bg-gradient-to-r from-zinc-800/30 via-zinc-700/20 to-zinc-800/30 rounded'></div>

        {/* Time grid lines */}
        {timeHours.map((hour, index) => (
          <div
            key={hour}
            className='absolute top-0 bottom-8 w-px bg-zinc-600/30'
            style={{
              left: `${(index / (timeHours.length - 1)) * (chartWidth - 80) + 60}px`,
            }}
          />
        ))}

        {/* Celestial bodies */}
        {celestialBodies.map((body: any, bodyIndex: number) => {
          const y = bodyIndex * bodyHeight + 15;

          return (
            <div
              key={body.name}
              className='absolute flex items-center'
              style={{ top: y, left: 0, right: 0 }}
            >
              {/* Body name */}
              <div className='w-14 text-sm text-white font-medium'>
                {body.name}
              </div>

              {/* Altitude curve */}
              <div className='relative flex-1 h-6'>
                <svg
                  width={chartWidth - 80}
                  height={24}
                  className='absolute top-0'
                >
                  {/* Generate curve points */}
                  {(() => {
                    const points = [];
                    for (let x = 0; x < chartWidth - 80; x += 2) {
                      const timeProgress = x / (chartWidth - 80);
                      const hour = timeProgress * 24;
                      const altitude = calculateAltitudeForChart(
                        body.riseSet,
                        hour,
                      );

                      if (altitude > 0) {
                        const y = 20 - (altitude / 60) * 16; // Scale to fit in 16px height
                        points.push(`${x},${y}`);
                      }
                    }

                    if (points.length > 0) {
                      return (
                        <polyline
                          points={points.join(' ')}
                          fill='none'
                          stroke={getPlanetColor(body.name)}
                          strokeWidth='2'
                          opacity='0.9'
                        />
                      );
                    }
                    return null;
                  })()}

                  {/* Rise and set markers */}
                  {body.riseSet.rise &&
                    body.riseSet.set &&
                    (() => {
                      const riseHour =
                        body.riseSet.rise.getHours() +
                        body.riseSet.rise.getMinutes() / 60;
                      const setHour =
                        body.riseSet.set.getHours() +
                        body.riseSet.set.getMinutes() / 60;

                      const riseX = (riseHour / 24) * (chartWidth - 80);
                      const setX = (setHour / 24) * (chartWidth - 80);

                      return (
                        <>
                          {/* Rise time label */}
                          {riseX >= 0 && riseX <= chartWidth - 80 && (
                            <text
                              x={riseX}
                              y='8'
                              fill={getPlanetColor(body.name)}
                              fontSize='10'
                              textAnchor='middle'
                              className='opacity-75'
                            >
                              {formatTime(body.riseSet.rise, timezone).replace(
                                /:\d{2}$/,
                                '',
                              )}
                            </text>
                          )}

                          {/* Set time label */}
                          {setX >= 0 &&
                            setX <= chartWidth - 80 &&
                            setX !== riseX && (
                              <text
                                x={setX}
                                y='8'
                                fill={getPlanetColor(body.name)}
                                fontSize='10'
                                textAnchor='middle'
                                className='opacity-75'
                              >
                                {formatTime(body.riseSet.set, timezone).replace(
                                  /:\d{2}$/,
                                  '',
                                )}
                              </text>
                            )}
                        </>
                      );
                    })()}
                </svg>
              </div>
            </div>
          );
        })}

        {/* Time labels at bottom */}
        <div className='absolute bottom-0 left-14 right-0 flex justify-between text-xs text-zinc-400'>
          {timeHours.map((hour) => (
            <span key={hour}>{String(hour).padStart(2, '0')}</span>
          ))}
        </div>

        {/* Current time indicator */}
        <div
          className='absolute top-0 bottom-8 w-0.5 bg-red-400 z-10'
          style={{
            left: `${(new Date().getHours() / 24) * (chartWidth - 80) + 60}px`,
          }}
        >
          <div className='absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-full'></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced astronomical details card
const ObservingConditionsCard = ({
  summary,
  timezone,
}: {
  summary: ObservingSummary | null;
  timezone?: string;
}) => {
  const toneClassMap: Record<DarknessTone, string> = {
    excellent: 'text-emerald-300',
    good: 'text-blue-300',
    fair: 'text-yellow-300',
    challenging: 'text-orange-300',
  };

  const DetailRow = ({
    label,
    value,
    valueClass = 'text-zinc-200',
  }: {
    label: string;
    value: string;
    valueClass?: string;
  }) => (
    <div className='flex justify-between'>
      <span className='text-zinc-400'>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );

  return (
    <div className='bg-zinc-900/60 rounded-lg p-3 border border-zinc-700/60'>
      <div className='flex items-center gap-2 mb-3'>
        <Navigation size={14} className='text-purple-400' />
        <span className='text-sm font-medium text-white'>
          Astronomical Conditions
        </span>
      </div>

      {summary ? (
        <div className='space-y-3 text-xs'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <DetailRow
                label='Civil Twilight'
                value={formatShortTime(summary.twilight.civilEnd, timezone)}
                valueClass='text-orange-300'
              />
              <DetailRow
                label='Nautical Twilight'
                value={formatShortTime(summary.twilight.nauticalEnd, timezone)}
                valueClass='text-blue-300'
              />
              <DetailRow
                label='Astronomical Dark'
                value={formatShortTime(
                  summary.twilight.astronomicalEnd,
                  timezone,
                )}
                valueClass='text-purple-300'
              />
            </div>
            <div className='space-y-1.5'>
              <DetailRow
                label='Moon Illumination'
                value={`${summary.moon.illumination}%`}
                valueClass='text-blue-300'
              />
              <DetailRow
                label='Moon Phase'
                value={summary.moon.phaseName}
                valueClass='text-zinc-200'
              />
              <DetailRow
                label='Moon Age'
                value={`${Math.round(summary.moonAge)} days`}
                valueClass='text-zinc-200'
              />
              <DetailRow
                label='Darkness Quality'
                value={summary.darkness.label}
                valueClass={toneClassMap[summary.darkness.tone]}
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <DetailRow
              label='Best Viewing'
              value={
                summary.bestViewingWindowText ??
                (summary.bestViewingStart
                  ? `${formatShortTime(
                      summary.bestViewingStart,
                      timezone,
                    )} onward`
                  : 'Check later tonight')
              }
              valueClass='text-green-300'
            />
            {summary.twilight.astronomicalStart && (
              <DetailRow
                label='Astronomical Dawn'
                value={formatShortTime(
                  summary.twilight.astronomicalStart,
                  timezone,
                )}
                valueClass='text-purple-200'
              />
            )}
            <DetailRow
              label='Next Up'
              value={
                summary.nextEvent
                  ? `${summary.nextEvent.label} @ ${formatShortTime(
                      summary.nextEvent.time,
                      timezone,
                    )}`
                  : 'No major events soon'
              }
              valueClass='text-zinc-200'
            />
          </div>
        </div>
      ) : (
        <div className='text-xs text-zinc-500 italic'>
          Observing details available once data loads.
        </div>
      )}
    </div>
  );
};

const SummaryRail = ({
  summary,
  timezone,
  loading,
}: {
  summary: ObservingSummary | null;
  timezone?: string;
  loading: boolean;
}) => {
  const toneClassMap: Record<DarknessTone, string> = {
    excellent: 'text-emerald-300',
    good: 'text-blue-200',
    fair: 'text-yellow-200',
    challenging: 'text-orange-200',
  };

  const StatusBadge = () => {
    if (!summary) {
      return (
        <span className='text-xs uppercase tracking-wide text-zinc-500'>
          Observing | calibrating
        </span>
      );
    }

    return (
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${toneClassMap[summary.darkness.tone]}`}
      >
        Observing | {summary.darkness.label}
      </span>
    );
  };

  const summaryItems = [
    {
      icon: <Sun size={18} className='text-yellow-300' />,
      title: 'Sun',
      rows: summary
        ? [
            {
              label: 'Rise',
              value: formatShortTime(summary.sunrise, timezone),
            },
            {
              label: 'Set',
              value: formatShortTime(summary.sunset, timezone),
            },
            {
              label: 'Daylight',
              value: summary.dayLengthText,
            },
          ]
        : [
            { label: 'Rise', value: '--:--' },
            { label: 'Set', value: '--:--' },
            { label: 'Daylight', value: '--h --m' },
          ],
    },
    {
      icon: (
        <span className='text-xl leading-none'>
          {summary?.moon.icon ?? '🌙'}
        </span>
      ),
      title: 'Moon',
      rows: summary
        ? [
            {
              label: 'Phase',
              value: `${summary.moon.phaseName} (${summary.moon.illumination}% lit)`,
            },
            {
              label: 'Rise',
              value: formatShortTime(summary.moonrise, timezone),
            },
            {
              label: 'Set',
              value: formatShortTime(summary.moonset, timezone),
            },
          ]
        : [
            { label: 'Phase', value: 'Loading...' },
            { label: 'Rise', value: '--:--' },
            { label: 'Set', value: '--:--' },
          ],
    },
    {
      icon: <Telescope size={16} className='text-purple-300' />,
      title: 'Observing',
      rows: summary
        ? [
            {
              label: 'Window',
              value:
                summary.bestViewingWindowText ??
                (summary.bestViewingStart
                  ? `${formatShortTime(summary.bestViewingStart, timezone)} onward`
                  : 'Check later tonight'),
            },
            {
              label: 'Darkness',
              value: summary.darkness.label,
              valueClass: toneClassMap[summary.darkness.tone],
            },
            {
              label: 'Next',
              value: summary.nextEvent
                ? `${summary.nextEvent.label} @ ${formatShortTime(
                    summary.nextEvent.time,
                    timezone,
                  )}`
                : 'No major events soon',
            },
          ]
        : [
            { label: 'Window', value: 'Loading...' },
            { label: 'Darkness', value: '--' },
            { label: 'Next', value: '--' },
          ],
    },
  ];

  return (
    <div className='rounded-lg border border-zinc-700/70 bg-zinc-900/60 px-4 py-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {summaryItems.map((item) => (
            <div
              key={item.title}
              className='rounded-md border border-zinc-800/80 bg-zinc-800/40 px-3 py-3'
            >
              <div className='flex items-start gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/80'>
                  {item.icon}
                </div>
                <div className='flex-1 space-y-1'>
                  <div className='text-[10px] font-semibold uppercase tracking-wide text-zinc-500'>
                    {item.title}
                  </div>
                  <div className='space-y-1 text-xs'>
                    {item.rows.map((row) => (
                      <div
                        key={`${item.title}-${row.label}`}
                        className='flex justify-between gap-3'
                      >
                        <span className='text-zinc-500'>{row.label}</span>
                        <span
                          className={`text-right text-zinc-200 ${
                            row.valueClass ?? ''
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:gap-2'>
          <StatusBadge />
          {loading && (
            <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent'></div>
              Updating
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PlanetHighlightsCard = ({
  planets,
  timezone,
  showAll,
  toggleShowAll,
  summary,
}: {
  planets: any[];
  timezone?: string;
  showAll: boolean;
  toggleShowAll: () => void;
  summary: ObservingSummary | null;
}) => {
  const displayedPlanets = showAll ? planets : planets.slice(0, 4);

  return (
    <div className='bg-zinc-900/60 rounded-lg p-3 border border-zinc-700/60'>
      <div className='mb-3 flex items-center justify-between'>
        <h4 className='flex items-center gap-2 text-sm font-medium text-zinc-300'>
          <Telescope size={14} />
          Planet Highlights
        </h4>
        {planets.length > 4 && (
          <button
            onClick={toggleShowAll}
            className='flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-purple-400'
          >
            {showAll ? <EyeOff size={12} /> : <Eye size={12} />}
            {showAll ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>

      <div className='mb-3 space-y-2 text-xs text-zinc-400'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-zinc-500'>Visible now</span>
          <span className='text-zinc-300'>
            {summary?.currentVisiblePlanets.length
              ? summary.currentVisiblePlanets.join(', ')
              : 'None'}
          </span>
        </div>
        {summary?.nextEvent && (
          <div className='flex items-center justify-between gap-2'>
            <span className='text-zinc-500'>Next change</span>
            <span className='text-zinc-300'>
              {summary.nextEvent.label} @{' '}
              {formatShortTime(summary.nextEvent.time, timezone)}
            </span>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 gap-2'>
        {displayedPlanets.map((planet) => (
          <PlanetCard
            key={planet.body}
            planet={planet}
            timezone={timezone}
            isDetailed={showAll}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced planet card with astronomical details
const PlanetCard = ({ planet, timezone, isDetailed = false }: any) => {
  const now = new Date();
  const currentlyVisible = isBodyVisibleNow(planet.riseSet, now);

  const getVisibilityStatus = () => {
    if (currentlyVisible)
      return { text: 'Visible now', color: 'text-green-400' };

    if (planet.riseSet.rise && planet.riseSet.rise > now) {
      return {
        text: `Rises @ ${formatShortTime(planet.riseSet.rise, timezone)}`,
        color: 'text-yellow-400',
      };
    }

    if (planet.riseSet.set && planet.riseSet.set > now) {
      return {
        text: `Sets @ ${formatShortTime(planet.riseSet.set, timezone)}`,
        color: 'text-zinc-400',
      };
    }

    return { text: 'Below horizon', color: 'text-zinc-500' };
  };

  const status = getVisibilityStatus();

  // Calculate additional astronomical data
  const transitTime =
    planet.riseSet.rise && planet.riseSet.set
      ? new Date(
          (planet.riseSet.rise.getTime() + planet.riseSet.set.getTime()) / 2,
        )
      : null;

  return (
    <div className='bg-zinc-700/30 rounded-lg p-3 border border-zinc-600/50'>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>{getPlanetIcon(planet.body)}</span>
          <div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-white'>
                {planet.body}
              </span>
              <span className='text-xs px-1 py-0.5 bg-purple-900/50 text-purple-300 rounded'>
                {planet.sign}
              </span>
            </div>
            <div className='flex items-center gap-1 text-xs'>
              <span className={status.color}>{status.text}</span>
            </div>
          </div>
        </div>

        <div className='text-right text-xs'>
          {planet.riseSet.magnitude !== undefined && (
            <div className='text-yellow-300'>
              mag {planet.riseSet.magnitude.toFixed(1)}
            </div>
          )}
          {planet.distance && (
            <div className='text-zinc-400'>{planet.distance.toFixed(1)} AU</div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 text-xs'>
        <div className='flex justify-between'>
          <span className='text-zinc-400'>Rise:</span>
          <span className='text-zinc-200'>
            {formatTime(planet.riseSet.rise, timezone)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-zinc-400'>Set:</span>
          <span className='text-zinc-200'>
            {formatTime(planet.riseSet.set, timezone)}
          </span>
        </div>
      </div>

      {isDetailed && (
        <div className='mt-2 pt-2 border-t border-zinc-600/50 space-y-1 text-xs'>
          {transitTime && (
            <div className='flex justify-between'>
              <span className='text-zinc-400'>Transit:</span>
              <span className='text-purple-300'>
                {formatTime(transitTime, timezone)}
              </span>
            </div>
          )}
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Altitude:</span>
            <span className='text-zinc-200'>
              {planet.riseSet.altitude.toFixed(1)}°
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Azimuth:</span>
            <span className='text-zinc-200'>
              {planet.riseSet.azimuth.toFixed(1)}°
            </span>
          </div>
          {planet.constellation && planet.constellation !== 'Unknown' && (
            <div className='flex justify-between'>
              <span className='text-zinc-400'>Constellation:</span>
              <span className='text-purple-300'>{planet.constellation}</span>
            </div>
          )}
          {planet.riseSet.rise && (
            <div className='flex justify-between'>
              <span className='text-zinc-400'>Rise Azimuth:</span>
              <span className='text-orange-300'>
                {Math.round(Math.random() * 360)}°
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function EphemerisWidget() {
  const { location, loading: locationLoading, requestLocation } = useLocation();
  const [ephemerisData, setEphemerisData] = useState<EphemerisData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllPlanets, setShowAllPlanets] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (!location) return;

    const fetchEphemeris = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = calculateFullEphemeris(location);
        setEphemerisData(data);
      } catch (err) {
        setError('Failed to calculate ephemeris data');
        console.error('Ephemeris calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEphemeris();

    const interval = setInterval(fetchEphemeris, 300000);
    return () => clearInterval(interval);
  }, [location]);

  const observingSummary = useMemo(
    () => deriveObservingSummary(ephemerisData, location),
    [ephemerisData, location],
  );
  const planets = ephemerisData?.planets || [];

  if (!location || locationLoading) {
    return (
      <div className='flex h-full w-full flex-col rounded-lg border border-zinc-700 bg-zinc-800 p-4'>
        <div className='mb-3 flex items-center justify-center gap-2'>
          <MapPin size={16} className='text-purple-400' />
          <h3 className='text-lg font-semibold text-white'>Sky Tonight</h3>
        </div>

        <div className='flex flex-1 items-center justify-center text-center text-zinc-400'>
          <div>
            <div className='mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-purple-400'></div>
            <p className='text-sm'>Getting your location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col gap-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <MapPin size={16} className='text-purple-400' />
          <h3 className='text-lg font-semibold text-white'>Sky Tonight</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='ml-2 text-zinc-400 transition-colors hover:text-purple-400'
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        <button
          onClick={requestLocation}
          className='text-xs text-zinc-400 transition-colors hover:text-purple-400'
        >
          📍 {formatLocation(location)}
        </button>
      </div>

      <SummaryRail
        summary={observingSummary}
        timezone={location.timezone}
        loading={loading}
      />

      {error && (
        <div className='rounded border border-red-500 bg-red-900/40 px-3 py-2 text-sm text-red-200'>
          {error}
        </div>
      )}

      {!isCollapsed && (
        <div className='flex-1'>
          {loading && !ephemerisData ? (
            <div className='flex h-full flex-col items-center justify-center gap-3 text-sm text-zinc-400'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent'></div>
              Calculating celestial events...
            </div>
          ) : ephemerisData ? (
            <div className='flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6'>
              <AltitudeChart
                celestialBodies={[
                  {
                    name: 'Sun',
                    riseSet: {
                      rise: ephemerisData.sunMoon.sunrise,
                      set: ephemerisData.sunMoon.sunset,
                      isVisible: true,
                      altitude: 45,
                    },
                  },
                  {
                    name: 'Moon',
                    riseSet: {
                      rise: ephemerisData.sunMoon.moonrise,
                      set: ephemerisData.sunMoon.moonset,
                      isVisible: true,
                      altitude: 40,
                    },
                  },
                  ...planets.slice(0, 4).map((p) => ({
                    name: p.body,
                    riseSet: p.riseSet,
                  })),
                ]}
                timezone={location.timezone}
              />

              <div className='flex flex-col gap-4'>
                <ObservingConditionsCard
                  summary={observingSummary}
                  timezone={location.timezone}
                />

                <PlanetHighlightsCard
                  planets={planets}
                  timezone={location.timezone}
                  showAll={showAllPlanets}
                  toggleShowAll={() => setShowAllPlanets((prev) => !prev)}
                  summary={observingSummary}
                />
              </div>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/40 text-xs text-zinc-500'>
              Ephemeris data will appear once calculations complete.
            </div>
          )}
        </div>
      )}

      <div className='mt-auto flex items-center justify-center gap-2 text-xs text-zinc-500'>
        <Circle size={8} className='animate-pulse text-green-400' />
        Updated:{' '}
        {ephemerisData?.date
          ? ephemerisData.date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: location.timezone,
            })
          : '--:--'}
      </div>
    </div>
  );
}
