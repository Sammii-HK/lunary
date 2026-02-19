import {
  WEEK_MS,
  DISMISS_COOLDOWN_MS,
  markTestimonialSubmitted,
  scheduleTestimonialReask,
  shouldPromptForTestimonial,
  TestimonialPromptMeta,
} from '@/lib/testimonial-prompt';

describe('testimonial prompt timing', () => {
  const baseTime = 1_700_000_000_000; // arbitrary fixed timestamp

  const buildMeta = (
    overrides?: Partial<TestimonialPromptMeta>,
  ): TestimonialPromptMeta =>
    ({
      firstSeen: baseTime,
      dontAskUntil: baseTime,
      submitted: false,
      ...overrides,
    }) as TestimonialPromptMeta;

  it('prompts after a week has passed and cancel window has elapsed', () => {
    const meta = buildMeta();
    const now = baseTime + WEEK_MS + 100;
    expect(shouldPromptForTestimonial(meta, now)).toBe(true);
  });

  it('does not prompt before a week has passed', () => {
    const meta = buildMeta();
    const now = baseTime + WEEK_MS - 1;
    expect(shouldPromptForTestimonial(meta, now)).toBe(false);
  });

  it('respects dontAskUntil delays', () => {
    const meta = buildMeta({ dontAskUntil: baseTime + WEEK_MS + 5000 });
    const now = baseTime + WEEK_MS + 100;
    expect(shouldPromptForTestimonial(meta, now)).toBe(false);
  });

  it('never prompts after submission', () => {
    const meta = buildMeta({ submitted: true });
    const now = baseTime + WEEK_MS + 100;
    expect(shouldPromptForTestimonial(meta, now)).toBe(false);
  });

  it('schedules a reask 28 days from now', () => {
    const meta = buildMeta();
    const now = baseTime + WEEK_MS + 500;
    const next = scheduleTestimonialReask(meta, now);
    expect(next.dontAskUntil).toBe(now + DISMISS_COOLDOWN_MS);
  });

  it('marks the meta as submitted', () => {
    const meta = buildMeta();
    const next = markTestimonialSubmitted(meta);
    expect(next.submitted).toBe(true);
  });
});
