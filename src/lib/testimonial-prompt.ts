export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const DISMISS_COOLDOWN_MS = 28 * 24 * 60 * 60 * 1000;

export interface TestimonialPromptMeta {
  firstSeen: number;
  dontAskUntil: number;
  submitted?: boolean;
}

export function shouldPromptForTestimonial(
  meta: TestimonialPromptMeta,
  now: number,
): boolean {
  if (meta.submitted) {
    return false;
  }

  const eligibleAfterWeek = meta.firstSeen + WEEK_MS;
  const eligibleAfterCancel = meta.dontAskUntil;
  return now >= eligibleAfterWeek && now >= eligibleAfterCancel;
}

export function scheduleTestimonialReask(
  meta: TestimonialPromptMeta,
  now: number,
): TestimonialPromptMeta {
  const reaskAt = now + DISMISS_COOLDOWN_MS;
  return {
    ...meta,
    dontAskUntil: reaskAt,
  };
}

export function markTestimonialSubmitted(
  meta: TestimonialPromptMeta,
): TestimonialPromptMeta {
  return {
    ...meta,
    submitted: true,
  };
}
