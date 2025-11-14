import { betterAuth } from 'better-auth';
import { jazzPlugin } from 'jazz-tools/better-auth/auth/server';
import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';
import { getAllowedOrigins } from './origin-validation';

// Better Auth server configuration with Jazz database adapter
export const auth = betterAuth({
  database: JazzBetterAuthDatabaseAdapter({
    syncServer:
      process.env.JAZZ_SYNC_SERVER ||
      `wss://cloud.jazz.tools/?key=${process.env.JAZZ_SYNC_KEY || ''}`,
    accountID: (() => {
      const accountId = process.env.JAZZ_WORKER_ACCOUNT;
      // Allow empty during build - Next.js evaluates modules during build
      // but these env vars are only needed at runtime when auth is actually used
      // During build, NEXT_PHASE is set, so we can detect that
      const isBuildPhase = !!process.env.NEXT_PHASE;
      if (
        !accountId &&
        !isBuildPhase &&
        process.env.NODE_ENV !== 'development' &&
        process.env.NODE_ENV !== 'test'
      ) {
        throw new Error('JAZZ_WORKER_ACCOUNT environment variable is required');
      }
      return accountId || '';
    })(),
    accountSecret: (() => {
      const secret = process.env.JAZZ_WORKER_SECRET;
      // Allow empty during build - Next.js evaluates modules during build
      // but these env vars are only needed at runtime when auth is actually used
      // During build, NEXT_PHASE is set, so we can detect that
      const isBuildPhase = !!process.env.NEXT_PHASE;
      if (
        !secret &&
        !isBuildPhase &&
        process.env.NODE_ENV !== 'development' &&
        process.env.NODE_ENV !== 'test'
      ) {
        throw new Error('JAZZ_WORKER_SECRET environment variable is required');
      }
      return secret || '';
    })(),
  }),
  secret: (() => {
    const secret = process.env.BETTER_AUTH_SECRET?.trim();
    if (!secret && process.env.NODE_ENV !== 'test') {
      console.warn(
        '⚠️ BETTER_AUTH_SECRET is not set. Auth may not work properly.',
      );
      // Use a fallback for local dev only
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Using fallback secret for local development');
        return 'local-dev-secret-key-change-in-production';
      }
    }
    return (
      secret ||
      (process.env.NODE_ENV === 'test'
        ? 'test-secret-key-for-jest-tests-only'
        : undefined)
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
      try {
        const {
          sendEmail,
          generatePasswordResetEmailHTML,
          generatePasswordResetEmailText,
        } = await import('./email');

        const html = generatePasswordResetEmailHTML(url, user.email);
        const text = generatePasswordResetEmailText(url, user.email);

        await sendEmail({
          to: user.email,
          subject: '🔐 Reset Your Lunary Password',
          html,
          text,
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

        const html = generateVerificationEmailHTML(url, user.email);
        const text = generateVerificationEmailText(url, user.email);

        await sendEmail({
          to: user.email,
          subject: '✨ Verify Your Email - Lunary',
          html,
          text,
        });

        console.log(`✅ Verification email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
      }
    },
  },

  // Session configuration
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
  trustedOrigins: getAllowedOrigins(),

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
