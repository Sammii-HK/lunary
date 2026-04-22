import aspectInterpretations from '@/data/aspect-interpretations.json';

export type AspectType =
  | 'Conjunction'
  | 'Sextile'
  | 'Square'
  | 'Trine'
  | 'Opposition';

type AspectDef = {
  name: AspectType;
  angle: number;
  orb: number;
};

const ASPECT_DEFS: AspectDef[] = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 4 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Trine', angle: 120, orb: 7 },
  { name: 'Opposition', angle: 180, orb: 8 },
];

export function findAspect(
  longitude1: number,
  longitude2: number,
): { type: AspectType; orb: number } | null {
  const diff = Math.abs(longitude1 - longitude2);
  const normalised = Math.min(diff, 360 - diff);
  for (const def of ASPECT_DEFS) {
    const delta = Math.abs(normalised - def.angle);
    if (delta <= def.orb) {
      return { type: def.name, orb: delta };
    }
  }
  return null;
}

export type AspectInterpretation = {
  meaning: string;
  description: string;
};

type AspectMap = Record<
  string,
  Record<string, Record<AspectType, AspectInterpretation>>
>;

/**
 * Look up the textual interpretation for an aspect between two planets.
 * aspect-interpretations.json is keyed by a canonical planet ordering
 * (e.g. Sun->Moon). We try both orderings so callers don't have to know.
 */
export function getAspectInterpretation(
  planetA: string,
  planetB: string,
  type: AspectType,
): AspectInterpretation | null {
  const data = aspectInterpretations as unknown as AspectMap;
  return (
    data[planetA]?.[planetB]?.[type] ?? data[planetB]?.[planetA]?.[type] ?? null
  );
}
