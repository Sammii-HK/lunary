'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heading } from '@/components/ui/Heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getCategoryVisuals,
  ALL_ANIMATION_TYPES,
  getRepresentativeCategory,
  type BackgroundAnimationType,
  type CategoryVisualConfig,
} from '@/remotion/config/category-visuals';
// Import background components directly (they're pure React, no Remotion context needed)
import { StarField } from '@/remotion/components/AnimatedBackground';
import { AuroraEffect } from '@/remotion/components/backgrounds/Aurora';
import { FloatingOrbsEffect } from '@/remotion/components/backgrounds/FloatingOrbs';
import { CandleFlamesEffect } from '@/remotion/components/backgrounds/CandleFlames';
import { SacredGeometryEffect } from '@/remotion/components/backgrounds/SacredGeometry';
import { MistWispsEffect } from '@/remotion/components/backgrounds/MistWisps';
import { EmberParticlesEffect } from '@/remotion/components/backgrounds/EmberParticles';

const FPS = 30;

const ANIMATION_LABELS: Record<BackgroundAnimationType, string> = {
  starfield: 'Starfield',
  aurora: 'Aurora',
  'floating-orbs': 'Floating Orbs',
  'candle-flames': 'Candle Flames',
  'sacred-geometry': 'Sacred Geometry',
  'mist-wisps': 'Mist Wisps',
  'ember-particles': 'Ember Particles',
};

/** Renders the appropriate background animation for a type */
function BackgroundPreview({
  animationType,
  visuals,
  frame,
  durationInFrames,
}: {
  animationType: BackgroundAnimationType;
  visuals: CategoryVisualConfig;
  frame: number;
  durationInFrames: number;
}) {
  const commonProps = {
    frame,
    durationInFrames,
    fps: FPS,
    seed: `preview-${animationType}`,
    tintColor: visuals.particleTintColor,
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse at 50% 50%, ${visuals.gradientColors[1]} 0%, ${visuals.gradientColors[0]} 70%)`,
        overflow: 'hidden',
      }}
    >
      {animationType === 'starfield' && (
        <StarField
          frame={frame}
          durationInFrames={durationInFrames}
          fps={FPS}
          seed='preview-starfield'
          tintColor={visuals.particleTintColor}
        />
      )}
      {animationType === 'aurora' && <AuroraEffect {...commonProps} />}
      {animationType === 'floating-orbs' && (
        <FloatingOrbsEffect {...commonProps} />
      )}
      {animationType === 'candle-flames' && (
        <CandleFlamesEffect {...commonProps} />
      )}
      {animationType === 'sacred-geometry' && (
        <SacredGeometryEffect {...commonProps} />
      )}
      {animationType === 'mist-wisps' && <MistWispsEffect {...commonProps} />}
      {animationType === 'ember-particles' && (
        <EmberParticlesEffect {...commonProps} />
      )}

      {/* Sample hook intro text (top) */}
      <div
        style={{
          position: 'absolute',
          top: '28%',
          left: '8%',
          right: '8%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          zIndex: 16,
        }}
      >
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          The cosmos are{' '}
          <span
            style={{
              color: visuals.accentColor,
              fontWeight: 700,
              textShadow: `0 0 20px ${visuals.accentColor}40`,
            }}
          >
            shifting
          </span>{' '}
          this week
        </p>
      </div>

      {/* Sample subtitle text (bottom) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '5%',
          right: '5%',
          textAlign: 'center',
          zIndex: 15,
        }}
      >
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            lineHeight: 1.4,
            textShadow: '0 0 4px rgba(0,0,0,0.5)',
          }}
        >
          Sample subtitle with{' '}
          <span style={{ color: visuals.highlightColor, fontWeight: 600 }}>
            highlighted
          </span>{' '}
          words
        </p>
      </div>
    </div>
  );
}

/** Color swatch display */
function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className='flex items-center gap-2'>
      <div
        className='h-6 w-6 rounded border border-zinc-600'
        style={{ backgroundColor: color }}
      />
      <span className='text-xs text-zinc-400'>
        {label}: {color}
      </span>
    </div>
  );
}

export default function VideoBackgroundsPage() {
  const [selectedAnimation, setSelectedAnimation] =
    useState<BackgroundAnimationType>('starfield');
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const animRef = useRef<number | null>(null);

  const durationInFrames = 300; // 10 seconds at 30fps
  const repCategory = getRepresentativeCategory(selectedAnimation);
  const visuals = getCategoryVisuals(repCategory);

  // Animation loop — throttle to 30fps to match actual Remotion render speed
  const lastTimeRef = useRef<number>(0);
  const frameInterval = 1000 / FPS; // ~33.3ms per frame at 30fps

  const animate = useCallback(
    (timestamp: number) => {
      if (playing) {
        const elapsed = timestamp - lastTimeRef.current;
        if (elapsed >= frameInterval) {
          lastTimeRef.current = timestamp - (elapsed % frameInterval);
          setFrame((f) => (f + 1) % durationInFrames);
        }
      }
      animRef.current = requestAnimationFrame(animate);
    },
    [playing, durationInFrames, frameInterval],
  );

  useEffect(() => {
    animRef.current = requestAnimationFrame((ts) => {
      lastTimeRef.current = ts;
      animate(ts);
    });
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return (
    <div className='min-h-screen bg-zinc-950 p-6'>
      <div className='mx-auto max-w-6xl'>
        <Heading as='h1' variant='h1' className='mb-6 text-white'>
          Video Background Preview
        </Heading>

        {/* Controls */}
        <div className='mb-6 flex flex-wrap items-center gap-4'>
          <div className='w-56'>
            <Select
              value={selectedAnimation}
              onValueChange={(v) =>
                setSelectedAnimation(v as BackgroundAnimationType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select background' />
              </SelectTrigger>
              <SelectContent>
                {ALL_ANIMATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ANIMATION_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => setViewMode('single')}
              className={`rounded px-3 py-2 text-sm ${
                viewMode === 'single'
                  ? 'bg-lunary-primary-500 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded px-3 py-2 text-sm ${
                viewMode === 'grid'
                  ? 'bg-lunary-primary-500 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Grid (All 7)
            </button>
          </div>

          <button
            onClick={() => setPlaying((p) => !p)}
            className='rounded bg-zinc-800 px-3 py-2 text-sm text-zinc-300'
          >
            {playing ? 'Pause' : 'Play'}
          </button>

          <span className='text-xs text-zinc-500'>
            Frame: {frame}/{durationInFrames} ({(frame / FPS).toFixed(1)}s)
          </span>
        </div>

        {viewMode === 'single' ? (
          <div className='flex gap-6'>
            {/* Preview panel — 9:16 aspect ratio */}
            <div
              className='relative overflow-hidden rounded-lg border border-zinc-700'
              style={{ width: 270, height: 480 }}
            >
              <BackgroundPreview
                animationType={selectedAnimation}
                visuals={visuals}
                frame={frame}
                durationInFrames={durationInFrames}
              />
            </div>

            {/* Config panel */}
            <div className='flex flex-col gap-4'>
              <Heading as='h2' variant='h3' className='text-white'>
                {ANIMATION_LABELS[selectedAnimation]}
              </Heading>

              <div className='rounded-lg border border-zinc-700 bg-zinc-900 p-4'>
                <p className='mb-3 text-sm font-medium text-zinc-300'>
                  Representative category:{' '}
                  <span className='text-lunary-primary-300'>{repCategory}</span>
                </p>

                <div className='flex flex-col gap-2'>
                  <ColorSwatch
                    color={visuals.gradientColors[0]}
                    label='Background'
                  />
                  <ColorSwatch
                    color={visuals.gradientColors[1]}
                    label='Gradient mid'
                  />
                  <ColorSwatch
                    color={visuals.gradientColors[2]}
                    label='Gradient light'
                  />
                  <ColorSwatch
                    color={visuals.highlightColor}
                    label='Highlight'
                  />
                  <ColorSwatch color={visuals.particleTintColor} label='Tint' />
                  <ColorSwatch color={visuals.accentColor} label='Accent' />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid mode — all 7 animation types */
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {ALL_ANIMATION_TYPES.map((type) => {
              const repCategory = getRepresentativeCategory(type);
              const repVisuals = getCategoryVisuals(repCategory);
              return (
                <div key={type} className='flex flex-col gap-2'>
                  <div
                    className='relative overflow-hidden rounded-lg border border-zinc-700'
                    style={{ width: '100%', aspectRatio: '9/16' }}
                  >
                    <BackgroundPreview
                      animationType={type}
                      visuals={repVisuals}
                      frame={frame}
                      durationInFrames={durationInFrames}
                    />
                  </div>
                  <p className='text-center text-xs text-zinc-400'>
                    {ANIMATION_LABELS[type]}
                    <br />
                    <span className='text-zinc-600'>({repCategory})</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
