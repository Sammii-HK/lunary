import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  console.log("🔍 GET /api/auth/get-session called");
  return auth.handler(request);
}

export async function POST(request: Request) {
  console.log("🔍 POST /api/auth/get-session called");
  return auth.handler(request);
}
