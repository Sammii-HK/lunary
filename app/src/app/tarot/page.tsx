'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { getImprovedTarotReading } from '../../../utils/tarot/improvedTarot';

const TarotReadings = () => {
  const { me } = useAccount();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  // State for time frame selection
  const [timeFrame, setTimeFrame] = useState(30);
  const [expandedSuit, setExpandedSuit] = useState<string | null>(null);

  // Get improved reading with selected time frame
  const personalizedReading = getImprovedTarotReading(userName, true, timeFrame);

  // Previous week readings
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
    return {
      day: day.format('dddd'),
      date: day.format('MMM D'),
      card: getTarotCard(dayjs(day).toDate().toDateString(), userName),
    };
  });

  if (!me) {
    return (
      <div className='h-[91vh] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-zinc-400'>
            Loading your personalized tarot reading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[91vh] space-y-6 pb-4'>
      <h1 className='py-4 text-lg font-bold'>
        {userName ? `${userName}'s Tarot Readings` : 'Your Tarot Readings'}
      </h1>

      {/* Personalized Reading Section */}
      <div className='bg-zinc-800 rounded-lg p-4 space-y-4'>
        <h2 className='text-lg font-semibold text-blue-400'>
          Your Personal Reading
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='text-center'>
            <h3 className='font-medium text-yellow-400 mb-2'>Daily Card</h3>
            <p className='font-semibold'>{personalizedReading.daily.name}</p>
            <p className='text-sm text-zinc-300 mt-1'>
              {personalizedReading.daily.keywords.slice(0, 2).join(', ')}
            </p>
          </div>

          <div className='text-center'>
            <h3 className='font-medium text-yellow-400 mb-2'>Weekly Card</h3>
            <p className='font-semibold'>{personalizedReading.weekly.name}</p>
            <p className='text-sm text-zinc-300 mt-1'>
              {personalizedReading.weekly.keywords.slice(0, 2).join(', ')}
            </p>
          </div>
        </div>

        {/* Clear Daily Message */}
        <div className='mt-4 p-3 bg-zinc-700 rounded'>
          <h3 className='font-medium text-purple-400 mb-2'>Daily Message</h3>
          <p className='text-sm text-zinc-200 mb-3'>
            {personalizedReading.guidance.dailyMessage}
          </p>
        </div>

        {/* Weekly Energy */}
        <div className='mt-4 p-3 bg-indigo-900/30 rounded border border-indigo-800'>
          <h3 className='font-medium text-indigo-400 mb-2'>Weekly Energy</h3>
          <p className='text-sm text-indigo-200'>
            {personalizedReading.guidance.weeklyMessage}
          </p>
        </div>

        {/* Action Points */}
        <div className='mt-4 p-3 bg-green-900/30 rounded border border-green-800'>
          <h3 className='font-medium text-green-400 mb-2'>Key Guidance</h3>
          <ul className='text-sm text-green-200 space-y-1'>
            {personalizedReading.guidance.actionPoints.map((point, index) => (
              <li key={index} className='flex items-start'>
                <span className='text-green-400 mr-2'>•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trend Analysis */}
      {personalizedReading.trendAnalysis && (
        <div className='bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-4 border border-purple-800'>
          <h2 className='text-lg font-semibold mb-4 text-purple-400'>
            Your 30-Day Tarot Patterns
          </h2>

          {/* Dominant Themes */}
          <div className='mb-4'>
            <h3 className='font-medium text-indigo-400 mb-2'>
              Dominant Themes
            </h3>
            <div className='flex flex-wrap gap-2'>
              {personalizedReading.trendAnalysis.dominantThemes.map(
                (theme, index) => (
                  <span
                    key={theme}
                    className={`px-2 py-1 text-xs rounded ${
                      index === 0
                        ? 'bg-purple-700 text-white'
                        : index === 1
                          ? 'bg-purple-800 text-purple-200'
                          : 'bg-purple-900 text-purple-300'
                    }`}
                  >
                    {theme}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Card Patterns with Readings */}
          {personalizedReading.trendAnalysis.frequentCards.length > 0 && (
            <div className='mb-4'>
              <h3 className='font-medium text-indigo-400 mb-2'>
                Card Patterns
              </h3>
              <div className='space-y-3'>
                {personalizedReading.trendAnalysis.frequentCards.map(
                  (card, index) => (
                    <div
                      key={index}
                      className='bg-indigo-900/30 p-3 rounded border border-indigo-800'
                    >
                      <p className='font-medium text-indigo-200 mb-1'>
                        {card.name} ({card.count} times)
                      </p>
                      <p className='text-xs text-indigo-300'>{card.reading}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Enhanced Suit Patterns */}
          {personalizedReading.trendAnalysis.suitPatterns.length > 0 && (
            <div className='mb-4'>
              <h3 className='font-medium text-indigo-400 mb-2'>
                Suit Patterns
              </h3>
              <div className='space-y-3'>
                {personalizedReading.trendAnalysis.suitPatterns.map(
                  (pattern, index) => (
                    <div
                      key={index}
                      className='bg-purple-900/30 p-3 rounded border border-purple-800'
                    >
                      <div 
                        className='flex justify-between items-center cursor-pointer'
                        onClick={() => setExpandedSuit(expandedSuit === pattern.suit ? null : pattern.suit)}
                      >
                        <p className='font-medium text-purple-200 mb-1'>
                          {pattern.suit} ({pattern.count}/{personalizedReading.trendAnalysis?.timeFrame} days)
                        </p>
                        <span className='text-purple-400 text-sm'>
                          {expandedSuit === pattern.suit ? '▼' : '▶'}
                        </span>
                      </div>
                      <p className='text-xs text-purple-300 mb-2'>{pattern.reading}</p>
                      
                      {expandedSuit === pattern.suit && (
                        <div className='mt-3 pt-3 border-t border-purple-700'>
                          <p className='text-xs text-purple-400 mb-2'>Individual Cards:</p>
                          <div className='grid grid-cols-1 gap-1'>
                            {pattern.cards.map((card, cardIndex) => (
                              <div key={cardIndex} className='flex justify-between text-xs'>
                                <span className='text-purple-200'>{card.name}</span>
                                <span className='text-purple-400'>{card.count}x</span>
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

          {/* Time Frame Controls */}
          <div className='mb-4'>
            <h3 className='font-medium text-indigo-400 mb-2'>Analysis Period</h3>
            <div className='flex gap-2'>
              {[7, 14, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeFrame(days)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    timeFrame === days
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Number Patterns */}
          {personalizedReading.trendAnalysis.numberPatterns.length > 0 && (
            <div className='mb-4'>
              <h3 className='font-medium text-orange-400 mb-2'>Number Patterns</h3>
              <div className='space-y-3'>
                {personalizedReading.trendAnalysis.numberPatterns.map(
                  (pattern, index) => (
                    <div
                      key={index}
                      className='bg-orange-900/30 p-3 rounded border border-orange-800'
                    >
                      <p className='font-medium text-orange-200 mb-1'>
                        {pattern.number}s ({pattern.count} times)
                      </p>
                      <p className='text-xs text-orange-300 mb-2'>{pattern.reading}</p>
                      <p className='text-xs text-orange-400'>
                        Cards: {pattern.cards.join(', ')}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Arcana Patterns */}
          {personalizedReading.trendAnalysis.arcanaPatterns.length > 0 && (
            <div>
              <h3 className='font-medium text-yellow-400 mb-2'>Arcana Balance</h3>
              <div className='space-y-3'>
                {personalizedReading.trendAnalysis.arcanaPatterns.map(
                  (pattern, index) => (
                    <div
                      key={index}
                      className='bg-yellow-900/30 p-3 rounded border border-yellow-800'
                    >
                                             <p className='font-medium text-yellow-200 mb-1'>
                         {pattern.type} ({pattern.count}/{personalizedReading.trendAnalysis?.timeFrame} days)
                       </p>
                      <p className='text-xs text-yellow-300'>{pattern.reading}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previous Readings */}
      <div>
        <h2 className='text-lg font-semibold mb-3'>Recent Daily Cards</h2>
        <div className='space-y-2'>
          {previousReadings.map((reading) => (
            <div
              key={reading.date}
              className='bg-zinc-800 rounded-lg p-3 flex justify-between items-center'
            >
              <div>
                <span className='font-bold'>{reading.day}</span> {reading.date}
              </div>
              <div className='text-right'>
                <p className='font-medium'>{reading.card.name}</p>
                <p className='text-sm text-zinc-400'>
                  {reading.card.keywords[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TarotReadings;
