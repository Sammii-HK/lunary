import { createHash } from 'crypto';

/**
 * Generate a deterministic UUID v5-like event ID for deduplication.
 *
 * Given the same input components, always produces the same UUID.
 * The DB unique constraint on conversion_events.event_id then handles
 * dedup via ON CONFLICT (event_id) DO NOTHING — no SELECT needed.
 *
 * @param components - Strings that together define uniqueness (e.g. eventType, identity, date)
 * @returns A valid UUID string
 */
export function deterministicEventId(...components: string[]): string {
  const input = components.join(':');
  const hash = createHash('sha256').update(input).digest('hex');
  // Format as UUID: 8-4-4-4-12, with version nibble = 5 and variant bits = 10xx
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    `5${hash.substring(13, 16)}`, // version 5
    `${((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16)}${hash.substring(17, 20)}`, // variant 10xx
    hash.substring(20, 32),
  ].join('-');
}
