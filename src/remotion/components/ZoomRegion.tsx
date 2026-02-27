import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

export interface ZoomPoint {
  /** Seconds when zoom begins */
  startTime: number;
  /** Seconds when zoom ends */
  endTime: number;
  /** Zoom multiplier — 1.0 = no zoom, 1.25 = 25% in */
  scale: number;
  /** Horizontal anchor 0-1 (0 = left, 0.5 = center, 1 = right) */
  x: number;
  /** Vertical anchor 0-1 (0 = top, 0.5 = center, 1 = bottom) */
  y: number;
}

interface ZoomRegionProps {
  zoomPoints: ZoomPoint[];
  children: React.ReactNode;
}

const ZOOM_IN_DURATION = 0.28; // seconds to ease in
const ZOOM_OUT_DURATION = 0.32; // seconds to ease out

/**
 * ZoomRegion — wraps content and applies smooth zoom/pan at specified time windows.
 *
 * Uses spring animation for natural zoom-in, interpolate easeOut for zoom-out.
 * Multiple non-overlapping zoom points can be defined for a single video.
 *
 * The zoom anchors at (x, y) so the area of interest stays visible during zoom.
 */
export const ZoomRegion: React.FC<ZoomRegionProps> = ({
  zoomPoints,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find the currently active zoom window
  const activeZoom = zoomPoints.find(
    (z) => currentTime >= z.startTime && currentTime <= z.endTime,
  );

  let scale = 1;
  let originX = 50;
  let originY = 50;

  if (activeZoom) {
    const elapsed = currentTime - activeZoom.startTime;
    const totalDuration = activeZoom.endTime - activeZoom.startTime;
    const timeBeforeEnd = totalDuration - elapsed;

    if (elapsed < ZOOM_IN_DURATION) {
      // Spring ease-in — natural deceleration into the zoom
      const springVal = spring({
        frame: Math.max(0, frame - Math.round(activeZoom.startTime * fps)),
        fps,
        config: { damping: 20, stiffness: 220, mass: 0.9 },
      });
      scale = interpolate(springVal, [0, 1], [1, activeZoom.scale], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (timeBeforeEnd < ZOOM_OUT_DURATION) {
      // Ease-out zoom back to normal
      scale = interpolate(
        timeBeforeEnd,
        [0, ZOOM_OUT_DURATION],
        [1, activeZoom.scale],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        },
      );
    } else {
      scale = activeZoom.scale;
    }

    originX = activeZoom.x * 100;
    originY = activeZoom.y * 100;
  }

  if (scale === 1) {
    // Skip the wrapper div entirely when no zoom is active
    return <>{children}</>;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${scale})`,
        transformOrigin: `${originX}% ${originY}%`,
      }}
    >
      {children}
    </div>
  );
};
