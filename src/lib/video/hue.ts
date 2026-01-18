const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.repeat(2) : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const rgbToHue = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  if (delta === 0) return 0;

  let hue = 0;
  if (max === rNorm) {
    hue = ((gNorm - bNorm) / delta) % 6;
  } else if (max === gNorm) {
    hue = (bNorm - rNorm) / delta + 2;
  } else {
    hue = (rNorm - gNorm) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
};

export function getThemeHueBase(hexColor: string): number {
  return rgbToHue(hexToRgb(hexColor));
}

export function clampHueShift(
  baseHue: number,
  proposedHue: number,
  maxDelta: number,
): number {
  const delta = proposedHue - baseHue;
  const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, delta));
  return baseHue + clampedDelta;
}

export function getHueSteps(baseHue: number, maxDelta: number): number[] {
  const drift = Math.min(6, maxDelta);
  const offsets = [0, drift, -drift];
  return offsets.map((offset) =>
    clampHueShift(baseHue, baseHue + offset, maxDelta),
  );
}

export function getFrameHueShift({
  frameIndex,
  baseHue,
  maxDelta,
  lockIntroHue,
}: {
  frameIndex: number;
  baseHue: number;
  maxDelta: number;
  lockIntroHue?: boolean;
}): number {
  if (lockIntroHue && frameIndex === 0) {
    return 0;
  }
  const steps = getHueSteps(baseHue, maxDelta);
  return steps[frameIndex % steps.length] ?? baseHue;
}
