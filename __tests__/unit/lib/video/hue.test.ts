import { clampHueShift, getFrameHueShift } from '@/lib/video/hue';

describe('hue utilities', () => {
  it('forces frame 1 hue to 0 when locked', () => {
    const hue = getFrameHueShift({
      frameIndex: 0,
      baseHue: 12,
      maxDelta: 8,
      lockIntroHue: true,
    });
    expect(hue).toBe(0);
  });

  it('clamps hue shift within max delta', () => {
    const clamped = clampHueShift(0, 25, 10);
    expect(clamped).toBe(10);
    const frameHue = getFrameHueShift({
      frameIndex: 2,
      baseHue: 5,
      maxDelta: 8,
      lockIntroHue: false,
    });
    expect(frameHue).toBeGreaterThanOrEqual(-3);
    expect(frameHue).toBeLessThanOrEqual(13);
  });
});
