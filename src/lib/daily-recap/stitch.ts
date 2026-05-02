/**
 * Daily recap — script stitcher.
 *
 * Combines the section outputs into a single narration script. Pure: no IO,
 * no async. Suitable for use from server components, API routes, and tests.
 *
 * Free users get the deterministic template-driven script. Plus users can
 * later be branched off here to receive an AI-personalised rewrite — for now
 * we leave a hook so the API route can wire that in without touching this
 * module's signature.
 */
import {
  closing,
  intro,
  keyAspectSection,
  moonPhaseSection,
  sunSection,
  type MoonPhaseInput,
  type TopAspectInput,
} from './sections';
import type { ZodiacSign } from '@/lib/transit-content/templates';

export type RecapAudience = 'free' | 'plus';

export interface StitchDailyRecapInput {
  date: Date;
  moonPhase: MoonPhaseInput;
  sunSign: ZodiacSign;
  /**
   * Optional — when omitted we just skip the aspect section rather than
   * making something up. Better to be quiet than wrong.
   */
  topAspect?: TopAspectInput;
  audience: RecapAudience;
}

const SECTION_SEPARATOR = '\n\n';

/**
 * Build the daily recap script.
 *
 * Order is intentional:
 *   1. Intro — orient the listener.
 *   2. Moon — fastest body, most felt.
 *   3. Sun — today's overall flavour.
 *   4. Key aspect — the standout movement (skipped if absent).
 *   5. Closing — release.
 */
export function stitchDailyRecap(input: StitchDailyRecapInput): string {
  const sections: string[] = [
    intro(input.date),
    moonPhaseSection(input.moonPhase),
    sunSection(input.sunSign),
  ];

  if (input.topAspect) {
    sections.push(keyAspectSection(input.topAspect));
  }

  sections.push(closing());

  const script = sections.join(SECTION_SEPARATOR);

  if (input.audience === 'plus') {
    // TODO: AI personalise hook — Plus users should get a server-cached,
    // chart-aware rewrite. The route layer is responsible for calling the
    // AI generator and substituting the result here so this module stays
    // pure and testable.
    return script;
  }

  return script;
}
