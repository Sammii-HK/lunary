'use client';

import { useMemo } from 'react';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  bodiesSymbols,
  zodiacSymbol,
  astroPointSymbols,
  houseThemes,
} from '../../../utils/zodiac/zodiac';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { PersonalPlanetsSection } from './PersonalPlanetsSection';
import { SocialPlanetsSection } from './SocialPlanetsSection';
import { GenerationalPlanetsSection } from './GenerationalPlanetsSection';
import { AsteroidsSection } from './AsteroidsSection';
import { SensitivePointsSection } from './SensitivePointsSection';
import {
  calculateWholeSigHouses,
  getPlanetaryInterpretation,
  getChartRuler,
  getOrdinalSuffix,
  getMostAspectedPlanet,
  getPlanetDignityStatus,
  getChartAnalysis,
  getElementCounts,
  getModalityCounts,
  getElementMeaning,
  getElementModality,
  getPlanetaryDignities,
  getModalitySymbol,
  getModalityMeaning,
  getPlanetaryAspects,
  getChartPatterns,
  getStelliums,
} from '@/utils/astrology/birth-chart-analysis';

interface BirthChartShowcaseProps {
  birthChart: BirthChartData[];
}

export function BirthChartShowcase({ birthChart }: BirthChartShowcaseProps) {
  const sun = birthChart.find((p) => p.body === 'Sun');
  const moon = birthChart.find((p) => p.body === 'Moon');
  const rising = birthChart.find((p) => p.body === 'Ascendant');

  const elements = useMemo(() => getElementCounts(birthChart), [birthChart]);
  const modalities = useMemo(() => getModalityCounts(birthChart), [birthChart]);
  const mostAspectedPlanet = useMemo(
    () => getMostAspectedPlanet(birthChart),
    [birthChart],
  );
  const dominantElement = useMemo(
    () => elements.reduce((a, b) => (a.count > b.count ? a : b)),
    [elements],
  );
  const dominantModality = useMemo(
    () => modalities.reduce((a, b) => (a.count > b.count ? a : b)),
    [modalities],
  );

  const houses = useMemo(
    () => calculateWholeSigHouses(birthChart),
    [birthChart],
  );

  const chartRulerData = useMemo(() => {
    if (!rising) return null;
    const chartRulerName = getChartRuler(rising.sign);
    const chartRuler = birthChart.find((p) => p.body === chartRulerName);
    if (!chartRuler) return null;

    const houseNum = houses?.findIndex((h) => h.sign === chartRuler.sign);
    const housePlacement =
      houseNum !== undefined && houseNum >= 0
        ? `${houseNum + 1}${getOrdinalSuffix(houseNum + 1)} House`
        : '';

    const rulerAspects = getPlanetaryAspects(birthChart)
      .filter(
        (a) => a.planet1 === chartRulerName || a.planet2 === chartRulerName,
      )
      .slice(0, 3);

    return { chartRulerName, chartRuler, housePlacement, rulerAspects };
  }, [birthChart, rising, houses]);

  const chartAnalysis = useMemo(
    () => getChartAnalysis(birthChart),
    [birthChart],
  );
  const elementModality = useMemo(
    () => getElementModality(birthChart),
    [birthChart],
  );
  const aspects = useMemo(() => getPlanetaryAspects(birthChart), [birthChart]);
  const patterns = useMemo(() => getChartPatterns(birthChart), [birthChart]);
  const stelliums = useMemo(() => getStelliums(birthChart), [birthChart]);
  const dignities = useMemo(
    () => getPlanetaryDignities(birthChart),
    [birthChart],
  );

  return (
    <div className='flex flex-col gap-3'>
      {/* Big Three - Sun, Moon, Rising */}
      {(sun || moon || rising) && (
        <div>
          <CollapsibleSection
            title='The Big Three'
            defaultCollapsed={false}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                {sun && (
                  <div className='bg-surface-elevated rounded p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-astro text-lg'>
                        {bodiesSymbols.sun}
                      </span>
                      <span className='text-sm font-medium text-content-primary'>
                        Sun in {sun.sign}
                      </span>
                    </div>
                    <p className='text-xs text-content-secondary'>
                      Your core identity and life purpose. This is who you are
                      at your essence.
                    </p>
                  </div>
                )}
                {moon && (
                  <div className='bg-surface-elevated rounded p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-astro text-lg'>
                        {bodiesSymbols.moon}
                      </span>
                      <span className='text-sm font-medium text-content-primary'>
                        Moon in {moon.sign}
                      </span>
                    </div>
                    <p className='text-xs text-content-secondary'>
                      Your emotional nature and inner needs. This is how you
                      feel and what you need to feel secure.
                    </p>
                  </div>
                )}
                {rising && (
                  <div className='bg-surface-elevated rounded p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-lg font-astro text-lunary-accent'>
                        {astroPointSymbols.ascendant}
                      </span>
                      <span className='text-sm font-medium text-content-primary'>
                        {rising.sign} Rising
                      </span>
                      <span className='text-sm font-astro text-content-muted'>
                        {
                          zodiacSymbol[
                            rising.sign.toLowerCase() as keyof typeof zodiacSymbol
                          ]
                        }
                      </span>
                    </div>
                    <p className='text-xs text-content-secondary'>
                      Your outer personality and how others see you. This is
                      your mask and first impression.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Chart Summary */}
      <div>
        <CollapsibleSection
          title='Chart Summary'
          defaultCollapsed={false}
          persistState={true}
        >
          <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              {/* Dominant Element */}
              <div className='bg-surface-elevated rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-astro text-lg'>
                    {dominantElement.symbol}
                  </span>
                  <span className='text-sm font-medium text-content-primary'>
                    {dominantElement.name} Dominant
                  </span>
                </div>
                <p className='text-xs text-content-secondary'>
                  {dominantElement.count} planet
                  {dominantElement.count !== 1 ? 's' : ''} in{' '}
                  {dominantElement.name} signs. You express yourself through{' '}
                  {getElementMeaning(dominantElement.name)} energy.
                </p>
              </div>

              {/* Dominant Modality */}
              <div className='bg-surface-elevated rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-astro text-lg'>
                    {getModalitySymbol(dominantModality.name)}
                  </span>
                  <span className='text-sm font-medium text-content-primary'>
                    {dominantModality.name} Mode
                  </span>
                </div>
                <p className='text-xs text-content-secondary'>
                  {dominantModality.count} planet
                  {dominantModality.count !== 1 ? 's' : ''} in{' '}
                  {dominantModality.name} signs. You approach life through{' '}
                  {dominantModality.name === 'Cardinal'
                    ? 'initiative and leadership'
                    : dominantModality.name === 'Fixed'
                      ? 'stability and persistence'
                      : 'adaptability and change'}
                  .
                </p>
              </div>

              {/* Most Aspected Planet */}
              <div className='bg-surface-elevated rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-astro text-lg'>
                    {
                      bodiesSymbols[
                        mostAspectedPlanet.toLowerCase() as keyof typeof bodiesSymbols
                      ]
                    }
                  </span>
                  <span className='text-sm font-medium text-content-primary'>
                    {mostAspectedPlanet} Focal Point
                  </span>
                </div>
                <p className='text-xs text-content-secondary'>
                  Your most aspected planet. This is a major driving force in
                  your chart, connecting multiple energies and themes.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Chart Ruler */}
      {chartRulerData && rising && (
        <div>
          <CollapsibleSection
            title='Chart Ruler'
            defaultCollapsed={false}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='mb-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-astro text-xl'>
                    {
                      bodiesSymbols[
                        chartRulerData.chartRulerName.toLowerCase() as keyof typeof bodiesSymbols
                      ]
                    }
                  </span>
                  <span className='text-base font-medium text-content-primary'>
                    {chartRulerData.chartRulerName} rules your chart
                  </span>
                </div>
                <p className='text-sm text-content-secondary mb-3'>
                  As the ruler of your {rising.sign} Ascendant,{' '}
                  {chartRulerData.chartRulerName} is the most important planet
                  in your chart. Its placement shows how you express your
                  Ascendant&apos;s energy and where you direct your life force.
                </p>
              </div>

              <div className='bg-surface-elevated rounded-lg p-3 mb-3'>
                <div className='text-sm font-medium text-content-primary mb-3'>
                  Chart Ruler Placement
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div className='text-center'>
                    <div className='text-xs text-content-muted mb-1'>Sign</div>
                    <div className='text-sm text-content-primary flex items-center justify-center gap-1.5'>
                      {chartRulerData.chartRuler.sign}
                      <span className='font-astro text-base text-content-muted'>
                        {
                          zodiacSymbol[
                            chartRulerData.chartRuler.sign.toLowerCase() as keyof typeof zodiacSymbol
                          ]
                        }
                      </span>
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-xs text-content-muted mb-1'>
                      Position
                    </div>
                    <div className='text-sm text-content-primary flex items-center justify-center gap-1.5'>
                      {chartRulerData.chartRuler.degree}°
                      {chartRulerData.chartRuler.minute}'
                      {chartRulerData.chartRuler.retrograde && (
                        <span className='text-xs text-orange-400'>&#8478;</span>
                      )}
                    </div>
                  </div>
                  {chartRulerData.housePlacement && (
                    <div className='text-center'>
                      <div className='text-xs text-content-muted mb-1'>
                        House
                      </div>
                      <div className='text-sm text-content-primary'>
                        {chartRulerData.housePlacement}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {chartRulerData.rulerAspects.length > 0 && (
                <div className='bg-surface-elevated rounded-lg p-3'>
                  <div className='text-sm font-medium text-content-primary mb-2'>
                    Key Aspects to Chart Ruler
                  </div>
                  <div className='space-y-1.5'>
                    {chartRulerData.rulerAspects.map((aspect, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-2 text-xs'
                      >
                        <span className='font-astro text-sm text-lunary-accent'>
                          {aspect.aspectSymbol}
                        </span>
                        <span className='text-content-secondary'>
                          {aspect.planet1 === chartRulerData.chartRulerName
                            ? aspect.planet2
                            : aspect.planet1}
                        </span>
                        <span className='text-content-muted'>
                          ({aspect.orb}° orb)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Houses */}
      {(() => {
        if (!houses) {
          return (
            <div data-testid='houses-list'>
              <CollapsibleSection
                title='Houses'
                defaultCollapsed={true}
                persistState={true}
              >
                <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
                  <p className='text-xs text-content-muted'>
                    Add your birth time to see accurate house placements.
                  </p>
                </div>
              </CollapsibleSection>
            </div>
          );
        }

        return (
          <div data-testid='houses-list'>
            <CollapsibleSection
              title='Your 12 Houses'
              defaultCollapsed={true}
              persistState={true}
            >
              <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
                <div className='grid grid-cols-2 gap-2'>
                  {houses.map(({ house, sign, planets }) => {
                    const houseInfo = houseThemes[house];
                    return (
                      <div
                        key={house}
                        className={`rounded p-2 ${
                          planets.length > 0
                            ? 'bg-lunary-highlight-950 border border-lunary-highlight-700/30'
                            : 'bg-surface-elevated'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-xs font-medium text-content-secondary'>
                            {house}
                            {house === 1
                              ? 'st'
                              : house === 2
                                ? 'nd'
                                : house === 3
                                  ? 'rd'
                                  : 'th'}
                          </span>
                          <span className='text-xs font-astro text-lunary-accent'>
                            {
                              zodiacSymbol[
                                sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </div>
                        <div className='text-xs text-content-muted mb-1 flex items-center gap-1.5'>
                          <span>{sign}</span>
                          <span className='font-astro text-base text-content-muted'>
                            {
                              zodiacSymbol[
                                sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </div>
                        {planets.length > 0 && (
                          <div className='flex flex-wrap gap-1 mt-1'>
                            {planets.map((p) => {
                              const symbolKey = p.body
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  '',
                                ) as keyof typeof bodiesSymbols;
                              const symbol =
                                bodiesSymbols[symbolKey] ||
                                astroPointSymbols[
                                  symbolKey as keyof typeof astroPointSymbols
                                ] ||
                                '';
                              const isAstronomiconChar =
                                symbol.length === 1 &&
                                symbol.charCodeAt(0) < 128;
                              return (
                                <span
                                  key={p.body}
                                  className={`text-sm text-lunary-highlight-300 ${isAstronomiconChar ? 'font-astro' : ''}`}
                                  title={p.body}
                                >
                                  {symbol}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className='text-[10px] text-content-muted mt-1'>
                          {houseInfo?.theme}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );
      })()}

      {/* Personal Planets */}
      <PersonalPlanetsSection
        birthChartData={birthChart}
        getPlanetaryInterpretation={getPlanetaryInterpretation}
        getPlanetDignityStatus={getPlanetDignityStatus}
      />

      {/* Social Planets */}
      <SocialPlanetsSection
        birthChartData={birthChart}
        getPlanetaryInterpretation={getPlanetaryInterpretation}
        getPlanetDignityStatus={getPlanetDignityStatus}
      />

      {/* Generational Planets */}
      <GenerationalPlanetsSection
        birthChartData={birthChart}
        getPlanetaryInterpretation={getPlanetaryInterpretation}
        getPlanetDignityStatus={getPlanetDignityStatus}
      />

      {/* Asteroids */}
      <AsteroidsSection birthChartData={birthChart} />

      {/* Sensitive Points */}
      <SensitivePointsSection birthChartData={birthChart} />

      {/* Chart Analysis */}
      {chartAnalysis.length > 0 && (
        <div>
          <CollapsibleSection
            title='Chart Analysis'
            defaultCollapsed={true}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='space-y-3'>
                {chartAnalysis.map((analysis, index) => (
                  <div key={index} className='bg-surface-elevated rounded p-3'>
                    <h5 className='text-xs font-medium text-content-brand-secondary mb-1'>
                      {analysis.category}
                    </h5>
                    <p className='text-xs text-content-secondary'>
                      {analysis.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Elemental & Modal Balance */}
      <div>
        <CollapsibleSection
          title='Elemental & Modal Balance'
          defaultCollapsed={true}
          persistState={true}
        >
          <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
            <div className='grid grid-cols-2 gap-3'>
              {/* Elements */}
              <div>
                <h5 className='text-xs font-medium text-lunary-rose-300 mb-2'>
                  Elements
                </h5>
                <div className='space-y-1'>
                  {elementModality.elements.map((element) => (
                    <div
                      key={element.name}
                      className='bg-surface-elevated rounded p-2'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-astro'>
                            {element.symbol}
                          </span>
                          <span className='text-xs text-content-secondary'>
                            {element.name}
                          </span>
                        </div>
                        <span className='text-xs text-lunary-rose-300'>
                          {element.count}
                        </span>
                      </div>
                      {element.count > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {(element as any).planets?.map(
                            (planet: BirthChartData) => {
                              const symbolKey = planet.body
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  '',
                                ) as keyof typeof bodiesSymbols;
                              const symbol =
                                bodiesSymbols[symbolKey] ||
                                astroPointSymbols[
                                  symbolKey as keyof typeof astroPointSymbols
                                ] ||
                                '';
                              const isAstronomiconChar =
                                symbol.length === 1 &&
                                symbol.charCodeAt(0) < 128;
                              return (
                                <span
                                  key={planet.body}
                                  className={`text-xs bg-surface-card px-1 rounded ${isAstronomiconChar ? 'font-astro' : ''}`}
                                  title={`${planet.body}: ${planet.degree}\u00B0${planet.minute}' ${planet.sign}`}
                                >
                                  {symbol}
                                </span>
                              );
                            },
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modalities */}
              <div>
                <h5 className='text-xs font-medium text-lunary-rose-300 mb-2'>
                  Modalities
                </h5>
                <div className='space-y-1'>
                  {elementModality.modalities.map((modality) => (
                    <div
                      key={modality.name}
                      className='bg-surface-elevated rounded p-2'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-astro'>
                            {getModalitySymbol(modality.name)}
                          </span>
                          <span className='text-xs text-content-secondary'>
                            {modality.name}
                          </span>
                        </div>
                        <span className='text-xs text-lunary-rose-300'>
                          {modality.count}
                        </span>
                      </div>
                      {modality.count > 0 && (
                        <div className='space-y-1'>
                          <div className='flex flex-wrap gap-1'>
                            {(modality as any).planets?.map(
                              (planet: BirthChartData) => {
                                const symbolKey = planet.body
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    '',
                                  ) as keyof typeof bodiesSymbols;
                                const symbol =
                                  bodiesSymbols[symbolKey] ||
                                  astroPointSymbols[
                                    symbolKey as keyof typeof astroPointSymbols
                                  ] ||
                                  '';
                                const isAstronomiconChar =
                                  symbol.length === 1 &&
                                  symbol.charCodeAt(0) < 128;
                                return (
                                  <span
                                    key={planet.body}
                                    className={`text-xs bg-surface-card px-1 rounded ${isAstronomiconChar ? 'font-astro' : ''}`}
                                    title={`${planet.body}: ${planet.degree}\u00B0${planet.minute}' ${planet.sign}`}
                                  >
                                    {symbol}
                                  </span>
                                );
                              },
                            )}
                          </div>
                          <p className='text-xs text-content-muted mt-1'>
                            {getModalityMeaning(
                              modality.name,
                              (modality as any).planets || [],
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Major Aspects */}
      {aspects.length > 0 && (
        <div data-testid='aspects-list'>
          <CollapsibleSection
            title='Major Aspects'
            defaultCollapsed={true}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='space-y-2'>
                {aspects.map((aspect, index) => (
                  <div
                    key={index}
                    className='border-l-2 border-lunary-primary pl-3'
                  >
                    <h5 className='text-xs font-medium text-content-brand'>
                      {aspect.planet1} {aspect.aspectSymbol} {aspect.planet2}
                    </h5>
                    <p className='text-xs text-content-secondary'>
                      {aspect.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Chart Patterns */}
      {patterns.length > 0 && (
        <div>
          <CollapsibleSection
            title='Chart Patterns'
            defaultCollapsed={true}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='space-y-2'>
                {patterns.map((pattern, index) => (
                  <div key={index} className='bg-surface-elevated rounded p-3'>
                    <h5 className='text-xs font-medium text-lunary-success-300 mb-1'>
                      {pattern.name}
                    </h5>
                    <p className='text-xs text-content-secondary'>
                      {pattern.description}
                    </p>
                    <p className='text-xs text-lunary-success-200 mt-1'>
                      {pattern.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Stelliums & Concentrations */}
      {stelliums.length > 0 && (
        <div>
          <CollapsibleSection
            title='Stelliums & Concentrations'
            defaultCollapsed={true}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='space-y-2'>
                {stelliums.map((stellium, index) => (
                  <div
                    key={index}
                    className='border-l-2 border-lunary-highlight pl-3'
                  >
                    <h5 className='text-xs font-medium text-lunary-highlight-300'>
                      {stellium.sign} Stellium ({stellium.planets.length}{' '}
                      planets)
                    </h5>
                    <p className='text-xs text-content-muted mb-1'>
                      {stellium.planets
                        .map((p) => `${p.body} (${p.degree}\u00B0)`)
                        .join(', ')}
                    </p>
                    <p className='text-xs text-content-secondary'>
                      {stellium.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Planetary Strength (Dignities) */}
      {dignities.length > 0 && (
        <div>
          <CollapsibleSection
            title='Planetary Strength'
            defaultCollapsed={true}
            persistState={true}
          >
            <div className='bg-surface-elevated rounded-lg p-4 border border-stroke-subtle'>
              <div className='space-y-3'>
                {dignities.map((dignity, index) => {
                  const dignityStyles = {
                    'in Rulership': {
                      borderColor: 'border-green-500',
                      badgeColor:
                        'bg-green-500/20 text-green-300 border-green-500/40',
                      icon: '\u2726',
                    },
                    'in Exaltation': {
                      borderColor: 'border-amber-500',
                      badgeColor:
                        'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      icon: '\u2605',
                    },
                    'in Detriment': {
                      borderColor: 'border-orange-500',
                      badgeColor:
                        'bg-orange-500/20 text-orange-300 border-orange-500/40',
                      icon: '\u26A0',
                    },
                    'in Fall': {
                      borderColor: 'border-red-500',
                      badgeColor:
                        'bg-red-500/20 text-red-300 border-red-500/40',
                      icon: '\u25BC',
                    },
                  };

                  const style =
                    dignityStyles[dignity.type as keyof typeof dignityStyles];
                  const borderColor =
                    style?.borderColor || 'border-lunary-rose';
                  const badgeColor =
                    style?.badgeColor ||
                    'bg-lunary-rose/20 text-lunary-rose-300 border-lunary-rose/30';
                  const badgeIcon = style?.icon || '\u25C6';

                  return (
                    <div
                      key={index}
                      className={`border-l-2 ${borderColor} pl-3 bg-surface-elevated/30 rounded-r p-2`}
                    >
                      <div className='flex items-center gap-2 mb-1.5'>
                        <span className='font-astro text-sm'>
                          {
                            bodiesSymbols[
                              dignity.planet.toLowerCase() as keyof typeof bodiesSymbols
                            ]
                          }
                        </span>
                        <h5 className='text-sm font-medium text-content-primary'>
                          {dignity.planet}
                        </h5>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${badgeColor} flex items-center gap-1`}
                        >
                          <span className='text-xs'>{badgeIcon}</span>
                          {dignity.type}
                        </span>
                      </div>
                      <p className='text-xs text-content-secondary leading-relaxed'>
                        {dignity.meaning}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
