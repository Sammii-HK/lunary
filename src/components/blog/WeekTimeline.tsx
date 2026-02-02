// Visual timeline of the week's major cosmic events
'use client';

import Image from 'next/image';
import { getPlanetSymbol, getMoonPhaseIcon } from '@/constants/symbols';

interface TimelineEvent {
  date: Date;
  type: 'ingress' | 'retrograde' | 'direct' | 'moon-phase' | 'aspect';
  title: string;
  planet?: string;
  sign?: string;
  phase?: string;
}

interface WeekTimelineProps {
  weekStart: Date;
  weekEnd: Date;
  events: TimelineEvent[];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                    <div
                      key={eventIndex}
                      className='group relative cursor-default'
                    >
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

                      {/* Tooltip */}
                      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10'>
                        {event.title}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='w-6 h-6' /> // Spacer for empty days
                )}
                {dayEvents.length > 2 && (
                  <span className='text-xs text-zinc-500'>
                    +{dayEvents.length - 2}
                  </span>
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
