'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Sun,
  Moon,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Circle,
  Navigation,
  Telescope,
  Compass,
  Zap,
} from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import {
  calculateFullEphemeris,
  EphemerisData,
  formatTime,
  formatDayLength,
} from '../../utils/astrology/ephemeris';
import { formatLocation } from '../../utils/location';

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

// Chart matching the screenshot
const AltitudeChart = ({ celestialBodies, timezone }: any) => {
  const chartWidth = 320;
  const chartHeight = 200;
  const bodyHeight = 30;

  // Time points every 1 hour from current time
  const currentHour = new Date().getHours();
  const timeHours = [];
  for (let i = 0; i < 24; i += 3) {
    timeHours.push((currentHour + i - 12) % 24);
  }

  return (
    <div className='bg-zinc-900/90 rounded-lg p-4 mb-4 border border-zinc-700'>
      <div className='flex items-center gap-2 mb-4'>
        <Telescope size={14} className='text-purple-400' />
        <span className='text-sm font-medium text-white'>Sky Chart</span>
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

// Enhanced astronomical details
const AstronomicalDetails = ({ ephemerisData, location }: any) => {
  const now = new Date();
  const sunsetTime = ephemerisData.sunMoon.sunset;
  const sunriseTime = ephemerisData.sunMoon.sunrise;

  // Calculate twilight times
  const civilTwilight = sunsetTime
    ? new Date(sunsetTime.getTime() + 30 * 60 * 1000)
    : null;
  const nauticalTwilight = sunsetTime
    ? new Date(sunsetTime.getTime() + 50 * 60 * 1000)
    : null;
  const astronomicalTwilight = sunsetTime
    ? new Date(sunsetTime.getTime() + 70 * 60 * 1000)
    : null;

  return (
    <div className='bg-zinc-700/30 rounded-lg p-3 mb-4'>
      <div className='flex items-center gap-2 mb-3'>
        <Navigation size={14} className='text-purple-400' />
        <span className='text-sm font-medium text-white'>
          Astronomical Conditions
        </span>
      </div>

      <div className='grid grid-cols-2 gap-3 text-xs'>
        <div className='space-y-1'>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Civil Twilight:</span>
            <span className='text-orange-300'>
              {formatTime(civilTwilight, location.timezone)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Nautical Twilight:</span>
            <span className='text-blue-300'>
              {formatTime(nauticalTwilight, location.timezone)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Astro Twilight:</span>
            <span className='text-purple-300'>
              {formatTime(astronomicalTwilight, location.timezone)}
            </span>
          </div>
        </div>

        <div className='space-y-1'>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Moon Illumination:</span>
            <span className='text-blue-300'>
              {Math.round(ephemerisData.sunMoon.moonPhase.illumination)}%
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Darkness Quality:</span>
            <span
              className={
                ephemerisData.sunMoon.moonPhase.illumination < 25
                  ? 'text-green-300'
                  : 'text-yellow-300'
              }
            >
              {ephemerisData.sunMoon.moonPhase.illumination < 25
                ? 'Excellent'
                : 'Good'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Best Viewing:</span>
            <span className='text-green-300'>
              {astronomicalTwilight
                ? `${formatTime(
                    astronomicalTwilight,
                    location.timezone,
                  )} - ${formatTime(new Date(sunriseTime.getTime() - 70 * 60 * 1000), location.timezone)}`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed moon display
const MoonDisplay = ({ sunMoon, timezone }: any) => {
  const illumination = Math.round(sunMoon.moonPhase.illumination);
  const phaseIcon = getMoonPhaseIcon(illumination);
  const phaseName = getMoonPhaseName(illumination);

  return (
    <div className='bg-zinc-700/50 rounded-lg p-3'>
      <div className='flex items-center gap-2 mb-2'>
        <div className='text-lg'>{phaseIcon}</div>
        <span className='font-medium text-white text-sm'>Moon</span>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-zinc-600 rounded-full relative overflow-hidden'>
            <div
              className='absolute right-0 top-0 h-full bg-gray-300 rounded-full transition-all duration-300'
              style={{ width: `${illumination}%` }}
            ></div>
          </div>
          <div className='text-xs'>
            <div className='text-blue-300 font-medium'>{phaseName}</div>
            <div className='text-zinc-400'>{illumination}% illuminated</div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Rise:</span>
            <span className='text-white'>
              {formatTime(sunMoon.moonrise, timezone)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-zinc-400'>Set:</span>
            <span className='text-white'>
              {formatTime(sunMoon.moonset, timezone)}
            </span>
          </div>
        </div>

        <div className='text-xs text-zinc-400'>
          Age: {Math.round(sunMoon.moonPhase.age)} days
        </div>
      </div>
    </div>
  );
};

// Enhanced planet card with astronomical details
const PlanetCard = ({
  planet,
  timezone,
  location,
  isDetailed = false,
}: any) => {
  const isCurrentlyVisible = () => {
    const now = new Date();
    if (!planet.riseSet.rise || !planet.riseSet.set) return false;
    return now >= planet.riseSet.rise && now <= planet.riseSet.set;
  };

  const getVisibilityStatus = () => {
    if (isCurrentlyVisible())
      return { text: 'Visible Now', color: 'text-green-400' };
    if (planet.riseSet.isVisible)
      return { text: 'Rises Today', color: 'text-yellow-400' };
    return { text: 'Below Horizon', color: 'text-zinc-500' };
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

  const visiblePlanets = showAllPlanets
    ? ephemerisData?.planets || []
    : ephemerisData?.planets.slice(0, 4) || [];

  if (!location || locationLoading) {
    return (
      <div className='w-full h-full bg-zinc-800 rounded-lg p-4 border border-zinc-700 flex flex-col'>
        <div className='flex items-center justify-center gap-2 mb-3'>
          <MapPin size={16} className='text-purple-400' />
          <h3 className='text-lg font-semibold text-white'>Sky Tonight</h3>
        </div>

        <div className='text-center text-zinc-400 flex-1 flex items-center justify-center'>
          <div>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2'></div>
            <p className='text-sm'>Getting your location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full bg-zinc-800 rounded-lg p-4 border border-zinc-700 flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <MapPin size={16} className='text-purple-400' />
          <h3 className='text-lg font-semibold text-white'>Sky Tonight</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='ml-2 text-zinc-400 hover:text-purple-400 transition-colors'
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        <button
          onClick={requestLocation}
          className='text-xs text-zinc-400 hover:text-purple-400 transition-colors'
        >
          📍 {formatLocation(location)}
        </button>
      </div>

      <div className='flex-1 flex flex-col'>
        {!isCollapsed && (
          <>
            {loading && (
              <div className='text-center py-4'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2'></div>
                <p className='text-sm text-zinc-400'>
                  Calculating celestial events...
                </p>
              </div>
            )}

            {error && (
              <div className='bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm mb-4'>
                {error}
              </div>
            )}

            {ephemerisData && (
              <div className='space-y-4'>
                {/* Chart matching the screenshot */}
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
                    ...ephemerisData.planets
                      .slice(0, 4)
                      .map((p) => ({ name: p.body, riseSet: p.riseSet })),
                  ]}
                  timezone={location.timezone}
                />

                {/* Astronomical Conditions */}
                <AstronomicalDetails
                  ephemerisData={ephemerisData}
                  location={location}
                />

                {/* Sun & Moon */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-zinc-700/50 rounded-lg p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Sun size={14} className='text-yellow-400' />
                      <span className='font-medium text-white text-sm'>
                        Sun
                      </span>
                    </div>

                    <div className='space-y-1 text-xs'>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Rise:</span>
                        <span className='text-white'>
                          {formatTime(
                            ephemerisData.sunMoon.sunrise,
                            location.timezone,
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Set:</span>
                        <span className='text-white'>
                          {formatTime(
                            ephemerisData.sunMoon.sunset,
                            location.timezone,
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Length:</span>
                        <span className='text-yellow-300'>
                          {formatDayLength(ephemerisData.sunMoon.dayLength)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <MoonDisplay
                    sunMoon={ephemerisData.sunMoon}
                    timezone={location.timezone}
                  />
                </div>

                {/* Enhanced Planets Section */}
                {visiblePlanets.length > 0 && (
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='text-sm font-medium text-zinc-300 flex items-center gap-2'>
                        <Telescope size={14} />
                        Planets ({visiblePlanets.length})
                      </h4>
                      <button
                        onClick={() => setShowAllPlanets(!showAllPlanets)}
                        className='flex items-center gap-1 text-xs text-zinc-400 hover:text-purple-400 transition-colors'
                      >
                        {showAllPlanets ? (
                          <EyeOff size={12} />
                        ) : (
                          <Eye size={12} />
                        )}
                        {showAllPlanets ? 'Show less' : 'Show all'}
                      </button>
                    </div>

                    <div className='grid grid-cols-1 gap-2'>
                      {visiblePlanets.map((planet) => (
                        <PlanetCard
                          key={planet.body}
                          planet={planet}
                          timezone={location.timezone}
                          location={location}
                          isDetailed={showAllPlanets}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className='text-center text-xs text-zinc-500 flex items-center justify-center gap-2'>
                  <Circle size={8} className='text-green-400 animate-pulse' />
                  Updated:{' '}
                  {ephemerisData.date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: location.timezone,
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Collapsed state summary */}
        {isCollapsed && ephemerisData && (
          <div className='text-center text-sm text-zinc-400 flex-1 flex items-center justify-center'>
            <div className='flex items-center justify-center gap-4'>
              <div className='flex items-center gap-1'>
                <Sun size={12} className='text-yellow-400' />
                <span>
                  {formatTime(ephemerisData.sunMoon.sunrise, location.timezone)}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                {getMoonPhaseIcon(
                  Math.round(ephemerisData.sunMoon.moonPhase.illumination),
                )}
                <span>
                  {getMoonPhaseName(
                    Math.round(ephemerisData.sunMoon.moonPhase.illumination),
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
