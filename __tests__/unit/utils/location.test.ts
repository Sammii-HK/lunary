import { parseCoordinates } from 'utils/location';

describe('parseCoordinates', () => {
  it('parses decimal coordinates with comma', () => {
    const result = parseCoordinates('35.0845, -106.6517');
    expect(result).toEqual({
      latitude: 35.0845,
      longitude: -106.6517,
    });
  });

  it('parses decimal coordinates with hemispheres', () => {
    const result = parseCoordinates('35.0845N, 106.6517W');
    expect(result?.latitude).toBeCloseTo(35.0845, 6);
    expect(result?.longitude).toBeCloseTo(-106.6517, 6);
  });

  it('parses DMS coordinates with hemispheres', () => {
    const input = '35\u00b05\'4.16"N, 106\u00b039\'4.1"W';
    const result = parseCoordinates(input);
    expect(result?.latitude).toBeCloseTo(35.0844889, 5);
    expect(result?.longitude).toBeCloseTo(-106.6511389, 5);
  });

  it('returns null for invalid input', () => {
    expect(parseCoordinates('Not a location')).toBeNull();
  });
});
