const DEFAULT_BASE_COLOR = '#0f172a';
const DEFAULT_BLEND_RATIO = 0.55;
const DEFAULT_ANGLE = '145deg';
const DEFAULT_SECONDARY_COLOR = '#1e293b';

function hexToRgb(hex: string) {
  const cleaned = hex.trim().replace('#', '');
  if (cleaned.length === 3) {
    const [r, g, b] = cleaned.split('');
    return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)];
  }

  if (cleaned.length === 6) {
    return [
      parseInt(cleaned.slice(0, 2), 16),
      parseInt(cleaned.slice(2, 4), 16),
      parseInt(cleaned.slice(4, 6), 16),
    ];
  }

  return [15, 23, 42];
}

function componentToHex(value: number) {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, '0');
}

function mixColors(color: string, mix: string, ratio: number) {
  const [r1, g1, b1] = hexToRgb(color);
  const [r2, g2, b2] = hexToRgb(mix);
  const blend = Math.max(0, Math.min(1, ratio));
  const r = r1 * (1 - blend) + r2 * blend;
  const g = g1 * (1 - blend) + g2 * blend;
  const b = b1 * (1 - blend) + b2 * blend;

  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function softenColor(
  color: string,
  base: string = DEFAULT_BASE_COLOR,
  ratio: number = DEFAULT_BLEND_RATIO,
) {
  return mixColors(color, base, ratio);
}

export function createSubtleGradient(
  colors: [string, string],
  angle: string = DEFAULT_ANGLE,
) {
  const start = softenColor(colors[0], DEFAULT_BASE_COLOR, DEFAULT_BLEND_RATIO);
  const end = softenColor(colors[1], DEFAULT_BASE_COLOR, DEFAULT_BLEND_RATIO);
  const midpoint = mixColors(colors[0], colors[1], 0.5);
  const middle = softenColor(
    midpoint,
    DEFAULT_BASE_COLOR,
    DEFAULT_BLEND_RATIO * 1.1,
  );

  return `linear-gradient(${angle}, ${start} 0%, ${middle} 50%, ${end} 85%, ${DEFAULT_BASE_COLOR} 100%)`;
}

export function createSectionGradient(
  accentColor: string,
  options?: { angle?: string; secondaryColor?: string },
) {
  const angle = options?.angle || '135deg';
  const secondaryColor = options?.secondaryColor || DEFAULT_SECONDARY_COLOR;

  const softenedSecondary = softenColor(
    secondaryColor,
    DEFAULT_BASE_COLOR,
    0.65,
  );
  const softenedAccent = softenColor(accentColor, DEFAULT_BASE_COLOR, 0.8);
  const midpointAccent = softenColor(accentColor, DEFAULT_BASE_COLOR, 0.6);

  return `linear-gradient(${angle}, ${DEFAULT_BASE_COLOR} 0%, ${softenedSecondary} 30%, ${midpointAccent} 55%, ${softenedAccent} 70%, ${DEFAULT_BASE_COLOR} 100%)`;
}
