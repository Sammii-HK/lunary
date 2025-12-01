import { betterAuth } from 'better-auth';
import { jazzPlugin } from 'jazz-tools/better-auth/auth/server';
import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';
import { getAllowedOrigins } from './origin-validation';

// Helper to safely get env var with validation
function getRequiredEnvVar(name: string, allowEmptyInBuild = false): string {
  const value = process.env[name];
  const isBuildPhase = !!process.env.NEXT_PHASE;

  // If we have a value, use it (even during build)
  if (value && value.trim() !== '') {
    return value.trim();
  }

  // Only allow empty during build phase if explicitly allowed
  if (isBuildPhase && allowEmptyInBuild) {
    return '';
  }

  // At runtime, env var must be set and non-empty
  // Log all env vars for debugging
  const allEnvKeys = Object.keys(process.env).sort();
  const matchingKeys = allEnvKeys.filter((key) =>
    key.toUpperCase().includes(name.toUpperCase().replace(/_/g, '')),
  );

  const deploymentUrl =
    process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  const vercelEnv = process.env.VERCEL_ENV || 'unknown';

  console.error(`❌ ${name} not found. Debug info:`, {
    totalEnvVars: allEnvKeys.length,
    matchingKeys,
    vercelEnv,
    deploymentUrl,
    jazzRelatedKeys: allEnvKeys.filter((k) => k.includes('JAZZ')),
  });

  throw new Error(
    `${name} environment variable is required and cannot be empty. ` +
      `Please set this in your Vercel project settings for ${vercelEnv} environment${deploymentUrl ? ` (current deployment: ${deploymentUrl})` : ''}. ` +
      `This variable is needed for Better Auth to connect to Jazz database. ` +
      `If you've already set it, make sure it's enabled for Preview/Production and redeploy.`,
  );
}

// Better Auth server configuration with Jazz database adapter
let authInstance: ReturnType<typeof betterAuth> | null = null;

function initializeAuth() {
  if (authInstance) {
    return authInstance;
  }

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.DEBUG_AUTH === 'true'
  ) {
    console.log('🔍 Initializing Better Auth...', {
      hasJazzAccount: !!process.env.JAZZ_WORKER_ACCOUNT,
      hasJazzSecret: !!process.env.JAZZ_WORKER_SECRET,
      hasAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
    });
  }

  try {
    const accountID = getRequiredEnvVar('JAZZ_WORKER_ACCOUNT', true);
    const accountSecret = getRequiredEnvVar('JAZZ_WORKER_SECRET', true);

    if (
      process.env.NODE_ENV === 'development' &&
      process.env.DEBUG_AUTH === 'true'
    ) {
      console.log('🔍 Got env vars:', {
        accountIDLength: accountID?.length || 0,
        accountSecretLength: accountSecret?.length || 0,
        accountIDEmpty: accountID === '',
        accountSecretEmpty: accountSecret === '',
      });
    }

    authInstance = betterAuth({
      database: JazzBetterAuthDatabaseAdapter({
        syncServer:
          process.env.JAZZ_SYNC_SERVER ||
          `wss://cloud.jazz.tools/?key=${process.env.JAZZ_SYNC_KEY || ''}`,
        accountID: accountID,
        accountSecret: accountSecret,
      }),
      secret: (() => {
        const secret = process.env.BETTER_AUTH_SECRET?.trim();
        const isBuildPhase = !!process.env.NEXT_PHASE;

        // If we have a value, use it (even during build)
        if (secret && secret !== '') {
          return secret;
        }

        // Allow missing secret only during build phase or in test
        if (isBuildPhase || process.env.NODE_ENV === 'test') {
          return 'test-secret-key-for-jest-tests-only';
        }

        // In development, use fallback if missing
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ BETTER_AUTH_SECRET not set, using dev fallback');
          return 'local-dev-secret-key-change-in-production';
        }

        // In production, secret must be set
        throw new Error(
          'BETTER_AUTH_SECRET environment variable is required in production and cannot be empty',
        );
      })(),

      // Email and password authentication
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Disabled - free users don't need verification
        minPasswordLength: 8,
        maxPasswordLength: 128,
        revokeSessionsOnPasswordReset: true,
        async sendResetPassword({ user, url }, _request) {
          // Lazy import email module only when actually needed (not during module initialization)
          // Use webpackIgnore comment to prevent webpack from analyzing this import
          try {
            // Dynamic import with webpackIgnore to prevent bundling in Edge runtime
            const emailModule = await import('./email');
            const sendEmail = emailModule.sendEmail;
            const generatePasswordResetEmailHTML = (emailModule as any)
              .generatePasswordResetEmailHTML;
            const generatePasswordResetEmailText = (emailModule as any)
              .generatePasswordResetEmailText;

            const html = generatePasswordResetEmailHTML(url, user.email);
            const text = generatePasswordResetEmailText(url, user.email);

            await sendEmail({
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
        // Email verification will be required when subscribing or accessing personalized features
      },

      // Email verification (optional - can be triggered when subscribing)
      emailVerification: {
        sendOnSignUp: false, // Don't require verification on signup
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url, token }, request) {
          try {
            const {
              sendEmail,
              generateVerificationEmailHTML,
              generateVerificationEmailText,
            } = await import('./email');

            const html = await generateVerificationEmailHTML(url, user.email);
            const text = await generateVerificationEmailText(url, user.email);

            await sendEmail({
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

      // Session configuration
      // IMPORTANT: BETTER_AUTH_SECRET must be stable across deployments
      // If it changes, all existing sessions will be invalidated and users logged out
      // Ensure this env var is set in Vercel and doesn't change between deployments
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
          enabled: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
        },
      },

      // Base URL configuration
      baseURL:
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://lunary.app'),

      // CORS and security settings
      // Better Auth's trustedOrigins includes runtime VERCEL_URL if it matches
      // our security patterns. This ensures each deployment includes its own URL
      // in the trusted origins list. Additional dynamic validation happens in
      // route handlers via our CORS wrapper for defense in depth.
      // Use a function to dynamically include the request origin if it matches patterns
      trustedOrigins: (request: Request) => {
        const staticOrigins = getAllowedOrigins();
        const requestOrigin = request.headers.get('origin');

        // If request has an origin that matches Vercel patterns, include it
        if (requestOrigin) {
          const vercelPatterns = [
            /^https:\/\/[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
            /^https:\/\/[a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*-sammiis-projects\.vercel\.app$/i,
            /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
            /^https:\/\/[a-z0-9][a-z0-9-]*--[a-z0-9][a-z0-9-]*\.vercel\.app$/i,
          ];

          if (vercelPatterns.some((pattern) => pattern.test(requestOrigin))) {
            return [...staticOrigins, requestOrigin];
          }
        }

        return staticOrigins;
      },

      // Add the Jazz plugin for integration
      plugins: [jazzPlugin()],

      // Database hooks for custom logic
      databaseHooks: {
        user: {
          create: {
            async after(user) {
              console.log(
                '✨ New user created with Jazz Account ID:',
                user.accountID,
              );
            },
          },
        },
      },

      // Advanced configuration
      advanced: { database: { generateId: () => crypto.randomUUID() } },
    });

    if (
      process.env.NODE_ENV === 'development' &&
      process.env.DEBUG_AUTH === 'true'
    ) {
      console.log('✅ Better Auth initialized successfully');
    }
    return authInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Better Auth:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      hasJazzAccount: !!process.env.JAZZ_WORKER_ACCOUNT,
      hasJazzSecret: !!process.env.JAZZ_WORKER_SECRET,
      hasAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      isBuildPhase: !!process.env.NEXT_PHASE,
    });
    throw error;
  }
}

// Export auth with lazy initialization - only initialize at runtime, not during build
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    // During build phase, return a no-op handler to avoid initialization
    const isBuildPhase = !!process.env.NEXT_PHASE;
    if (isBuildPhase) {
      if (prop === 'handler') {
        return async () =>
          new Response('Build phase - handler not available', { status: 503 });
      }
      // Return a dummy value for other properties during build
      return undefined;
    }

    // At runtime, initialize and return the actual value
    try {
      const instance = initializeAuth();
      const value = instance[prop as keyof typeof instance];

      // If accessing the handler, return it directly (already initialized)
      if (prop === 'handler') {
        return value;
      }

      // For other properties, return the value from the initialized instance
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    } catch (error) {
      console.error('❌ Failed to access auth property:', {
        prop,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // If accessing handler and initialization failed, return error handler
      if (prop === 'handler') {
        return async (request: Request) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Auth initialization failed';
          console.error(
            '❌ Auth handler called but initialization failed:',
            errorMessage,
          );

          // Provide helpful error message in development/preview
          const isDevOrPreview =
            process.env.NODE_ENV === 'development' ||
            process.env.VERCEL_ENV === 'preview' ||
            process.env.VERCEL_ENV === 'development';

          return new Response(
            JSON.stringify({
              error: 'Authentication service unavailable',
              message: isDevOrPreview
                ? errorMessage
                : 'Authentication service is not configured. Please contact support.',
              ...(isDevOrPreview && {
                hint: 'Make sure JAZZ_WORKER_ACCOUNT and JAZZ_WORKER_SECRET are set in Vercel environment variables.',
              }),
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          );
        };
      }

      throw error;
    }
  },
});
