import { betterAuth } from 'better-auth';
import { jazzPlugin } from 'jazz-tools/better-auth/auth/server';
import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';
import {
  sendEmail,
  generateVerificationEmailHTML,
  generateVerificationEmailText,
} from './email';

// Better Auth server configuration with Jazz database adapter
export const auth = betterAuth({
  database: JazzBetterAuthDatabaseAdapter({
    syncServer: `wss://cloud.jazz.tools/?key=sam@lunary.com`,
    accountID:
      process.env.JAZZ_WORKER_ACCOUNT || 'co_zQcie5b9JeVB3go2xcpitCuPPUK',
    accountSecret:
      process.env.JAZZ_WORKER_SECRET ||
      'sealerSecret_z6j9dtYQev5cMjaKKncXQRMxpa23ppGDencCFwH2Bf4Jm/signerSecret_z3t4A4AbNMp3GSf7YP7Mc2nmuB3yJfYNLEUWDTqE1r6cV',
  }),
  secret: process.env.BETTER_AUTH_SECRET,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled for testing - can re-enable later
  },

  // Email verification disabled for testing
  // emailVerification: {
  //   sendOnSignUp: true,
  //   autoSignInAfterVerification: true,
  //   async sendVerificationEmail({ user, url, token }, request) {
  //     // Email verification code here when needed
  //   },
  // },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  // CORS and security settings
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://lunary.app',
    'https://www.lunary.app',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],

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
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
