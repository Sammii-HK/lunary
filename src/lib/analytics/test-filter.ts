export const TEST_EMAIL_PATTERN = '%@test.lunary.app';
export const TEST_EMAIL_EXACT = 'test@test.lunary.app';

/**
 * Standard SQL fragment for excluding test users from conversion_events.
 * Returns a raw SQL string — safe because values are hardcoded constants.
 * Use inside sql.query() or as a raw interpolation in sql tagged templates
 * via unsafe() if available. For @vercel/postgres sql``, use sql.query() instead.
 */
export const testUserFilter = () =>
  `(user_email IS NULL OR (user_email NOT LIKE '${TEST_EMAIL_PATTERN}' AND user_email != '${TEST_EMAIL_EXACT}'))`;

/**
 * Standard SQL fragment for excluding test users from subscriptions.
 * Checks both subscription.user_email and user.email.
 */
export const testUserFilterSubscriptions = () =>
  `(COALESCE(s.user_email, u.email) IS NULL
   OR (COALESCE(s.user_email, u.email) NOT LIKE '${TEST_EMAIL_PATTERN}'
       AND COALESCE(s.user_email, u.email) != '${TEST_EMAIL_EXACT}'))`;

/**
 * For direct user table queries.
 */
export const testUserFilterUsers = () =>
  `(email IS NULL OR (email NOT LIKE '${TEST_EMAIL_PATTERN}' AND email != '${TEST_EMAIL_EXACT}'))`;

/**
 * Exclude unverified users (bots) from signed-in metrics.
 * Only applies to queries joining the "user" table — anonymous visitors are unaffected.
 * Alias: u = "user" table.
 */
export const verifiedUserFilter = (alias = 'u') =>
  `${alias}."emailVerified" = true`;

/**
 * Combined filter: exclude test users AND unverified users.
 * For direct user table queries where alias = the user table.
 */
export const realUserFilter = (alias = 'u') =>
  `${testUserFilterUsers()} AND ${verifiedUserFilter(alias)}`;
