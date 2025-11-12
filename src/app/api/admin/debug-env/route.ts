import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check for admin auth or restrict to production only
  const isProduction = process.env.NODE_ENV === 'production';

  // Get all OpenAI-related env vars (checking for common variations)
  const envVars = {
    OPENAI_API_KEY: {
      exists: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0,
      prefix: process.env.OPENAI_API_KEY
        ? `${process.env.OPENAI_API_KEY.substring(0, 8)}...`
        : 'missing',
      startsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
      rawValue: process.env.OPENAI_API_KEY ? '[REDACTED]' : null,
    },
    // Check for common variations
    'process.env keys': Object.keys(process.env)
      .filter((key) => key.toLowerCase().includes('openai'))
      .map((key) => ({
        key,
        exists: true,
        length: process.env[key]?.length || 0,
      })),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  };

  return NextResponse.json({
    success: true,
    message: 'Environment variable debug info',
    envVars,
    note: 'Check Vercel dashboard > Settings > Environment Variables. Make sure OPENAI_API_KEY is set for Production environment.',
  });
}
