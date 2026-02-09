/**
 * polarFromLongitude is defined inline in chart-wheel-svg.tsx.
 * We replicate it here for unit testing the clockwise flip logic.
 */
function polarFromLongitude(
  longitude: number,
  ascendantAngle: number,
  radius: number,
  clockwise = false,
) {
  const adjustedLong = (longitude - ascendantAngle + 360) % 360;
  const angle = (180 + adjustedLong) % 360;
  const radian = (angle * Math.PI) / 180;
  const rawY = Math.sin(radian) * radius;
  return {
    angle,
    radian,
    x: Math.round(Math.cos(radian) * radius * 1000) / 1000,
    y: Math.round((clockwise ? -rawY : rawY) * 1000) / 1000,
  };
}

describe('polarFromLongitude clockwise toggle', () => {
  const ascendant = 120; // arbitrary ascendant longitude
  const radius = 65;

  it('clockwise=true produces negated Y vs clockwise=false', () => {
    const longitude = 45;
    const ccw = polarFromLongitude(longitude, ascendant, radius, false);
    const cw = polarFromLongitude(longitude, ascendant, radius, true);

    expect(cw.x).toBe(ccw.x);
    expect(cw.y).toBe(-ccw.y);
  });

  it('X remains unchanged between clockwise and counter-clockwise', () => {
    // Test across multiple longitudes
    for (let long = 0; long < 360; long += 30) {
      const ccw = polarFromLongitude(long, ascendant, radius, false);
      const cw = polarFromLongitude(long, ascendant, radius, true);

      expect(cw.x).toBe(ccw.x);
    }
  });

  it("Ascendant is positioned at 180 degrees (9 o'clock) regardless of clockwise", () => {
    // When longitude === ascendantAngle, adjustedLong = 0, angle = 180
    const ccw = polarFromLongitude(ascendant, ascendant, radius, false);
    const cw = polarFromLongitude(ascendant, ascendant, radius, true);

    expect(ccw.angle).toBe(180);
    expect(cw.angle).toBe(180);

    // At 180 degrees, cos(pi) = -1, sin(pi) ≈ 0
    // So x should be -radius and y should be ~0
    expect(ccw.x).toBeCloseTo(-radius, 1);
    expect(cw.x).toBeCloseTo(-radius, 1);
    expect(Math.abs(ccw.y)).toBeLessThan(0.01);
    expect(Math.abs(cw.y)).toBeLessThan(0.01);
  });

  it('handles zero radius', () => {
    const ccw = polarFromLongitude(90, ascendant, 0, false);
    const cw = polarFromLongitude(90, ascendant, 0, true);

    expect(ccw.x).toBeCloseTo(0, 5);
    expect(ccw.y).toBeCloseTo(0, 5);
    expect(cw.x).toBeCloseTo(0, 5);
    expect(cw.y).toBeCloseTo(0, 5);
  });

  it('handles full 360-degree sweep consistently', () => {
    for (let long = 0; long < 360; long += 15) {
      const ccw = polarFromLongitude(long, ascendant, radius, false);
      const cw = polarFromLongitude(long, ascendant, radius, true);

      // Y should always be negated
      expect(cw.y).toBeCloseTo(-ccw.y, 2);
      // X should always match
      expect(cw.x).toBeCloseTo(ccw.x, 2);
    }
  });
});
