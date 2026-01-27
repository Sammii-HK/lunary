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

// Auth instance
let authInstance: ReturnType<typeof betterAuth> | null = null;

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

  return authInstance;
}

// Export auth with simple lazy initialization
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    if (process.env.NEXT_PHASE) {
      if (prop === 'handler') {
        return async () => new Response('Build phase', { status: 503 });
      }
      return undefined;
    }

    // Lazy initialization for all properties
    return (async () => {
      const instance = await initializeAuth();
      const value = (instance as any)[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    })();
  },
});
