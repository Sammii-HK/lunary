import { betterAuth } from "better-auth";
import { jazzPlugin } from "jazz-tools/better-auth/auth/server";

// Better Auth server configuration with Jazz plugin
export const auth = betterAuth({
  database: {
    // Using SQLite for local development - you can change this to PostgreSQL, MySQL, etc.
    provider: "sqlite",
    url: "./data/auth.db", // Local SQLite database file
  },
  
  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // CORS and security settings
  trustedOrigins: [
    "http://localhost:3000",
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
    generateId: () => crypto.randomUUID(),
  },
});
