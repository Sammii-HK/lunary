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
      const isBuildPhase = !!process.env.NEXT_PHASE;

      // If we have a value, use it (even during build)
      if (accountId && accountId.trim() !== '') {
        return accountId.trim();
      }

      // Only allow empty during build phase if env var is truly missing
      if (isBuildPhase) {
        return '';
      }

      // In runtime, env var must be set and non-empty
      throw new Error(
        'JAZZ_WORKER_ACCOUNT environment variable is required and cannot be empty',
      );
    })(),
    accountSecret: (() => {
      const secret = process.env.JAZZ_WORKER_SECRET;
      const isBuildPhase = !!process.env.NEXT_PHASE;

      // If we have a value, use it (even during build)
      if (secret && secret.trim() !== '') {
        return secret.trim();
      }

      // Only allow empty during build phase if env var is truly missing
      if (isBuildPhase) {
        return '';
      }

      // In runtime, env var must be set and non-empty
      throw new Error(
        'JAZZ_WORKER_SECRET environment variable is required and cannot be empty',
      );
    })(),
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
      try {
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
