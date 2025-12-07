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

    console.log(`🎉 Migrated user ${jazzUser.email} from Jazz to Postgres!`);

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
  } catch (error) {
    console.error('❌ Failed to migrate user from Jazz to Postgres:', error);
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

// Jazz fallback adapter (READ then MIGRATE)
async function createJazzFallbackAdapter() {
  try {
    const { JazzBetterAuthDatabaseAdapter } = await import(
      'jazz-tools/better-auth/database-adapter'
    );

    const accountID = process.env.JAZZ_WORKER_ACCOUNT;
    const accountSecret = process.env.JAZZ_WORKER_SECRET;

    if (!accountID || !accountSecret) {
      console.warn('⚠️ Jazz credentials not set - fallback disabled');
      return null;
    }

    return JazzBetterAuthDatabaseAdapter({
      syncServer:
        process.env.JAZZ_SYNC_SERVER ||
        `wss://cloud.jazz.tools/?key=${process.env.JAZZ_SYNC_KEY || ''}`,
      accountID,
      accountSecret,
    });
  } catch (error) {
    console.warn('⚠️ Failed to initialize Jazz fallback:', error);
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
            console.log('🔄 Postgres threw, trying Jazz...');
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
