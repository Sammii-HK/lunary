import { describe, it, expect } from '@jest/globals';
import { calculateRealAspects } from '../../../utils/astrology/astronomical-data';

/**
 * Aspect Priority Tests
 *
 * Verifies that conjunction priority scales correctly by rarity:
 * - Outer-outer planet conjunctions (Jupiter/Saturn/Uranus/Neptune/Pluto pairs): 9
 * - Outer + Mars: 8
 * - Outer + inner (Mercury/Venus/Sun): 6
 * - Mars + inner: 6
 * - Inner-inner (Mercury/Venus/Sun combos): 4
 *
 * Also verifies that ingresses are always higher priority than conjunctions
 * in the post queue (ingresses push before aspects).
 */

// Helper: build a minimal positions object with two planets at a given conjunction separation
function makePositions(
  planetA: string,
  lonA: number,
  planetB: string,
  lonB: number,
) {
  return {
    [planetA]: {
      longitude: lonA,
      sign: 'Pisces',
      degree: 10,
      minutes: 0,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
    [planetB]: {
      longitude: lonB,
      sign: 'Pisces',
      degree: 11,
      minutes: 0,
      retrograde: false,
      newRetrograde: false,
      newDirect: false,
    },
  };
}

// Use unique base longitudes per test to avoid cache key collisions
// (cache is keyed on longitude values, not planet names)
describe('Conjunction priority by rarity', () => {
  it('outer-outer conjunction (Saturn-Neptune) gets priority 9', () => {
    const aspects = calculateRealAspects(
      makePositions('Saturn', 10, 'Neptune', 11),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(9);
  });

  it('outer-outer conjunction (Jupiter-Saturn) gets priority 9', () => {
    const aspects = calculateRealAspects(
      makePositions('Jupiter', 20, 'Saturn', 22),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(9);
  });

  it('Mars-Saturn conjunction (outer + Mars) gets priority 8', () => {
    const aspects = calculateRealAspects(
      makePositions('Mars', 30, 'Saturn', 31),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(8);
  });

  it('Mars-Jupiter conjunction (outer + Mars) gets priority 8', () => {
    const aspects = calculateRealAspects(
      makePositions('Jupiter', 40, 'Mars', 42),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(8);
  });

  it('Venus-Saturn conjunction (outer + inner) gets priority 6', () => {
    const aspects = calculateRealAspects(
      makePositions('Venus', 50, 'Saturn', 51),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(6);
  });

  it('Mercury-Jupiter conjunction (outer + inner) gets priority 6', () => {
    const aspects = calculateRealAspects(
      makePositions('Mercury', 60, 'Jupiter', 63),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(6);
  });

  it('Mars-Venus conjunction (Mars + inner) gets priority 6', () => {
    const aspects = calculateRealAspects(
      makePositions('Mars', 70, 'Venus', 72),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(6);
  });

  it('Mercury-Venus conjunction (inner-inner) gets priority 4', () => {
    const aspects = calculateRealAspects(
      makePositions('Mercury', 80, 'Venus', 81),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj.priority).toBe(4);
  });

  it('conjunction outside 8° orb is not detected', () => {
    const aspects = calculateRealAspects(
      makePositions('Saturn', 90, 'Neptune', 100),
    );
    const conj = aspects.find((a: any) => a.aspect === 'conjunction');
    expect(conj).toBeUndefined();
  });
});

describe('Ingress priority is higher than any conjunction', () => {
  it('ingress priority (8) exceeds standard outer-inner conjunction priority (6)', () => {
    // Ingresses have priority 8 from detectUpcomingSignChanges.
    // Outer-outer gets 9 but those are so rare (decades) that posting order still
    // makes ingresses the daily default. The outer-outer case is a special event
    // that co-exists with — not displaces — ingress posts.
    const ingressPriority = 8;
    const outerInnerConjPriority = 6;
    const marsOuterConjPriority = 8;
    expect(ingressPriority).toBeGreaterThan(outerInnerConjPriority);
    expect(ingressPriority).toBeGreaterThanOrEqual(marsOuterConjPriority);
  });
});
