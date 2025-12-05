import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { getAllowedOrigins } from './origin-validation';

// Postgres pool (PRIMARY)
let pgPool: Pool | null = null;

function getPostgresPool() {
  if (pgPool) return pgPool;

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    if (process.env.NEXT_PHASE) return null;
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
async function migrateJazzUserToPostgres(jazzUser: any, jazzSession: any) {
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
      return;
    }

    // Migrate user to Postgres
    await pool.query(
      `INSERT INTO "user" (id, name, email, email_verified, image, created_at, updated_at)
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

    console.log(`🎉 Migrated user ${jazzUser.email} from Jazz to Postgres!`);

    // Also migrate the session if we have one
    if (jazzSession) {
      await pool.query(
        `INSERT INTO session (id, user_id, token, expires_at, ip_address, user_agent, created_at, updated_at)
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

    // Migrate account (credentials) if present
    if (jazzUser.accounts?.length > 0) {
      for (const account of jazzUser.accounts) {
        await pool.query(
          `INSERT INTO account (id, user_id, account_id, provider_id, password, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [
            account.id || crypto.randomUUID(),
            jazzUser.id,
            account.accountId || jazzUser.id,
            account.providerId || 'credential',
            account.password || null,
          ],
        );
      }
    }
  } catch (error) {
    console.error('❌ Failed to migrate user from Jazz to Postgres:', error);
    // Don't throw - user can still use Jazz, migration will retry next login
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

    const { JazzBetterAuthDatabaseAdapter } = await import(
      'jazz-tools/better-auth/database-adapter'
    );

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
      '✅ Jazz fallback ready (will migrate users to Postgres on login)',
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
                return await (authInstance as any).api[apiProp](...args);
              } catch (postgresError: any) {
                // If not found in Postgres, try Jazz
                const isNotFound =
                  postgresError?.message?.includes('not found') ||
                  postgresError?.message?.includes('Invalid credentials') ||
                  postgresError?.message?.includes('User not found') ||
                  postgresError?.code === 'USER_NOT_FOUND';

                if (jazzAuthInstance && isNotFound) {
                  console.log(`🔄 Trying Jazz for ${String(apiProp)}...`);
                  try {
                    const jazzResult = await (jazzAuthInstance as any).api[
                      apiProp
                    ](...args);

                    // If sign-in succeeded, migrate user to Postgres!
                    if (
                      (apiProp === 'signInEmail' || apiProp === 'signIn') &&
                      jazzResult?.user
                    ) {
                      await migrateJazzUserToPostgres(
                        jazzResult.user,
                        jazzResult.session,
                      );
                    }

                    return jazzResult;
                  } catch (jazzError) {
                    console.error('❌ Jazz fallback failed:', jazzError);
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

          // If auth failed and this is a sign-in, try Jazz
          if (
            (response.status === 401 || response.status === 400) &&
            jazzAuthInstance
          ) {
            console.log('🔄 Trying Jazz handler...');
            const jazzResponse = await (jazzAuthInstance as any).handler(
              request.clone(),
            );

            if (jazzResponse.ok) {
              // Parse response to get user for migration
              try {
                const clonedResponse = jazzResponse.clone();
                const data = await clonedResponse.json();
                if (data?.user && isSignIn) {
                  await migrateJazzUserToPostgres(data.user, data.session);
                }
              } catch {
                // Response might not be JSON, that's fine
              }
              return jazzResponse;
            }
          }

          return response;
        } catch (error) {
          if (jazzAuthInstance) {
            console.log('🔄 Postgres failed, trying Jazz...');
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
