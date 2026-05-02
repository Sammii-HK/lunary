import type { CompositeChart } from './composite';

const ELEMENT_BLURB: Record<CompositeChart['dominantElement'], string> = {
  Fire: 'This relationship moves through heat: spark, courage, directness, and the need to keep choosing aliveness over politeness.',
  Earth:
    'This relationship wants proof: rituals, routines, shared resources, and the quiet safety of showing up again.',
  Air: 'This relationship breathes through conversation: curiosity, naming the pattern, trading perspective, and letting the mind stay open.',
  Water:
    'This relationship has a tide: memory, softness, instinct, and the brave work of feeling things before explaining them.',
};

const MODALITY_BLURB: Record<CompositeChart['dominantModality'], string> = {
  Cardinal:
    'Cardinal emphasis means the bond initiates movement; together you push doors open.',
  Fixed:
    'Fixed emphasis makes the bond loyal and durable, though it can cling to a pattern after it has expired.',
  Mutable:
    'Mutable emphasis keeps the bond adaptive; the relationship survives by changing shape honestly.',
};

export function composeCompositeReading(composite: CompositeChart): string {
  const sun = composite.placements.find((p) => p.body === 'Sun');
  const moon = composite.placements.find((p) => p.body === 'Moon');
  const asc = composite.placements.find((p) => p.body === 'Ascendant');
  const signature = composite.signatureAspect;

  const pieces = [
    ELEMENT_BLURB[composite.dominantElement],
    MODALITY_BLURB[composite.dominantModality],
  ];

  if (sun) {
    pieces.push(
      `Composite Sun in ${sun.sign} names the shared purpose: the thing this relationship becomes when it is acting as one organism.`,
    );
  }
  if (moon) {
    pieces.push(
      `Composite Moon in ${moon.sign} shows the emotional climate you create together, especially when nobody is performing.`,
    );
  }
  if (asc) {
    pieces.push(
      `Composite Rising in ${asc.sign} is the relationship's first impression: how the two of you enter a room as a pair.`,
    );
  }
  if (signature) {
    pieces.push(
      `The tightest internal aspect is ${signature.bodyA} ${signature.aspect} ${signature.bodyB}; that is the relationship's loudest recurring lesson, gift, or pressure point.`,
    );
  }

  return pieces.join(' ');
}
