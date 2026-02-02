import { sql } from '@vercel/postgres';

export const TEST_EMAIL_PATTERN = '%@test.lunary.app';
export const TEST_EMAIL_EXACT = 'test@test.lunary.app';

/**
 * Standard SQL fragment for excluding test users from conversion_events
 */
export const testUserFilter = () => sql`
  (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
`;

/**
 * Standard SQL fragment for excluding test users from subscriptions
 * Checks both subscription.user_email and user.email
 */
export const testUserFilterSubscriptions = () => sql`
  (COALESCE(s.user_email, u.email) IS NULL
   OR (COALESCE(s.user_email, u.email) NOT LIKE ${TEST_EMAIL_PATTERN}
       AND COALESCE(s.user_email, u.email) != ${TEST_EMAIL_EXACT}))
`;

/**
 * For direct user table queries
 */
export const testUserFilterUsers = () => sql`
  (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
`;
