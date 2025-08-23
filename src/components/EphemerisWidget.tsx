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
} from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import {
  calculateFullEphemeris,
  EphemerisData,
  formatTime,
  formatDayLength,
} from '../../utils/astrology/ephemeris';
import { formatLocation } from '../../utils/location';

export default function EphemerisWidget() {
  const { location, loading: locationLoading, requestLocation } = useLocation();
  const [ephemerisData, setEphemerisData] = useState<EphemerisData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllPlanets, setShowAllPlanets] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

    const interval = setInterval(fetchEphemeris, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [location]);

  // Show key planets always, rest only when showAllPlanets is true
  const visiblePlanets = showAllPlanets
    ? ephemerisData?.planets || []
    : ephemerisData?.planets.slice(0, 4) || []; // Show first 4 planets when collapsed

  if (!location || locationLoading) {
    return (
      <div className='w-full max-w-md mx-auto bg-zinc-800 rounded-lg p-4 border border-zinc-700'>
        {/* <div className='flex items-center justify-center gap-2 mb-3'>
          <MapPin size={16} className='text-purple-400' />
          <h3 className='text-lg font-semibold text-white'>Sky Tonight</h3>
        </div> */}

        <div className='text-center text-zinc-400'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2'></div>
          <p className='text-sm'>Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-md mx-auto bg-zinc-800 rounded-lg p-4 border border-zinc-700'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <button
            onClick={requestLocation}
            className='text-xs text-zinc-400 hover:text-purple-400 transition-colors'
          >
            📍 {formatLocation(location)}
          </button>
          {/* <MapPin size={16} className='text-purple-400' />
          <h3 className='text-lg font-semibold text-white'>Sky Tonight</h3> */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='ml-2 text-zinc-400 hover:text-purple-400 transition-colors'
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

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
              {/* Sun & Moon */}
              {showAllPlanets ? (
                // Full sun/moon display when showing all
                <div className='grid grid-cols-2 gap-3'>
                  {/* Sun */}
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

                  {/* Moon */}
                  <div className='bg-zinc-700/50 rounded-lg p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Moon size={14} className='text-blue-300' />
                      <span className='font-medium text-white text-sm'>
                        Moon
                      </span>
                    </div>

                    <div className='space-y-1 text-xs'>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Rise:</span>
                        <span className='text-white'>
                          {formatTime(
                            ephemerisData.sunMoon.moonrise,
                            location.timezone,
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Set:</span>
                        <span className='text-white'>
                          {formatTime(
                            ephemerisData.sunMoon.moonset,
                            location.timezone,
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>Phase:</span>
                        <span className='text-blue-300 text-xs'>
                          {ephemerisData.sunMoon.moonPhase.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Minified sun/moon display when showing less
                <div className='bg-zinc-700/30 rounded-lg p-2'>
                  <div className='flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-1'>
                        <Sun size={12} className='text-yellow-400' />
                        <span className='text-white'>
                          {formatTime(
                            ephemerisData.sunMoon.sunrise,
                            location.timezone,
                          )}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Moon size={12} className='text-blue-300' />
                        <span className='text-white'>
                          {ephemerisData.sunMoon.moonPhase.name}
                        </span>
                      </div>
                    </div>
                    <span className='text-zinc-400'>
                      {formatTime(
                        ephemerisData.sunMoon.sunset,
                        location.timezone,
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Planets */}
              {visiblePlanets.length > 0 && (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-sm font-medium text-zinc-300'>
                      Planets
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
                      <div
                        key={planet.body}
                        className='bg-zinc-700/30 rounded-lg p-2'
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <div className='flex items-center gap-2'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                planet.riseSet.isVisible
                                  ? 'bg-green-400'
                                  : 'bg-zinc-500'
                              }`}
                            ></div>
                            <span className='text-sm font-medium text-white'>
                              {planet.body}
                            </span>
                            <span className='text-xs text-purple-300'>
                              {planet.sign}
                            </span>
                          </div>
                          {planet.riseSet.magnitude && (
                            <span className='text-xs text-yellow-300'>
                              mag {planet.riseSet.magnitude.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className='grid grid-cols-2 gap-2 text-xs'>
                          <div className='flex justify-between'>
                            <span className='text-zinc-400'>Rise:</span>
                            <span className='text-zinc-200'>
                              {formatTime(
                                planet.riseSet.rise,
                                location.timezone,
                              )}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-zinc-400'>Set:</span>
                            <span className='text-zinc-200'>
                              {formatTime(
                                planet.riseSet.set,
                                location.timezone,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transit Times - only show when expanded */}
              {showAllPlanets && (
                <div className='bg-zinc-700/30 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Clock size={14} className='text-purple-400' />
                    <span className='text-sm font-medium text-white'>
                      Transit Times
                    </span>
                  </div>

                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Solar Noon:</span>
                      <span className='text-yellow-300'>
                        {formatTime(
                          ephemerisData.sunMoon.solarNoon,
                          location.timezone,
                        )}
                      </span>
                    </div>
                    {ephemerisData.sunMoon.moonPhase.illumination > 10 && (
                      <div className='flex justify-between'>
                        <span className='text-zinc-400'>
                          Moon Illumination:
                        </span>
                        <span className='text-blue-300'>
                          {Math.round(
                            ephemerisData.sunMoon.moonPhase.illumination,
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className='text-center text-xs text-zinc-500'>
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
        <div className='text-center text-sm text-zinc-400'>
          <div className='flex items-center justify-center gap-4'>
            <div className='flex items-center gap-1'>
              <Sun size={12} className='text-yellow-400' />
              <span>
                {formatTime(ephemerisData.sunMoon.sunrise, location.timezone)}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Moon size={12} className='text-blue-300' />
              <span>{ephemerisData.sunMoon.moonPhase.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
