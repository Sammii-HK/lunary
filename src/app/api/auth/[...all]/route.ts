import { auth } from "@/lib/auth";

// Export the Better Auth API handler for all HTTP methods
export const { GET, POST } = auth.handler;
