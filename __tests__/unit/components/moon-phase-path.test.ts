import { buildMoonLitPath } from '@/components/charts/MoonPhase';

const getXValues = (path: string): number[] =>
  Array.from(path.matchAll(/[ML] (-?\d+(?:\.\d+)?) /g), (match) =>
    Number(match[1]),
  );

describe('buildMoonLitPath', () => {
  it('renders a waxing crescent as a narrow right-side lit region', () => {
    const xs = getXValues(
      buildMoonLitPath({
        cx: 0,
        cy: 0,
        r: 10,
        illumination: 0.2,
        waxing: true,
        segments: 16,
      }),
    );

    expect(Math.min(...xs)).toBeGreaterThanOrEqual(-0.1);
    expect(Math.max(...xs)).toBeCloseTo(10, 5);
  });

  it('renders a waning crescent as a narrow left-side lit region', () => {
    const xs = getXValues(
      buildMoonLitPath({
        cx: 0,
        cy: 0,
        r: 10,
        illumination: 0.2,
        waxing: false,
        segments: 16,
      }),
    );

    expect(Math.min(...xs)).toBeCloseTo(-10, 5);
    expect(Math.max(...xs)).toBeLessThanOrEqual(0.1);
  });

  it('keeps gibbous phases visibly wider than crescents', () => {
    const crescentXs = getXValues(
      buildMoonLitPath({
        cx: 0,
        cy: 0,
        r: 10,
        illumination: 0.2,
        waxing: true,
      }),
    );
    const gibbousXs = getXValues(
      buildMoonLitPath({
        cx: 0,
        cy: 0,
        r: 10,
        illumination: 0.8,
        waxing: true,
      }),
    );

    const crescentWidth = Math.max(...crescentXs) - Math.min(...crescentXs);
    const gibbousWidth = Math.max(...gibbousXs) - Math.min(...gibbousXs);

    expect(gibbousWidth).toBeGreaterThan(crescentWidth);
  });
});
