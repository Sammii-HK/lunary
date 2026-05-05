'use client';

import { useState } from 'react';
import Link from 'next/link';

type WorkedExamplePart = {
  id: string;
  label: string;
  value: string;
  href: string;
  explanation: string;
};

export function ChartReadingExampleInteractive({
  parts,
}: {
  parts: WorkedExamplePart[];
}) {
  const [activeId, setActiveId] = useState(parts[0]?.id ?? '');
  const activePart = parts.find((part) => part.id === activeId) ?? parts[0];

  const activate = (id: string) => {
    setActiveId(id);
  };

  return (
    <section className='mb-12 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-6'>
      <div className='mb-6'>
        <p className='text-sm uppercase tracking-[0.3em] text-content-muted mb-3'>
          Worked visual example
        </p>
        <h2 className='text-3xl font-light text-content-primary mb-4'>
          Click the Chart, Then Read the Synthesis
        </h2>
        <p className='text-content-secondary max-w-3xl'>
          This is not a real person&apos;s full chart. It is a simplified
          teaching chart showing how one placement becomes a reading: Moon in
          Capricorn in the 7th house square Mars, with a later Mars transit
          activating the same pattern.
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center'>
        <div className='overflow-hidden rounded-xl border border-stroke-subtle bg-surface-base/70 p-3'>
          <svg
            viewBox='0 0 720 520'
            role='img'
            aria-labelledby='worked-chart-title worked-chart-description'
            className='h-auto w-full'
          >
            <title id='worked-chart-title'>
              Clickable birth chart reading example
            </title>
            <desc id='worked-chart-description'>
              Simplified chart wheel linking Moon, Capricorn, seventh house,
              square Mars, and a Mars transit to explanation sections below.
            </desc>
            <defs>
              <radialGradient id='chartGlow' cx='50%' cy='50%' r='60%'>
                <stop offset='0%' stopColor='#312e81' stopOpacity='0.35' />
                <stop offset='55%' stopColor='#18181b' stopOpacity='0.9' />
                <stop offset='100%' stopColor='#09090b' stopOpacity='1' />
              </radialGradient>
              <marker
                id='arrowHead'
                markerWidth='10'
                markerHeight='10'
                refX='8'
                refY='5'
                orient='auto'
              >
                <path d='M 0 0 L 10 5 L 0 10 z' fill='#a78bfa' />
              </marker>
            </defs>

            <rect width='720' height='520' rx='24' fill='url(#chartGlow)' />
            <g transform='translate(360 250)'>
              <circle r='178' fill='none' stroke='#52525b' strokeWidth='2' />
              <circle r='130' fill='none' stroke='#3f3f46' strokeWidth='1.5' />
              <circle r='78' fill='none' stroke='#27272a' strokeWidth='1.5' />

              {Array.from({ length: 12 }, (_, index) => {
                const angle = (index * 30 - 90) * (Math.PI / 180);
                const x1 = Math.cos(angle) * 78;
                const y1 = Math.sin(angle) * 78;
                const x2 = Math.cos(angle) * 178;
                const y2 = Math.sin(angle) * 178;
                return (
                  <line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke='#3f3f46'
                    strokeWidth='1'
                  />
                );
              })}

              <line
                x1='-160'
                y1='0'
                x2='160'
                y2='0'
                stroke='#7c3aed'
                strokeWidth='2'
              />
              <line
                x1='0'
                y1='-160'
                x2='0'
                y2='160'
                stroke='#52525b'
                strokeWidth='1'
                strokeDasharray='5 6'
              />

              <a
                href='#example-house'
                aria-label='Show 7th house meaning'
                onClick={() => activate('example-house')}
              >
                <path
                  d='M -178 0 A 178 178 0 0 1 -89 -154 L -39 -68 A 78 78 0 0 0 -78 0 Z'
                  fill='#7c3aed'
                  fillOpacity={activeId === 'example-house' ? '0.4' : '0.2'}
                  stroke={activeId === 'example-house' ? '#f8fafc' : '#a78bfa'}
                  strokeWidth={activeId === 'example-house' ? '4' : '2'}
                />
                <text
                  x='-132'
                  y='-76'
                  textAnchor='middle'
                  fill='#ddd6fe'
                  fontSize='20'
                  fontWeight='700'
                >
                  7H
                </text>
              </a>

              <a
                href='#example-sign'
                aria-label='Show Capricorn meaning'
                onClick={() => activate('example-sign')}
              >
                <text
                  x='-118'
                  y='-128'
                  textAnchor='middle'
                  fill={activeId === 'example-sign' ? '#ffffff' : '#c4b5fd'}
                  fontSize='26'
                  fontWeight='700'
                  stroke={activeId === 'example-sign' ? '#7c3aed' : 'none'}
                  strokeWidth='1'
                >
                  Capricorn
                </text>
              </a>

              <a
                href='#example-planet'
                aria-label='Show Moon meaning'
                onClick={() => activate('example-planet')}
              >
                <circle
                  cx='-92'
                  cy='-92'
                  r={activeId === 'example-planet' ? '29' : '24'}
                  fill='#f8fafc'
                  stroke={activeId === 'example-planet' ? '#facc15' : '#a78bfa'}
                  strokeWidth='3'
                />
                <text
                  x='-92'
                  y='-80'
                  textAnchor='middle'
                  fill='#18181b'
                  fontSize='34'
                  fontWeight='800'
                >
                  ☽
                </text>
                <text
                  x='-92'
                  y='-122'
                  textAnchor='middle'
                  fill='#f8fafc'
                  fontSize='18'
                  fontWeight='700'
                >
                  Moon
                </text>
              </a>

              <a
                href='#example-aspect'
                aria-label='Show square Mars meaning'
                onClick={() => activate('example-aspect')}
              >
                <line
                  x1='-92'
                  y1='-92'
                  x2='96'
                  y2='92'
                  stroke={activeId === 'example-aspect' ? '#facc15' : '#f97316'}
                  strokeWidth={activeId === 'example-aspect' ? '6' : '4'}
                  strokeDasharray='10 7'
                />
                <rect
                  x='-34'
                  y='-18'
                  width='68'
                  height='36'
                  rx='8'
                  fill='#431407'
                  stroke={activeId === 'example-aspect' ? '#facc15' : '#fb923c'}
                  strokeWidth='2'
                />
                <text
                  x='0'
                  y='7'
                  textAnchor='middle'
                  fill='#fed7aa'
                  fontSize='20'
                  fontWeight='800'
                >
                  square
                </text>
                <circle
                  cx='96'
                  cy='92'
                  r='24'
                  fill='#7f1d1d'
                  stroke={activeId === 'example-aspect' ? '#facc15' : '#f97316'}
                  strokeWidth='3'
                />
                <text
                  x='96'
                  y='104'
                  textAnchor='middle'
                  fill='#ffedd5'
                  fontSize='34'
                  fontWeight='800'
                >
                  ♂
                </text>
                <text
                  x='96'
                  y='132'
                  textAnchor='middle'
                  fill='#ffedd5'
                  fontSize='18'
                  fontWeight='700'
                >
                  Mars
                </text>
              </a>

              <a
                href='#example-timing'
                aria-label='Show transit activation meaning'
                onClick={() => activate('example-timing')}
              >
                <path
                  d='M 186 -104 C 242 -56 244 52 184 104'
                  fill='none'
                  stroke={activeId === 'example-timing' ? '#facc15' : '#38bdf8'}
                  strokeWidth={activeId === 'example-timing' ? '6' : '4'}
                  strokeDasharray='9 8'
                  markerEnd='url(#arrowHead)'
                />
                <text
                  x='236'
                  y='5'
                  textAnchor='middle'
                  fill='#bae6fd'
                  fontSize='20'
                  fontWeight='700'
                >
                  transit
                </text>
              </a>
            </g>
          </svg>
        </div>

        <div className='space-y-4'>
          <div className='rounded-xl border border-lunary-primary-700 bg-layer-base/10 p-5'>
            <p className='text-sm uppercase tracking-[0.25em] text-content-muted mb-2'>
              Selected layer
            </p>
            <h3 className='text-2xl font-light text-content-primary mb-2'>
              {activePart.value}
            </h3>
            <p className='text-content-secondary'>{activePart.explanation}</p>
            <Link
              href={activePart.href}
              className='mt-4 inline-flex text-sm text-content-brand hover:text-lunary-primary-300'
            >
              Read the full {activePart.label.toLowerCase()} guide
            </Link>
          </div>

          <h3 className='text-2xl font-light text-content-primary'>
            Synthesis
          </h3>
          <p className='text-content-secondary leading-relaxed'>
            Moon in Capricorn in the 7th house square Mars can describe someone
            who needs reliability in relationships, but may feel emotionally
            unsafe when conflict becomes sudden, direct, or heated. The
            interpretation only works because each layer is read together.
          </p>
          <p className='text-content-muted'>
            The chart does not say &quot;you are doomed in relationships.&quot;
            It says: emotional safety, control, partnership expectations, and
            anger need conscious handling.
          </p>
          <div className='flex flex-wrap gap-2 text-sm'>
            {parts.map((part) => (
              <a
                key={part.id}
                href={`#${part.id}`}
                onClick={() => activate(part.id)}
                className={`rounded-lg border px-3 py-2 ${
                  activeId === part.id
                    ? 'border-lunary-primary-600 bg-layer-base/20 text-content-brand'
                    : 'border-stroke-subtle bg-surface-card text-content-secondary hover:border-lunary-primary-600 hover:text-content-brand'
                }`}
              >
                {part.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-8 grid gap-4 md:grid-cols-2'>
        {parts.map((part) => (
          <div
            key={part.id}
            id={part.id}
            className={`scroll-mt-24 rounded-xl border p-5 transition-colors ${
              activeId === part.id
                ? 'border-lunary-primary-600 bg-layer-base/10'
                : 'border-stroke-subtle bg-surface-elevated/30'
            }`}
          >
            <p className='text-sm uppercase tracking-[0.25em] text-content-muted mb-2'>
              {part.label}
            </p>
            <h3 className='text-xl font-medium text-content-primary mb-3'>
              {part.value}
            </h3>
            <p className='text-content-muted mb-4'>{part.explanation}</p>
            <Link
              href={part.href}
              className='text-sm text-content-brand hover:text-lunary-primary-300'
            >
              Read the full {part.label.toLowerCase()} guide
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
