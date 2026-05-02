/**
 * Cosmic Habits — types for the evidence-based-astrology layer that lives on
 * top of the Book of Shadows journal.
 *
 * Each journal/dream/ritual entry can optionally carry a `HabitCapture` block
 * inside its `content` JSONB. Over weeks we bucket entries by the dominant
 * transit-to-natal aspect on their date and surface `HabitCorrelation`s like
 * "you sleep ~18% worse on Moon-square-Mars days, n=7".
 *
 * No DB schema change — `habitCapture` is just a new field on the existing
 * `collections.content` JSON shape.
 */
export type Mood = 'low' | 'meh' | 'ok' | 'good' | 'glowing';

export type SleepScore = 1 | 2 | 3 | 4 | 5;

/**
 * Optional capture row a user attaches to a journal entry.
 * Stored at `collections.content.habitCapture`.
 */
export interface HabitCapture {
  /** 1 (rough) – 5 (deep & restful). */
  sleepScore?: SleepScore;
  /** Coarse mood bucket — kept small so data buckets stay populated. */
  mood?: Mood;
  /** Free-form labels the user wants to track ("anxious", "social", …). */
  tags?: string[];
  /** Did the user run their daily practice/intention today? */
  practiced?: boolean;
}

export type HabitCorrelationKind = 'mood' | 'sleep' | 'practice';

export type HabitCorrelationConfidence = 'low' | 'medium' | 'high';

/**
 * One detected correlation between a transit-to-natal aspect bucket and a
 * tracked habit metric. `effectPct` is signed — positive = the bucket runs
 * higher than overall, negative = lower.
 */
export interface HabitCorrelation {
  kind: HabitCorrelationKind;
  /** Human-readable transit signature, e.g. "Moon square Mars". */
  transit: string;
  /** Number of journal entries in this transit bucket. */
  sampleSize: number;
  /** Signed effect size as a percentage of the overall mean. */
  effectPct: number;
  confidence: HabitCorrelationConfidence;
  /** Plain-language insight ready to render. */
  oneLiner: string;
}

/** Map mood label → numeric so we can mean/compare. */
export const MOOD_VALUES: Record<Mood, number> = {
  low: 1,
  meh: 2,
  ok: 3,
  good: 4,
  glowing: 5,
};

export const MOOD_LABELS: Mood[] = ['low', 'meh', 'ok', 'good', 'glowing'];
