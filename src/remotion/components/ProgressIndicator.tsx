import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../styles/theme';

interface ProgressIndicatorProps {
  /** Custom color for the progress bar */
  color?: string;
  /** Height of the progress bar */
  height?: number;
  /** Position: 'top' or 'bottom' */
  position?: 'top' | 'bottom';
}

/**
 * Progress Indicator Component
 *
 * Minimal progress bar for video playback:
 * - Thin line at top or bottom
 * - Smooth animation following playback
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  color = COLORS.cosmicPurple,
  height = 3,
  position = 'bottom',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = (frame / durationInFrames) * 100;

  const positionStyle = position === 'top' ? { top: 0 } : { bottom: 0 };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        ...positionStyle,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: color,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
};

export default ProgressIndicator;
