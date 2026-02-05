// Visual timeline of the week's major cosmic events
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  getPlanetSymbol,
  getMoonPhaseIcon,
  getAspectSymbol,
  getZodiacSymbol,
} from '@/constants/symbols';

interface TimelineEvent {
  date: Date;
  type: 'ingress' | 'retrograde' | 'direct' | 'moon-phase' | 'aspect';
  title: string;
  planet?: string;
  planetB?: string;
  aspect?: string;
  sign?: string;
  phase?: string;
}

interface WeekTimelineProps {
  weekStart: Date;
  weekEnd: Date;
  events: TimelineEvent[];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format event title with astronomical symbols
function formatEventTitle(event: TimelineEvent): string {
  if (
    event.type === 'aspect' &&
    event.planet &&
    event.planetB &&
    event.aspect
  ) {
    const planetASymbol = getPlanetSymbol(event.planet);
    const aspectSymbol = getAspectSymbol(event.aspect);
    const planetBSymbol = getPlanetSymbol(event.planetB);
    return `${planetASymbol} ${event.planet} ${aspectSymbol} ${planetBSymbol} ${event.planetB}`;
  }
  if (event.type === 'ingress' && event.planet && event.sign) {
    const planetSymbol = getPlanetSymbol(event.planet);
    const signSymbol = getZodiacSymbol(event.sign);
    return `${planetSymbol} ${event.planet} enters ${signSymbol} ${event.sign}`;
  }
  if (
    (event.type === 'retrograde' || event.type === 'direct') &&
    event.planet
  ) {
    const planetSymbol = getPlanetSymbol(event.planet);
    return `${planetSymbol} ${event.title}`;
  }
  return event.title;
}

// Tooltip component with proper positioning
function EventTooltip({
  children,
  content,
  dayIndex,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  dayIndex: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  // Determine tooltip alignment based on position in the week
  // Left columns align left, right columns align right, middle centers
  const getAlignment = () => {
    if (dayIndex <= 1) return 'left-0';
    if (dayIndex >= 5) return 'right-0';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div
      className='relative'
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute bottom-full mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs z-20 whitespace-nowrap ${getAlignment()}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function getEventColor(type: TimelineEvent['type']): string {
  switch (type) {
    case 'ingress':
      return 'bg-purple-500';
    case 'retrograde':
      return 'bg-amber-500';
    case 'direct':
      return 'bg-emerald-500';
    case 'moon-phase':
      return 'bg-zinc-300';
    case 'aspect':
      return 'bg-teal-500';
    default:
      return 'bg-zinc-500';
  }
}

export function WeekTimeline({
  weekStart,
  weekEnd,
  events,
}: WeekTimelineProps) {
  // Generate array of 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Group events by day
  const eventsByDay = days.map((day) => {
    const dayStr = day.toDateString();
    return events.filter((e) => {
      const eventDate = e.date instanceof Date ? e.date : new Date(e.date);
      return eventDate.toDateString() === dayStr;
    });
  });

  // Check if today falls within this week
  const today = new Date();
  const todayIndex = days.findIndex(
    (d) => d.toDateString() === today.toDateString(),
  );

  return (
    <div className='mb-8 overflow-x-auto'>
      <div className='min-w-[600px]'>
        {/* Day headers */}
        <div className='grid grid-cols-7 gap-1 mb-2'>
          {days.map((day, index) => {
            const isToday = index === todayIndex;
            return (
              <div
                key={index}
                className={`text-center text-xs ${
                  isToday
                    ? 'text-lunary-primary-400 font-semibold'
                    : 'text-zinc-500'
                }`}
              >
                <div>{dayNames[day.getDay()]}</div>
                <div
                  className={`text-lg font-medium ${
                    isToday ? 'text-lunary-primary-300' : 'text-zinc-300'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline bar */}
        <div className='relative'>
          {/* Background bar */}
          <div className='h-2 bg-zinc-800 rounded-full' />

          {/* Today marker */}
          {todayIndex >= 0 && (
            <div
              className='absolute top-0 w-2 h-2 bg-lunary-primary-400 rounded-full transform -translate-x-1/2'
              style={{ left: `${((todayIndex + 0.5) / 7) * 100}%` }}
            />
          )}

          {/* Event markers */}
          <div className='grid grid-cols-7 gap-1 mt-2'>
            {eventsByDay.map((dayEvents, dayIndex) => (
              <div key={dayIndex} className='flex flex-col items-center gap-1'>
                {dayEvents.length > 0 ? (
                  dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <EventTooltip
                      key={eventIndex}
                      content={formatEventTitle(event)}
                      dayIndex={dayIndex}
                    >
                      <div className='cursor-default'>
                        {event.type === 'moon-phase' && event.phase ? (
                          <Image
                            src={getMoonPhaseIcon(event.phase)}
                            alt={event.phase}
                            width={24}
                            height={24}
                            className='opacity-80'
                          />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full ${getEventColor(
                              event.type,
                            )} flex items-center justify-center text-xs font-medium text-zinc-900`}
                          >
                            {event.planet
                              ? getPlanetSymbol(event.planet)
                              : event.type.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </EventTooltip>
                  ))
                ) : (
                  <div className='w-6 h-6' /> // Spacer for empty days
                )}
                {dayEvents.length > 2 && (
                  <EventTooltip
                    content={
                      <div className='space-y-1'>
                        {dayEvents.slice(2).map((e, i) => (
                          <div key={i}>{formatEventTitle(e)}</div>
                        ))}
                      </div>
                    }
                    dayIndex={dayIndex}
                  >
                    <span className='text-xs text-zinc-500 cursor-default'>
                      +{dayEvents.length - 2}
                    </span>
                  </EventTooltip>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className='flex flex-wrap justify-center gap-4 mt-4 text-xs text-zinc-400'>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-purple-500' />
            <span>Sign Change</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-amber-500' />
            <span>Retrograde</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-emerald-500' />
            <span>Direct</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-teal-500' />
            <span>Aspect</span>
          </div>
          <div className='flex items-center gap-1'>
            <Image
              src='/icons/moon-phases/full-moon.svg'
              alt='Moon'
              width={12}
              height={12}
            />
            <span>Moon Phase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
