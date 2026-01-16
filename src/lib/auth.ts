import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { getAllowedOrigins } from './origin-validation';

// Postgres pool (PRIMARY)
let pgPool: Pool | null = null;

function getPostgresPool() {
  if (pgPool) return pgPool;

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    // Skip in build phase, CI/test mode, or when SKIP_AUTH is set
    if (
      process.env.NEXT_PHASE ||
      process.env.CI ||
      process.env.NODE_ENV === 'test' ||
      process.env.SKIP_AUTH === 'true' ||
      process.env.BYPASS_AUTH === 'true'
    ) {
      console.warn('⚠️ POSTGRES_URL not set - running without database');
      return null;
    }
    throw new Error('POSTGRES_URL required');
  }

  pgPool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
  });
  return pgPool;
}

// Migrate user from Jazz to Postgres after successful Jazz login
// Now also updates existing users' password hashes if they exist in Postgres with wrong hash
async function migrateJazzUserToPostgres(
  jazzUser: any,
  jazzSession: any,
  jazzPasswordHash?: string,
) {
  const pool = getPostgresPool();
  if (!pool || !jazzUser) return;

  try {
    // Check if user already exists in Postgres
    const existing = await pool.query(
      'SELECT id FROM "user" WHERE id = $1 OR email = $2',
      [jazzUser.id, jazzUser.email],
    );

    if (existing.rows.length > 0) {
      console.log(`✅ User ${jazzUser.email} already in Postgres`);

      // Even if user exists, update their password hash if we have the correct one from Jazz
      if (jazzPasswordHash) {
        console.log(
          `🔐 Updating password hash for ${jazzUser.email} from Jazz...`,
        );
        await pool.query(
          `UPDATE account SET password = $1, "updatedAt" = NOW() 
           WHERE "userId" = $2 AND "providerId" = 'credential'`,
          [jazzPasswordHash, existing.rows[0].id],
        );
        console.log(`✅ Password hash updated for ${jazzUser.email}`);
      }

      // Update migration status if not already set
      await pool.query(
        `INSERT INTO jazz_migration_status (user_id, migration_status, migrated_at, jazz_account_id)
         VALUES ($1, 'completed', COALESCE((SELECT "createdAt" FROM "user" WHERE id = $1), NOW()), $2)
         ON CONFLICT (user_id) DO UPDATE SET
           migration_status = 'completed',
           migrated_at = COALESCE(jazz_migration_status.migrated_at, NOW()),
           jazz_account_id = COALESCE(EXCLUDED.jazz_account_id, jazz_migration_status.jazz_account_id),
           updated_at = NOW()
         WHERE jazz_migration_status.migration_status != 'completed'`,
        [existing.rows[0].id, jazzUser.id],
      );

      return;
    }

    // Migrate user to Postgres
    await pool.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        jazzUser.id,
        jazzUser.name || null,
        jazzUser.email,
        jazzUser.emailVerified || false,
        jazzUser.image || null,
        jazzUser.createdAt || new Date(),
      ],
    );

    console.log(`🎉 Migrated user ${jazzUser.email} from 💩 to Postgres!`);

    // Also migrate the session if we have one
    if (jazzSession) {
      await pool.query(
        `INSERT INTO session (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          jazzSession.id,
          jazzUser.id,
          jazzSession.token,
          jazzSession.expiresAt ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          jazzSession.ipAddress || null,
          jazzSession.userAgent || null,
        ],
      );
    }

    // Create account with correct password hash from Jazz
    const accountId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT ("userId", "providerId") DO UPDATE SET password = $5, "updatedAt" = NOW()`,
      [
        accountId,
        jazzUser.email,
        'credential',
        jazzUser.id,
        jazzPasswordHash || null,
      ],
    );

    if (jazzPasswordHash) {
      console.log(`✅ Account migrated with correct password hash`);
    } else {
      console.log(`⚠️ Account migrated but no password hash available`);
    }

    // Track migration status
    await pool.query(
      `INSERT INTO jazz_migration_status (user_id, migration_status, migrated_at, jazz_account_id)
       VALUES ($1, 'completed', NOW(), $2)
       ON CONFLICT (user_id) DO UPDATE SET
         migration_status = 'completed',
         migrated_at = COALESCE(jazz_migration_status.migrated_at, NOW()),
         jazz_account_id = COALESCE(EXCLUDED.jazz_account_id, jazz_migration_status.jazz_account_id),
         updated_at = NOW()`,
      [jazzUser.id, jazzUser.id],
    );

    console.log(`✅ Migration status tracked for ${jazzUser.email}`);
  } catch (error) {
    console.error('❌ Failed to migrate user from 💩 to Postgres:', error);

    // Try to record failed migration status
    try {
      const pool = getPostgresPool();
      if (pool && jazzUser?.id) {
        await pool.query(
          `INSERT INTO jazz_migration_status (user_id, migration_status, error_message)
           VALUES ($1, 'failed', $2)
           ON CONFLICT (user_id) DO UPDATE SET
             migration_status = 'failed',
             error_message = EXCLUDED.error_message,
             updated_at = NOW()`,
          [
            jazzUser.id,
            error instanceof Error ? error.message : 'Unknown error',
          ],
        );
      }
    } catch (statusError) {
      // Ignore errors when recording migration status
      console.error('Failed to record migration status:', statusError);
    }
  }
}

// Hash password using Better Auth's method
async function hashPasswordForMigration(
  plainPassword: string,
): Promise<string | null> {
  try {
    const { hashPassword } = await import('better-auth/crypto');
    const hash = await hashPassword(plainPassword);
    console.log(`🔐 Generated password hash for migration`);
    return hash;
  } catch (error) {
    console.error('❌ Failed to hash password for migration:', error);
    return null;
  }
}

async function recordSignupConversionEvent(
  pool: Pool,
  user: { id: string; email?: string | null; createdAt?: Date | string | null },
): Promise<void> {
  try {
    const normalizedEmail =
      typeof user.email === 'string' && user.email.trim().length > 0
        ? user.email.trim().toLowerCase()
        : null;
    const createdAt =
      user.createdAt instanceof Date
        ? user.createdAt
        : user.createdAt
          ? new Date(user.createdAt)
          : new Date();

    await pool.query(
      `INSERT INTO conversion_events (
        event_type,
        user_id,
        user_email,
        metadata,
        created_at
      )
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (
        SELECT 1
        FROM conversion_events
        WHERE event_type = $1
          AND user_id = $2
      )`,
      [
        'signup',
        user.id,
        normalizedEmail,
        JSON.stringify({ source: 'auth' }),
        createdAt,
      ],
    );
  } catch (error) {
    console.warn('[auth] Failed to record signup conversion event:', error);
  }
}

// Jazz fallback adapter (READ-ONLY for existing users, disabled for new signups)
async function createJazzFallbackAdapter() {
  try {
    const accountID = process.env.JAZZ_WORKER_ACCOUNT;
    const accountSecret = process.env.JAZZ_WORKER_SECRET;

    if (!accountID || !accountSecret) {
      console.log(
        '[Jazz] Credentials not set - fallback disabled (expected for new signups)',
      );
      return null;
    }

    const { JazzBetterAuthDatabaseAdapter } =
      await import('jazz-tools/better-auth/database-adapter');

    return JazzBetterAuthDatabaseAdapter({
      syncServer:
        process.env.JAZZ_SYNC_SERVER ||
        `wss://cloud.jazz.tools/?key=${process.env.JAZZ_SYNC_KEY || ''}`,
      accountID,
      accountSecret,
    });
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('secret') || msg.includes('seed')) {
      console.log(
        '[Jazz] Adapter init skipped - no Jazz account for this user',
      );
    } else {
      console.warn('[Jazz] Failed to initialize fallback:', error);
    }
    return null;
  }
}

// Auth instances
let authInstance: ReturnType<typeof betterAuth> | null = null;
let jazzAuthInstance: ReturnType<typeof betterAuth> | null = null;

async function initializeAuth() {
  if (authInstance) return authInstance;

  const pool = getPostgresPool();

  const sharedConfig = {
    secret: (() => {
      const secret = process.env.BETTER_AUTH_SECRET?.trim();
      if (secret) return secret;
      if (process.env.NEXT_PHASE || process.env.NODE_ENV === 'test') {
        return 'test-secret-key-for-jest-tests-only';
      }
      if (process.env.NODE_ENV === 'development') {
        return 'local-dev-secret-key-change-in-production';
      }
      throw new Error('BETTER_AUTH_SECRET required in production');
    })(),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      async sendResetPassword({ user, url }: { user: any; url: string }) {
        try {
          const emailModule = await import('./email');
          const html = await (
            emailModule as any
          ).generatePasswordResetEmailHTML(url, user.email);
          const text = (emailModule as any).generatePasswordResetEmailText(
            url,
            user.email,
          );
          await emailModule.sendEmail({
            to: user.email,
            subject: '🔐 Reset Your Lunary Password',
            html,
            text,
            tracking: {
              userId: user.id || user.email,
              notificationType: 'password_reset',
              notificationId: `password-reset-${user.id || user.email}`,
              utm: {
                source: 'email',
                medium: 'auth',
                campaign: 'password_reset',
              },
            },
          });
          console.log(`🔐 Password reset email sent to ${user.email}`);
        } catch (error) {
          console.error('Failed to send password reset email:', error);
          throw error;
        }
      },
    },

    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      async sendVerificationEmail({
        user,
        url,
        token,
      }: {
        user: any;
        url: string;
        token: string;
      }) {
        try {
          const emailModule = await import('./email');
          const html = await (emailModule as any).generateVerificationEmailHTML(
            url,
            user.email,
          );
          const text = await (emailModule as any).generateVerificationEmailText(
            url,
            user.email,
          );
          await emailModule.sendEmail({
            to: user.email,
            subject: '✨ Verify Your Email - Lunary',
            html,
            text,
            tracking: {
              userId: user.id || user.email,
              notificationType: 'email_verification',
              notificationId: `email-verify-${token}`,
              utm: {
                source: 'email',
                medium: 'auth',
                campaign: 'email_verification',
              },
            },
          });
          console.log(`✅ Verification email sent to ${user.email}`);
        } catch (error) {
          console.error('Failed to send verification email:', error);
          throw error;
        }
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 },
    },

    baseURL:
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://lunary.app'),

    trustedOrigins: (request: Request) => {
      const origins = getAllowedOrigins();
      const reqOrigin = request.headers.get('origin');
      if (reqOrigin) {
        const patterns = [
          /^https:\/\/[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
          /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
        ];
        if (patterns.some((p) => p.test(reqOrigin))) {
          return [...origins, reqOrigin];
        }
      }
      return origins;
    },

    advanced: { database: { generateId: () => crypto.randomUUID() } },
  };

  // Skip auth initialization if no database (CI/test mode)
  if (!pool) {
    console.warn('⚠️ Auth running in mock mode (no database)');
    // Return a minimal mock auth that allows the app to start
    authInstance = {
      handler: async () =>
        new Response('Auth disabled in test mode', { status: 503 }),
      api: new Proxy(
        {},
        {
          get() {
            return async () => ({ user: null, session: null });
          },
        },
      ),
    } as any;
    return authInstance;
  }

  // PRIMARY: Postgres
  authInstance = betterAuth({
    database: pool as any,
    ...sharedConfig,
    plugins: [],
    databaseHooks: {
      user: {
        create: {
          async after(user: any) {
            console.log('✨ New user created in Postgres:', user.id);

            if (pool) {
              await recordSignupConversionEvent(pool, user);
            }

            // Send welcome email (transactional - no opt-in required)
            if (user.email) {
              try {
                const emailModule = await import('./email');
                const html = await (
                  emailModule as any
                ).generateWelcomeEmailHTML(user.email, user.name);
                const text = (emailModule as any).generateWelcomeEmailText(
                  user.email,
                  user.name,
                );

                await emailModule.sendEmail({
                  to: user.email,
                  subject: '✨ Welcome to Lunary',
                  html,
                  text,
                  tracking: {
                    userId: user.id,
                    notificationType: 'welcome',
                    notificationId: `welcome-${user.id}`,
                    utm: {
                      source: 'email',
                      medium: 'transactional',
                      campaign: 'welcome',
                    },
                  },
                });
                console.log(`✅ Welcome email sent to ${user.email}`);
              } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't throw - welcome email failure shouldn't block signup
              }
            }
          },
        },
      },
    },
  });

  // FALLBACK: Jazz (for users not yet migrated)
  const jazzAdapter = await createJazzFallbackAdapter();
  if (jazzAdapter) {
    const { jazzPlugin } = await import('jazz-tools/better-auth/auth/server');
    jazzAuthInstance = betterAuth({
      database: jazzAdapter,
      ...sharedConfig,
      plugins: [jazzPlugin()],
    });
    console.log(
      '💩 Legacy fallback ready (will migrate users to Postgres on login)',
    );
  }

  return authInstance;
}

// Export auth with Postgres-first, Jazz-fallback-then-migrate logic
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    if (process.env.NEXT_PHASE) {
      if (prop === 'handler') {
        return async () => new Response('Build phase', { status: 503 });
      }
      return undefined;
    }

    // API methods with fallback + migration
    if (prop === 'api') {
      return new Proxy(
        {},
        {
          get(_apiTarget, apiProp) {
            return async (...args: any[]) => {
              await initializeAuth();

              // Try Postgres first
              try {
                const result = await (authInstance as any).api[apiProp](
                  ...args,
                );
                return result;
              } catch (postgresError: any) {
                // Fallback to Jazz for auth errors - user might have correct password in Jazz
                // but wrong hash in Postgres from broken batch migration
                const isAuthError =
                  postgresError?.message?.includes('User not found') ||
                  postgresError?.message?.includes('user not found') ||
                  postgresError?.message?.includes('No user found') ||
                  postgresError?.message?.includes('Invalid password') ||
                  postgresError?.message?.includes('Invalid credentials') ||
                  postgresError?.message?.includes(
                    'Invalid email or password',
                  ) ||
                  postgresError?.message?.includes('Incorrect password') ||
                  postgresError?.code === 'USER_NOT_FOUND' ||
                  postgresError?.code === 'INVALID_EMAIL_OR_PASSWORD';

                if (jazzAuthInstance && isAuthError) {
                  try {
                    const jazzResult = await (jazzAuthInstance as any).api[
                      apiProp
                    ](...args);

                    // If sign-in succeeded, migrate user AND password hash to Postgres!
                    if (
                      (apiProp === 'signInEmail' || apiProp === 'signIn') &&
                      jazzResult?.user
                    ) {
                      // Extract password from the request args and hash it properly
                      const requestBody = args[0]?.body;
                      const plainPassword = requestBody?.password;
                      const passwordHash = plainPassword
                        ? await hashPasswordForMigration(plainPassword)
                        : null;
                      await migrateJazzUserToPostgres(
                        jazzResult.user,
                        jazzResult.session,
                        passwordHash || undefined,
                      );
                    }

                    return jazzResult;
                  } catch (jazzError) {
                    console.error('❌ 💩 fallback failed:', jazzError);
                    throw postgresError;
                  }
                }
                throw postgresError;
              }
            };
          },
        },
      );
    }

    // Handler with fallback + migration
    if (prop === 'handler') {
      return async (request: Request) => {
        await initializeAuth();

        const url = new URL(request.url);
        const isSignIn =
          url.pathname.includes('sign-in') || url.pathname.includes('signin');

        // Try Postgres first
        try {
          const response = await (authInstance as any).handler(request.clone());

          // Try Jazz fallback for any auth error during sign-in
          // User might have correct password in Jazz but wrong hash in Postgres
          if (
            (response.status === 401 || response.status === 400) &&
            jazzAuthInstance &&
            isSignIn
          ) {
            // Clone and check error message
            const clonedForCheck = response.clone();
            let errorBody: any = null;
            try {
              errorBody = await clonedForCheck.json();
            } catch {
              // Not JSON, continue with response
            }

            // Fallback for any auth error (user not found OR password error)
            const isAuthError =
              errorBody?.message?.includes('User not found') ||
              errorBody?.message?.includes('user not found') ||
              errorBody?.message?.includes('No user found') ||
              errorBody?.message?.includes('Invalid password') ||
              errorBody?.message?.includes('Invalid credentials') ||
              errorBody?.message?.includes('Invalid email or password') ||
              errorBody?.message?.includes('Incorrect password') ||
              errorBody?.code === 'USER_NOT_FOUND' ||
              errorBody?.code === 'INVALID_EMAIL_OR_PASSWORD';

            if (isAuthError) {
              // Log legacy fallback usage for monitoring
              console.log(
                `[LEGACY_FALLBACK] User attempted login via legacy system - checking for migration...`,
              );

              // Track legacy fallback usage in database
              try {
                const clonedForEmail = request.clone();
                const bodyText = await clonedForEmail.text();
                const bodyJson = JSON.parse(bodyText);
                const email = bodyJson?.email || null;

                if (email) {
                  const trackingPool = getPostgresPool();
                  if (trackingPool) {
                    await trackingPool.query(
                      `INSERT INTO legacy_fallback_usage (user_email, used_at)
                       VALUES ($1, NOW())
                       ON CONFLICT DO NOTHING`,
                      [email],
                    );
                  }
                }
              } catch (trackError) {
                // Don't fail auth if tracking fails
                console.warn(
                  'Failed to track legacy fallback usage:',
                  trackError,
                );
              }

              // Clone request to extract password before Jazz consumes it
              let plainPassword: string | null = null;
              try {
                const clonedForPassword = request.clone();
                const bodyText = await clonedForPassword.text();
                const bodyJson = JSON.parse(bodyText);
                plainPassword = bodyJson?.password || null;
              } catch {
                // Could not extract password
              }

              const jazzResponse = await (jazzAuthInstance as any).handler(
                request.clone(),
              );

              if (jazzResponse.ok) {
                // Parse response to get user for migration
                try {
                  const clonedResponse = jazzResponse.clone();
                  const data = await clonedResponse.json();
                  if (data?.user && isSignIn) {
                    // Hash the plain password with Better Auth and store in Postgres
                    const passwordHash = plainPassword
                      ? await hashPasswordForMigration(plainPassword)
                      : null;
                    await migrateJazzUserToPostgres(
                      data.user,
                      data.session,
                      passwordHash || undefined,
                    );

                    // Mark this usage as migrated
                    if (data.user?.email) {
                      try {
                        const trackingPool = getPostgresPool();
                        if (trackingPool) {
                          await trackingPool.query(
                            `UPDATE legacy_fallback_usage 
                             SET user_id = $1, migrated = true 
                             WHERE user_email = $2 AND migrated = false
                             ORDER BY used_at DESC LIMIT 1`,
                            [data.user.id, data.user.email],
                          );
                        }
                      } catch (updateError) {
                        // Don't fail if update fails
                        console.warn(
                          'Failed to update legacy fallback usage:',
                          updateError,
                        );
                      }
                    }
                  }
                } catch {
                  // Response might not be JSON, that's fine
                }
                return jazzResponse;
              }
            }
          }

          return response;
        } catch (error) {
          console.error('❌ Postgres handler threw error:', error);
          if (jazzAuthInstance) {
            console.log('🔄 Postgres threw, trying 💩...');
            return await (jazzAuthInstance as any).handler(request);
          }
          throw error;
        }
      };
    }

    // Other properties
    return (async () => {
      const instance = await initializeAuth();
      const value = (instance as any)[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    })();
  },
});

export const getJazzAuth = async () => {
  await initializeAuth();
  return jazzAuthInstance;
};
