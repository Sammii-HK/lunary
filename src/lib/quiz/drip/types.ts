/**
 * Quiz drip — shared types for all quiz-aware email sequence configs.
 *
 * Each quiz registers a DripConfig. The welcome-drip cron reads the registry
 * and, for any user with a recorded quiz claim, routes to the quiz's
 * personalised Day 2 / Day 5 email instead of the generic welcome drip.
 */

export type DripRenderContext = {
  userName: string;
  userEmail: string;
  userId: string;
  sunSign?: string;
  risingSign?: string;
  archetype?: string;
  archetypeTagline?: string;
};

export type DripEmail = {
  subject: string;
  html: string;
  text: string;
};

export type DripConfig = {
  quizSlug: string;
  day2?: (ctx: DripRenderContext) => Promise<DripEmail>;
  day5?: (ctx: DripRenderContext) => Promise<DripEmail>;
};
