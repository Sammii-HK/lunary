import { betterAuth } from "better-auth";
import { jazzPlugin } from "jazz-tools/better-auth/auth/server";
import Database from "better-sqlite3";

// Better Auth server configuration with Jazz plugin
export const auth = betterAuth({
  database: new Database("./data/auth.db"),
  
  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
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

  // CORS and security settings
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://lunary.app",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ],

  // Add the Jazz plugin for integration
  plugins: [
    jazzPlugin(),
  ],

  // Database hooks for custom logic
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          console.log("✨ New user created with Jazz Account ID:", user.accountID);
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
