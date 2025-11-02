'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import Link from 'next/link';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { getImprovedTarotReading } from '../../../utils/tarot/improvedTarot';
import { getGeneralTarotReading } from '../../../utils/tarot/generalTarot';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { Check, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

const TarotReadings = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const hasChartAccess = hasBirthChartAccess(subscription.status);

  const [timeFrame, setTimeFrame] = useState(30);
  const [expandedSuit, setExpandedSuit] = useState<string | null>(null);

  if (!me) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  if (!hasChartAccess) {
    const generalTarot = getGeneralTarotReading();
    const currentDate = dayjs();
    const previousWeek = () => {
      let week = [];
      for (let i = 0; i < 7; i++) {
        week.push(currentDate.subtract(i, 'day'));
      }
      return week;
    };
    const week = previousWeek();

    const previousReadings = week.map((day) => {
      const dayOfYear = day.dayOfYear();
      const seed = `cosmic-${day.format('YYYY-MM-DD')}-${dayOfYear}-energy`;
      return {
        day: day.format('dddd'),
        date: day.format('MMM D'),
        card: getTarotCard(seed, 'cosmic-daily-energy'),
      };
    });

    return (
      <div className='min-h-screen space-y-6 pb-20 px-4'>
        <div className='pt-6'>
          <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
            Your Tarot Readings
          </h1>
          <p className='text-sm text-zinc-400'>
            General cosmic guidance based on universal energies
          </p>
        </div>

        <div className='space-y-6'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
            <h2 className='text-xl font-medium text-zinc-100'>
              Your Cosmic Reading
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                  Daily Card
                </h3>
                <p className='text-lg font-medium text-zinc-100 mb-1'>
                  {generalTarot.daily.name}
                </p>
                <p className='text-sm text-zinc-400'>
                  {generalTarot.daily.keywords.slice(0, 2).join(', ')}
                </p>
              </div>

              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                  Weekly Card
                </h3>
                <p className='text-lg font-medium text-zinc-100 mb-1'>
                  {generalTarot.weekly.name}
                </p>
                <p className='text-sm text-zinc-400'>
                  {generalTarot.weekly.keywords.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>

            <div className='space-y-4 pt-4 border-t border-zinc-800/50'>
              <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
                <h3 className='text-sm font-medium text-purple-300/90 mb-2'>
                  Daily Message
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {generalTarot.guidance.dailyMessage}
                </p>
              </div>

              <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
                <h3 className='text-sm font-medium text-indigo-300/90 mb-2'>
                  Weekly Energy
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {generalTarot.guidance.weeklyMessage}
                </p>
              </div>

              <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4'>
                <h3 className='text-sm font-medium text-emerald-300/90 mb-2'>
                  Key Guidance
                </h3>
                <ul className='text-sm text-zinc-300 space-y-2'>
                  {generalTarot.guidance.actionPoints.map((point, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <Check
                        className='w-4 h-4 text-emerald-400/80 mt-0.5 flex-shrink-0'
                        strokeWidth={2}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              Unlock Personal Tarot Patterns
            </h3>
            <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
              Get readings based on YOUR name and birthday, plus discover your
              personal tarot patterns and card trends over time.
            </p>
            <ul className='text-xs text-zinc-400 space-y-2 mb-4'>
              <li className='flex items-start gap-2'>
                <Check
                  className='w-3 h-3 text-purple-400/80 mt-0.5 flex-shrink-0'
                  strokeWidth={2}
                />
                <span>Cards chosen specifically for you</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check
                  className='w-3 h-3 text-purple-400/80 mt-0.5 flex-shrink-0'
                  strokeWidth={2}
                />
                <span>30-90 day pattern analysis</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check
                  className='w-3 h-3 text-purple-400/80 mt-0.5 flex-shrink-0'
                  strokeWidth={2}
                />
                <span>Personal card frequency tracking</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check
                  className='w-3 h-3 text-purple-400/80 mt-0.5 flex-shrink-0'
                  strokeWidth={2}
                />
                <span>Suit and number pattern insights</span>
              </li>
            </ul>
            <SmartTrialButton
              size='md'
              variant='primary'
              className='inline-block'
            >
              Start Free Trial
            </SmartTrialButton>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-medium text-zinc-100'>
                Recent Daily Cards
              </h2>
              <div className='px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
                <span className='text-xs font-medium text-purple-300/90'>
                  Personalised Feature
                </span>
              </div>
            </div>
            <div className='relative'>
              <div className='filter blur-sm pointer-events-none'>
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 mb-3 opacity-60'
                  >
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-zinc-100'>●●●●●●●</span>
                      <div className='text-right'>
                        <p className='font-medium text-zinc-100'>●●●●●●●</p>
                        <p className='text-sm text-zinc-400'>●●●●●●●●●</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
                <div className='text-center p-6 max-w-sm'>
                  <Sparkles
                    className='w-8 h-8 text-purple-400/80 mx-auto mb-3'
                    strokeWidth={1.5}
                  />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Card History
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                    Track your personal tarot journey with 7+ days of card
                    history
                  </p>
                  <SmartTrialButton
                    size='sm'
                    variant='primary'
                    className='inline-block'
                  >
                    Start Free Trial
                  </SmartTrialButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const personalizedReading = getImprovedTarotReading(
    userName,
    true,
    timeFrame,
  );

  const currentDate = dayjs();
  const previousWeek = () => {
    let week = [];
    for (let i = 1; i < 8; i++) {
      week.push(currentDate.subtract(i, 'day'));
    }
    return week;
  };
  const week = previousWeek();

  const previousReadings = week.map((day) => {
    return {
      day: day.format('dddd'),
      date: day.format('MMM D'),
      card: getTarotCard(dayjs(day).toDate().toDateString(), userName),
    };
  });

  return (
    <div className='min-h-screen space-y-6 pb-20 px-4'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          {userName ? `${userName}'s Tarot Readings` : 'Your Tarot Readings'}
        </h1>
        <p className='text-sm text-zinc-400'>
          Personalized guidance based on your cosmic signature
        </p>
      </div>

      <div className='space-y-6'>
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
          <h2 className='text-xl font-medium text-zinc-100'>
            Your Personal Reading
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
              <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                Daily Card
              </h3>
              <p className='text-lg font-medium text-zinc-100 mb-1'>
                {personalizedReading.daily.name}
              </p>
              <p className='text-sm text-zinc-400'>
                {personalizedReading.daily.keywords.slice(0, 2).join(', ')}
              </p>
            </div>

            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
              <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                Weekly Card
              </h3>
              <p className='text-lg font-medium text-zinc-100 mb-1'>
                {personalizedReading.weekly.name}
              </p>
              <p className='text-sm text-zinc-400'>
                {personalizedReading.weekly.keywords.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>

          <div className='space-y-4 pt-4 border-t border-zinc-800/50'>
            <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'>
              <h3 className='text-sm font-medium text-purple-300/90 mb-2'>
                Daily Message
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {personalizedReading.guidance.dailyMessage}
              </p>
            </div>

            <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'>
              <h3 className='text-sm font-medium text-indigo-300/90 mb-2'>
                Weekly Energy
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {personalizedReading.guidance.weeklyMessage}
              </p>
            </div>

            <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4'>
              <h3 className='text-sm font-medium text-emerald-300/90 mb-2'>
                Key Guidance
              </h3>
              <ul className='text-sm text-zinc-300 space-y-2'>
                {personalizedReading.guidance.actionPoints.map(
                  (point, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <Check
                        className='w-4 h-4 text-emerald-400/80 mt-0.5 flex-shrink-0'
                        strokeWidth={2}
                      />
                      <span>{point}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {personalizedReading.trendAnalysis && (
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-medium text-zinc-100'>
                Your {timeFrame}-Day Tarot Patterns
              </h2>
              <div className='flex gap-2'>
                {[7, 14, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeFrame(days)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      timeFrame === days
                        ? 'bg-purple-500/20 text-purple-300/90 border border-purple-500/30'
                        : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {personalizedReading.trendAnalysis.dominantThemes.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                  Dominant Themes
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {personalizedReading.trendAnalysis.dominantThemes.map(
                    (theme, index) => (
                      <span
                        key={theme}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          index === 0
                            ? 'bg-purple-500/20 text-purple-300/90 border border-purple-500/30'
                            : index === 1
                              ? 'bg-purple-500/15 text-purple-300/80 border border-purple-500/20'
                              : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'
                        }`}
                      >
                        {theme}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            {personalizedReading.trendAnalysis.frequentCards.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                  Card Patterns
                </h3>
                <div className='space-y-3'>
                  {personalizedReading.trendAnalysis.frequentCards.map(
                    (card, index) => (
                      <div
                        key={index}
                        className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4'
                      >
                        <p className='font-medium text-zinc-100 mb-1'>
                          {card.name} ({card.count} times)
                        </p>
                        <p className='text-sm text-zinc-400 leading-relaxed'>
                          {card.reading}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {personalizedReading.trendAnalysis.suitPatterns.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                  Suit Patterns
                </h3>
                <div className='space-y-3'>
                  {personalizedReading.trendAnalysis.suitPatterns.map(
                    (pattern, index) => (
                      <div
                        key={index}
                        className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-4'
                      >
                        <div
                          className='flex justify-between items-center cursor-pointer'
                          onClick={() =>
                            setExpandedSuit(
                              expandedSuit === pattern.suit
                                ? null
                                : pattern.suit,
                            )
                          }
                        >
                          <p className='font-medium text-zinc-100'>
                            {pattern.suit} ({pattern.count}/
                            {personalizedReading.trendAnalysis?.timeFrame} days)
                          </p>
                          {expandedSuit === pattern.suit ? (
                            <ChevronDown
                              className='w-4 h-4 text-zinc-400'
                              strokeWidth={2}
                            />
                          ) : (
                            <ChevronRight
                              className='w-4 h-4 text-zinc-400'
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        <p className='text-sm text-zinc-400 leading-relaxed mt-2'>
                          {pattern.reading}
                        </p>

                        {expandedSuit === pattern.suit && (
                          <div className='mt-4 pt-4 border-t border-zinc-800/50'>
                            <p className='text-xs font-medium text-zinc-400 mb-3'>
                              Individual Cards:
                            </p>
                            <div className='grid grid-cols-1 gap-2'>
                              {pattern.cards.map((card, cardIndex) => (
                                <div
                                  key={cardIndex}
                                  className='flex justify-between items-center text-sm py-1.5 px-2 rounded bg-zinc-900/50'
                                >
                                  <span className='text-zinc-300'>
                                    {card.name}
                                  </span>
                                  <span className='text-zinc-500'>
                                    {card.count}x
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {personalizedReading.trendAnalysis.numberPatterns.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                  Number Patterns
                </h3>
                <div className='space-y-3'>
                  {personalizedReading.trendAnalysis.numberPatterns.map(
                    (pattern, index) => (
                      <div
                        key={index}
                        className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-4'
                      >
                        <p className='font-medium text-zinc-100 mb-1'>
                          {pattern.number}s ({pattern.count} times)
                        </p>
                        <p className='text-sm text-zinc-400 leading-relaxed mb-2'>
                          {pattern.reading}
                        </p>
                        <p className='text-xs text-zinc-500'>
                          Cards: {pattern.cards.join(', ')}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {personalizedReading.trendAnalysis.arcanaPatterns.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                  Arcana Balance
                </h3>
                <div className='space-y-3'>
                  {personalizedReading.trendAnalysis.arcanaPatterns.map(
                    (pattern, index) => (
                      <div
                        key={index}
                        className='rounded-lg border border-violet-500/20 bg-violet-500/10 p-4'
                      >
                        <p className='font-medium text-zinc-100 mb-1'>
                          {pattern.type} ({pattern.count}/
                          {personalizedReading.trendAnalysis?.timeFrame} days)
                        </p>
                        <p className='text-sm text-zinc-400 leading-relaxed'>
                          {pattern.reading}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Recent Daily Cards
          </h2>
          <div className='space-y-3'>
            {previousReadings.map((reading) => (
              <div
                key={reading.date}
                className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 flex justify-between items-center hover:bg-zinc-900/50 transition-colors'
              >
                <div>
                  <span className='font-medium text-zinc-100'>
                    {reading.day}
                  </span>{' '}
                  <span className='text-sm text-zinc-400'>{reading.date}</span>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-zinc-100'>
                    {reading.card.name}
                  </p>
                  <p className='text-sm text-zinc-400'>
                    {reading.card.keywords[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotReadings;
