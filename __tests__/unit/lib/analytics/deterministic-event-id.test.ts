import { deterministicEventId } from '@/lib/analytics/deterministic-event-id';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('deterministicEventId', () => {
  it('returns a valid UUID v5-like string', () => {
    const id = deterministicEventId('app_opened', 'user_1', '2026-02-16');
    expect(id).toMatch(UUID_REGEX);
  });

  it('is deterministic — same inputs always produce the same UUID', () => {
    const a = deterministicEventId(
      'page_viewed',
      'user_1',
      '/horoscope',
      '2026-02-16',
    );
    const b = deterministicEventId(
      'page_viewed',
      'user_1',
      '/horoscope',
      '2026-02-16',
    );
    expect(a).toBe(b);
  });

  it('produces different UUIDs for different event types', () => {
    const a = deterministicEventId('app_opened', 'user_1', '2026-02-16');
    const b = deterministicEventId('product_opened', 'user_1', '2026-02-16');
    expect(a).not.toBe(b);
  });

  it('produces different UUIDs for different users', () => {
    const a = deterministicEventId('app_opened', 'user_1', '2026-02-16');
    const b = deterministicEventId('app_opened', 'user_2', '2026-02-16');
    expect(a).not.toBe(b);
  });

  it('produces different UUIDs for different dates', () => {
    const a = deterministicEventId('app_opened', 'user_1', '2026-02-16');
    const b = deterministicEventId('app_opened', 'user_1', '2026-02-17');
    expect(a).not.toBe(b);
  });

  it('produces different UUIDs for different paths (page_viewed dedup)', () => {
    const a = deterministicEventId(
      'page_viewed',
      'user_1',
      '/horoscope',
      '2026-02-16',
    );
    const b = deterministicEventId(
      'page_viewed',
      'user_1',
      '/grimoire',
      '2026-02-16',
    );
    expect(a).not.toBe(b);
  });

  it('handles anonymous identity consistently', () => {
    const a = deterministicEventId('app_opened', 'anon_abc123', '2026-02-16');
    const b = deterministicEventId('app_opened', 'anon_abc123', '2026-02-16');
    expect(a).toBe(b);
    expect(a).toMatch(UUID_REGEX);
  });

  it('version nibble is always 5', () => {
    for (let i = 0; i < 20; i++) {
      const id = deterministicEventId(
        'evt',
        `u${i}`,
        `2026-01-${String(i + 1).padStart(2, '0')}`,
      );
      // UUID format: xxxxxxxx-xxxx-Vxxx-Nxxx-xxxxxxxxxxxx
      // Version nibble V should be 5
      expect(id[14]).toBe('5');
    }
  });

  it('variant bits are always 10xx (8, 9, a, or b)', () => {
    for (let i = 0; i < 20; i++) {
      const id = deterministicEventId(
        'evt',
        `u${i}`,
        `2026-01-${String(i + 1).padStart(2, '0')}`,
      );
      // Variant nibble N should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(id[19]);
    }
  });

  it('produces different output for visit route pattern vs open route pattern', () => {
    // Visit: eventType + identity + path + date
    const visit = deterministicEventId(
      'page_viewed',
      'user_1',
      '/dashboard',
      '2026-02-16',
    );
    // Open: eventType + identity + date (no path)
    const open = deterministicEventId('app_opened', 'user_1', '2026-02-16');
    expect(visit).not.toBe(open);
  });
});
